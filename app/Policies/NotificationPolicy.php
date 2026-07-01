<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Notifications\DatabaseNotification;

class NotificationPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('view notifications') || $user->can('manage notifications') || $user->hasRole('admin');
    }

    public function view(User $user, DatabaseNotification $notification): bool
    {
        return (int) $notification->notifiable_id === (int) $user->id || $user->can('manage notifications') || $user->hasRole('admin');
    }

    public function update(User $user, DatabaseNotification $notification): bool
    {
        return $this->view($user, $notification);
    }
}
