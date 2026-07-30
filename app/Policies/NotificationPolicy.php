<?php

namespace App\Policies;

use App\Models\User;
use App\Policies\Concerns\HandlesTenantAuthorization;
use Illuminate\Notifications\DatabaseNotification;

class NotificationPolicy
{
    use HandlesTenantAuthorization;

    public function viewAny(User $user): bool
    {
        return $this->allowed($user, 'notifications.view');
    }

    public function view(User $user, DatabaseNotification $notification): bool
    {
        return $this->allowed($user, 'notifications.view')
            && ((int) $notification->notifiable_id === (int) $user->id
                || ($this->allowed($user, 'notifications.manage') && $user->hasAnyRole(config('archilbo_roles.protected'))));
    }

    public function update(User $user, DatabaseNotification $notification): bool
    {
        return $this->view($user, $notification);
    }
}
