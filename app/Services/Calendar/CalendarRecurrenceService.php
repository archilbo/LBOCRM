<?php

namespace App\Services\Calendar;

use App\Models\CalendarEvent;
use App\Models\CalendarEventRecurrence;
use Carbon\Carbon;

class CalendarRecurrenceService
{
    public function apply(CalendarEvent $event): void
    {
        $recurrence = $event->recurrences()->first();
        if (!$recurrence) return;

        $dates = $this->generateDates($recurrence, $event->starts_at);
        $base = $event->replicate();
        $duration = $event->ends_at ? $event->starts_at->diffInSeconds($event->ends_at) : 0;

        foreach ($dates as $date) {
            if ($date->equalTo($event->starts_at)) continue;

            $exists = CalendarEvent::where('event_number', '!=', $event->event_number)
                ->where('title', $event->title)
                ->whereDate('starts_at', $date)
                ->where('type', $event->type)
                ->exists();

            if ($exists) continue;

            $cloned = $base->toArray();
            unset($cloned['event_number']);
            $cloned['starts_at'] = $date;
            $cloned['ends_at'] = $duration > 0 ? (clone $date)->addSeconds($duration) : null;

            CalendarEvent::create($cloned + [
                'event_number' => app(CalendarNumberService::class)->generate(),
            ]);
        }
    }

    private function generateDates(CalendarEventRecurrence $recurrence, Carbon $start): array
    {
        $dates = [];
        $max = $recurrence->count ?? 52;
        $endDate = $recurrence->ends_at ? Carbon::parse($recurrence->ends_at) : null;
        $interval = max(1, $recurrence->interval);
        $current = clone $start;

        for ($i = 0; $i < $max; $i++) {
            if ($endDate && $current->greaterThan($endDate)) break;

            $dates[] = clone $current;

            match ($recurrence->frequency) {
                'daily' => $current->addDays($interval),
                'weekly' => $current->addWeeks($interval),
                'monthly' => $current->addMonths($interval),
                'yearly' => $current->addYears($interval),
                default => $current->addWeeks($interval),
            };
        }

        return $dates;
    }
}
