<?php

namespace App\Services\Dossiers;

use App\Enums\PaymentKind;
use App\Http\Resources\DossierResource;
use App\Models\ArchiveRecord;
use App\Models\Box;
use App\Models\City;
use App\Models\Client;
use App\Models\Contract;
use App\Models\DocumentTemplate;
use App\Models\Dossier;
use App\Models\DossierDocument;
use App\Models\FinanceDocument;
use App\Models\Room;
use App\Models\Shelf;
use App\Models\User;
use App\Services\CompanyContext;
use App\Services\Finance\DossierFinanceEligibilityService;
use App\Services\PermissionRegistry;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Route;

class ProjectWorkspaceDataService
{
    public function __construct(
        private readonly CompanyContext $companyContext,
        private readonly PermissionRegistry $permissions,
        private readonly DossierWorkflowStepperService $workflowStepper,
        private readonly DossierFinanceEligibilityService $financeEligibility,
        private readonly ProjectActivityService $activity,
    ) {
    }

    public function build(Dossier $dossier, User $user, Request $request): array
    {
        $capabilities = $this->capabilities($dossier, $user);

        $relations = [
            'client.intermediary',
            'city',
            'workflowRequirementHistories.changedBy',
        ];

        if ($capabilities['canViewDocuments']) {
            $relations[] = 'documents.template';
        }

        if ($capabilities['canViewContract']) {
            $relations[] = 'contract';
        }

        if ($capabilities['canViewFinance']) {
            $relations[] = 'financeDocuments.payments';
            $relations[] = 'financeDocuments.creator';
            $relations[] = 'payments.document';
            $relations[] = 'payments.receiptDocument';
            $relations[] = 'payments.creator';
        }

        if ($capabilities['canViewArchive']) {
            $relations[] = 'archiveRecord.events.actor';
        }

        $dossier->load($relations);

        if ($capabilities['canViewDocuments']) {
            $dossier->loadCount('documents');
        }

        if ($capabilities['canViewFinance']) {
            $dossier->loadCount('financeDocuments');
        }

        if ($capabilities['canViewContract']) {
            $dossier->loadExists('contract');
        }

        if ($capabilities['canViewArchive']) {
            $dossier->loadExists('archiveRecord');
        }

        if ($capabilities['canViewFinance']) {
            $dossier->setRelation(
                'financeDocuments',
                $dossier->financeDocuments
                    ->filter(fn (FinanceDocument $document) => $this->sameFinanceScope($dossier, $document))
                    ->values(),
            );

            $dossier->setRelation(
                'payments',
                $dossier->payments
                    ->filter(fn ($payment) => $this->sameFinanceScope($dossier, $payment))
                    ->values(),
            );

            $dossier->setAttribute(
                'finance_documents_count',
                $dossier->financeDocuments->count(),
            );
        }

        $documents = $capabilities['canViewDocuments']
            ? $this->documentPayload($dossier, $user)
            : collect();

        $contract = $capabilities['canViewContract']
            ? $this->contractPayload($dossier)
            : null;

        $finance = $capabilities['canViewFinance']
            ? $this->financePayload($dossier)
            : null;

        $archive = $capabilities['canViewArchive']
            ? $this->archivePayload($dossier)
            : null;

        $canMutateProject = $capabilities['canUpdate'];

        return [
            'dossier' => DossierResource::make($dossier)->resolve($request),
            'capabilities' => $capabilities,

            // Existing frontend compatibility.
            'canDesign' => $capabilities['canViewProjectDesign'],
            'workflow' => $this->workflowStepper->evaluate($dossier),
            'documents' => $documents->values(),
            'contract' => $contract,
            'financeRecords' => $finance['legacyRecords'] ?? collect(),
            'archiveRecord' => $archive,

            // New backend contract for Projects Workspace V2.
            'financeDocuments' => $finance['documents'] ?? collect(),
            'payments' => $finance['payments'] ?? collect(),
            'finance' => $finance !== null
                ? [
                    'summary' => $finance['summary'],
                    'eligibility' => $finance['eligibility'],
                    'advances' => $finance['advances'],
                ]
                : null,
            'activity' => $this->activity->forDossier($dossier, [
                'documents' => $capabilities['canViewDocuments'],
                'contract' => $capabilities['canViewContract'],
                'finance' => $capabilities['canViewFinance'],
                'archive' => $capabilities['canViewArchive'],
                'projectDesign' => $capabilities['canViewProjectDesign'],
            ]),

            'clients' => $canMutateProject
                ? $this->clientOptions($user)
                : [],
            'cities' => $canMutateProject
                ? City::query()
                    ->where('is_active', true)
                    ->orderBy('name')
                    ->get(['id', 'name', 'code', 'color'])
                : [],
            'dossiers' => $capabilities['canViewDocuments']
                ? $this->dossierOptions($user)
                : [],
            'templates' => $capabilities['canViewDocuments']
                ? $this->documentTemplateOptions()
                : [],
            'contractClients' => $capabilities['canViewContract']
                ? $this->contractClientOptions($user)
                : [],
            'financeDossiers' => $capabilities['canViewFinance']
                ? $this->financeDossierOptions($user)
                : [],
            'archiveRooms' => $capabilities['canViewArchive']
                ? Room::query()->orderBy('code')->get(['id', 'code', 'name'])
                : [],
            'archiveShelves' => $capabilities['canViewArchive']
                ? Shelf::query()->orderBy('code')->get(['id', 'room_id', 'code', 'name'])
                    ->map(fn (Shelf $shelf) => [
                        'id' => $shelf->id,
                        'roomId' => $shelf->room_id,
                        'code' => $shelf->code,
                        'name' => $shelf->name,
                    ])
                : [],
            'archiveBoxes' => $capabilities['canViewArchive']
                ? Box::query()->orderBy('code')->get(['id', 'shelf_id', 'code', 'name'])
                    ->map(fn (Box $box) => [
                        'id' => $box->id,
                        'shelfId' => $box->shelf_id,
                        'code' => $box->code,
                        'name' => $box->name,
                    ])
                : [],
        ];
    }

    private function capabilities(Dossier $dossier, User $user): array
    {
        return [
            'canUpdate' => $user->can('update', $dossier),
            'canDelete' => $user->can('delete', $dossier),
            'canUpdateWorkflow' => $user->can('updateWorkflow', $dossier),
            'canViewDocuments' => $this->permissions->allows($user, 'documents.view'),
            'canCreateDocuments' => $this->permissions->allows($user, 'documents.create'),
            'canViewContract' => $this->permissions->allows($user, 'contracts.view'),
            'canCreateContract' => $this->permissions->allows($user, 'contracts.create'),
            'canViewFinance' => $this->permissions->allows($user, 'finance.view'),
            'canCreateFinanceDocuments' => $this->permissions->allows($user, 'finance.documents.create'),
            'canRecordPayments' => $this->permissions->allows($user, 'finance.payments.create'),
            'canViewArchive' => $this->permissions->allows($user, 'archive.view'),
            'canUpdateArchive' => $this->permissions->allows($user, 'archive.update'),
            'canViewProjectDesign' => $this->permissions->allows($user, 'project-design.view'),
        ];
    }

    private function documentPayload(Dossier $dossier, User $user): Collection
    {
        return $dossier->documents
            ->sortByDesc(fn (DossierDocument $document) => $document->uploaded_at ?? $document->created_at)
            ->map(function (DossierDocument $document) use ($user): array {
                $canDownload = $user->can('download', $document);

                return [
                    'id' => $document->id,
                    'documentNumber' => $document->document_number,
                    'name' => $document->template?->name
                        ?? $document->original_filename
                        ?? $document->document_number
                        ?? 'Document',
                    'status' => $document->status,
                    'fileName' => $document->original_filename,
                    'mimeType' => $document->mime_type,
                    'sizeBytes' => $document->size_bytes,
                    'uploadedAt' => optional($document->uploaded_at)->format('Y-m-d'),
                    'verifiedAt' => optional($document->verified_at)->format('Y-m-d'),
                    'notes' => $document->notes,
                    'downloadUrl' => $canDownload && Route::has('documents.download')
                        ? route('documents.download', $document)
                        : null,
                ];
            });
    }

    private function contractPayload(Dossier $dossier): ?array
    {
        $contract = $dossier->contract;

        if (! $contract) {
            return null;
        }

        return [
            'id' => $contract->id,
            'dossierId' => (string) $contract->dossier_id,
            'contractNumber' => $contract->contract_number,
            'status' => $contract->status,
            'surface' => (float) $contract->surface,
            'pricePerSquareMeter' => (float) $contract->price_per_square_meter,
            'feeRatePercent' => (float) $contract->fee_rate_percent,
            'calculationMode' => $contract->calculation_mode,
            'forfaitTtc' => (float) $contract->forfait_ttc,
            'ht' => (float) $contract->ht,
            'tva' => (float) $contract->tva,
            'ttc' => (float) $contract->ttc,
            'notes' => $contract->notes,
            'generatedAt' => optional($contract->generated_at)->format('Y-m-d'),
            'signedAt' => optional($contract->signed_at)->format('Y-m-d'),
            'createdAt' => optional($contract->created_at)->format('Y-m-d'),
            'hasGeneratedDoc' => filled($contract->generated_document_path),
            'hasPdf' => filled($contract->pdf_path),
        ];
    }

    private function financePayload(Dossier $dossier): array
    {
        $documents = $dossier->financeDocuments
            ->sortByDesc(fn (FinanceDocument $document) => $document->issue_date ?? $document->created_at)
            ->values();

        $documentPayload = $documents->map(fn (FinanceDocument $document) => [
            'id' => $document->id,
            'type' => $document->type,
            'number' => $document->number,
            'status' => $document->status,
            'issueDate' => optional($document->issue_date)->format('Y-m-d'),
            'dueDate' => optional($document->due_date)->format('Y-m-d'),
            'validUntil' => optional($document->valid_until)->format('Y-m-d'),
            'currency' => $document->currency ?: 'MAD',
            'totalTtc' => (float) $document->total_ttc,
            'paidTotal' => (float) $document->paid_total,
            'remainingTotal' => (float) $document->remaining_total,
            'acceptedAt' => optional($document->accepted_at)->toIso8601String(),
            'issuedAt' => optional($document->issued_at)->toIso8601String(),
            'generatedAt' => optional($document->generated_at)->toIso8601String(),
        ]);

        $payments = $dossier->payments
            ->sortByDesc(fn ($payment) => $payment->paid_at ?? $payment->created_at)
            ->values();

        $paymentPayload = $payments->map(fn ($payment) => [
            'id' => $payment->id,
            'paymentNumber' => $payment->payment_number ?: '#'.$payment->id,
            'kind' => $payment->payment_kind instanceof PaymentKind
                ? $payment->payment_kind->value
                : (string) $payment->payment_kind,
            'financeDocumentId' => $payment->finance_document_id,
            'documentNumber' => $payment->document?->number,
            'receiptDocumentId' => $payment->receipt_document_id,
            'receiptNumber' => $payment->receiptDocument?->number,
            'amount' => (float) $payment->amount,
            'method' => $payment->method,
            'reference' => $payment->reference,
            'paidAt' => optional($payment->paid_at)->format('Y-m-d'),
            'notes' => $payment->notes,
        ]);

        $advances = $paymentPayload
            ->filter(fn (array $payment) => $payment['kind'] === PaymentKind::Advance->value)
            ->values();

        $activeInvoices = $documents
            ->filter(fn (FinanceDocument $document) => $document->isInvoice() && $document->status !== 'cancelled');

        $legacyRecords = $documentPayload->map(fn (array $document) => [
            'id' => $document['id'],
            'recordNumber' => $document['number'],
            'type' => $document['type'],
            'status' => $document['status'],
            'totalTtc' => $document['totalTtc'],
            'paid' => $document['paidTotal'],
            'remaining' => $document['remainingTotal'],
        ]);

        return [
            'documents' => $documentPayload,
            'payments' => $paymentPayload,
            'advances' => $advances,
            'legacyRecords' => $legacyRecords,
            'eligibility' => $this->financeEligibility->stateForDocuments($documents),
            'summary' => [
                'currency' => $documents->first()?->currency ?: 'MAD',
                'documentsCount' => $documents->count(),
                'quotesCount' => $documents->where('type', 'quote')->count(),
                'activeInvoicesCount' => $activeInvoices->count(),
                'totalTtc' => (float) $activeInvoices->sum('total_ttc'),
                'paidTotal' => (float) $activeInvoices->sum('paid_total'),
                'remainingTotal' => (float) $activeInvoices->sum('remaining_total'),
                'unappliedAdvancesTotal' => (float) $payments
                    ->filter(function ($payment): bool {
                        $kind = $payment->payment_kind instanceof PaymentKind
                            ? $payment->payment_kind->value
                            : (string) $payment->payment_kind;

                        return $kind === PaymentKind::Advance->value
                            && $payment->finance_document_id === null;
                    })
                    ->sum('amount'),
            ],
        ];
    }

    private function archivePayload(Dossier $dossier): ?array
    {
        $archive = $dossier->archiveRecord;

        if (! $archive) {
            return null;
        }

        return [
            'id' => $archive->id,
            'dossierId' => (string) $archive->dossier_id,
            'clientId' => (string) ($dossier->client_id ?? ''),
            'dossierNumber' => $dossier->dossier_number,
            'projectObject' => $dossier->project_object,
            'clientName' => $dossier->client?->full_name ?? '',
            'clientCin' => $dossier->client?->cin ?? '',
            'archiveNumber' => $archive->archive_number,
            'status' => $archive->status,
            'room' => $archive->room,
            'shelf' => $archive->shelf,
            'box' => $archive->box,
            'folder' => $archive->folder,
            'inDate' => optional($archive->in_date)->format('Y-m-d'),
            'outDate' => optional($archive->out_date)->format('Y-m-d'),
            'returnedAt' => optional($archive->returned_at)->format('Y-m-d'),
            'requestedBy' => $archive->requested_by,
            'notes' => $archive->notes,
            'isOverdue' => $archive->isOverdue(),
            'isLost' => (bool) $archive->is_lost,
            'lostReason' => $archive->lost_reason,
            'locationLabel' => trim(implode(' / ', array_filter([
                $archive->room,
                $archive->shelf,
                $archive->box,
                $archive->folder,
            ]))),
        ];
    }

    private function clientOptions(User $user): array
    {
        return $this->companyContext->applyTo(Client::query(), $user)
            ->orderBy('full_name')
            ->get()
            ->map(fn (Client $client) => [
                'id' => (string) $client->id,
                'label' => $client->client_number.' - '.$client->full_name,
            ])
            ->values()
            ->all();
    }

    private function dossierOptions(User $user): Collection
    {
        return $this->companyContext->applyTo(Dossier::query(), $user)
            ->with('client:id,full_name')
            ->latest('created_at')
            ->get(['id', 'client_id', 'dossier_number', 'project_object'])
            ->map(fn (Dossier $dossier) => [
                'id' => (string) $dossier->id,
                'label' => trim(implode(' - ', array_filter([
                    $dossier->dossier_number,
                    $dossier->project_object,
                    $dossier->client?->full_name,
                ]))),
                'clientId' => (string) $dossier->client_id,
            ])
            ->values();
    }

    private function documentTemplateOptions(): Collection
    {
        return DocumentTemplate::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(fn (DocumentTemplate $template) => [
                'id' => (string) $template->id,
                'label' => $template->name,
                'code' => $template->code,
                'documentType' => $template->document_type,
                'isRequired' => (bool) $template->is_required,
            ])
            ->values();
    }

    private function contractClientOptions(User $user): Collection
    {
        return $this->companyContext->applyTo(Client::query(), $user)
            ->with([
                'dossiers' => fn ($query) => $this->companyContext
                    ->applyTo($query->getQuery(), $user)
                    ->with('contract')
                    ->latest('created_at'),
            ])
            ->orderBy('full_name')
            ->get()
            ->map(fn (Client $client) => [
                'id' => (string) $client->id,
                'fullName' => $client->full_name,
                'cin' => $client->cin,
                'dossiers' => $client->dossiers->map(fn (Dossier $dossier) => [
                    'id' => (string) $dossier->id,
                    'label' => $dossier->dossier_number.' - '.$dossier->project_object,
                    'floorArea' => $dossier->floor_area !== null
                        ? (float) $dossier->floor_area
                        : null,
                    'hasContract' => $dossier->contract !== null,
                ])->values()->all(),
            ])
            ->values();
    }

    private function sameFinanceScope(Dossier $dossier, mixed $record): bool
    {
        if ((int) $record->company_id !== (int) $dossier->company_id) {
            return false;
        }

        if ($dossier->branch_id === null) {
            return $record->branch_id === null;
        }

        return (int) $record->branch_id === (int) $dossier->branch_id;
    }

    private function financeDossierOptions(User $user): Collection
    {
        return $this->companyContext->applyTo(Dossier::query(), $user)
            ->with('client:id,full_name')
            ->latest('created_at')
            ->get(['id', 'client_id', 'dossier_number', 'project_object'])
            ->map(fn (Dossier $dossier) => [
                'id' => (string) $dossier->id,
                'label' => trim(implode(' - ', array_filter([
                    $dossier->dossier_number,
                    $dossier->project_object,
                    $dossier->client?->full_name,
                ]))),
                'clientName' => $dossier->client?->full_name ?? '-',
            ])
            ->values();
    }
}
