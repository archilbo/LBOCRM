<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageAttachmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'originalFilename' => $this->original_filename,
            'filename' => $this->filename,
            'mimeType' => $this->mime_type,
            'size' => $this->size,
            'url' => $this->url,
            'thumbnailUrl' => $this->thumbnail_url,
            'downloadUrl' => route('inbox.attachments.download', $this->resource, false),
            'createdAt' => $this->created_at?->toISOString(),
        ];
    }
}
