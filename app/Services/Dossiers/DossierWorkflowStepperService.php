<?php

namespace App\Services\Dossiers;

use App\Enums\DossierWorkflowStepStatus;
use App\Models\Dossier;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class DossierWorkflowStepperService
{
    public function evaluate(Dossier $dossier): array
    {
        $dossier->loadMissing(['documents.template', 'contract', 'authorization', 'workflowRequirements.checkedBy']);

        $steps = collect(config('archilbo_workflow.client_project_steps', []))
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

                return [
                    ...$requirement,
                    'done' => $this->requirementDone($dossier, (string) $step['key'], (string) $requirement['key'], $isManualConfig),
                    'manual' => $isManualConfig || $manualRecord !== null,
                    'notes' => $manualRecord?->notes,
                    'checkedAt' => optional($manualRecord?->checked_at)->format('Y-m-d H:i'),
                    'checkedBy' => $manualRecord?->checkedBy?->name,
                    'actionLabel' => $isManualConfig ? null : $this->requirementActionLabel($dossier, (string) $step['key'], (string) $requirement['key']),
                    'actionUrl' => $isManualConfig ? null : $this->requirementActionUrl($dossier, (string) $step['key'], (string) $requirement['key']),
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
            'documents.cin' => $this->hasDocument($dossier, ['cin', 'cni', 'carte nationale']),
            'documents.certificat_propriete' => $this->hasDocument($dossier, ['certificat propriete', 'certificat de propriete', 'titre foncier']),
            'documents.terrain_documents' => $this->terrainDocumentsReady($dossier),

            'contract.contract_created' => (bool) $dossier->contract,
            'contract.contract_generated' => filled($dossier->contract?->generated_document_path) || filled($dossier->contract?->generated_at),
            'contract.contract_signed' => filled($dossier->contract?->signed_at) || in_array($dossier->contract?->status, ['signed', 'cachete', 'contrat_cachete'], true),

            'cahier_chantier.engineer_request' => $this->hasDocument($dossier, ['demande ingenieur', 'centre ingenieur', 'cahier chantier demande']),
            'cahier_chantier.cahier_received' => $this->hasDocument($dossier, ['cahier de chantier', 'cahier chantier']),

            'rokhas.rokhas_upload' => in_array($dossier->authorization?->status, ['submitted', 'under_review', 'approved', 'authorization_received'], true)
                || filled($dossier->authorization?->submission_number)
                || filled($dossier->authorization?->submitted_at),
            'rokhas.fiche_energetique' => $this->hasDocument($dossier, ['fiche energetique', 'efficacite energetique', 'efficacite energetic']),

            'bureau_etude.contract_bureau_etude' => $this->hasDocument($dossier, ['contrat bureau etude', 'contract bureau etude']),
            'bureau_etude.plan_beton' => $this->hasDocument($dossier, ['plan beton', 'beton arme', 'plan ba']),
            'bureau_etude.implantation_topographie' => $this->hasDocument($dossier, ['implantation', 'topographie', 'topographe']),
            'bureau_etude.laboratoire_controle' => $this->hasDocument($dossier, ['laboratoire', 'bureau de controle', 'controle technique']),

            'permis_habiter.demande_permis_habiter' => $this->hasDocument($dossier, ['demande permis habiter', 'permis d habiter', 'permis habiter']),
            'permis_habiter.site_images' => $this->hasDocument($dossier, ['image site', 'photo site', 'photos site', 'location']),
            'permis_habiter.recent_certificat_propriete' => $this->hasDocument($dossier, ['certificat propriete recent', 'certificat de propriete recent'])
                || $this->hasDocument($dossier, ['certificat propriete', 'certificat de propriete', 'titre foncier']),

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

    private function terrainDocumentsReady(Dossier $dossier): bool
    {
        if ($this->hasDocument($dossier, ['plan parcellaire'])) {
            return true;
        }

        return $this->hasDocument($dossier, ['plan cadastral'])
            && $this->hasDocument($dossier, ['calcul contenance', 'contenance']);
    }

    private function archiveDocumentsVerified(Dossier $dossier): bool
    {
        $allSteps = config('archilbo_workflow.client_project_steps', []);

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
            'rokhas' => 'Ouvrir autorisations',
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
            'rokhas' => route('authorizations.index', ['dossier_id' => $dossier->id]),
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
            'rokhas.rokhas_upload' => 'Suivre Rokhas',
            'archive.documents_verified' => null,
            'archive.archive_created' => $dossier->archiveRecord ? 'Ouvrir la fiche d archive' : 'Creer la fiche d archive',
            'archive.file_stored' => 'Ouvrir la fiche d archive',
            default => 'Televerser / ouvrir',
        };
    }

    private function requirementActionUrl(Dossier $dossier, string $step, string $requirement): string|null
    {
        return match ($step . '.' . $requirement) {
            'contract.contract_created', 'contract.contract_generated', 'contract.contract_signed' => route('contracts.index', ['dossier_id' => $dossier->id]),
            'rokhas.rokhas_upload' => route('authorizations.index', ['dossier_id' => $dossier->id]),
            'archive.documents_verified' => null,
            'archive.archive_created', 'archive.file_stored' => route('archives.index', ['dossier_id' => $dossier->id]),
            default => route('documents.index', ['dossier_id' => $dossier->id]),
        };
    }
}
