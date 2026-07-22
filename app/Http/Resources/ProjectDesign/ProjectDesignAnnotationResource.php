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
            'companyId' => $this->company_id,
            'dossierId' => $this->dossier_id,
            'fileId' => $this->file_id,
            'versionId' => $this->version_id,
            'assetId' => $this->asset_id,
            'remarkId' => $this->remark_id,
            'annotationType' => $this->type,
            'pageNumber' => $this->page_number,
            'coordinateSpace' => $this->coordinate_space,
            'geometry' => $this->geometry,
            'style' => $this->style_json,
            'viewport' => $this->viewport_json,
            'referenceWidth' => $this->reference_width,
            'referenceHeight' => $this->reference_height,
            'sourceRotation' => $this->source_rotation,
            'authoredBy' => $this->whenLoaded('authoredBy', fn () => $this->authoredBy ? ['id' => $this->authoredBy->id, 'name' => $this->authoredBy->name] : null),
            'createdBy' => $this->whenLoaded('createdBy', fn () => $this->createdBy ? ['id' => $this->createdBy->id, 'name' => $this->createdBy->name] : null),
            'hasRemark' => $this->relationLoaded('remarks') ? $this->remarks->isNotEmpty() : null,
            'remark' => $this->relationLoaded('remarks') && $this->remarks->isNotEmpty()
                ? new ProjectDesignRemarkResource($this->remarks->first())
                : null,
            'createdAt' => $this->created_at?->toIso8601String(),
            'updatedAt' => $this->updated_at?->toIso8601String(),
            'recordVersion' => $this->record_version,
        ];
    }
}
