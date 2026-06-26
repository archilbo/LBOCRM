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
                'receipt' => 'Reçu',
                default => ucfirst($this->type),
            },
            'number' => $this->number,
            'status' => $this->status,
            'client' => $this->client ? [
                'id' => $this->client->id,
                'name' => $this->client->name,
                'cin' => $this->client->cin ?? null,
            ] : null,
            'dossier' => $this->dossier ? [
                'id' => $this->dossier->id,
                'number' => $this->dossier->number,
                'projectObject' => $this->dossier->project_object ?? null,
            ] : null,
            'sourceDocumentId' => $this->source_document_id,
            'issueDate' => $this->issue_date?->toDateString(),
            'dueDate' => $this->due_date?->toDateString(),
            'validUntil' => $this->valid_until?->toDateString(),
            'currency' => $this->currency,
            'tvaRate' => $this->tva_rate,
            'subtotalHt' => $this->subtotal_ht,
            'discountTotal' => $this->discount_total,
            'taxTotal' => $this->tax_total,
            'totalTtc' => $this->total_ttc,
            'paidTotal' => $this->paid_total,
            'remainingTotal' => $this->remaining_total,
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
            'paymentsCount' => $this->whenCounted('payments'),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
            'showUrl' => route('finance.documents.show', $this),
            'updateUrl' => route('finance.documents.update', $this),
            'deleteUrl' => route('finance.documents.destroy', $this),
            'convertToInvoiceUrl' => $this->isQuote() ? route('finance.documents.convert-to-invoice', $this) : null,
            'paymentUrl' => $this->isInvoice() ? route('finance.payments.store') : null,
        ];
    }
}
