<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CalendarReminderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'calendarEventId' => $this->calendar_event_id,
            'userId' => $this->user_id,
            'offsetMinutes' => $this->offset_minutes,
            'remindAt' => $this->remind_at?->toIso8601String(),
            'channel' => $this->channel,
            'status' => $this->status,
            'snoozedUntil' => $this->snoozed_until?->toIso8601String(),
            'sentAt' => $this->sent_at?->toIso8601String(),
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }
}
