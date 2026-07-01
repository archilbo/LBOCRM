<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConversationParticipantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $this->whenLoaded('user');
        return [
            'id' => $this->id,
            'userId' => $this->user_id,
            'user' => $user ? (new UserResource($user))->resolve() : [
                'id' => $this->user_id,
                'name' => 'Deleted user',
                'email' => null,
                'lastSeenAt' => null,
                'isOnline' => false,
            ],
            'lastReadAt' => optional($this->last_read_at)->toISOString(),
            'archivedAt' => optional($this->archived_at)->toISOString(),
        ];
    }
}
