<?php

namespace App\Services\Calendar;

use App\Models\CalendarEvent;
use App\Models\CalendarEventActivityLog;

class CalendarActivityService
{
    public function log(
        CalendarEvent $event,
        ?int $userId,
        string $eventName,
        mixed $oldValue = null,
        mixed $newValue = null,
        mixed $metadata = null,
    ): CalendarEventActivityLog {
        return CalendarEventActivityLog::create([
            'calendar_event_id' => $event->id,
            'user_id' => $userId,
            'event' => $eventName,
            'old_value' => $oldValue,
            'new_value' => $newValue,
            'metadata' => $metadata,
            'created_at' => now(),
        ]);
    }
}
