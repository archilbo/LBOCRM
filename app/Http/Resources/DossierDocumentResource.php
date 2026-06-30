<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DossierDocumentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $hasFile = filled($this->stored_path);

        return [
            'id' => $this->id,
            'dossierId' => $this->dossier_id ? (string) $this->dossier_id : '',
            'dossierNumber' => $this->dossier?->dossier_number ?? '-',
            'projectObject' => $this->dossier?->project_object ?? '-',
            'clientName' => $this->dossier?->client?->full_name ?? '-',

            'documentTemplateId' => $this->document_template_id ? (string) $this->document_template_id : '',
            'templateName' => $this->template?->name ?? 'Manual document',
            'templateCode' => $this->template?->code ?? null,
            'documentType' => $this->template?->document_type ?? 'manual',

            'documentNumber' => $this->document_number,
            'originalFilename' => $this->original_filename,
            'mimeType' => $this->mime_type,
            'sizeBytes' => $this->size_bytes,
            'sizeLabel' => $this->formatSize($this->size_bytes),
            'status' => $this->status,
            'uploadedAt' => optional($this->uploaded_at)->format('Y-m-d H:i'),
            'verifiedAt' => optional($this->verified_at)->format('Y-m-d H:i'),
            'updatedAt' => optional($this->updated_at)->diffForHumans(),
            'notes' => $this->notes,

            'hasFile' => $hasFile,
            'downloadUrl' => $hasFile ? route('documents.download', $this->id) : null,
        ];
    }

    private function formatSize(?int $size): string
    {
        if (!$size) {
            return '-';
        }

        if ($size < 1024) {
            return $size . ' B';
        }

        if ($size < 1024 * 1024) {
            return round($size / 1024) . ' KB';
        }

        return number_format($size / 1024 / 1024, 1) . ' MB';
    }
}