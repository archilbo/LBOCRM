<?php

namespace App\Services\Dossiers;

use App\Enums\DossierWorkflowStepStatus;
use App\Models\Dossier;
use App\Models\DossierDocument;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class DossierWorkflowStepperService
{
    public function evaluate(Dossier $dossier): array
    {
        $dossier->loadMissing([
            'client',
            'clients',
            'primaryClient',
            'documents.template',
            'documents.client',
            'contract',
            'cahier',
            'workflowRequirements.checkedBy',
        ]);

        $steps = collect($this->stepsForClient($dossier))
            ->map(fn (array $step, int $index) => $this->evaluateStep($dossier, $step, $index))
            ->values();

        $completed = $steps->where('status', DossierWorkflowStepStatus::Completed->value)->count();
        $total = max(1, $steps->count());
        $currentStep = $steps->first(fn (array $step) => $step['status'] !== DossierWorkflowStepStatus::Completed->value)['key']
            ?? $steps->last()['key']
            ?? null;

        return [
            'completed' => $completed,
            'total' => $steps->count(),
            'percent' => (int) round(($completed / $total) * 100),
            'currentStep' => $currentStep,
            'steps' => $steps->all(),
        ];
    }

    private function evaluateStep(Dossier $dossier, array $step, int $index): array
    {
        $requirements = collect($step['requirements'] ?? [])
            ->map(function (array $requirement) use ($dossier, $step) {
                $manualRecord = $this->manualRequirement($dossier, (string) $step['key'], (string) $requirement['key']);
                $isManualConfig = $requirement['manual'] ?? false;
                $isCinRequirement = $step['key'] === 'documents' && $requirement['key'] === 'cin';

                return [
                    ...$requirement,
                    'done' => $this->requirementDone($dossier, (string) $step['key'], (string) $requirement['key'], $isManualConfig),
                    'manual' => $isManualConfig || $manualRecord !== null,
                    'notes' => $manualRecord?->notes,
                    'checkedAt' => optional($manualRecord?->checked_at)->format('Y-m-d H:i'),
                    'checkedBy' => $manualRecord?->checkedBy?->name,
                    'actionLabel' => $this->requirementActionLabel($dossier, (string) $step['key'], (string) $requirement['key']),
                    'actionUrl' => $this->requirementActionUrl($dossier, (string) $step['key'], (string) $requirement['key']),
                    'hasFile' => $this->requirementHasFile($dossier, (string) $step['key'], (string) $requirement['key']),
                    // One pair belongs to one linked client. Keeping this in
                    // the workflow payload makes missing identity files clear
                    // without exposing document paths or binary data.
                    'clientCins' => $isCinRequirement
                        ? $this->cinStatuses($dossier)->all()
                        : [],
                ];
            })
            ->values();

        $done = $requirements->where('done', true)->count();
        $status = $this->stepStatus($requirements, $done);

        return [
            'key' => $step['key'],
            'order' => $index + 1,
            'label' => $step['label'],
            'description' => $step['description'] ?? null,
            'status' => $status->value,
            'statusLabel' => $status->label(),
            'done' => $done,
            'total' => $requirements->count(),
            'requirements' => $requirements->all(),
            'primaryActionLabel' => $this->stepActionLabel((string) $step['key']),
            'primaryActionUrl' => $this->stepActionUrl($dossier, (string) $step['key']),
        ];
    }

    private function stepStatus(Collection $requirements, int $done): DossierWorkflowStepStatus
    {
        if ($requirements->isNotEmpty() && $done === $requirements->count()) {
            return DossierWorkflowStepStatus::Completed;
        }

        $hasBlocked = $requirements->contains(function ($req) {
            if (!$req['done'] && $req['manual'] && filled($req['notes'] ?? null)) {
                return true;
            }
            return false;
        });

        if ($hasBlocked) {
            return DossierWorkflowStepStatus::Blocked;
        }

        if ($done > 0) {
            return DossierWorkflowStepStatus::InProgress;
        }

        return DossierWorkflowStepStatus::Pending;
    }

    private function requirementDone(Dossier $dossier, string $step, string $requirement, bool $isManualConfig = false): bool
    {
        $manualDone = $this->manualRequirement($dossier, $step, $requirement)?->is_done;

        if ($manualDone !== null) {
            return $manualDone;
        }

        if ($isManualConfig) {
            return false;
        }

        return match ($step . '.' . $requirement) {
            'documents.cin',
            'documents.certificat_propriete',
            'documents.plan_cadastral',
            'documents.calcul_contenance',
            'documents.plan_parcellaire',
            'documents.statut',
            'documents.rce',
            'documents.desistement',
            'documents.procuration',
            'rokhas.rokhas_upload',
            'rokhas.fiche_energetique',
            'bureau_etude.contract_bureau_etude',
            'bureau_etude.plan_beton',
            'bureau_etude.attestation_implantation',
            'bureau_etude.contrat_topographie',
            'bureau_etude.contrat_laboratoire',
            'bureau_etude.bureau_controle',
            'bureau_etude.attestation_situation_reguliere',
            'bureau_etude.topographe',
            'permis_habiter.demande_permis_habiter',
            'permis_habiter.site_images',
            'permis_habiter.recent_certificat_propriete' => false,

            'contract.contract_created' => (bool) $dossier->contract,
            'contract.contract_generated' => filled($dossier->contract?->generated_document_path) || filled($dossier->contract?->generated_at),
            'contract.contract_signed' => filled($dossier->contract?->signed_at) || in_array($dossier->contract?->status, ['signed', 'cachete', 'contrat_cachete'], true),

            'cahier_chantier.engineer_request', 'cahier_chantier.cahier_received' => false,

            'archive.documents_verified' => $this->archiveDocumentsVerified($dossier),
            'archive.archive_created' => (bool) $dossier->archiveRecord,
            'archive.file_stored' => $dossier->archiveRecord?->status === 'stored',

            default => false,
        };
    }

    private function manualRequirement(Dossier $dossier, string $step, string $requirement)
    {
        return $dossier->workflowRequirements
            ->first(fn ($item) => $item->step_key === $step && $item->requirement_key === $requirement);
    }

    private function archiveDocumentsVerified(Dossier $dossier): bool
    {
        $allSteps = $this->stepsForClient($dossier);

        foreach ($allSteps as $step) {
            if ($step['key'] === 'archive') {
                continue;
            }

            foreach ($step['requirements'] ?? [] as $req) {
                if (!$this->requirementDone($dossier, (string) $step['key'], (string) $req['key'])) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Existing records created before client_type are personal clients.
     */
    private function stepsForClient(Dossier $dossier): array
    {
        $clientType = $dossier->primaryClient?->client_type === 'company'
            ? 'company'
            : 'person';

        return collect(config('archilbo_workflow.client_project_steps', []))
            ->map(function (array $step) use ($clientType): array {
                $step['requirements'] = collect($step['requirements'] ?? [])
                    ->filter(function (array $requirement) use ($clientType): bool {
                        $allowedTypes = $requirement['client_types'] ?? null;

                        return ! is_array($allowedTypes)
                            || in_array($clientType, $allowedTypes, true);
                    })
                    ->map(function (array $requirement): array {
                        unset($requirement['client_types']);

                        return $requirement;
                    })
                    ->values()
                    ->all();

                return $step;
            })
            ->all();
    }

    private function hasCompleteCin(Dossier $dossier): bool
    {
        $statuses = $this->cinStatuses($dossier);

        return $statuses->isNotEmpty()
            && $statuses->every(fn (array $status): bool => $status['complete']);
    }

    /**
     * @return Collection<int, array{clientId: string, fullName: string, cin: string|null, isPrimary: bool, hasFront: bool, hasBack: bool, complete: bool}>
     */
    private function cinStatuses(Dossier $dossier): Collection
    {
        $clients = $dossier->clients;

        // Legacy rows that have not yet been backfilled still have a single
        // primary client. Do not accidentally make their CIN satisfy future
        // co-client requirements.
        if ($clients->isEmpty() && $dossier->primaryClient) {
            $clients = collect([$dossier->primaryClient]);
        }

        $cinDocuments = $dossier->documents->filter(
            fn (DossierDocument $document): bool => $this->isStoredCinDocument($document),
        );

        return $clients
            ->map(function ($client) use ($cinDocuments, $dossier): array {
                $isPrimary = (int) $client->id === (int) $dossier->primaryClient?->id;
                $documents = $cinDocuments->filter(
                    fn (DossierDocument $document): bool => (int) $document->client_id === (int) $client->id
                        || ($document->client_id === null && $isPrimary),
                );

                $hasFront = $documents->contains('document_side', DossierDocument::SIDE_FRONT);
                $hasBack = $documents->contains('document_side', DossierDocument::SIDE_BACK);

                return [
                    'clientId' => (string) $client->id,
                    'fullName' => $client->full_name,
                    'cin' => $client->cin,
                    'isPrimary' => $isPrimary,
                    'hasFront' => $hasFront,
                    'hasBack' => $hasBack,
                    'complete' => $hasFront && $hasBack,
                ];
            })
            ->values();
    }

    private function isStoredCinDocument(DossierDocument $document): bool
    {
        if (! filled($document->stored_path) && ! filled($document->original_filename)) {
            return false;
        }

        $templateText = $this->normalize(implode(' ', array_filter([
            $document->template?->name,
            $document->template?->code,
        ])));

        return Str::contains($templateText, ['cin', 'cni', 'carte nationale']);
    }

    private function hasDocument(Dossier $dossier, array $aliases): bool
    {
        return $dossier->documents->contains(function ($document) use ($aliases) {
            if (! filled($document->stored_path) && ! filled($document->original_filename)) {
                return false;
            }

            $haystack = $this->normalize(implode(' ', array_filter([
                $document->document_number,
                $document->original_filename,
                $document->status,
                $document->notes,
                $document->template?->name,
                $document->template?->code,
                $document->template?->document_type,
            ])));

            foreach ($aliases as $alias) {
                if (Str::contains($haystack, $this->normalize($alias))) {
                    return true;
                }
            }

            return false;
        });
    }

    private function normalize(?string $value): string
    {
        return Str::of($value ?? '')
            ->ascii()
            ->lower()
            ->replace(['_', '-', '\''], ' ')
            ->squish()
            ->toString();
    }

    private function stepActionLabel(string $step): string
    {
        return match ($step) {
            'documents' => 'Ouvrir les documents',
            'contract' => 'Ouvrir les contrats',
            'cahier_chantier' => 'Ajouter documents cahier',
            'rokhas' => 'Ouvrir les documents Rokhas',
            'bureau_etude' => 'Ajouter documents techniques',
            'permis_habiter' => 'Ajouter documents permis',
            'archive' => 'Creer / ouvrir archive',
            default => 'Ouvrir dossier',
        };
    }

    private function stepActionUrl(Dossier $dossier, string $step): string
    {
        return match ($step) {
            'contract' => route('contracts.index', ['dossier_id' => $dossier->id]),
            'rokhas' => route('documents.index', ['dossier_id' => $dossier->id]),
            'archive' => route('archives.index', ['dossier_id' => $dossier->id]),
            default => route('documents.index', ['dossier_id' => $dossier->id]),
        };
    }

    private function requirementActionLabel(Dossier $dossier, string $step, string $requirement): string|null
    {
        return match ($step . '.' . $requirement) {
            'contract.contract_created' => 'Creer contrat',
            'contract.contract_generated' => 'Generer contrat',
            'contract.contract_signed' => 'Marquer signe',
            'rokhas.rokhas_upload' => 'Televerser le dossier Rokhas',
            'archive.documents_verified' => null,
            'archive.archive_created' => $dossier->archiveRecord ? 'Ouvrir la fiche d archive' : 'Creer la fiche d archive',
            'archive.file_stored' => 'Ouvrir la fiche d archive',
            'cahier_chantier.engineer_request' => null,
            'cahier_chantier.cahier_received' => 'Gerer le cahier',
            default => 'Televerser',
        };
    }

    private function requirementActionUrl(Dossier $dossier, string $step, string $requirement): string|null
    {
        return match ($step . '.' . $requirement) {
            'contract.contract_created', 'contract.contract_generated', 'contract.contract_signed' => route('contracts.index', ['dossier_id' => $dossier->id]),
            'rokhas.rokhas_upload' => route('documents.index', ['dossier_id' => $dossier->id]),
            'archive.documents_verified' => null,
            'archive.archive_created', 'archive.file_stored' => route('archives.index', ['dossier_id' => $dossier->id]),
            default => route('documents.index', ['dossier_id' => $dossier->id]),
        };
    }

    private function requirementHasFile(Dossier $dossier, string $step, string $requirement): bool
    {
        return match ($step . '.' . $requirement) {
            'documents.cin' => $this->hasCompleteCin($dossier),
            'documents.certificat_propriete' => $this->hasDocument($dossier, ['certificat propriete', 'certificat de propriete', 'titre foncier']),
            'documents.plan_cadastral' => $this->hasDocument($dossier, ['plan cadastral']),
            'documents.calcul_contenance' => $this->hasDocument($dossier, ['calcul contenance', 'contenance']),
            'documents.plan_parcellaire' => $this->hasDocument($dossier, ['plan parcellaire']),
            'documents.statut' => $this->hasDocument($dossier, ['statut', 'statuts']),
            'documents.rce' => $this->hasDocument($dossier, ['rce', 'registre commerce', 'registre du commerce']),
            'documents.desistement' => $this->hasDocument($dossier, ['desistement']),
            'documents.procuration' => $this->hasDocument($dossier, ['procuration']),
            'rokhas.rokhas_upload' => $this->hasDocument($dossier, ['rokhas', 'depot dossier', 'recepisse depot']),
            'rokhas.fiche_energetique' => $this->hasDocument($dossier, ['fiche energetique', 'efficacite energetique', 'efficacite energetic']),
            'bureau_etude.contract_bureau_etude' => $this->hasDocument($dossier, ['contrat bureau etude', 'contract bureau etude']),
            'bureau_etude.plan_beton' => $this->hasDocument($dossier, ['plan beton', 'beton arme', 'plan ba']),
            'bureau_etude.attestation_implantation' => $this->hasDocument($dossier, ['attestation implantation', 'implantation']),
            'bureau_etude.contrat_topographie' => $this->hasDocument($dossier, ['contrat topographie', 'topographie', 'topographe']),
            'bureau_etude.contrat_laboratoire' => $this->hasDocument($dossier, ['contrat laboratoire', 'laboratoire']),
            'bureau_etude.bureau_controle' => $this->hasDocument($dossier, ['bureau de controle', 'controle technique']),
            'bureau_etude.attestation_situation_reguliere' => $this->hasDocument($dossier, ['attestation situation reguliere']),
            'bureau_etude.topographe' => $this->hasDocument($dossier, ['topographe']),
            'permis_habiter.demande_permis_habiter' => $this->hasDocument($dossier, ['demande permis habiter', 'permis d habiter', 'permis habiter']),
            'permis_habiter.site_images' => $this->hasDocument($dossier, ['image site', 'photo site', 'photos site', 'location']),
            'permis_habiter.recent_certificat_propriete' => $this->hasDocument($dossier, ['certificat propriete recent', 'certificat de propriete recent']),
            default => false,
        };
    }
}
