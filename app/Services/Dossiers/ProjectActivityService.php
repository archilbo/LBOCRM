<?php

namespace App\Services\Dossiers;

use App\Enums\PaymentKind;
use App\Models\AuditLog;
use App\Models\Dossier;
use App\Models\ProjectDesign\ProjectDesignFile;
use App\Models\ProjectDesign\ProjectDesignFileVersion;
use App\Models\ProjectDesign\ProjectDesignRemark;
use Carbon\CarbonInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Route;

class ProjectActivityService
{
    public function forDossier(Dossier $dossier, array $visibility): array
    {
        $items = collect();

        $this->appendAuditEvents($items, $dossier);
        $this->appendProjectFallbackEvents($items, $dossier);
        $this->appendWorkflowEvents($items, $dossier);

        if ($visibility['documents'] ?? false) {
            $this->appendDocumentEvents($items, $dossier);
        }

        if ($visibility['contract'] ?? false) {
            $this->appendContractEvents($items, $dossier);
        }

        if ($visibility['finance'] ?? false) {
            $this->appendFinanceEvents($items, $dossier);
        }

        if ($visibility['archive'] ?? false) {
            $this->appendArchiveEvents($items, $dossier);
        }

        if ($visibility['projectDesign'] ?? false) {
            $this->appendProjectDesignEvents($items, $dossier);
        }

        return $items
            ->filter(fn (array $item) => $item['_timestamp'] !== null)
            ->sortByDesc('_timestamp')
            ->take(80)
            ->map(function (array $item): array {
                unset($item['_timestamp']);

                return $item;
            })
            ->values()
            ->all();
    }

    private function appendAuditEvents(Collection $items, Dossier $dossier): void
    {
        AuditLog::query()
            ->with('user:id,name')
            ->where('auditable_type', Dossier::class)
            ->where('auditable_id', $dossier->id)
            ->latest('created_at')
            ->limit(30)
            ->get()
            ->each(function (AuditLog $log) use ($items, $dossier): void {
                $type = match ($log->action) {
                    'dossier.created' => 'project_created',
                    'dossier.updated' => 'project_updated',
                    'dossier.deleted' => 'project_deleted',
                    default => str_replace('.', '_', $log->action),
                };

                $this->push(
                    $items,
                    'audit-'.$log->id,
                    'project',
                    $type,
                    $this->titleForAuditAction($log->action),
                    $log->description,
                    $log->user,
                    $log->created_at,
                    $log->metadata ?? [],
                    $this->projectHref($dossier),
                );
            });
    }

    private function appendProjectFallbackEvents(Collection $items, Dossier $dossier): void
    {
        if (! $items->contains(fn (array $item) => $item['type'] === 'project_created')) {
            $this->push(
                $items,
                'project-'.$dossier->id.'-created',
                'project',
                'project_created',
                'Project created',
                $dossier->dossier_number.' — '.$dossier->project_object,
                null,
                $dossier->created_at,
                ['status' => $dossier->status],
                $this->projectHref($dossier),
            );
        }

        if (
            $dossier->updated_at !== null
            && $dossier->created_at !== null
            && ! $dossier->updated_at->equalTo($dossier->created_at)
            && ! $items->contains(fn (array $item) => $item['type'] === 'project_updated')
        ) {
            $this->push(
                $items,
                'project-'.$dossier->id.'-updated',
                'project',
                'project_updated',
                'Project updated',
                $dossier->project_object,
                null,
                $dossier->updated_at,
                ['status' => $dossier->status],
                $this->projectHref($dossier),
            );
        }
    }

    private function appendWorkflowEvents(Collection $items, Dossier $dossier): void
    {
        $dossier->workflowRequirementHistories()
            ->with('changedBy:id,name')
            ->latest('changed_at')
            ->limit(30)
            ->get()
            ->each(function ($history) use ($items, $dossier): void {
                $this->push(
                    $items,
                    'workflow-'.$history->id,
                    'workflow',
                    'workflow_updated',
                    $history->new_is_done
                        ? 'Workflow requirement completed'
                        : 'Workflow requirement reopened',
                    trim($history->step_key.' / '.$history->requirement_key),
                    $history->changedBy,
                    $history->changed_at ?? $history->created_at,
                    [
                        'stepKey' => $history->step_key,
                        'requirementKey' => $history->requirement_key,
                        'oldIsDone' => (bool) $history->old_is_done,
                        'newIsDone' => (bool) $history->new_is_done,
                    ],
                    $this->tabHref($dossier, 'workflow'),
                );
            });
    }

    private function appendDocumentEvents(Collection $items, Dossier $dossier): void
    {
        $dossier->documents()
            ->with('template:id,name')
            ->latest('uploaded_at')
            ->limit(25)
            ->get()
            ->each(function ($document) use ($items, $dossier): void {
                $name = $document->template?->name
                    ?? $document->original_filename
                    ?? $document->document_number
                    ?? 'Document';

                $this->push(
                    $items,
                    'document-'.$document->id,
                    'documents',
                    'document_created',
                    'Document added',
                    $name,
                    null,
                    $document->uploaded_at ?? $document->created_at,
                    [
                        'documentId' => $document->id,
                        'documentNumber' => $document->document_number,
                        'status' => $document->status,
                    ],
                    $this->tabHref($dossier, 'documents'),
                );
            });
    }

    private function appendContractEvents(Collection $items, Dossier $dossier): void
    {
        $contract = $dossier->contract()->first();

        if (! $contract) {
            return;
        }

        $this->push(
            $items,
            'contract-'.$contract->id,
            'contract',
            $contract->signed_at ? 'contract_signed' : 'contract_created',
            $contract->signed_at ? 'Contract signed' : 'Contract created',
            $contract->contract_number,
            null,
            $contract->signed_at ?? $contract->generated_at ?? $contract->created_at,
            [
                'contractId' => $contract->id,
                'status' => $contract->status,
                'ttc' => (float) $contract->ttc,
            ],
            $this->tabHref($dossier, 'contract'),
        );
    }

    private function appendFinanceEvents(Collection $items, Dossier $dossier): void
    {
        $dossier->financeDocuments()
            ->where('company_id', $dossier->company_id)
            ->when(
                $dossier->branch_id !== null,
                fn ($query) => $query->where('branch_id', $dossier->branch_id),
                fn ($query) => $query->whereNull('branch_id'),
            )
            ->with('creator:id,name')
            ->latest('created_at')
            ->limit(25)
            ->get()
            ->each(function ($document) use ($items, $dossier): void {
                $this->push(
                    $items,
                    'finance-document-'.$document->id,
                    'finance',
                    'finance_document_created',
                    ucfirst($document->type).' created',
                    $document->number,
                    $document->creator,
                    $document->issued_at ?? $document->created_at,
                    [
                        'financeDocumentId' => $document->id,
                        'type' => $document->type,
                        'status' => $document->status,
                        'amount' => (float) $document->total_ttc,
                        'currency' => $document->currency ?: 'MAD',
                    ],
                    $this->tabHref($dossier, 'finance'),
                );
            });

        $dossier->payments()
            ->where('company_id', $dossier->company_id)
            ->when(
                $dossier->branch_id !== null,
                fn ($query) => $query->where('branch_id', $dossier->branch_id),
                fn ($query) => $query->whereNull('branch_id'),
            )
            ->with('creator:id,name')
            ->latest('paid_at')
            ->limit(25)
            ->get()
            ->each(function ($payment) use ($items, $dossier): void {
                $kind = $payment->payment_kind instanceof PaymentKind
                    ? $payment->payment_kind->value
                    : (string) $payment->payment_kind;

                $this->push(
                    $items,
                    'payment-'.$payment->id,
                    'finance',
                    $kind === PaymentKind::Advance->value
                        ? 'advance_recorded'
                        : 'payment_recorded',
                    $kind === PaymentKind::Advance->value
                        ? 'Project advance recorded'
                        : 'Payment recorded',
                    $payment->payment_number ?: '#'.$payment->id,
                    $payment->creator,
                    $payment->paid_at ?? $payment->created_at,
                    [
                        'paymentId' => $payment->id,
                        'paymentKind' => $kind,
                        'amount' => (float) $payment->amount,
                        'method' => $payment->method,
                    ],
                    $this->tabHref($dossier, 'finance'),
                );
            });
    }

    private function appendArchiveEvents(Collection $items, Dossier $dossier): void
    {
        $archive = $dossier->archiveRecord()
            ->with('events.actor:id,name')
            ->first();

        if (! $archive) {
            return;
        }

        $this->push(
            $items,
            'archive-'.$archive->id,
            'archive',
            'archive_created',
            'Archive record created',
            $archive->archive_number,
            null,
            $archive->created_at,
            [
                'archiveRecordId' => $archive->id,
                'status' => $archive->status,
                'location' => trim(implode(' / ', array_filter([
                    $archive->room,
                    $archive->shelf,
                    $archive->box,
                    $archive->folder,
                ]))),
            ],
            $this->projectHref($dossier),
        );

        $archive->events
            ->sortByDesc('created_at')
            ->take(20)
            ->each(function ($event) use ($items, $dossier): void {
                $this->push(
                    $items,
                    'archive-event-'.$event->id,
                    'archive',
                    'archive_'.$event->type,
                    'Archive '.str_replace('_', ' ', $event->type),
                    null,
                    $event->actor,
                    $event->created_at,
                    $event->payload ?? [],
                    $this->projectHref($dossier),
                );
            });
    }

    private function appendProjectDesignEvents(Collection $items, Dossier $dossier): void
    {
        ProjectDesignFile::query()
            ->with('createdBy:id,name')
            ->where('company_id', $dossier->company_id)
            ->where('dossier_id', $dossier->id)
            ->when(
                $dossier->branch_id !== null,
                fn ($query) => $query->where('branch_id', $dossier->branch_id),
                fn ($query) => $query->whereNull('branch_id'),
            )
            ->latest('created_at')
            ->limit(20)
            ->get()
            ->each(function (ProjectDesignFile $file) use ($items, $dossier): void {
                $this->push(
                    $items,
                    'design-file-'.$file->id,
                    'project-design',
                    'design_file_created',
                    'Design file created',
                    $file->name,
                    $file->createdBy,
                    $file->created_at,
                    [
                        'fileId' => $file->id,
                        'code' => $file->code,
                        'status' => $file->status,
                    ],
                    $this->tabHref($dossier, 'project-design'),
                );
            });

        ProjectDesignFileVersion::query()
            ->with(['uploadedBy:id,name', 'file:id,name'])
            ->where('company_id', $dossier->company_id)
            ->where('dossier_id', $dossier->id)
            ->latest('created_at')
            ->limit(20)
            ->get()
            ->each(function (ProjectDesignFileVersion $version) use ($items, $dossier): void {
                $this->push(
                    $items,
                    'design-version-'.$version->id,
                    'project-design',
                    'design_version_uploaded',
                    'Design revision uploaded',
                    ($version->file?->name ?? 'Design file').' — '.$version->revision_code,
                    $version->uploadedBy,
                    $version->created_at,
                    [
                        'fileId' => $version->file_id,
                        'versionId' => $version->id,
                        'revisionCode' => $version->revision_code,
                        'status' => $version->status,
                    ],
                    $this->tabHref($dossier, 'project-design'),
                );
            });

        ProjectDesignRemark::query()
            ->with(['createdBy:id,name', 'version.file:id,name'])
            ->where('company_id', $dossier->company_id)
            ->whereHas(
                'version',
                fn ($query) => $query
                    ->where('company_id', $dossier->company_id)
                    ->where('dossier_id', $dossier->id),
            )
            ->latest('created_at')
            ->limit(20)
            ->get()
            ->each(function (ProjectDesignRemark $remark) use ($items, $dossier): void {
                $this->push(
                    $items,
                    'design-remark-'.$remark->id,
                    'project-design',
                    'design_remark_created',
                    'Design remark created',
                    $remark->title,
                    $remark->createdBy,
                    $remark->created_at,
                    [
                        'remarkId' => $remark->id,
                        'versionId' => $remark->version_id,
                        'fileName' => $remark->version?->file?->name,
                        'severity' => $remark->severity,
                        'status' => $remark->status,
                    ],
                    $this->tabHref($dossier, 'project-design'),
                );
            });
    }

    private function push(
        Collection $items,
        string $id,
        string $category,
        string $type,
        string $title,
        ?string $description,
        mixed $actor,
        mixed $occurredAt,
        array $metadata,
        ?string $href,
    ): void {
        $date = $occurredAt instanceof CarbonInterface
            ? $occurredAt
            : null;

        $items->push([
            'id' => $id,
            'category' => $category,
            'type' => $type,
            'title' => $title,
            'description' => $description,
            'actor' => $actor
                ? [
                    'id' => (int) $actor->id,
                    'name' => (string) $actor->name,
                ]
                : null,
            'occurredAt' => $date?->toIso8601String(),
            'occurredAtLabel' => $date?->diffForHumans(),
            'href' => $href,
            'metadata' => $metadata,
            '_timestamp' => $date?->getTimestamp(),
        ]);
    }

    private function titleForAuditAction(string $action): string
    {
        return match ($action) {
            'dossier.created' => 'Project created',
            'dossier.updated' => 'Project updated',
            'dossier.deleted' => 'Project deleted',
            default => str($action)
                ->replace('.', ' ')
                ->headline()
                ->toString(),
        };
    }

    private function projectHref(Dossier $dossier): ?string
    {
        return Route::has('dossiers.show')
            ? route('dossiers.show', $dossier)
            : null;
    }

    private function tabHref(Dossier $dossier, string $tab): ?string
    {
        return Route::has('dossiers.show')
            ? route('dossiers.show', ['dossier' => $dossier, 'tab' => $tab])
            : null;
    }
}
