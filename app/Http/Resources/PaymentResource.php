<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'paymentNumber' => $this->payment_number,
            'amount' => $this->amount,
            'method' => $this->method,
            'reference' => $this->reference,
            'paidAt' => $this->paid_at?->toDateString(),
            'notes' => $this->notes,
            'document' => $this->document ? [
                'id' => $this->document->id,
                'number' => $this->document->number,
                'type' => $this->document->type,
            ] : null,
            'client' => $this->client ? [
                'id' => $this->client->id,
                'name' => $this->client->name,
            ] : null,
            'dossier' => $this->dossier ? [
                'id' => $this->dossier->id,
                'number' => $this->dossier->number,
            ] : null,
            'receiptDocumentId' => $this->receipt_document_id,
            'createdAt' => $this->created_at?->toISOString(),
        ];
    }
}
