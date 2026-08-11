<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

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
            'architectFeeOptionId' => $this->architect_fee_option_id ? (string) $this->architect_fee_option_id : null,
            'architectFeeLabel' => $this->architect_fee_label,
            'contractTemplateKey' => $this->contract_template_key,
            'forfaitTtc' => $this->forfait_ttc !== null ? (float) $this->forfait_ttc : null,
            'ht' => (float) $this->ht,
            'tva' => (float) $this->tva,
            'ttc' => (float) $this->ttc,
            'financeTtc' => $this->effectiveFinanceTtc(),
            'customFinanceTtc' => $this->finance_ttc !== null ? (float) $this->finance_ttc : null,

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
            // Kept for backwards-compatible clients. The value is now the
            // policy-protected download route rather than a public storage URL.
            'generatedDocumentPublicUrl' => $hasGeneratedDocument ? route('contracts.download.generated', $this->id) : null,
            'pdfPublicUrl' => $hasPdf ? route('contracts.preview.pdf', $this->id) : null,
        ];
    }
}
