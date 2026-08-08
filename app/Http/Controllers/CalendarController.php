<?php

namespace App\Http\Controllers;

use App\Models\CalendarEvent;
use App\Services\Calendar\CalendarEventService;
use App\Http\Requests\Calendar\CalendarIndexRequest;
use Inertia\Inertia;
use Inertia\Response;

class CalendarController extends Controller
{
    public function __construct(
        protected CalendarEventService $calendarService,
    ) {}

    public function index(CalendarIndexRequest $request): Response
    {
        $this->authorize('viewAny', CalendarEvent::class);

        $payload = $this->calendarService->indexPayload(
            $request->user(),
            $request->validated(),
        );
        $payload['capabilities'] = [
            'create' => $request->user()->can('create', CalendarEvent::class),
            'manageAdminVisibility' => app(\App\Services\PermissionRegistry::class)->isProtected($request->user()),
        ];

        return Inertia::render('Calendar/Index', $payload);
    }
}
