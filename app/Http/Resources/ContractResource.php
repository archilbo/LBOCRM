<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ContractResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $hasGeneratedDocument = filled($this->generated_document_path);
        $hasPdf = filled($this->pdf_path);

        return [
            'id' => $this->id,
            'dossierId' => $this->dossier_id ? (string) $this->dossier_id : '',
            'dossierNumber' => $this->dossier?->dossier_number ?? '-',
            'projectObject' => $this->dossier?->project_object ?? '-',
            'clientName' => $this->dossier?->client?->full_name ?? '-',
            'clientCin' => $this->dossier?->client?->cin ?? '-',

            'contractNumber' => $this->contract_number,
            'status' => $this->status,

            'surface' => (float) $this->surface,
            'pricePerSquareMeter' => (float) $this->price_per_square_meter,
            'calculationMode' => $this->calculation_mode ?? 'percentage',
            'feeRatePercent' => (float) ($this->fee_rate_percent ?? 0.5),
            'forfaitTtc' => $this->forfait_ttc !== null ? (float) $this->forfait_ttc : null,
            'ht' => (float) $this->ht,
            'tva' => (float) $this->tva,
            'ttc' => (float) $this->ttc,

            'generatedDocumentPath' => $this->generated_document_path,
            'pdfPath' => $this->pdf_path,
            'generatedAt' => optional($this->generated_at)->format('Y-m-d H:i'),
            'signedAt' => optional($this->signed_at)->format('Y-m-d H:i'),
            'updatedAt' => optional($this->updated_at)->diffForHumans(),
            'createdAt' => optional($this->created_at)->format('Y-m-d'),
            'notes' => $this->notes,

            'hasGeneratedDocument' => $hasGeneratedDocument,
            'hasPdf' => $hasPdf,
            'generatedDocumentDownloadUrl' => $hasGeneratedDocument ? route('contracts.download.generated', $this->id) : null,
            'pdfDownloadUrl' => $hasPdf ? route('contracts.download.pdf', $this->id) : null,
            'generatedDocumentPublicUrl' => $hasGeneratedDocument ? Storage::disk('public')->url($this->generated_document_path) : null,
            'pdfPublicUrl' => $hasPdf ? route('contracts.preview.pdf', $this->id) : null,
        ];
    }
}
