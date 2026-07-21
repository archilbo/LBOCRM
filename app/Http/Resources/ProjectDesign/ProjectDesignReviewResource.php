<?php

namespace App\Http\Resources\ProjectDesign;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectDesignReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'fileId' => $this->file_id,
            'versionId' => $this->version_id,
            'status' => $this->status,
            'decision' => $this->decision,
            'notes' => $this->notes,
            'generalNote' => $this->general_note,
            'requestedBy' => $this->whenLoaded('requestedBy', fn () => $this->requestedBy ? ['id' => $this->requestedBy->id, 'name' => $this->requestedBy->name] : null),
            'reviewer' => $this->whenLoaded('reviewer', fn () => $this->reviewer ? ['id' => $this->reviewer->id, 'name' => $this->reviewer->name] : null),
            'file' => $this->whenLoaded('file', fn () => ['id' => $this->file->id, 'name' => $this->file->name, 'discipline' => $this->file->discipline]),
            'version' => $this->whenLoaded('version', fn () => new ProjectDesignFileVersionResource($this->version)),
            'requestedAt' => $this->requested_at?->toIso8601String(),
            'startedAt' => $this->started_at?->toIso8601String(),
            'dueAt' => $this->due_at?->toIso8601String(),
            'completedAt' => $this->completed_at?->toIso8601String(),
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }
}
