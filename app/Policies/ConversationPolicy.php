<?php

namespace App\Policies;

use App\Models\Conversation;
use App\Models\User;

class ConversationPolicy
{
    public function view(User $user, Conversation $conversation): bool
    {
        return $conversation->belongsToScope($user)
            && $conversation->participants()->where('user_id', $user->id)->exists();
    }

    public function create(User $user): bool
    {
        return $user->can('view inbox') || $user->can('manage inbox') || $user->hasRole('admin');
    }

    public function manage(User $user, Conversation $conversation): bool
    {
        if (! $this->view($user, $conversation)) {
            return false;
        }

        return $user->can('manage inbox')
            || $user->hasRole('admin')
            || $conversation->participants()->where('user_id', $user->id)->whereIn('role', ['owner', 'admin'])->exists();
    }
}
