<?php

namespace App\Services\Calendar;

use App\Models\CalendarEvent;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class CalendarConflictService
{
    public function check(CalendarEvent $event, array $participantIds): Collection
    {
        if (!$event->starts_at || !$event->ends_at) {
            return collect();
        }

        $start = Carbon::parse($event->starts_at);
        $end = Carbon::parse($event->ends_at);

        $conflicts = CalendarEvent::where('id', '!=', $event->id)
            ->where(function ($q) use ($start, $end) {
                $q->whereBetween('starts_at', [$start, $end])
                  ->orWhereBetween('ends_at', [$start, $end])
                  ->orWhere(function ($q2) use ($start, $end) {
                      $q2->where('starts_at', '<=', $start)
                         ->where('ends_at', '>=', $end);
                  });
            })
            ->whereHas('participants', fn ($q) => $q->whereIn('user_id', $participantIds))
            ->whereNotIn('status', ['cancelled', 'completed'])
            ->with(['participants.user'])
            ->get();

        return $conflicts->map(fn ($conflict) => [
            'event_id' => $conflict->id,
            'title' => $conflict->title,
            'starts_at' => $conflict->starts_at->format('Y-m-d H:i:s'),
            'ends_at' => $conflict->ends_at?->format('Y-m-d H:i:s'),
            'participants' => $conflict->participants->pluck('user.name')->filter()->values(),
        ]);
    }
}
