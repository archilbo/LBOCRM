<?php

namespace App\Policies;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;

class MessagePolicy
{
    public function create(User $user, Conversation $conversation): bool
    {
        return $conversation->participants()->where('user_id', $user->id)->exists();
    }

    public function update(User $user, Message $message): bool
    {
        return $message->user_id === $user->id && $message->created_at->diffInMinutes(now()) < 15;
    }

    public function delete(User $user, Message $message): bool
    {
        return $message->user_id === $user->id || $user->hasRole('admin');
    }
}
