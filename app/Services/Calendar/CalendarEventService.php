<?php

namespace App\Services\Calendar;

use App\Models\CalendarEvent;
use App\Models\User;
use App\Services\CompanyContext;
use App\Services\Collaboration\RelatedRecordScopeGuard;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class CalendarEventService
{
    public function __construct(
        protected CalendarNumberService $numberService,
        protected CalendarActivityService $activityService,
        protected CalendarNotificationService $notificationService,
        protected CalendarTaskSyncService $taskSyncService,
        protected CalendarConflictService $conflictService,
        protected CalendarRecurrenceService $recurrenceService,
        protected CompanyContext $companyContext,
        protected RelatedRecordScopeGuard $scopeGuard,
    ) {}

    public function indexPayload(User $user, array $filters): array
    {
        $query = CalendarEvent::with([
            'creator', 'owner', 'participants.user', 'reminders',
        ])->whereHas('creator', fn ($creator) => $this->companyContext->applyTo($creator, $user))
            ->where(function ($q) use ($user) {
            $q->where('created_by', $user->id)
              ->orWhereHas('participants', fn ($p) => $p->where('user_id', $user->id))
              ->orWhere('visibility', 'team')
              ->orWhere('visibility', 'admins');
        });

        if (! $user->hasAnyRole(config('archilbo_roles.protected'))) {
            $query->where(function ($q) use ($user) {
                $q->where('visibility', '!=', 'admins')
                  ->orWhere('created_by', $user->id);
            });
        }

        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['user_id'])) {
            $query->whereHas('participants', fn ($q) => $q->where('user_id', $filters['user_id']));
        }

        if (!empty($filters['start'])) {
            $query->where('starts_at', '>=', Carbon::parse($filters['start']));
        }

        if (!empty($filters['end'])) {
            $query->where('starts_at', '<=', Carbon::parse($filters['end']));
        }

        $events = $query->orderBy('starts_at')->get();

        return [
            'events' => \App\Http\Resources\CalendarEventResource::collection($events)->resolve(),
            'users' => $this->companyContext->applyTo(User::query(), $user)
                ->orderBy('name')
                ->get(['id', 'name', 'email']),
        ];
    }

    public function create(array $data, User $user): CalendarEvent
    {
        $participantIds = $data['participant_ids'] ?? [];
        $reminderOffset = $data['reminder_offset'] ?? null;
        $this->scopeGuard->assertCalendarLinks($user, $data);
        unset($data['participant_ids'], $data['reminder_offset']);

        $event = CalendarEvent::create([
            ...$data,
            'event_number' => $this->numberService->generate(),
            'created_by' => $user->id,
        ]);

        if ($participantIds) {
            $event->participants()->createMany(
                collect($participantIds)->map(fn ($id) => [
                    'user_id' => $id,
                    'role' => $id === $user->id ? 'owner' : 'assignee',
                ])->all()
            );
        }

        if (!$event->participants()->where('user_id', $user->id)->exists()) {
            $event->participants()->create([
                'user_id' => $user->id,
                'role' => 'owner',
            ]);
        }

        if ($reminderOffset !== null) {
            $event->reminders()->create([
                'user_id' => $user->id,
                'offset_minutes' => $reminderOffset,
                'channel' => 'in_app',
            ]);
        }

        $this->activityService->log($event, $user->id, 'created');

        $event->load('participants.user', 'reminders');

        if ($event->type === 'task') {
            $this->taskSyncService->createTaskFromEvent($event, $user);
        }

        if ($event->recurrences()->exists()) {
            $this->recurrenceService->apply($event);
        }

        return $event->refresh();
    }

    public function update(CalendarEvent $event, array $data, User $user): CalendarEvent
    {
        $old = $event->replicate();
        $participantIds = $data['participant_ids'] ?? null;
        $reminderOffset = $data['reminder_offset'] ?? null;
        $this->scopeGuard->assertCalendarLinks($user, $data);
        unset($data['participant_ids'], $data['reminder_offset']);

        $event->update($data);

        if (is_array($participantIds)) {
            $event->participants()->whereNotIn('role', ['owner'])->delete();
            foreach ($participantIds as $id) {
                $event->participants()->firstOrCreate(
                    ['user_id' => $id],
                    ['role' => 'assignee']
                );
            }
        }

        if ($reminderOffset !== null) {
            $event->reminders()->where('user_id', $user->id)->delete();
            $event->reminders()->create([
                'user_id' => $user->id,
                'offset_minutes' => $reminderOffset,
                'channel' => 'in_app',
            ]);
        }

        $changes = collect($data)
            ->filter(fn ($value, $key) => $old->$key != $value)
            ->keys()
            ->all();

        if ($changes) {
            $this->activityService->log($event, $user->id, 'updated', null, ['changes' => $changes]);

            if (in_array('starts_at', $changes) || in_array('ends_at', $changes)) {
                $event->participants()->with('user')->get()->each(function ($p) use ($event) {
                    $this->notificationService->notifyDateChanged($event, $p->user);
                });
            }

            if (in_array('starts_at', $changes) || in_array('ends_at', $changes)) {
                $this->taskSyncService->syncEventDatesToTask($event);
            }
        }

        return $event->fresh()->load(['participants.user', 'reminders']);
    }

    public function move(CalendarEvent $event, Carbon $newStart, ?Carbon $newEnd, User $user): CalendarEvent
    {
        $duration = $event->ends_at ? $event->starts_at->diffInMinutes($event->ends_at) : null;

        $event->update([
            'starts_at' => $newStart,
            'ends_at' => $newEnd ?? ($duration ? (clone $newStart)->addMinutes($duration) : null),
        ]);

        $this->activityService->log($event, $user->id, 'moved', [
            'starts_at' => $event->getOriginal('starts_at')?->format('Y-m-d H:i:s'),
            'ends_at' => $event->getOriginal('ends_at')?->format('Y-m-d H:i:s'),
        ], [
            'starts_at' => $newStart->format('Y-m-d H:i:s'),
            'ends_at' => ($newEnd ?? ($duration ? (clone $newStart)->addMinutes($duration) : null))?->format('Y-m-d H:i:s'),
        ]);

        $this->taskSyncService->syncEventDatesToTask($event);

        $event->participants()->with('user')->get()->each(function ($p) use ($event) {
            $this->notificationService->notifyDateChanged($event, $p->user);
        });

        return $event->fresh();
    }

    public function resize(CalendarEvent $event, Carbon $newEnd, User $user): CalendarEvent
    {
        $event->update(['ends_at' => $newEnd]);

        $this->activityService->log($event, $user->id, 'resized', [
            'ends_at' => $event->getOriginal('ends_at')?->format('Y-m-d H:i:s'),
        ], [
            'ends_at' => $newEnd->format('Y-m-d H:i:s'),
        ]);

        return $event->fresh();
    }

    public function conflicts(CalendarEvent $event, array $participantIds): Collection
    {
        return $this->conflictService->check($event, $participantIds);
    }
}
