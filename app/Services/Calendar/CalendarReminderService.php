<?php

namespace App\Services\Calendar;

use App\Models\CalendarEventReminder;
use App\Models\User;

class CalendarReminderService
{
    public function __construct(
        protected CalendarNotificationService $notificationService,
        protected CalendarActivityService $activityService,
    ) {}

    public function snooze(CalendarEventReminder $reminder, ?int $minutes = 5): CalendarEventReminder
    {
        $reminder->update([
            'status' => 'snoozed',
            'snoozed_until' => now()->addMinutes($minutes),
        ]);

        return $reminder->fresh();
    }

    public function dismiss(CalendarEventReminder $reminder): CalendarEventReminder
    {
        $reminder->update([
            'status' => 'dismissed',
            'dismissed_at' => now(),
        ]);

        return $reminder->fresh();
    }

    public function send(CalendarEventReminder $reminder): void
    {
        if ($reminder->status === 'sent' || $reminder->status === 'dismissed') return;

        $event = $reminder->event;
        $user = $reminder->user;

        if ($user) {
            $this->notificationService->notifyReminderDue($event, $user);
        }

        $reminder->update([
            'status' => 'sent',
            'sent_at' => now(),
        ]);
    }

    public function processDue(): int
    {
        $sent = 0;

        CalendarEventReminder::where('status', 'pending')
            ->where(function ($q) {
                $q->whereNotNull('remind_at')->where('remind_at', '<=', now())
                  ->orWhere(function ($q2) {
                      $q2->whereNull('remind_at')
                         ->whereNotNull('offset_minutes')
                         ->whereHas('event', fn ($e) => $e->where('starts_at', '<=', now()->addMinutes(
                             (new CalendarEventReminder)->rawOffset()
                         )));
                  });
            })
            ->chunk(50, function ($reminders) use (&$sent) {
                foreach ($reminders as $reminder) {
                    $this->send($reminder);
                    $sent++;
                }
            });

        CalendarEventReminder::where('status', 'snoozed')
            ->where('snoozed_until', '<=', now())
            ->chunk(50, function ($reminders) use (&$sent) {
                foreach ($reminders as $reminder) {
                    $this->send($reminder);
                    $sent++;
                }
            });

        return $sent;
    }
}
