<?php

namespace App\Http\Resources\ProjectDesign;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectDesignFileVersionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $label = 'v' . ($this->version_number ?? '?');
        if ($this->revision_code) {
            $label .= ' - ' . $this->revision_code;
        }

        return [
            'id' => $this->id,
            'fileId' => $this->file_id,
            'versionNumber' => $this->version_number,
            'label' => $label,
            'status' => $this->status,
            'uploadStatus' => $this->upload_status,
            'previewStatus' => $this->preview_status,
            'reviewStatus' => $this->review_status,
            'revisionCode' => $this->revision_code,
            'changeSummary' => $this->change_summary,
            'uploadNote' => $this->upload_note,
            'uploadedBy' => $this->whenLoaded('uploadedBy', fn () => $this->uploadedBy ? ['id' => $this->uploadedBy->id, 'name' => $this->uploadedBy->name] : null),
            'assets' => ProjectDesignAssetResource::collection($this->whenLoaded('assets')),
            'previewError' => $this->preview_error,
            'submittedAt' => $this->submitted_at?->toIso8601String(),
            'approvedAt' => $this->approved_at?->toIso8601String(),
            'rejectedAt' => $this->rejected_at?->toIso8601String(),
            'supersededAt' => $this->superseded_at?->toIso8601String(),
            'recordVersion' => $this->record_version,
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }
}
