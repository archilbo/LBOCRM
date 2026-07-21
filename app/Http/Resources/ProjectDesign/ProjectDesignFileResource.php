<?php

namespace App\Http\Resources\ProjectDesign;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectDesignFileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'dossierId' => $this->dossier_id,
            'folderId' => $this->folder_id,
            'name' => $this->name,
            'description' => $this->description,
            'type' => $this->type,
            'status' => $this->status,
            'sortOrder' => $this->sort_order,
            'recordVersion' => $this->record_version,
            'latestVersion' => new ProjectDesignFileVersionResource($this->whenLoaded('latestVersion')),
            'versionsCount' => $this->whenCounted('versions'),
            'createdAt' => $this->created_at?->toIso8601String(),
            'updatedAt' => $this->updated_at?->toIso8601String(),
        ];
    }
}
