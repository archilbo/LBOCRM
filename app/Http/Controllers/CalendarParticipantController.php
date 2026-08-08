<?php

namespace App\Http\Controllers;

use App\Models\CalendarEvent;
use App\Models\User;
use App\Services\Collaboration\RelatedRecordScopeGuard;
use App\Services\Calendar\CalendarActivityService;
use App\Services\Calendar\CalendarNotificationService;
use App\Services\Calendar\CalendarRealtimeService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CalendarParticipantController extends Controller
{
    public function __construct(
        protected CalendarNotificationService $notificationService,
        protected CalendarActivityService $activityService,
        protected CalendarRealtimeService $realtimeService,
        protected RelatedRecordScopeGuard $scopeGuard,
    ) {}

    public function store(Request $request, CalendarEvent $calendarEvent): RedirectResponse
    {
        $this->authorize('update', $calendarEvent);

        $data = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'role' => ['nullable', 'string', 'in:owner,assignee,watcher,guest'],
        ]);

        $this->scopeGuard->assertUserIds($request->user(), [$data['user_id']]);

        $previousRecipientIds = $this->realtimeService->recipientIds($calendarEvent);

        $calendarEvent->participants()->firstOrCreate(
            ['user_id' => $data['user_id']],
            ['role' => $data['role'] ?? 'assignee'],
        );

        $user = User::find($data['user_id']);
        if ($user) {
            $this->notificationService->notifyAssigned($calendarEvent, $user);
        }

        $this->activityService->log($calendarEvent, $request->user()->id, 'participant_added', null, ['user_id' => $data['user_id']]);
        $this->realtimeService->publish($calendarEvent->fresh(), 'participants_updated', $previousRecipientIds);

        return redirect()->back()->with('success', 'Participant added.');
    }

    public function destroy(CalendarEvent $calendarEvent, User $user): RedirectResponse
    {
        $this->authorize('update', $calendarEvent);
        $this->scopeGuard->assertUserIds(request()->user(), [$user->id]);

        $previousRecipientIds = $this->realtimeService->recipientIds($calendarEvent);

        $calendarEvent->participants()->where('user_id', $user->id)->where('role', '!=', 'owner')->delete();

        $this->activityService->log($calendarEvent, request()->user()->id, 'participant_removed', null, ['user_id' => $user->id]);
        $this->realtimeService->publish($calendarEvent->fresh(), 'participants_updated', $previousRecipientIds);

        return redirect()->back()->with('success', 'Participant removed.');
    }
}
