<?php

namespace App\Services\Calendar;

use App\Events\Calendar\CalendarChanged;
use App\Models\CalendarEvent;
use App\Models\User;
use App\Services\CompanyContext;
use App\Services\PermissionRegistry;
use Illuminate\Support\Facades\Log;

class CalendarRealtimeService
{
    public function __construct(
        private readonly CompanyContext $companyContext,
        private readonly PermissionRegistry $permissions,
    ) {}

    /** @return list<int> */
    public function recipientIds(CalendarEvent $event): array
    {
        $event->loadMissing('creator', 'participants');

        if (! $event->creator) {
            return [];
        }

        if ($event->visibility === 'team') {
            return $this->companyUsers($event, fn (User $user) => $this->permissions->allows($user, 'calendar.view'));
        }

        if ($event->visibility === 'admins') {
            return $this->companyUsers($event, fn (User $user) => $this->permissions->isProtected($user));
        }

        $recipientIds = [(int) $event->created_by];

        if ($event->visibility === 'assigned_users') {
            $recipientIds = [
                ...$recipientIds,
                ...$event->participants->pluck('user_id')->map(fn ($id) => (int) $id)->all(),
            ];
        }

        return array_values(array_unique($recipientIds));
    }

    /** @param list<int> $additionalRecipientIds */
    public function publish(CalendarEvent $event, string $action, array $additionalRecipientIds = []): void
    {
        $this->publishTo([
            ...$this->recipientIds($event),
            ...$additionalRecipientIds,
        ], "calendar_event:{$event->id}", $action);
    }

    /** @param list<int> $recipientIds */
    public function publishTo(array $recipientIds, string $eventKey, string $action): void
    {
        foreach (array_values(array_unique($recipientIds)) as $recipientId) {
            try {
                CalendarChanged::dispatch($recipientId, $eventKey, $action);
            } catch (\Throwable $exception) {
                // Realtime refresh is additive. An unavailable broadcaster must not
                // roll back an already-persisted calendar change for the user.
                Log::warning('Calendar realtime broadcast was unavailable.', [
                    'recipient_id' => $recipientId,
                    'event_key' => $eventKey,
                    'action' => $action,
                    'exception' => $exception::class,
                ]);
            }
        }
    }

    /** @return list<int> */
    private function companyUsers(CalendarEvent $event, callable $accepts): array
    {
        return $this->companyContext
            ->applyTo(User::query(), $event->creator)
            ->get()
            ->filter($accepts)
            ->pluck('id')
            ->map(fn ($id) => (int) $id)
            ->values()
            ->all();
    }
}
