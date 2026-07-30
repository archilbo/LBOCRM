<?php

namespace App\Http\Controllers;

use App\Models\CalendarEventReminder;
use App\Services\Collaboration\RelatedRecordScopeGuard;
use App\Services\Calendar\CalendarReminderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CalendarReminderController extends Controller
{
    public function __construct(
        protected CalendarReminderService $service,
        protected RelatedRecordScopeGuard $scopeGuard,
    ) {}

    public function store(Request $request, \App\Models\CalendarEvent $calendarEvent): RedirectResponse
    {
        $this->authorize('update', $calendarEvent);

        $data = $request->validate([
            'user_id' => ['nullable', 'exists:users,id'],
            'offset_minutes' => ['nullable', 'integer'],
            'remind_at' => ['nullable', 'date'],
            'channel' => ['nullable', 'string'],
        ]);

        $this->scopeGuard->assertUserIds($request->user(), array_filter([$data['user_id'] ?? null]));

        $calendarEvent->reminders()->create([
            ...$data,
            'channel' => $data['channel'] ?? 'in_app',
        ]);

        return redirect()->back()->with('success', 'Reminder added.');
    }

    public function snooze(Request $request, CalendarEventReminder $calendarReminder): JsonResponse
    {
        $this->authorize('snooze', $calendarReminder);

        $data = $request->validate(['minutes' => ['nullable', 'integer', 'min:1', 'max:1440']]);

        $reminder = $this->service->snooze($calendarReminder, $data['minutes'] ?? 5);

        return response()->json([
            'reminder' => new \App\Http\Resources\CalendarReminderResource($reminder),
        ]);
    }

    public function dismiss(CalendarEventReminder $calendarReminder): JsonResponse
    {
        $this->authorize('dismiss', $calendarReminder);

        $reminder = $this->service->dismiss($calendarReminder);

        return response()->json([
            'reminder' => new \App\Http\Resources\CalendarReminderResource($reminder),
        ]);
    }
}
