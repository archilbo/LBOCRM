<?php

namespace App\Services\Clients;

use App\Models\Client;
use App\Models\Dossier;
use App\Services\Dossiers\DossierWorkflowStepperService;
use App\Services\Finance\FinanceSettingsService;

class ClientWorkspaceService
{
    public function __construct(
        private readonly DossierWorkflowStepperService $workflowStepper,
    ) {
    }

    public function forClient(Client $client, ?int $selectedDossierId = null): array
    {
        $client->loadMissing([
            'intermediary',
            'dossiers.documents.template',
            'dossiers.contract',
            'dossiers.authorization',
            'dossiers.workflowRequirements.checkedBy',
            'dossiers.financeDocuments',
            'dossiers.payments.document',
            'dossiers.archiveRecord',
        ]);

        $projects = $client->dossiers
            ->sortByDesc('updated_at')
            ->values()
            ->map(fn (Dossier $dossier) => $this->projectSummary($dossier))
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
            'selectedProject' => $selectedDossier ? $this->projectWorkspace($selectedDossier) : null,
        ];
    }

    public function projectSummary(Dossier $dossier): array
    {
        $financeDocuments = $dossier->financeDocuments;
        $invoices = $financeDocuments->where('type', 'invoice');
        $payments = $dossier->payments;

        return [
            'id' => $dossier->id,
            'clientId' => $dossier->client_id,
            'clientName' => $dossier->client?->full_name,
            'dossierNumber' => $dossier->dossier_number,
            'projectObject' => $dossier->project_object,
            'projectAddress' => $dossier->project_address,
            'province' => $dossier->province,
            'commune' => $dossier->commune,
            'status' => $dossier->status,
            'workflowStep' => $dossier->workflow_step,
            'documentsCount' => $dossier->documents->count(),
            'financeDocumentsCount' => $financeDocuments->count(),
            'paymentsCount' => $payments->count(),
            'quotesTotal' => (float) $financeDocuments->where('type', 'quote')->sum('total_ttc'),
            'invoicesTotal' => (float) $invoices->sum('total_ttc'),
            'paidTotal' => (float) $payments->sum('amount'),
            'remainingTotal' => (float) $invoices->sum('remaining_total'),
            'updatedAt' => optional($dossier->updated_at)->toISOString(),
        ];
    }

    private function projectWorkspace(Dossier $dossier): array
    {
        $financeDocuments = $dossier->financeDocuments->sortByDesc('issue_date')->values();
        $payments = $dossier->payments->sortByDesc('paid_at')->values();

        return [
            ...$this->projectSummary($dossier),
            'currency' => FinanceSettingsService::getCurrency(),
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
                'notes' => $dossier->contract->notes,
                'createdAt' => optional($dossier->contract->created_at)->toISOString(),
                'generatedAt' => optional($dossier->contract->generated_at)->toISOString(),
                'signedAt' => optional($dossier->contract->signed_at)->toISOString(),
            ] : null,
            'authorization' => $dossier->authorization ? [
                'id' => $dossier->authorization->id,
                'status' => $dossier->authorization->status,
                'submissionNumber' => $dossier->authorization->submission_number,
                'authorizationNumber' => $dossier->authorization->authorization_number,
                'authorityName' => $dossier->authorization->authority_name,
                'submittedAt' => optional($dossier->authorization->submitted_at)->toISOString(),
                'approvedAt' => optional($dossier->authorization->approved_at)->toISOString(),
            ] : null,
            'documents' => $dossier->documents->map(fn ($document) => [
                'id' => $document->id,
                'name' => $document->template?->name ?? $document->original_filename ?? 'Document',
                'status' => $document->status,
                'documentNumber' => $document->document_number,
                'originalFilename' => $document->original_filename,
                'uploadedAt' => optional($document->uploaded_at)->toDateString(),
            ])->values()->all(),
            'financeDocuments' => $financeDocuments->map(fn ($document) => [
                'id' => $document->id,
                'type' => $document->type,
                'number' => $document->number,
                'status' => $document->status,
                'issueDate' => optional($document->issue_date)->toDateString(),
                'totalTtc' => (float) $document->total_ttc,
                'paidTotal' => (float) $document->paid_total,
                'remainingTotal' => (float) $document->remaining_total,
            ])->all(),
            'payments' => $payments->map(fn ($payment) => [
                'id' => $payment->id,
                'paymentNumber' => $payment->payment_number,
                'documentNumber' => $payment->document?->number,
                'amount' => (float) $payment->amount,
                'method' => $payment->method,
                'paidAt' => optional($payment->paid_at)->toDateString(),
            ])->all(),
            'archiveRecord' => $dossier->archiveRecord ? [
                'id' => $dossier->archiveRecord->id,
                'archiveNumber' => $dossier->archiveRecord->archive_number,
                'status' => $dossier->archiveRecord->status,
                'inDate' => optional($dossier->archiveRecord->in_date)->toISOString(),
                'outDate' => optional($dossier->archiveRecord->out_date)->toISOString(),
                'returnedAt' => optional($dossier->archiveRecord->returned_at)->toISOString(),
            ] : null,
            'workflow' => $this->workflowStepper->evaluate($dossier),
            'timeline' => $this->buildTimeline($dossier),
        ];
    }

    private function buildTimeline(Dossier $dossier): array
    {
        $events = [];

        foreach ($dossier->documents as $doc) {
            $events[] = [
                'date' => optional($doc->uploaded_at ?? $doc->created_at)->toISOString(),
                'type' => 'document',
                'label' => 'Document uploaded',
                'description' => $doc->template?->name ?? $doc->original_filename ?? 'Document',
                'status' => $doc->status,
            ];
        }

        if ($dossier->contract) {
            $events[] = [
                'date' => optional($dossier->contract->created_at)->toISOString(),
                'type' => 'contract',
                'label' => 'Contract created',
                'description' => $dossier->contract->contract_number,
                'status' => $dossier->contract->status,
            ];
            if ($dossier->contract->generated_at) {
                $events[] = [
                    'date' => optional($dossier->contract->generated_at)->toISOString(),
                    'type' => 'contract',
                    'label' => 'Contract generated',
                    'description' => $dossier->contract->contract_number,
                    'status' => $dossier->contract->status,
                ];
            }
            if ($dossier->contract->signed_at) {
                $events[] = [
                    'date' => optional($dossier->contract->signed_at)->toISOString(),
                    'type' => 'contract',
                    'label' => 'Contract signed',
                    'description' => $dossier->contract->contract_number,
                    'status' => 'signed',
                ];
            }
        }

        foreach ($dossier->financeDocuments as $fin) {
            $events[] = [
                'date' => optional($fin->issue_date ?? $fin->created_at)->toISOString(),
                'type' => 'finance',
                'label' => ucfirst($fin->type) . ' created',
                'description' => $fin->number,
                'status' => $fin->status,
            ];
        }

        foreach ($dossier->payments as $pay) {
            $events[] = [
                'date' => optional($pay->paid_at ?? $pay->created_at)->toISOString(),
                'type' => 'payment',
                'label' => 'Payment recorded',
                'description' => $pay->payment_number . ' - ' . number_format((float) $pay->amount, 2) . ' ' . FinanceSettingsService::getCurrency(),
                'status' => $pay->method ?? 'payment',
            ];
        }

        if ($dossier->authorization) {
            if ($dossier->authorization->submitted_at) {
                $events[] = [
                    'date' => optional($dossier->authorization->submitted_at)->toISOString(),
                    'type' => 'authorization',
                    'label' => 'Authorization submitted',
                    'description' => $dossier->authorization->submission_number ?? 'Rokhas submission',
                    'status' => 'submitted',
                ];
            }
            if ($dossier->authorization->approved_at) {
                $events[] = [
                    'date' => optional($dossier->authorization->approved_at)->toISOString(),
                    'type' => 'authorization',
                    'label' => 'Authorization approved',
                    'description' => $dossier->authorization->authorization_number ?? 'Approved',
                    'status' => 'approved',
                ];
            }
        }

        if ($dossier->archiveRecord) {
            $events[] = [
                'date' => optional($dossier->archiveRecord->created_at)->toISOString(),
                'type' => 'archive',
                'label' => 'Archive record created',
                'description' => $dossier->archiveRecord->archive_number,
                'status' => $dossier->archiveRecord->status,
            ];
            if ($dossier->archiveRecord->in_date) {
                $events[] = [
                    'date' => optional($dossier->archiveRecord->in_date)->toISOString(),
                    'type' => 'archive',
                    'label' => 'File stored in archive',
                    'description' => $dossier->archiveRecord->archive_number,
                    'status' => 'stored',
                ];
            }
        }

        usort($events, fn (array $a, array $b) => ($a['date'] ?? '') <=> ($b['date'] ?? ''));

        return $events;
    }
}
