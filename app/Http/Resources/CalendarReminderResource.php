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
            'remindAt' => $this->remind_at?->format('Y-m-d H:i:s'),
            'channel' => $this->channel,
            'status' => $this->status,
            'snoozedUntil' => $this->snoozed_until?->format('Y-m-d H:i:s'),
            'sentAt' => $this->sent_at?->format('Y-m-d H:i:s'),
            'createdAt' => $this->created_at?->format('Y-m-d H:i:s'),
        ];
    }
}
