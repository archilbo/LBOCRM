<?php

namespace App\Policies;

use App\Models\CalendarEvent;
use App\Models\User;

class CalendarEventPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, CalendarEvent $event): bool
    {
        if ($user->can('admin')) return true;
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
        return true;
    }

    public function update(User $user, CalendarEvent $event): bool
    {
        if ($user->can('admin')) return true;
        if ($user->id === $event->created_by) return true;
        if ($event->participants()->where('user_id', $user->id)->where('role', 'owner')->exists()) return true;
        return false;
    }

    public function delete(User $user, CalendarEvent $event): bool
    {
        if ($user->can('admin')) return true;
        return $user->id === $event->created_by;
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
