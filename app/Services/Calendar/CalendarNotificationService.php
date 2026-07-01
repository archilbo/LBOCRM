<?php

namespace App\Services\Calendar;

use App\Models\CalendarEvent;
use App\Models\User;

class CalendarNotificationService
{
    public function notifyAssigned(CalendarEvent $event, User $user): void
    {
        $user->notify(new \App\Notifications\CalendarEventNotification(
            $event,
            'assigned',
            'You have been assigned to: ' . $event->title,
        ));
    }

    public function notifyDateChanged(CalendarEvent $event, User $user): void
    {
        $user->notify(new \App\Notifications\CalendarEventNotification(
            $event,
            'date_changed',
            'Event date changed: ' . $event->title,
        ));
    }

    public function notifyReminderDue(CalendarEvent $event, User $user): void
    {
        $user->notify(new \App\Notifications\CalendarEventNotification(
            $event,
            'reminder',
            'Reminder: ' . $event->title,
        ));
    }

    public function notifyCancelled(CalendarEvent $event, User $user): void
    {
        $user->notify(new \App\Notifications\CalendarEventNotification(
            $event,
            'cancelled',
            'Event cancelled: ' . $event->title,
        ));
    }

    public function notifyStartsSoon(CalendarEvent $event, User $user): void
    {
        $user->notify(new \App\Notifications\CalendarEventNotification(
            $event,
            'starts_soon',
            'Starting soon: ' . $event->title,
        ));
    }
}
