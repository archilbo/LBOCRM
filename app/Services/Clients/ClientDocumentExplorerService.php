<?php

namespace App\Services\Clients;

use App\Models\Client;
use App\Models\Contract;
use App\Models\DossierDocument;
use App\Models\ProjectEfficiencySheet;
use App\Models\User;
use App\Services\Documents\DossierDocumentFileService;
use App\Services\Dossiers\ProjectDocumentExplorerService;
use App\Services\PermissionRegistry;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Route;

/**
 * Client-scoped aggregator behind the Client Document Explorer payload
 * (ClientWorkspaceService::forClient → `explorer`).
 *
 * Business rule (corrected): Client → Documents is an aggregation of ALL
 * documents from ALL Projects belonging to that Client. There is no direct
 * Client document pool in this schema (no client_documents table): every
 * entry is a projection of a Project-owned source row.
 *
 * Sources, exactly like the Project explorer:
 *   - uploaded project documents (sourceType 'project'),
 *   - generated contract DOCX/PDF (sourceType 'contract'),
 *   - generated efficiency-sheet DOCX/PDF (sourceType 'efficiency_sheet').
 *
 * Scope rules enforced here:
 *   - Project IDs come from the real Client → Dossiers relationship
 *     (batched `WHERE dossier_id IN (...)`; never trusted from the frontend);
 *   - every adapter applies the same Project constraint, so a document can
 *     never enter through a different Client's Project;
 *   - tenant scope is guaranteed by the caller (ClientController::show binds
 *     the route-bound Client and authorizes `view`), and every source row is
 *     reachable only through the Client's Projects;
 *   - entries carry backend-generated source-aware keys
 *     (project:{id}, contract:{id}:docx|pdf,
 *     efficiency_sheet:{id}:v{version}:docx|pdf) and are deduplicated by key,
 *     so the same artifact is never shown twice;
 *   - no storage paths are serialized; downloads/previews keep the original
 *     source routes (documents.*, contracts.*, dossiers.efficiency-sheet.*),
 *     which re-validate user/tenant/Project ownership on every request.
 */
class ClientDocumentExplorerService
{
    public function __construct(
        private readonly DossierDocumentFileService $documentFiles,
        private readonly ProjectDocumentExplorerService $projectExplorer,
        private readonly PermissionRegistry $permissions,
    ) {
    }

    /**
     * @return array{
     *     context: array{type: 'client', clientId: int},
     *     documents: array<int, array<string, mixed>>,
     * }
     */
    public function forClient(Client $client, ?User $viewer): array
    {
        $canViewDocuments = $viewer === null || $this->permissions->allows($viewer, 'documents.view');
        $canViewContracts = $viewer === null || $this->permissions->allows($viewer, 'contracts.view');
        $canViewEfficiencySheet = $viewer === null || $this->permissions->allows($viewer, 'projects.efficiency_sheet.view');

        // Authoritative Project set: the Client's own Projects only.
        $projectIds = $client->dossiers()->pluck('dossiers.id');

        $documents = collect()
            ->concat($canViewDocuments ? $this->uploadedDocuments($projectIds, $client) : collect())
            ->concat($canViewContracts ? $this->contractFiles($projectIds, $client) : collect())
            ->concat($canViewEfficiencySheet ? $this->efficiencySheetFiles($projectIds, $client) : collect())
            // Source-aware deduplication: the same artifact entering through
            // several relations must appear exactly once.
            ->keyBy('key')
            ->values();

        return [
            'context' => [
                'type' => 'client',
                'clientId' => (int) $client->id,
            ],
            'documents' => $documents->all(),
        ];
    }

    /**
     * Uploaded files of the Client's Projects (sourceType 'project').
     *
     * @param  Collection<int, int>  $projectIds
     * @return Collection<int, array<string, mixed>>
     */
    private function uploadedDocuments(Collection $projectIds, Client $client): Collection
    {
        if ($projectIds->isEmpty()) {
            return collect();
        }

        $projects = $client->dossiers()
            ->whereIn('dossiers.id', $projectIds)
            ->get(['id', 'dossier_number', 'project_object'])
            ->keyBy('id');

        return DossierDocument::query()
            ->with('template')
            ->whereIn('dossier_id', $projectIds)
            ->get()
            ->sortByDesc(fn (DossierDocument $document) => $document->uploaded_at ?? $document->created_at)
            ->map(function (DossierDocument $document) use ($projects): array {
                $project = $projects->get($document->dossier_id);

                $hasFile = $this->documentFiles->exists($document);
                $canPreview = $this->documentFiles->canPreview($document, $hasFile);
                $canPreviewText = $this->documentFiles->canPreviewText($document);

                return [
                    'key' => "project:{$document->id}",
                    'id' => $document->id,
                    'sourceType' => 'project',
                    'sourceLabel' => null,
                    'generated' => false,
                    'version' => null,
                    'extension' => null,
                    'name' => $this->projectExplorer->documentDisplayName($document),
                    'status' => $document->status,
                    'documentNumber' => $document->document_number,
                    'originalFilename' => $document->original_filename,
                    'mimeType' => $document->mime_type,
                    'sizeLabel' => $this->projectExplorer->formatSize($document->size_bytes),
                    'storageLocation' => $this->documentFiles->locationLabel($document, $document->dossier),
                    'uploadedAt' => optional($document->uploaded_at)->format('Y-m-d'),
                    'hasFile' => $hasFile,
                    'canPreview' => $canPreview,
                    'viewUrl' => $canPreview && Route::has('documents.view')
                        ? route('documents.view', $document)
                        : null,
                    'contentUrl' => $canPreviewText && Route::has('documents.content')
                        ? route('documents.content', $document)
                        : null,
                    'printUrl' => $canPreview && Route::has('documents.print')
                        ? route('documents.print', $document)
                        : null,
                    'downloadUrl' => $hasFile && Route::has('documents.download')
                        ? route('documents.download', $document)
                        : null,
                    'canDelete' => false,
                    'projectId' => $project?->id,
                    'projectLabel' => $this->projectLabel($project),
                    'project' => $this->projectReference($project),
                ];
            });
    }

    /**
     * Generated contract files of the Client's Projects (sourceType
     * 'contract'): current DOCX/PDF per Contract row.
     *
     * @param  Collection<int, int>  $projectIds
     * @return Collection<int, array<string, mixed>>
     */
    private function contractFiles(Collection $projectIds, Client $client): Collection
    {
        if ($projectIds->isEmpty()) {
            return collect();
        }

        $projects = $client->dossiers()
            ->whereIn('dossiers.id', $projectIds)
            ->get(['id', 'dossier_number', 'project_object'])
            ->keyBy('id');

        $files = collect();

        Contract::query()
            ->whereIn('dossier_id', $projectIds)
            ->get()
            ->each(function (Contract $contract) use ($files, $projects): void {
                $project = $projects->get($contract->dossier_id);
                $projectReference = $this->projectReference($project);

                if (filled($contract->generated_document_path)) {
                    $files->push([
                        'key' => "contract:{$contract->id}:docx",
                        'id' => $contract->id,
                        'sourceType' => 'contract',
                        'sourceLabel' => 'Contrat',
                        'generated' => true,
                        'version' => null,
                        'extension' => 'docx',
                        'name' => $contract->contract_number.' — Contrat DOCX',
                        'status' => $contract->status,
                        'documentNumber' => $contract->contract_number,
                        'originalFilename' => $contract->contract_number.' — Contrat.docx',
                        'mimeType' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                        'sizeLabel' => null,
                        'storageLocation' => null,
                        'uploadedAt' => optional($contract->generated_at)->format('Y-m-d'),
                        'hasFile' => true,
                        'canPreview' => false,
                        'viewUrl' => null,
                        'contentUrl' => null,
                        'printUrl' => null,
                        'downloadUrl' => Route::has('contracts.download.generated')
                            ? route('contracts.download.generated', $contract)
                            : null,
                        'canDelete' => false,
                        'projectId' => $project?->id,
                        'projectLabel' => $this->projectLabel($project),
                        'project' => $projectReference,
                    ]);
                }

                if (filled($contract->pdf_path)) {
                    $files->push([
                        'key' => "contract:{$contract->id}:pdf",
                        'id' => $contract->id,
                        'sourceType' => 'contract',
                        'sourceLabel' => 'Contrat',
                        'generated' => true,
                        'version' => null,
                        'extension' => 'pdf',
                        'name' => $contract->contract_number.' — Contrat PDF',
                        'status' => $contract->status,
                        'documentNumber' => $contract->contract_number,
                        'originalFilename' => $contract->contract_number.' — Contrat.pdf',
                        'mimeType' => 'application/pdf',
                        'sizeLabel' => null,
                        'storageLocation' => null,
                        'uploadedAt' => optional($contract->generated_at)->format('Y-m-d'),
                        'hasFile' => true,
                        'canPreview' => false,
                        'viewUrl' => null,
                        'contentUrl' => null,
                        'printUrl' => null,
                        'downloadUrl' => Route::has('contracts.download.pdf')
                            ? route('contracts.download.pdf', $contract)
                            : null,
                        'canDelete' => false,
                        'projectId' => $project?->id,
                        'projectLabel' => $this->projectLabel($project),
                        'project' => $projectReference,
                    ]);
                }
            });

        return $files;
    }

    /**
     * Generated efficiency-sheet files of the Client's Projects (sourceType
     * 'efficiency_sheet'): current DOCX/PDF per sheet row, carrying the row's
     * version counter.
     *
     * @param  Collection<int, int>  $projectIds
     * @return Collection<int, array<string, mixed>>
     */
    private function efficiencySheetFiles(Collection $projectIds, Client $client): Collection
    {
        if ($projectIds->isEmpty()) {
            return collect();
        }

        $projects = $client->dossiers()
            ->whereIn('dossiers.id', $projectIds)
            ->get(['id', 'dossier_number', 'project_object'])
            ->keyBy('id');

        $files = collect();

        ProjectEfficiencySheet::query()
            ->whereIn('dossier_id', $projectIds)
            ->get()
            ->each(function (ProjectEfficiencySheet $fiche) use ($files, $projects): void {
                $project = $projects->get($fiche->dossier_id);
                $projectReference = $this->projectReference($project);

                if (filled($fiche->docx_path)) {
                    $files->push([
                        'key' => "efficiency_sheet:{$fiche->id}:v{$fiche->version}:docx",
                        'id' => $fiche->id,
                        'sourceType' => 'efficiency_sheet',
                        'sourceLabel' => 'Fiche efficacité',
                        'generated' => true,
                        'version' => $fiche->version,
                        'extension' => 'docx',
                        'name' => 'Fiche efficacité DOCX',
                        'status' => $fiche->status,
                        'documentNumber' => null,
                        'originalFilename' => "Fiche efficacité v{$fiche->version}.docx",
                        'mimeType' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                        'sizeLabel' => null,
                        'storageLocation' => null,
                        'uploadedAt' => optional($fiche->generated_at)->format('Y-m-d'),
                        'hasFile' => true,
                        'canPreview' => false,
                        'viewUrl' => null,
                        'contentUrl' => null,
                        'printUrl' => null,
                        'downloadUrl' => Route::has('dossiers.efficiency-sheet.download.docx')
                            ? route('dossiers.efficiency-sheet.download.docx', [$fiche->dossier, $fiche])
                            : null,
                        'canDelete' => false,
                        'projectId' => $project?->id,
                        'projectLabel' => $this->projectLabel($project),
                        'project' => $projectReference,
                    ]);
                }

                if (filled($fiche->pdf_path)) {
                    $files->push([
                        'key' => "efficiency_sheet:{$fiche->id}:v{$fiche->version}:pdf",
                        'id' => $fiche->id,
                        'sourceType' => 'efficiency_sheet',
                        'sourceLabel' => 'Fiche efficacité',
                        'generated' => true,
                        'version' => $fiche->version,
                        'extension' => 'pdf',
                        'name' => 'Fiche efficacité PDF',
                        'status' => $fiche->status,
                        'documentNumber' => null,
                        'originalFilename' => "Fiche efficacité v{$fiche->version}.pdf",
                        'mimeType' => 'application/pdf',
                        'sizeLabel' => null,
                        'storageLocation' => null,
                        'uploadedAt' => optional($fiche->generated_at)->format('Y-m-d'),
                        'hasFile' => true,
                        'canPreview' => true,
                        'viewUrl' => Route::has('dossiers.efficiency-sheet.preview.pdf')
                            ? route('dossiers.efficiency-sheet.preview.pdf', [$fiche->dossier, $fiche])
                            : null,
                        'contentUrl' => null,
                        'printUrl' => Route::has('dossiers.efficiency-sheet.print')
                            ? route('dossiers.efficiency-sheet.print', [$fiche->dossier, $fiche])
                            : null,
                        'downloadUrl' => Route::has('dossiers.efficiency-sheet.download.pdf')
                            ? route('dossiers.efficiency-sheet.download.pdf', [$fiche->dossier, $fiche])
                            : null,
                        'canDelete' => false,
                        'projectId' => $project?->id,
                        'projectLabel' => $this->projectLabel($project),
                        'project' => $projectReference,
                    ]);
                }
            });

        return $files;
    }

    /**
     * Display label of the owning Project ("P{id} · {project_object}").
     */
    private function projectLabel(mixed $project): ?string
    {
        if (! $project) {
            return null;
        }

        return trim('P'.$project->id.($project->project_object ? ' · '.$project->project_object : ''));
    }

    /**
     * Safe Project reference (id, name, code) — never unrelated Project
     * fields, never the storage path.
     *
     * @return array{id: int, name: string|null, code: string}|null
     */
    private function projectReference(mixed $project): ?array
    {
        if (! $project) {
            return null;
        }

        return [
            'id' => (int) $project->id,
            'name' => $project->project_object,
            'code' => (string) $project->dossier_number,
        ];
    }
}
