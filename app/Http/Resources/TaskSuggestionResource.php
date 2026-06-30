<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskSuggestionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'description' => $this->description,
            'dossierId' => $this->dossier_id,
            'clientId' => $this->client_id,
            'isDismissed' => $this->is_dismissed,
            'createdTaskId' => $this->created_task_id,
            'createdAt' => $this->created_at?->toISOString(),
        ];
    }
}
