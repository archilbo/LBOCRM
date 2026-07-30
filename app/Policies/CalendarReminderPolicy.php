<?php

namespace App\Policies;

use App\Models\CalendarEventReminder;
use App\Models\User;
use App\Policies\Concerns\HandlesTenantAuthorization;

class CalendarReminderPolicy
{
    use HandlesTenantAuthorization;

    public function viewAny(User $user): bool
    {
        return $this->allowed($user, 'calendar.view');
    }

    public function view(User $user, CalendarEventReminder $reminder): bool
    {
        return $this->allowed($user, 'calendar.view')
            && $reminder->event?->belongsToScope($user)
            && ($user->hasAnyRole(config('archilbo_roles.protected'))
                || $reminder->user_id === $user->id
                || $reminder->event->created_by === $user->id);
    }

    public function create(User $user): bool
    {
        return $this->allowed($user, 'calendar.create');
    }

    public function update(User $user, CalendarEventReminder $reminder): bool
    {
        return $this->allowed($user, 'calendar.update')
            && $reminder->event?->belongsToScope($user)
            && ($user->hasAnyRole(config('archilbo_roles.protected'))
                || $reminder->user_id === $user->id
                || $reminder->event->created_by === $user->id);
    }

    public function delete(User $user, CalendarEventReminder $reminder): bool
    {
        return $this->allowed($user, 'calendar.delete')
            && $reminder->event?->belongsToScope($user)
            && ($user->hasAnyRole(config('archilbo_roles.protected'))
                || $reminder->user_id === $user->id
                || $reminder->event->created_by === $user->id);
    }

    public function snooze(User $user, CalendarEventReminder $reminder): bool
    {
        return $this->allowed($user, 'calendar.view')
            && $reminder->event?->belongsToScope($user)
            && $reminder->user_id === $user->id;
    }

    public function dismiss(User $user, CalendarEventReminder $reminder): bool
    {
        return $this->allowed($user, 'calendar.view')
            && $reminder->event?->belongsToScope($user)
            && $reminder->user_id === $user->id;
    }
}
