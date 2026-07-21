<?php

namespace App\Http\Resources\ProjectDesign;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Route;

class ProjectDesignAssetResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'assetType' => $this->asset_type,
            'originalFilename' => $this->original_filename,
            'mimeType' => $this->mime_type,
            'extension' => $this->extension,
            'sizeBytes' => $this->size_bytes,
            'previewable' => $this->previewable,
            'sortOrder' => $this->sort_order,
            'previewUrl' => $this->previewable ? route('project-design.assets.preview', ['asset' => $this->id]) : null,
            'downloadUrl' => $this->previewable ? route('project-design.assets.download', ['asset' => $this->id]) : null,
            'thumbnailUrl' => null,
            'scanStatus' => $this->scan_status,
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }
}
