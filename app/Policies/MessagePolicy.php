<?php

namespace App\Policies;

use App\Models\Message;
use App\Models\User;

class MessagePolicy
{
    public function view(User $user, Message $message): bool
    {
        return $message->conversation
            ? $message->conversation->participants()->where('user_id', $user->id)->exists()
            : false;
    }

    public function create(User $user): bool
    {
        return $user->can('manage inbox') || $user->can('view inbox') || $user->hasRole('admin');
    }

    public function update(User $user, Message $message): bool
    {
        return $message->user_id === $user->id || $user->can('manage inbox') || $user->hasRole('admin');
    }

    public function delete(User $user, Message $message): bool
    {
        return $message->user_id === $user->id || $user->can('manage inbox') || $user->hasRole('admin');
    }
}
