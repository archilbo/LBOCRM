<?php

namespace App\Http\Resources\ProjectDesign;

use App\Services\PermissionRegistry;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectDesignSummaryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'folders' => (int) ($this->resource['folders'] ?? 0),
            'files' => (int) ($this->resource['files'] ?? 0),
            'versions' => (int) ($this->resource['versions'] ?? 0),
            'activities' => (int) ($this->resource['activities'] ?? 0),
            'canUpload' => $request->user() !== null
                && app(PermissionRegistry::class)->allows($request->user(), 'project-design.upload'),
        ];
    }
}
