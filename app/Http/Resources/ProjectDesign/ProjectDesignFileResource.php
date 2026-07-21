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
            'code' => $this->code,
            'description' => $this->description,
            'discipline' => $this->discipline,
            'category' => $this->category,
            'status' => $this->status,
            'requiresApproval' => $this->requires_approval,
            'responsibleUser' => $this->whenLoaded('responsibleUser', fn () => $this->responsibleUser ? ['id' => $this->responsibleUser->id, 'name' => $this->responsibleUser->name] : null),
            'reviewer' => $this->whenLoaded('reviewer', fn () => $this->reviewer ? ['id' => $this->reviewer->id, 'name' => $this->reviewer->name] : null),
            'currentVersionId' => $this->current_version_id,
            'latestApprovedVersionId' => $this->latest_approved_version_id,
            'reviewDueAt' => $this->review_due_at?->toIso8601String(),
            'archivedAt' => $this->archived_at?->toIso8601String(),
            'recordVersion' => $this->record_version,
            'latestVersion' => new ProjectDesignFileVersionResource($this->whenLoaded('latestVersion')),
            'versionsCount' => $this->whenCounted('versions'),
            'openRemarksCount' => $this->whenCounted('openRemarks'),
            'createdAt' => $this->created_at?->toIso8601String(),
            'updatedAt' => $this->updated_at?->toIso8601String(),
        ];
    }
}
