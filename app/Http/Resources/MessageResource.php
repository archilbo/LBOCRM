<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'body' => $this->body,
            'isEdited' => $this->is_edited,
            'user' => new UserResource($this->whenLoaded('user')),
            'readBy' => $this->whenLoaded('reads', fn () => $this->reads->pluck('user_id')),
            'attachments' => $this->whenLoaded('attachments'),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->diffForHumans(),
        ];
    }
}
