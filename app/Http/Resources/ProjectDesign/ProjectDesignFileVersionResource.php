<?php

namespace App\Http\Resources\ProjectDesign;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectDesignFileVersionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'fileId' => $this->file_id,
            'versionNumber' => $this->version_number,
            'status' => $this->status,
            'checksum' => $this->checksum,
            'fileSize' => $this->file_size,
            'mimeType' => $this->mime_type,
            'originalFilename' => $this->original_filename,
            'uploadedBy' => $this->whenLoaded('uploadedBy', fn () => [
                'id' => $this->uploadedBy->id,
                'name' => $this->uploadedBy->name,
            ]),
            'notes' => $this->notes,
            'recordVersion' => $this->record_version,
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }
}
