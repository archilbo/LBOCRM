<?php

namespace App\Http\Resources\ProjectDesign;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectDesignRemarkResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'versionId' => $this->version_id,
            'annotationId' => $this->annotation_id,
            'severity' => $this->severity,
            'status' => $this->status,
            'title' => $this->title,
            'description' => $this->description,
            'createdBy' => $this->whenLoaded('createdBy', fn () => $this->createdBy ? ['id' => $this->createdBy->id, 'name' => $this->createdBy->name] : null),
            'assignedTo' => $this->whenLoaded('assignedTo', fn () => $this->assignedTo ? ['id' => $this->assignedTo->id, 'name' => $this->assignedTo->name] : null),
            'file' => $this->whenLoaded('version.file', fn () => $this->version->file ? ['id' => $this->version->file->id, 'name' => $this->version->file->name, 'discipline' => $this->version->file->discipline] : null),
            'versionNumber' => $this->whenLoaded('version', fn () => $this->version->version_number),
            'dueDate' => $this->due_date?->toDateString(),
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }
}
