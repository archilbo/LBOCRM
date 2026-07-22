<?php

namespace App\Http\Resources\ProjectDesign;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Route;

class ProjectDesignAssetResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $cap = \App\Support\DesignFormats::find($this->extension);

        return [
            'id' => $this->id,
            'assetType' => $this->asset_type,
            'sourceApplication' => $this->source_application,
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
            'conversionStatus' => $this->conversion_status,
            'formatCapability' => $cap ? [
                'label' => $cap['label'],
                'application' => $cap['application'],
                'category' => $cap['category'],
                'previewStrategy' => $cap['preview_strategy'],
                'directBrowserPreview' => $cap['direct_browser_preview'],
                'conversionProvider' => $cap['conversion_provider'],
                'supportedViewer' => $cap['supported_viewer'],
                'supports2d' => $cap['supports_2d'],
                'supports3d' => $cap['supports_3d'],
                'supportsAnnotations' => $cap['supports_annotations'],
                'requiresConversion' => in_array($cap['preview_strategy'], ['autodesk-aps', 'server-conversion', 'ifc'], true),
                'fallbackMessage' => $cap['fallback_message'],
            ] : null,
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }
}
