<?php

namespace App\Http\Controllers;

use App\Models\CalendarEvent;
use App\Services\Calendar\CalendarEventService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CalendarController extends Controller
{
    public function __construct(
        protected CalendarEventService $calendarService,
    ) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', CalendarEvent::class);

        $payload = $this->calendarService->indexPayload(
            $request->user(),
            $request->only(['type', 'status', 'user_id', 'start', 'end']),
        );

        return Inertia::render('Calendar/Index', $payload);
    }
}
