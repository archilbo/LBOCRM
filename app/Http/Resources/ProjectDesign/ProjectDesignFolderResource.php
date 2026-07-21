<?php

namespace App\Http\Resources\ProjectDesign;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectDesignFolderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'dossierId' => $this->dossier_id,
            'parentId' => $this->parent_id,
            'name' => $this->name,
            'slug' => $this->slug,
            'sortOrder' => $this->sort_order,
            'filesCount' => $this->whenCounted('files', fn () => (int) $this->files_count, 0),
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }
}
