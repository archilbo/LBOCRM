<?php

namespace App\Services\Calendar;

use App\Models\CalendarEvent;

class CalendarNumberService
{
    public function generate(): string
    {
        $prefix = 'CAL-';
        $last = CalendarEvent::withTrashed()->where('event_number', 'like', $prefix . date('Y') . '-%')
            ->orderBy('id', 'desc')->value('event_number');

        if ($last) {
            $num = (int) substr($last, strrpos($last, '-') + 1) + 1;
        } else {
            $num = 1;
        }

        return $prefix . date('Y') . '-' . str_pad((string) $num, 4, '0', STR_PAD_LEFT);
    }
}
