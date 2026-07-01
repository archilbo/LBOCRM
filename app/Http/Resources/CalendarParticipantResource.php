<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CalendarParticipantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'calendarEventId' => $this->calendar_event_id,
            'user' => $this->whenLoaded('user', fn () => new UserResource($this->user)),
            'userId' => $this->user_id,
            'role' => $this->role,
            'responseStatus' => $this->response_status,
            'lastReadAt' => $this->last_read_at?->format('Y-m-d H:i:s'),
        ];
    }
}
