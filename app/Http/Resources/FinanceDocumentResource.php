<?php

namespace App\Http\Resources;

use App\Enums\FinanceDocumentStatus;
use App\Enums\FinanceDocumentType;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FinanceDocumentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $receivable = $this->isInvoice()
            ? app(\App\Services\Finance\FinanceReceivablesService::class)->forInvoice($this->resource)
            : null;

        return [
            'id' => $this->id,
            'type' => $this->type,
            'typeLabel' => FinanceDocumentType::tryFrom($this->type)?->label() ?? ucfirst($this->type),
            'number' => $this->number,
            'numberLocked' => (bool) ($this->number_locked ?? false),
            'numberLockedAt' => $this->number_locked_at ? (string) $this->number_locked_at : null,
            'lock' => app(\App\Services\Finance\FinanceDocumentLockStatePresenter::class)->toArray($this->resource),
            'status' => $this->status,
            'statusLabel' => FinanceDocumentStatus::tryFrom($this->status)?->label() ?? ucfirst($this->status),
            'client' => $this->client ? [
                'id' => $this->client->id,
                'name' => $this->client->full_name,
                'cin' => $this->client->cin ?? null,
                'address' => $this->client->address ?? null,
            ] : null,
            'dossier' => $this->dossier ? [
                'id' => $this->dossier->id,
                'number' => $this->dossier->dossier_number,
                'projectObject' => $this->dossier->project_object ?? null,
                'address' => $this->dossier->project_address ?? null,
                'floorArea' => $this->dossier->floor_area ?? null,
                'landSurface' => $this->dossier->land_surface ?? null,
            ] : null,
            'sourceDocumentId' => $this->source_document_id,
            'convertedToDocumentId' => $this->converted_to_document_id,
            'issueDate' => $this->issue_date?->toDateString(),
            'dueDate' => $this->due_date?->toDateString(),
            'validUntil' => $this->valid_until?->toDateString(),
            'currency' => $this->currency,
            'tvaRate' => (float) $this->tva_rate,
            'subtotalHt' => (float) $this->subtotal_ht,
            'discountTotal' => (float) $this->discount_total,
            'taxTotal' => (float) $this->tax_total,
            'totalTtc' => (float) $this->total_ttc,
            'paidTotal' => $receivable['paid'] ?? (float) $this->paid_total,
            'remainingTotal' => $receivable['outstanding'] ?? (float) $this->remaining_total,
            'receivable' => $receivable,
            'paymentScheduleItems' => $this->when(
                $this->relationLoaded('paymentScheduleItems'),
                fn () => app(\App\Services\Finance\FinancePaymentScheduleService::class)->itemsForInvoice($this->resource)->values(),
                [],
            ),
            'paymentPromises' => $this->when($this->relationLoaded('paymentPromises'), fn () => $this->paymentPromises->map(fn ($promise) => [
                'id' => $promise->id,
                'amount' => (float) $promise->amount,
                'promisedFor' => $promise->promised_for?->toDateString(),
                'status' => $promise->status,
                'note' => $promise->note,
            ])->values(), []),
            'notes' => $this->notes,
            'terms' => $this->terms,
            'templateId' => $this->template_id,
            'issuedAt' => $this->issued_at?->toISOString(),
            'snapshotHash' => $this->snapshot_hash,
            'generatedAt' => $this->generated_at?->toISOString(),
            'sentAt' => $this->sent_at?->toISOString(),
            'acceptedAt' => $this->accepted_at?->toISOString(),
            'rejectedAt' => $this->rejected_at?->toISOString(),
            'paidAt' => $this->paid_at?->toISOString(),
            'items' => $this->whenLoaded('items', fn () => FinanceDocumentItemResource::collection($this->items)->resolve($request), []),
            'payments' => $this->whenLoaded('payments', fn () => PaymentResource::collection($this->payments)->resolve($request), []),
            'paymentsCount' => $this->payments_count ?? $this->whenLoaded('payments', fn() => $this->payments->count(), 0),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
            'showUrl' => route('finance.documents.show', $this),
            'viewUrl' => route('finance.documents.view', $this),
            'viewPdfUrl' => $this->pdf_path ? route('finance.documents.view-pdf', $this) : null,
            'printUrl' => route('finance.documents.print', $this),
            'updateUrl' => route('finance.documents.update', $this),
            'deleteUrl' => route('finance.documents.destroy', $this),
            'acceptUrl' => $this->isQuote() ? route('finance.documents.accept', $this) : null,
            'rejectUrl' => $this->isQuote() ? route('finance.documents.reject', $this) : null,
            'cancelUrl' => route('finance.documents.cancel', $this),
            'convertToInvoiceUrl' => $this->canConvertToInvoice() ? route('finance.documents.convert-to-invoice', $this) : null,
            'generateUrl' => route('finance.documents.generate', $this),
            'hasPdf' => (bool) $this->pdf_path,
            'hasExcel' => (bool) $this->excel_path,
            'generatePdfUrl' => route('finance.documents.generate-pdf', $this),
            'generateExcelUrl' => route('finance.documents.generate-excel', $this),
            'downloadUrl' => $this->excel_path ? route('finance.documents.download', $this) : null,
            'excelDownloadUrl' => $this->excel_path ? route('finance.documents.download-excel', $this) : null,
            'pdfDownloadUrl' => $this->pdf_path ? route('finance.documents.download-pdf', $this) : null,
            'paymentUrl' => $this->canRecordPayment() ? route('finance.payments.store') : null,
        ];
    }
}
