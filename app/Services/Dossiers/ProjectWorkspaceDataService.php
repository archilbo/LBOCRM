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
use App\Models\Intermediary;
use App\Models\Room;
use App\Models\Shelf;
use App\Models\User;
use App\Services\CompanyContext;
use App\Services\Documents\WorkflowDocumentTemplateResolver;
use App\Services\Finance\DossierFinanceEligibilityService;
use App\Services\Finance\FinanceReceivablesService;
use App\Services\Finance\FinanceSettingsService;
use App\Services\PermissionRegistry;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Route;

class ProjectWorkspaceDataService
{
    public function __construct(
        private readonly CompanyContext $companyContext,
        private readonly PermissionRegistry $permissions,
        private readonly WorkflowDocumentTemplateResolver $documentTemplateResolver,
        private readonly DossierWorkflowStepperService $workflowStepper,
        private readonly DossierFinanceEligibilityService $financeEligibility,
        private readonly FinanceReceivablesService $receivables,
        private readonly ProjectActivityService $activity,
        private readonly ProjectDocumentExplorerService $documentExplorer,
    ) {
    }

    public function build(Dossier $dossier, User $user, Request $request): array
    {
        $capabilities = $this->capabilities($dossier, $user);

        $relations = [
            'client',
            'intermediary',
            'city',
            'cahier',
            'workflowRequirementHistories.changedBy',
        ];

        if ($capabilities['canViewDocuments']) {
            $relations[] = 'documents.template';
        }

        if ($capabilities['canViewContract']) {
            $relations[] = 'contract';
        }

        if ($capabilities['canViewEfficiencySheet']) {
            $relations[] = 'efficiencySheet';
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
            $relations[] = 'archiveRecord.city';
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

        $explorerDocuments = $capabilities['canViewDocuments']
            ? $this->explorerDocumentsPayload($dossier, $user, $capabilities['canViewEfficiencySheet'])
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
            'cahier' => $this->cahierPayload($dossier),
            'documents' => $documents->values(),
            'explorerDocuments' => $explorerDocuments->values(),
            'explorerContext' => [
                'type' => 'project',
                'projectId' => (int) $dossier->id,
            ],
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
            'intermediaries' => $canMutateProject
                ? $this->intermediaryOptions($user)
                : [],
            'dossiers' => (
                $capabilities['canViewDocuments']
                || $capabilities['canCreateDocuments']
            )
                ? $this->dossierOptions($user)
                : [],

            'templates' => (
                $capabilities['canViewDocuments']
                || $capabilities['canCreateDocuments']
            )
                ? $this->documentTemplateOptions()
                : [],

            'workflowTemplateMap' =>
                $capabilities['canCreateDocuments']
                    ? $this
                        ->documentTemplateResolver
                        ->requirementTemplateMap()
                    : [],
            'contractClients' => $capabilities['canViewContract']
                ? $this->contractClientOptions($user)
                : [],
            'architectFeeOptions' => $capabilities['canViewContract']
                ? FinanceSettingsService::architectFeeOptions(true)
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
            'canViewEfficiencySheet' => $this->permissions->allows($user, 'projects.efficiency_sheet.view'),
            'canCreateEfficiencySheet' => $this->permissions->allows($user, 'projects.efficiency_sheet.create'),
            'canUpdateEfficiencySheet' => $this->permissions->allows($user, 'projects.efficiency_sheet.update'),
            'canGenerateEfficiencySheet' => $this->permissions->allows($user, 'projects.efficiency_sheet.generate'),
        ];
    }

    private function documentPayload(Dossier $dossier, User $user): Collection
    {
        return $dossier->documents
            ->sortByDesc(fn (DossierDocument $document) => $document->uploaded_at ?? $document->created_at)
            ->map(function (DossierDocument $document) use ($user): array {
                $canDownload = $user->can('download', $document);

                $displayName = $this->documentExplorer->documentDisplayName($document);

                return [
                    'id' => $document->id,
                    'documentNumber' => $document->document_number,
                    'name' => $displayName,
                    'baseName' => $document->template?->name
                        ?? $document->original_filename
                        ?? 'Document',
                    'documentSide' =>
                        $document->document_side
                        ?? DossierDocument::SIDE_SINGLE,
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
                    'type' =>
                        $document->template
                            ?->document_type
                        ?? 'manual',
                    'templateId' =>
                        $document
                            ->document_template_id,
                    'templateCode' =>
                        $document->template?->code,
                ];
            });
    }

    private function cahierPayload(Dossier $dossier): ?array
    {
        $cahier = $dossier->cahier;

        if (! $cahier) {
            return null;
        }

        return [
            'number' => (string) $cahier->cahier_number,
            'receivedAt' => optional($cahier->received_at)->format('Y-m-d'),
            'deliveredAt' => optional($cahier->delivered_at)->format('Y-m-d'),
        ];
    }

    /**
     * Explorer payload for the Project Documents tab — delegated to
     * ProjectDocumentExplorerService, the single aggregator that combines
     * uploaded documents with the generated contract and efficiency-sheet
     * files. See that service for the STEP 0 rules (no file copies, no
     * duplicate rows, no storage-path exposure, original source routes).
     */
    private function explorerDocumentsPayload(Dossier $dossier, User $user, bool $canViewEfficiencySheet): Collection
    {
        return $this->documentExplorer->forDossier($dossier, $user, $canViewEfficiencySheet);
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
            'financeTtc' => $contract->effectiveFinanceTtc(),
            'customFinanceTtc' => $contract->finance_ttc !== null ? (float) $contract->finance_ttc : null,
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
        $receivableByDocument = $documents
            ->filter(fn (FinanceDocument $document) => $document->isInvoice())
            ->mapWithKeys(fn (FinanceDocument $document) => [$document->id => $this->receivables->forInvoice($document)]);

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
            'paidTotal' => (float) ($receivableByDocument[$document->id]['paid'] ?? $document->paid_total),
            'remainingTotal' => (float) ($receivableByDocument[$document->id]['outstanding'] ?? $document->remaining_total),
            'receivable' => $receivableByDocument[$document->id] ?? null,
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

        $invoiceReceivables = $activeInvoices->map(fn (FinanceDocument $document) => $receivableByDocument[$document->id]);
        $nextDue = $activeInvoices
            ->filter(fn (FinanceDocument $document) => ($receivableByDocument[$document->id]['outstanding'] ?? 0) > 0 && $document->due_date)
            ->sortBy('due_date')
            ->first();

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
                'paidTotal' => (float) $invoiceReceivables->sum('paid'),
                'remainingTotal' => (float) $invoiceReceivables->sum('outstanding'),
                'collectionProgress' => (float) $activeInvoices->sum('total_ttc') > 0
                    ? round(((float) $invoiceReceivables->sum('paid') / (float) $activeInvoices->sum('total_ttc')) * 100, 2)
                    : 0,
                'nextDue' => $nextDue ? [
                    'date' => $nextDue->due_date->toDateString(),
                    'amount' => (float) $receivableByDocument[$nextDue->id]['outstanding'],
                ] : null,
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
            'displaySequence' => str_pad((string) $archive->archive_sequence, 4, '0', STR_PAD_LEFT),
            'status' => $archive->status,
            'city' => $this->archiveCityPayload($archive, $dossier),
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

    /**
     * City shown next to the archive chip: the archive's own city when present,
     * falling back to the dossier city (the numbering scope is identical).
     *
     * @return array{id: int, name: string, color: string}|null
     */
    private function archiveCityPayload(ArchiveRecord $archive, Dossier $dossier): ?array
    {
        $city = $archive->city ?? $dossier->city;

        if (! $city) {
            return null;
        }

        return [
            'id' => (int) $city->id,
            'name' => (string) $city->name,
            'color' => (string) ($city->color ?? '#64748B'),
        ];
    }

    private function clientOptions(User $user): array
    {
        return $this->companyContext->applyTo(Client::query(), $user)
            ->orderBy('full_name')
            ->get()
            ->map(fn (Client $client) => [
                'id' => (string) $client->id,
                'label' => $client->cin . ' - ' . $client->full_name,
            ])
            ->values()
            ->all();
    }

    private function intermediaryOptions(User $user): array
    {
        return $this->companyContext->applyTo(Intermediary::query(), $user)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Intermediary $intermediary) => [
                'id' => (string) $intermediary->id,
                'label' => $intermediary->name,
            ])
            ->values()
            ->all();
    }

    private function dossierOptions(User $user): Collection
    {
        return $this->companyContext->applyTo(Dossier::query(), $user)
            ->latest('created_at')
            ->get(['id', 'client_id', 'dossier_number', 'project_object'])
            ->map(fn (Dossier $dossier) => [
                'id' => (string) $dossier->id,
                'label' => $dossier->dossier_number . ($dossier->project_object ? ' - ' . $dossier->project_object : ''),
                'clientId' => (string) $dossier->client_id,
            ])
            ->values();
    }

    private function documentTemplateOptions(): Collection
    {
        return DocumentTemplate::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(
                fn (DocumentTemplate $template) =>
                    $this
                        ->documentTemplateResolver
                        ->option($template)
            )
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
