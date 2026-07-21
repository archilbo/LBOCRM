<?php

namespace App\Http\Resources\ProjectDesign;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectDesignAnnotationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'versionId' => $this->version_id,
            'type' => $this->type,
            'geometry' => $this->geometry,
            'authoredBy' => $this->whenLoaded('authoredBy', fn () => $this->authoredBy ? ['id' => $this->authoredBy->id, 'name' => $this->authoredBy->name] : null),
            'hasRemark' => $this->relationLoaded('remarks') ? $this->remarks->isNotEmpty() : null,
            'createdAt' => $this->created_at?->toIso8601String(),
            'recordVersion' => $this->record_version,
        ];
    }
}
