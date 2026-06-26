<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FinanceDocumentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'typeLabel' => match ($this->type) {
                'quote' => 'Devis',
                'invoice' => 'Facture',
                'receipt' => 'Recu',
                default => ucfirst($this->type),
            },
            'number' => $this->number,
            'status' => $this->status,
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
            'issueDate' => $this->issue_date?->toDateString(),
            'dueDate' => $this->due_date?->toDateString(),
            'validUntil' => $this->valid_until?->toDateString(),
            'currency' => $this->currency,
            'tvaRate' => (float) $this->tva_rate,
            'subtotalHt' => (float) $this->subtotal_ht,
            'discountTotal' => (float) $this->discount_total,
            'taxTotal' => (float) $this->tax_total,
            'totalTtc' => (float) $this->total_ttc,
            'paidTotal' => (float) $this->paid_total,
            'remainingTotal' => (float) $this->remaining_total,
            'notes' => $this->notes,
            'terms' => $this->terms,
            'templateId' => $this->template_id,
            'pdfPath' => $this->pdf_path,
            'excelPath' => $this->excel_path,
            'generatedAt' => $this->generated_at?->toISOString(),
            'sentAt' => $this->sent_at?->toISOString(),
            'acceptedAt' => $this->accepted_at?->toISOString(),
            'rejectedAt' => $this->rejected_at?->toISOString(),
            'paidAt' => $this->paid_at?->toISOString(),
            'items' => FinanceDocumentItemResource::collection($this->whenLoaded('items')),
            'payments' => PaymentResource::collection($this->whenLoaded('payments')),
            'paymentsCount' => $this->payments_count ?? $this->whenLoaded('payments', fn() => $this->payments->count(), 0),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
            'showUrl' => route('finance.documents.show', $this),
            'updateUrl' => route('finance.documents.update', $this),
            'deleteUrl' => route('finance.documents.destroy', $this),
            'acceptUrl' => $this->isQuote() ? route('finance.documents.accept', $this) : null,
            'rejectUrl' => $this->isQuote() ? route('finance.documents.reject', $this) : null,
            'cancelUrl' => route('finance.documents.cancel', $this),
            'convertToInvoiceUrl' => $this->isQuote() ? route('finance.documents.convert-to-invoice', $this) : null,
            'generateUrl' => route('finance.documents.generate', $this),
                        'hasPdf' => (bool) $this->pdf_path,
            'hasExcel' => (bool) $this->excel_path,
            'generatePdfUrl' => route('finance.documents.generate-pdf', $this),
            'generateExcelUrl' => route('finance.documents.generate-excel', $this),
            'downloadUrl' => $this->excel_path ? route('finance.documents.download', $this) : null,
            'excelDownloadUrl' => $this->excel_path ? route('finance.documents.download-excel', $this) : null,
            'pdfDownloadUrl' => $this->pdf_path ? route('finance.documents.download-pdf', $this) : null,
            'paymentUrl' => $this->isInvoice() ? route('finance.payments.store') : null,
        ];
    }
}
