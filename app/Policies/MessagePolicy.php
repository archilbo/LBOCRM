<?php

namespace App\Policies;

use App\Models\Message;
use App\Models\User;
use App\Policies\Concerns\HandlesTenantAuthorization;

class MessagePolicy
{
    use HandlesTenantAuthorization;

    public function view(User $user, Message $message): bool
    {
        return $message->conversation
            ? app(ConversationPolicy::class)->view($user, $message->conversation)
            : false;
    }

    public function create(User $user): bool
    {
        return $this->allowed($user, 'inbox.manage');
    }

    public function update(User $user, Message $message): bool
    {
        return $this->allowed($user, 'inbox.manage') && $this->view($user, $message) && (
            $user->hasAnyRole(config('archilbo_roles.protected')) ||
            $message->user_id === $user->id
            && $message->created_at?->gte(now()->subMinutes(config('chat.message_edit_window_minutes', 30)))
        );
    }

    public function delete(User $user, Message $message): bool
    {
        return $this->allowed($user, 'inbox.manage') && $this->view($user, $message) && (
            $user->hasAnyRole(config('archilbo_roles.protected')) ||
            $message->user_id === $user->id
            && $message->created_at?->gte(now()->subMinutes(config('chat.message_delete_window_minutes', 30)))
        );
    }
}
