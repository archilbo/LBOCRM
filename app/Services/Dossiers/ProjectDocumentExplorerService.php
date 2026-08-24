<?php

namespace App\Services\Dossiers;

use App\Models\Dossier;
use App\Models\DossierDocument;
use App\Models\User;
use App\Services\Documents\DossierDocumentFileService;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Route;

/**
 * Single aggregator behind the project Document Explorer payload
 * (ProjectWorkspaceDataService::explorerDocuments).
 *
 * One entry per real generated file the architecture exposes:
 *   - uploaded project documents (sourceType 'project'),
 *   - the current contract DOCX/PDF (sourceType 'contract'; the Contract row
 *     keeps no version history, so version stays null),
 *   - the current efficiency-sheet DOCX/PDF (sourceType 'efficiency_sheet';
 *     the row's version counter is exposed as `version`).
 *
 * STEP 0 rules enforced here:
 *   - no file copies and no duplicate rows: entries are projections of the
 *     source rows (dossiers_documents, contracts, efficiency_sheets);
 *   - no storage-path exposure: path columns are never serialized;
 *   - artifact existence is decided by the source row's path columns only
 *     (no disk access, so the payload never regenerates or moves files);
 *   - downloads/previews keep using the original source routes
 *     (documents.*, contracts.*, dossiers.efficiency-sheet.*);
 *   - every entry carries a backend-generated unique key
 *     (contract:18:docx, efficiency_sheet:7:v2:pdf) so the frontend never
 *     has to guess one and docx/pdf files of the same source row never
 *     collide.
 */
class ProjectDocumentExplorerService
{
    public function __construct(
        private readonly DossierDocumentFileService $documentFiles,
    ) {
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    public function forDossier(Dossier $dossier, User $user, bool $canViewEfficiencySheet): Collection
    {
        return $this->uploadedDocuments($dossier, $user)
            ->concat($this->contractFiles($dossier))
            ->concat($this->efficiencySheetFiles($dossier, $canViewEfficiencySheet))
            ->values();
    }

    /**
     * Uploaded project files (sourceType 'project').
     *
     * @return Collection<int, array<string, mixed>>
     */
    private function uploadedDocuments(Dossier $dossier, User $user): Collection
    {
        return $dossier->documents
            ->sortByDesc(fn (DossierDocument $document) => $document->uploaded_at ?? $document->created_at)
            ->map(function (DossierDocument $document) use ($dossier, $user): array {
                $hasFile = $this->documentFiles->exists($document);
                $canPreview = $this->documentFiles->canPreview($document, $hasFile);
                $canPreviewText = $this->documentFiles->canPreviewText($document);
                $canDownload = $user->can('download', $document);

                return [
                    'key' => "project:{$document->id}",
                    'id' => $document->id,
                    'sourceType' => 'project',
                    'sourceLabel' => null,
                    'generated' => false,
                    'version' => null,
                    'extension' => null,
                    'name' => $this->documentDisplayName($document),
                    'clientId' => $document->client_id
                        ? (string) $document->client_id
                        : null,
                    'clientName' => $document->client?->full_name
                        ?? $dossier->primaryClient?->full_name,
                    'status' => $document->status,
                    'documentNumber' => $document->document_number,
                    'originalFilename' => $document->original_filename,
                    'mimeType' => $document->mime_type,
                    'sizeLabel' => $this->formatSize($document->size_bytes),
                    'storageLocation' => $this->documentFiles->locationLabel($document, $dossier),
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
                    'downloadUrl' => $hasFile && $canDownload && Route::has('documents.download')
                        ? route('documents.download', $document)
                        : null,
                    'canDelete' => $user->can('delete', $document),
                ];
            });
    }

    /**
     * Generated contract files (sourceType 'contract'): the current DOCX and
     * PDF only. The Contract row keeps no version history, so `version` is
     * null and the keys are contract:{id}:docx / contract:{id}:pdf. Files
     * stay download-only, matching the legacy explorer behavior.
     *
     * @return Collection<int, array<string, mixed>>
     */
    private function contractFiles(Dossier $dossier): Collection
    {
        $contract = $dossier->contract;

        if (! $contract) {
            return collect();
        }

        $files = collect();

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
            ]);
        }

        return $files;
    }

    /**
     * Generated efficiency-sheet files (sourceType 'efficiency_sheet'): the
     * current DOCX/PDF of the sheet row, carrying the row's version counter
     * (efficiency_sheet:{id}:v{version}:docx|pdf). A missing path column
     * means the file does not exist; nothing is read from disk. Hidden
     * entirely without the efficiency-sheet view permission.
     *
     * @return Collection<int, array<string, mixed>>
     */
    private function efficiencySheetFiles(Dossier $dossier, bool $canViewEfficiencySheet): Collection
    {
        $fiche = $dossier->efficiencySheet;

        if (! $canViewEfficiencySheet || ! $fiche) {
            return collect();
        }

        $files = collect();

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
                    ? route('dossiers.efficiency-sheet.download.docx', [$dossier, $fiche])
                    : null,
                'canDelete' => false,
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
                    ? route('dossiers.efficiency-sheet.preview.pdf', [$dossier, $fiche])
                    : null,
                'contentUrl' => null,
                'printUrl' => Route::has('dossiers.efficiency-sheet.print')
                    ? route('dossiers.efficiency-sheet.print', [$dossier, $fiche])
                    : null,
                'downloadUrl' => Route::has('dossiers.efficiency-sheet.download.pdf')
                    ? route('dossiers.efficiency-sheet.download.pdf', [$dossier, $fiche])
                    : null,
                'canDelete' => false,
            ]);
        }

        return $files;
    }

    /**
     * Display name for an uploaded project document (template name + side
     * suffix). Shared with the legacy `documents` payload builder
     * (ProjectWorkspaceDataService::documentPayload) so both surfaces agree.
     */
    public function documentDisplayName(DossierDocument $document): string
    {
        $baseName = $document->template?->name
            ?? $document->original_filename
            ?? 'Document';

        return match ($document->document_side) {
            DossierDocument::SIDE_FRONT => $baseName.' — Recto',
            DossierDocument::SIDE_BACK => $baseName.' — Verso',
            default => $baseName,
        };
    }

    public function formatSize(?int $size): ?string
    {
        if (! $size || $size < 0) {
            return null;
        }

        if ($size < 1024) {
            return $size.' B';
        }

        if ($size < 1024 * 1024) {
            return round($size / 1024).' KB';
        }

        return number_format($size / 1024 / 1024, 1).' MB';
    }
}
