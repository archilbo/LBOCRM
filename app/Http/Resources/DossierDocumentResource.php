<?php

namespace App\Http\Resources;

use App\Models\DossierDocument;
use App\Services\Documents\DossierDocumentFileService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DossierDocumentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $files = app(
            DossierDocumentFileService::class
        );

        $hasFile = $files->exists($this->resource);
        $canPreview = $files->canPreview(
            $this->resource,
            $hasFile
        );

        $baseName =
            $this->template?->name
            ?? 'Manual document';

        $displayName = match (
            $this->document_side
        ) {
            DossierDocument::SIDE_FRONT =>
                $baseName.' — Recto',

            DossierDocument::SIDE_BACK =>
                $baseName.' — Verso',

            default => $baseName,
        };

        return [
            'id' => $this->id,
            'dossierId' => $this->dossier_id
                ? (string) $this->dossier_id
                : '',
            'dossierNumber' =>
                $this->dossier?->dossier_number
                ?? '-',
            'projectObject' =>
                $this->dossier?->project_object
                ?? '-',
            'clientName' =>
                $this->client?->full_name
                ?? $this->dossier?->primaryClient?->full_name
                ?? '-',
            'clientId' => $this->client_id
                ? (string) $this->client_id
                : null,
            'documentTemplateId' =>
                $this->document_template_id
                    ? (string)
                        $this->document_template_id
                    : '',
            'templateName' => $displayName,
            'templateBaseName' => $baseName,
            'templateCode' =>
                $this->template?->code,
            'documentType' =>
                $this->template?->document_type
                ?? 'manual',
            'documentSide' =>
                $this->document_side
                ?? DossierDocument::SIDE_SINGLE,
            'documentNumber' =>
                $this->document_number,
            'originalFilename' =>
                $this->original_filename,
            'mimeType' => $this->mime_type,
            'sizeBytes' => $this->size_bytes,
            'sizeLabel' =>
                $this->formatSize(
                    $this->size_bytes
                ),
            'status' => $this->status,
            'uploadedAt' =>
                optional(
                    $this->uploaded_at
                )->format('Y-m-d H:i'),
            'verifiedAt' =>
                optional(
                    $this->verified_at
                )->format('Y-m-d H:i'),
            'updatedAt' =>
                optional(
                    $this->updated_at
                )->diffForHumans(),
            'notes' => $this->notes,
            'hasFile' => $hasFile,
            'canPreview' => $canPreview,
            'storageLocation' =>
                $files->locationLabel(
                    $this->resource
                ),
            'viewUrl' => $canPreview
                ? route(
                    'documents.view',
                    $this->id
                )
                : null,
            'contentUrl' => $files->canPreviewText(
                $this->resource
            )
                ? route(
                    'documents.content',
                    $this->id
                )
                : null,
            'printUrl' => $canPreview
                ? route(
                    'documents.print',
                    $this->id
                )
                : null,
            'downloadUrl' => $hasFile
                ? route(
                    'documents.download',
                    $this->id
                )
                : null,
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
