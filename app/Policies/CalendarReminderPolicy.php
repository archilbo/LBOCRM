<?php

namespace App\Policies;

use App\Models\CalendarEventReminder;
use App\Models\User;

class CalendarReminderPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, CalendarEventReminder $reminder): bool
    {
        if ($user->can('admin')) return true;
        return $reminder->user_id === $user->id || $reminder->event->created_by === $user->id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, CalendarEventReminder $reminder): bool
    {
        if ($user->can('admin')) return true;
        return $reminder->user_id === $user->id || $reminder->event->created_by === $user->id;
    }

    public function delete(User $user, CalendarEventReminder $reminder): bool
    {
        if ($user->can('admin')) return true;
        return $reminder->user_id === $user->id || $reminder->event->created_by === $user->id;
    }

    public function snooze(User $user, CalendarEventReminder $reminder): bool
    {
        return $reminder->user_id === $user->id;
    }

    public function dismiss(User $user, CalendarEventReminder $reminder): bool
    {
        return $reminder->user_id === $user->id;
    }
}
