<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskChecklistItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'label' => $this->label,
            'isDone' => $this->is_done,
            'position' => $this->position,
            'completedBy' => new UserResource($this->whenLoaded('completedBy')),
            'completedAt' => optional($this->completed_at)->toISOString(),
        ];
    }
}
