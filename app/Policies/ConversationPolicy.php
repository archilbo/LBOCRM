<?php

namespace App\Policies;

use App\Models\Conversation;
use App\Models\User;
use App\Policies\Concerns\HandlesTenantAuthorization;

class ConversationPolicy
{
    use HandlesTenantAuthorization;

    public function view(User $user, Conversation $conversation): bool
    {
        return $this->allowed($user, 'inbox.view')
            && $conversation->belongsToScope($user)
            && $conversation->participants()->where('user_id', $user->id)->exists();
    }

    public function create(User $user): bool
    {
        return $this->allowed($user, 'inbox.manage');
    }

    public function manage(User $user, Conversation $conversation): bool
    {
        if (! $this->view($user, $conversation)) {
            return false;
        }

        return $this->allowed($user, 'inbox.manage')
            || $conversation->participants()->where('user_id', $user->id)->whereIn('role', ['owner', 'admin'])->exists();
    }
}
