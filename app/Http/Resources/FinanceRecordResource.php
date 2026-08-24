<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FinanceRecordResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'dossierId' => $this->dossier_id ? (string) $this->dossier_id : '',
            'clientId' => $this->client_id ? (string) $this->client_id : '',

            'dossierNumber' => $this->dossier?->dossier_number ?? '-',
            'projectObject' => $this->dossier?->project_object ?? '-',
            'clientName' => $this->client?->full_name ?? $this->dossier?->primaryClient?->full_name ?? '-',
            'clientCin' => $this->client?->cin ?? $this->dossier?->primaryClient?->cin ?? '-',

            'recordNumber' => $this->record_number,
            'type' => $this->type,
            'status' => $this->status,

            'ht' => (float) $this->ht,
            'tva' => (float) $this->tva,
            'totalTtc' => (float) $this->total_ttc,
            'paid' => (float) $this->paid,
            'remaining' => (float) $this->remaining,

            'issuedAt' => optional($this->issued_at)->format('Y-m-d'),
            'dueDate' => optional($this->due_date)->format('Y-m-d'),
            'paidAt' => optional($this->paid_at)->format('Y-m-d'),

            'notes' => $this->notes,
            'updatedAt' => optional($this->updated_at)->diffForHumans(),
            'createdAt' => optional($this->created_at)->format('Y-m-d'),

            'generatedFilePath' => $this->generated_file_path,
            'generatedPdfPath' => $this->generated_pdf_path,
            'generatedAt' => optional($this->generated_at)->format('Y-m-d H:i'),

            'downloadUrl' => route('finance.download', $this->id),
            'pdfDownloadUrl' => route('finance.download-pdf', $this->id),
            'hasGeneratedFile' => !is_null($this->generated_file_path),
            'hasPdf' => !is_null($this->generated_pdf_path),
        ];
    }
}
