<?php

namespace App\Services\Clients;

use App\Http\Resources\FinanceDocumentResource;
use App\Models\Client;
use App\Models\Contract;
use App\Models\Dossier;
use App\Models\User;
use App\Services\Dossiers\DossierWorkflowStepperService;
use App\Services\Documents\DossierDocumentFileService;
use App\Services\Finance\FinanceSettingsService;
use App\Services\Finance\FinanceDocumentMetricsService;
use App\Services\Finance\DossierFinanceEligibilityService;
use App\Services\Finance\FinanceReceivablesService;
use App\Services\PermissionRegistry;
use Illuminate\Support\Facades\Storage;

class ClientWorkspaceService
{
    public function __construct(
        private readonly DossierWorkflowStepperService $workflowStepper,
        private readonly DossierDocumentFileService $documentFiles,
        private readonly DossierFinanceEligibilityService $financeEligibility,
        private readonly FinanceReceivablesService $receivables,
        private readonly FinanceDocumentMetricsService $financeMetrics,
        private readonly PermissionRegistry $permissions,
        private readonly ClientDocumentExplorerService $clientExplorer,
    ) {
    }

    public function forClient(Client $client, ?int $selectedDossierId = null, ?User $viewer = null): array
    {
        $canViewFinance = $viewer === null || $this->permissions->allows($viewer, 'finance.view');
        $canViewArchive = $viewer === null || $this->permissions->allows($viewer, 'archive.view');

        $relations = [
            'intermediary',
            'dossiers.primaryClient',
            'dossiers.city',
            'dossiers.documents.template',
            'dossiers.contract',
            'dossiers.cahier',
            'dossiers.workflowRequirements.checkedBy',
        ];

        if ($canViewArchive) {
            $relations[] = 'dossiers.archiveRecord.city';
        }

        if ($canViewFinance) {
            $relations = array_merge($relations, [
                'dossiers.financeDocuments.client',
                'dossiers.financeDocuments.dossier',
                'dossiers.financeDocuments.items',
                'dossiers.financeDocuments.creator',
                'dossiers.financeDocuments.payments.document',
                'dossiers.financeDocuments.payments.client',
                'dossiers.financeDocuments.payments.dossier',
                'dossiers.financeDocuments.payments.receiptDocument',
                'dossiers.financeDocuments.payments.creator',
                'dossiers.payments.document',
                'dossiers.payments.creator',
                'dossiers.negotiatedPaymentLines.payments',
            ]);
        }

        $client->loadMissing($relations);

        $projects = $client->dossiers
            ->sortByDesc('updated_at')
            ->values()
            ->map(fn (Dossier $dossier) => $this->projectSummary($dossier, $canViewFinance))
            ->all();

        $selectedDossier = $selectedDossierId
            ? $client->dossiers->firstWhere('id', $selectedDossierId)
            : $client->dossiers->sortByDesc('updated_at')->first();

        return [
            'client' => [
                'id' => $client->id,
                'clientNumber' => $client->client_number,
                'fullName' => $client->full_name,
                'cin' => $client->cin,
                'phone' => $client->phone,
                'email' => $client->email,
                'address' => $client->address,
                'status' => $client->status,
                'intermediaryName' => $client->intermediary?->name,
            ],
            'projects' => $projects,
            'selectedProject' => $selectedDossier ? $this->projectWorkspace($selectedDossier, $canViewFinance, $canViewArchive) : null,
            'contracts' => $client->dossiers
                ->filter(fn (Dossier $dossier) => $dossier->contract !== null)
                ->sortByDesc(fn (Dossier $dossier) => $dossier->contract?->created_at?->getTimestamp() ?? 0)
                ->map(fn (Dossier $dossier) => $this->contractSummary($dossier->contract, $dossier))
                ->values()
                ->all(),
            'explorer' => $this->clientExplorer->forClient($client, $viewer),
        ];
    }

    public function projectSummary(Dossier $dossier, bool $includeFinance = true): array
    {
        $financeDocuments = $includeFinance ? $dossier->financeDocuments : collect();
        $payments = $includeFinance ? $dossier->payments : collect();
        $metrics = $this->financeMetrics->forDocuments($financeDocuments, $payments);
        $invoices = $financeDocuments->where('type', 'invoice')->where('status', '!=', 'cancelled');
        $receivables = $invoices->map(fn ($invoice) => $this->receivables->forInvoice($invoice));
        $negotiatedPaymentLines = $includeFinance
            ? $dossier->negotiatedPaymentLines
                ->map(function ($line): array {
                    $payments = $line->payments
                        ->filter(fn ($payment) => $payment->cancelled_at === null)
                        ->sortBy(fn ($payment) => $payment->paid_at ?? $payment->created_at)
                        ->values();
                    $paidAmount = (float) $payments->sum('amount');

                    return [
                        'id' => (string) $line->id,
                        'designation' => $line->designation,
                        'negotiatedAmount' => (float) $line->negotiated_amount,
                        'paidAmount' => $paidAmount,
                        'remainingAmount' => max(0, round((float) $line->negotiated_amount - $paidAmount, 2)),
                        'payments' => $payments->map(fn ($payment) => [
                            'id' => (string) $payment->id,
                            'amount' => (float) $payment->amount,
                            'method' => $payment->method,
                            'paidAt' => optional($payment->paid_at)->format('Y-m-d'),
                            'reference' => $payment->reference,
                        ])->all(),
                    ];
                })
                ->values()
                ->all()
            : [];

        return [
            'id' => $dossier->id,
            'clientId' => $dossier->client_id,
            'clientName' => $dossier->primaryClient?->full_name,
            'dossierNumber' => $dossier->dossier_number,
            'projectObject' => $dossier->project_object,
            'projectAddress' => $dossier->project_address,
            'province' => $dossier->province,
            'commune' => $dossier->commune,
            'floorArea' => $dossier->floor_area,
            'status' => $dossier->status,
            'workflowStep' => $dossier->workflow_step,
            'documentsCount' => $dossier->documents->count(),
            'financeDocumentsCount' => $financeDocuments->count(),
            'paymentsCount' => $payments->count(),
            'quotesTotal' => (float) $financeDocuments->where('type', 'quote')->sum('total_ttc'),
            'expectedTotal' => $metrics['expectedTotal'],
            'expectedPaidTotal' => $metrics['expectedPaidTotal'],
            'expectedRemainingTotal' => $metrics['expectedRemainingTotal'],
            'invoicesTotal' => $metrics['officialInvoicedTotal'],
            'paidTotal' => $metrics['officialPaidTotal'],
            'remainingTotal' => $metrics['officialBalanceTotal'],
            'negotiatedPaymentLines' => $negotiatedPaymentLines,
            'overdueTotal' => (float) $invoices
                ->filter(fn ($invoice) => $this->receivables->forInvoice($invoice)['dueState'] === 'overdue')
                ->map(fn ($invoice) => $this->receivables->forInvoice($invoice)['outstanding'])
                ->sum(),
            'updatedAt' => optional($dossier->updated_at)->toISOString(),
        ];
    }

    private function projectWorkspace(Dossier $dossier, bool $includeFinance, bool $includeArchive): array
    {
        $financeDocuments = $includeFinance ? $dossier->financeDocuments->sortByDesc('issue_date')->values() : collect();
        $payments = $includeFinance ? $dossier->payments->sortByDesc('paid_at')->values() : collect();
        $archive = $includeArchive ? $dossier->archiveRecord : null;
        $archiveCity = $archive?->city ?? $dossier->city;

        return [
            ...$this->projectSummary($dossier, $includeFinance),
            'currency' => $includeFinance ? FinanceSettingsService::getCurrency() : null,
            'contract' => $dossier->contract ? [
                'id' => $dossier->contract->id,
                'number' => $dossier->contract->contract_number,
                'status' => $dossier->contract->status,
                'surface' => (float) $dossier->contract->surface,
                'pricePerSquareMeter' => (float) $dossier->contract->price_per_square_meter,
                'calculationMode' => $dossier->contract->calculation_mode,
                'feeRatePercent' => (float) $dossier->contract->fee_rate_percent,
                'forfaitTtc' => $dossier->contract->forfait_ttc ? (float) $dossier->contract->forfait_ttc : null,
                'ttc' => (float) $dossier->contract->ttc,
                'financeTtc' => $dossier->contract->effectiveFinanceTtc(),
                'customFinanceTtc' => $dossier->contract->finance_ttc !== null ? (float) $dossier->contract->finance_ttc : null,
                'notes' => $dossier->contract->notes,
                'createdAt' => optional($dossier->contract->created_at)->toISOString(),
                'generatedAt' => optional($dossier->contract->generated_at)->toISOString(),
                'signedAt' => optional($dossier->contract->signed_at)->toISOString(),
            ] : null,
            'documents' => $dossier->documents->map(function ($document) use ($dossier) {
                $hasFile = $this->documentFiles->exists($document);
                $canPreview = $this->documentFiles->canPreview($document, $hasFile);
                $canPreviewText = $this->documentFiles->canPreviewText($document);

                return [
                    'id' => $document->id,
                    'name' => $document->template?->name ?? $document->original_filename ?? 'Document',
                    'status' => $document->status,
                    'documentNumber' => $document->document_number,
                    'originalFilename' => $document->original_filename,
                    'mimeType' => $document->mime_type,
                    'sizeLabel' => $this->formatSize($document->size_bytes),
                    'storageLocation' => $this->documentFiles->locationLabel($document, $dossier),
                    'uploadedAt' => optional($document->uploaded_at)->toDateString(),
                    'hasFile' => $hasFile,
                    'canPreview' => $canPreview,
                    'viewUrl' => $canPreview ? route('documents.view', $document) : null,
                    'contentUrl' => $canPreviewText ? route('documents.content', $document) : null,
                    'printUrl' => $canPreview ? route('documents.print', $document) : null,
                    'downloadUrl' => $hasFile ? route('documents.download', $document) : null,
                ];
            })->values()->all(),
            'financeDocuments' => $includeFinance ? $financeDocuments
                ->map(fn ($document) => (new FinanceDocumentResource($document))->resolve(request()))
                ->all() : [],
            'payments' => $includeFinance ? $payments->map(fn ($payment) => [
                'id' => $payment->id,
                'paymentNumber' => $payment->payment_number,
                'paymentKind' => $payment->payment_kind?->value ?? $payment->payment_kind ?? 'invoice',
                'financeDocumentId' => $payment->finance_document_id,
                'documentNumber' => $payment->document?->number,
                'amount' => (float) $payment->amount,
                'method' => $payment->method,
                'paidAt' => optional($payment->paid_at)->toDateString(),
                'canDelete' => (bool) request()->user()?->can('delete', $payment),
                'deleteUrl' => route('finance.payments.destroy', $payment),
            ])->all() : [],
            'financeEligibility' => $includeFinance ? $this->financeEligibility->stateForDocuments($financeDocuments) : null,
            'archiveRecord' => $archive ? [
                'id' => $archive->id,
                'archiveNumber' => $archive->archive_number,
                'status' => $archive->status,
                'city' => $archiveCity ? [
                    'id' => (int) $archiveCity->id,
                    'name' => (string) $archiveCity->name,
                    'color' => (string) ($archiveCity->color ?? '#64748B'),
                ] : null,
                'inDate' => optional($archive->in_date)->toISOString(),
                'outDate' => optional($archive->out_date)->toISOString(),
                'returnedAt' => optional($archive->returned_at)->toISOString(),
            ] : null,
            // The client workspace always exposes the currently selected
            // project's Cahier. It never aggregates Cahiers from the client's
            // other projects into a single workflow.
            'cahier' => $dossier->cahier ? [
                'number' => (string) $dossier->cahier->cahier_number,
                'receivedAt' => optional($dossier->cahier->received_at)->toDateString(),
                'deliveredAt' => optional($dossier->cahier->delivered_at)->toDateString(),
            ] : null,
            'workflow' => $this->workflowStepper->evaluate($dossier),
            'timeline' => $this->buildTimeline($dossier, $includeFinance, $includeArchive),
        ];
    }

    private function buildTimeline(Dossier $dossier, bool $includeFinance = true, bool $includeArchive = true): array
    {
        $events = [];

        foreach ($dossier->documents as $doc) {
            $events[] = [
                'date' => optional($doc->uploaded_at ?? $doc->created_at)->toISOString(),
                'type' => 'document',
                'action' => 'documentUploaded',
                'description' => $doc->template?->name ?? $doc->original_filename ?? 'Document',
                'status' => $doc->status,
            ];
        }

        if ($dossier->contract) {
            $events[] = [
                'date' => optional($dossier->contract->created_at)->toISOString(),
                'type' => 'contract',
                'action' => 'contractCreated',
                'description' => $dossier->contract->contract_number,
                'status' => $dossier->contract->status,
            ];
            if ($dossier->contract->generated_at) {
                $events[] = [
                    'date' => optional($dossier->contract->generated_at)->toISOString(),
                    'type' => 'contract',
                    'action' => 'contractGenerated',
                    'description' => $dossier->contract->contract_number,
                    'status' => $dossier->contract->status,
                ];
            }
            if ($dossier->contract->signed_at) {
                $events[] = [
                    'date' => optional($dossier->contract->signed_at)->toISOString(),
                    'type' => 'contract',
                    'action' => 'contractSigned',
                    'description' => $dossier->contract->contract_number,
                    'status' => 'signed',
                ];
            }
        }

        if ($includeFinance) {
            foreach ($dossier->financeDocuments as $fin) {
                $events[] = [
                    'date' => optional($fin->issue_date ?? $fin->created_at)->toISOString(),
                    'type' => 'finance',
                    'action' => 'financeDocumentCreated',
                    'description' => $fin->number,
                    'status' => $fin->status,
                    'actorName' => $fin->creator?->name,
                ];
            }

            foreach ($dossier->payments as $pay) {
                $events[] = [
                    'date' => optional($pay->paid_at ?? $pay->created_at)->toISOString(),
                    'type' => 'payment',
                    'action' => 'paymentRecorded',
                    'description' => $pay->payment_number . ' - ' . number_format((float) $pay->amount, 2) . ' ' . FinanceSettingsService::getCurrency(),
                    'status' => $pay->method ?? 'payment',
                    'actorName' => $pay->creator?->name,
                ];
            }
        }

        if ($includeArchive && $dossier->archiveRecord) {
            $events[] = [
                'date' => optional($dossier->archiveRecord->created_at)->toISOString(),
                'type' => 'archive',
                'action' => 'archiveRecordCreated',
                'description' => $dossier->archiveRecord->archive_number,
                'status' => $dossier->archiveRecord->status,
            ];
            if ($dossier->archiveRecord->in_date) {
                $events[] = [
                    'date' => optional($dossier->archiveRecord->in_date)->toISOString(),
                    'type' => 'archive',
                    'action' => 'archiveFileStored',
                    'description' => $dossier->archiveRecord->archive_number,
                    'status' => 'stored',
                ];
            }
        }

        usort($events, fn (array $a, array $b) => ($a['date'] ?? '') <=> ($b['date'] ?? ''));

        return $events;
    }

    private function contractSummary(Contract $contract, Dossier $dossier): array
    {
        $hasGeneratedDocument = filled($contract->generated_document_path);
        $hasPdf = filled($contract->pdf_path);

        return [
            'id' => $contract->id,
            'dossierId' => (string) $contract->dossier_id,
            'dossierNumber' => $dossier->dossier_number,
            'projectObject' => $dossier->project_object,
            'contractNumber' => $contract->contract_number,
            'status' => $contract->status,
            'surface' => (float) $contract->surface,
            'pricePerSquareMeter' => $contract->price_per_square_meter !== null ? (float) $contract->price_per_square_meter : null,
            'feeRatePercent' => (float) ($contract->fee_rate_percent ?? 0),
            'calculationMode' => $contract->calculation_mode,
            'forfaitTtc' => $contract->forfait_ttc !== null ? (float) $contract->forfait_ttc : null,
            'ht' => (float) $contract->ht,
            'tva' => (float) $contract->tva,
            'ttc' => (float) $contract->ttc,
            'financeTtc' => $contract->effectiveFinanceTtc(),
            'customFinanceTtc' => $contract->finance_ttc !== null ? (float) $contract->finance_ttc : null,
            'generatedAt' => optional($contract->generated_at)->toISOString(),
            'signedAt' => optional($contract->signed_at)->toISOString(),
            'createdAt' => optional($contract->created_at)->toISOString(),
            'notes' => $contract->notes,
            'hasGeneratedDocument' => $hasGeneratedDocument,
            'hasPdf' => $hasPdf,
            'generatedDocumentDownloadUrl' => $hasGeneratedDocument ? route('contracts.download.generated', $contract) : null,
            'pdfDownloadUrl' => $hasPdf ? route('contracts.download.pdf', $contract) : null,
            'pdfPublicUrl' => $hasPdf ? route('contracts.preview.pdf', $contract) : null,
        ];
    }

    private function formatSize(?int $size): string
    {
        if (! $size) {
            return '-';
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
