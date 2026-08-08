<?php

namespace App\Services\Calendar;

use App\Models\CalendarEvent;
use App\Models\User;
use App\Services\CompanyContext;
use App\Services\Collaboration\RelatedRecordScopeGuard;
use App\Services\PermissionRegistry;
use Carbon\CarbonImmutable;
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
        protected PermissionRegistry $permissions,
        protected CalendarRealtimeService $realtimeService,
    ) {}

    public function indexPayload(User $user, array $filters): array
    {
        [$rangeStart, $rangeEnd] = $this->range($filters);

        $query = CalendarEvent::with([
            'creator:id,name,email,company_id,branch_id',
            'owner:id,name,email,company_id,branch_id',
            'participants:id,calendar_event_id,user_id,role,response_status,last_read_at',
            'participants.user:id,name,email,company_id,branch_id',
            'reminders:id,calendar_event_id,user_id,offset_minutes,remind_at,channel,status,snoozed_until,sent_at,created_at',
        ])->whereHas('creator', fn ($creator) => $this->companyContext->applyTo($creator, $user))
            ->where(function ($q) use ($user) {
            $q->where('created_by', $user->id)
              ->orWhereHas('participants', fn ($p) => $p->where('user_id', $user->id))
              ->orWhere('visibility', 'team');

                if ($this->permissions->isProtected($user)) {
                    $q->orWhere('visibility', 'admins');
                }
        });

        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['user_id'])) {
            $this->scopeGuard->assertUserIds($user, [(int) $filters['user_id']]);
            $query->whereHas('participants', fn ($q) => $q->where('user_id', $filters['user_id']));
        }

        $query->where('starts_at', '<=', $rangeEnd)
            ->where(fn ($dates) => $dates
                ->whereNull('ends_at')
                ->orWhere('ends_at', '>=', $rangeStart));

        $events = $query->orderBy('starts_at')->get();

        return [
            'events' => \App\Http\Resources\CalendarEventResource::collection($events)->resolve(),
            'users' => $this->companyContext->applyTo(User::query(), $user)
                ->orderBy('name')
                ->get(['id', 'name', 'email']),
            'range' => [
                'start' => $rangeStart->toDateString(),
                'end' => $rangeEnd->toDateString(),
            ],
        ];
    }

    /** @return array{CarbonImmutable, CarbonImmutable} */
    private function range(array $filters): array
    {
        $timezone = config('app.timezone', 'UTC');

        if (! empty($filters['start']) && ! empty($filters['end'])) {
            return [
                CarbonImmutable::createFromFormat('!Y-m-d', $filters['start'], $timezone)->startOfDay(),
                CarbonImmutable::createFromFormat('!Y-m-d', $filters['end'], $timezone)->endOfDay(),
            ];
        }

        $today = CarbonImmutable::now($timezone);

        return [$today->startOfMonth(), $today->endOfMonth()];
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

        $event = $event->refresh();
        $this->realtimeService->publish($event, 'created');

        return $event;
    }

    public function update(CalendarEvent $event, array $data, User $user): CalendarEvent
    {
        $previousRecipientIds = $this->realtimeService->recipientIds($event);
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

        $event = $event->fresh()->load(['participants.user', 'reminders']);
        $this->realtimeService->publish($event, 'updated', $previousRecipientIds);

        return $event;
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

        $event = $event->fresh();
        $this->realtimeService->publish($event, 'moved');

        return $event;
    }

    public function resize(CalendarEvent $event, Carbon $newEnd, User $user): CalendarEvent
    {
        $event->update(['ends_at' => $newEnd]);

        $this->activityService->log($event, $user->id, 'resized', [
            'ends_at' => $event->getOriginal('ends_at')?->format('Y-m-d H:i:s'),
        ], [
            'ends_at' => $newEnd->format('Y-m-d H:i:s'),
        ]);

        $event = $event->fresh();
        $this->realtimeService->publish($event, 'resized');

        return $event;
    }

    public function delete(CalendarEvent $event): void
    {
        $recipientIds = $this->realtimeService->recipientIds($event);
        $eventKey = "calendar_event:{$event->id}";

        $event->delete();

        $this->realtimeService->publishTo($recipientIds, $eventKey, 'deleted');
    }

    public function conflicts(CalendarEvent $event, array $participantIds): Collection
    {
        return $this->conflictService->check($event, $participantIds);
    }
}
