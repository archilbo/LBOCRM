<?php

namespace App\Policies;

use App\Models\CalendarEvent;
use App\Models\User;
use App\Policies\Concerns\HandlesTenantAuthorization;

class CalendarEventPolicy
{
    use HandlesTenantAuthorization;

    public function viewAny(User $user): bool
    {
        return $this->allowed($user, 'calendar.view');
    }

    public function view(User $user, CalendarEvent $event): bool
    {
        if (! $this->allowed($user, 'calendar.view') || ! $event->belongsToScope($user)) {
            return false;
        }

        if ($user->hasAnyRole(config('archilbo_roles.protected'))) return true;
        if ($event->visibility === 'admins') return false;
        if ($user->id === $event->created_by) return true;
        if ($event->visibility === 'team') return true;
        if ($event->visibility === 'assigned_users') {
            return $event->participants()->where('user_id', $user->id)->exists();
        }
        return $user->id === $event->created_by;
    }

    public function create(User $user): bool
    {
        return $this->allowed($user, 'calendar.create');
    }

    public function update(User $user, CalendarEvent $event): bool
    {
        if (! $this->allowed($user, 'calendar.update') || ! $event->belongsToScope($user)) {
            return false;
        }

        if ($user->hasAnyRole(config('archilbo_roles.protected'))) return true;
        if ($user->id === $event->created_by) return true;
        if ($event->participants()->where('user_id', $user->id)->where('role', 'owner')->exists()) return true;
        return false;
    }

    public function delete(User $user, CalendarEvent $event): bool
    {
        return $this->allowed($user, 'calendar.delete')
            && $event->belongsToScope($user)
            && ($user->hasAnyRole(config('archilbo_roles.protected')) || $user->id === $event->created_by);
    }

    public function move(User $user, CalendarEvent $event): bool
    {
        return $this->update($user, $event);
    }

    public function resize(User $user, CalendarEvent $event): bool
    {
        return $this->update($user, $event);
    }
}
