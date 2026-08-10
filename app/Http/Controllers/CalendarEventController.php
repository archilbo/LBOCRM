<?php

namespace App\Http\Controllers;

use App\Http\Requests\Calendar\StoreCalendarEventRequest;
use App\Http\Requests\Calendar\UpdateCalendarEventRequest;
use App\Http\Requests\Calendar\MoveCalendarEventRequest;
use App\Http\Requests\Calendar\ResizeCalendarEventRequest;
use App\Http\Resources\CalendarEventResource;
use App\Models\CalendarEvent;
use App\Services\Calendar\CalendarEventService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CalendarEventController extends Controller
{
    public function __construct(
        protected CalendarEventService $service,
    ) {}

    public function store(StoreCalendarEventRequest $request): RedirectResponse
    {
        $this->authorize('create', CalendarEvent::class);

        $event = $this->service->create($request->validated(), $request->user());

        return redirect()->route('calendar.index')->with('success', 'Event created.');
    }

    public function show(CalendarEvent $calendarEvent): JsonResponse
    {
        $this->authorize('view', $calendarEvent);

        $calendarEvent->load([
            'creator', 'owner', 'participants.user', 'reminders',
            'task', 'dossier', 'client',
        ]);

        return response()->json(new CalendarEventResource($calendarEvent));
    }

    public function update(UpdateCalendarEventRequest $request, CalendarEvent $calendarEvent): RedirectResponse
    {
        $this->authorize('update', $calendarEvent);

        $this->service->update($calendarEvent, $request->validated(), $request->user());

        return redirect()->back()->with('success', 'Event updated.');
    }

    public function destroy(Request $request, CalendarEvent $calendarEvent): RedirectResponse
    {
        $this->authorize('delete', $calendarEvent);

        $this->service->delete($calendarEvent, $request->user());

        return redirect()->route('calendar.index')->with('success', 'Événement déplacé dans la corbeille.');
    }

    public function move(MoveCalendarEventRequest $request, CalendarEvent $calendarEvent): JsonResponse
    {
        $this->authorize('move', $calendarEvent);

        $data = $request->validated();

        $event = $this->service->move(
            $calendarEvent,
            Carbon::parse($data['starts_at']),
            isset($data['ends_at']) ? Carbon::parse($data['ends_at']) : null,
            $request->user(),
        );

        return response()->json(new CalendarEventResource($event));
    }

    public function resize(ResizeCalendarEventRequest $request, CalendarEvent $calendarEvent): JsonResponse
    {
        $this->authorize('resize', $calendarEvent);

        $data = $request->validated();

        $event = $this->service->resize(
            $calendarEvent,
            Carbon::parse($data['ends_at']),
            $request->user(),
        );

        return response()->json(new CalendarEventResource($event));
    }

    public function conflicts(CalendarEvent $calendarEvent): JsonResponse
    {
        $this->authorize('view', $calendarEvent);

        $participantIds = $calendarEvent->participants()->pluck('user_id')->all();

        return response()->json([
            'conflicts' => $this->service->conflicts($calendarEvent, $participantIds),
        ]);
    }
}
