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

        if ($this->isProtected($user)) return true;
        if ($event->visibility === 'admins') return false;
        if ($user->id === $event->created_by) return true;
        if ($event->visibility === 'team') return true;
        if ($event->visibility === 'assigned_users') {
            return $this->isParticipant($event, $user);
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

        if ($this->isProtected($user)) return true;
        if ($user->id === $event->created_by) return true;
        if ($this->isParticipant($event, $user, 'owner')) return true;
        return false;
    }

    public function delete(User $user, CalendarEvent $event): bool
    {
        return $this->allowed($user, 'calendar.delete')
            && $event->belongsToScope($user)
            && ($this->isProtected($user) || $user->id === $event->created_by);
    }

    public function move(User $user, CalendarEvent $event): bool
    {
        return $this->update($user, $event);
    }

    public function resize(User $user, CalendarEvent $event): bool
    {
        return $this->update($user, $event);
    }

    private function isParticipant(CalendarEvent $event, User $user, ?string $role = null): bool
    {
        if ($event->relationLoaded('participants')) {
            return $event->participants
                ->where('user_id', $user->id)
                ->when($role, fn ($participants) => $participants->where('role', $role))
                ->isNotEmpty();
        }

        return $event->participants()
            ->where('user_id', $user->id)
            ->when($role, fn ($query) => $query->where('role', $role))
            ->exists();
    }
}
