<?php

namespace App\Services\Chat;

use App\Models\ChatActivityLog;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;

class ChatActivityService
{
    public function log(
        Conversation $conversation,
        User $user,
        string $action,
        array $oldValues = [],
        array $newValues = [],
        ?Message $message = null,
    ): ChatActivityLog {
        return ChatActivityLog::create([
            'company_id' => $conversation->company_id ?? $user->company_id,
            'branch_id' => $conversation->branch_id ?? $user->branch_id,
            'conversation_id' => $conversation->id,
            'message_id' => $message?->id,
            'user_id' => $user->id,
            'action' => $action,
            'old_values' => $oldValues ?: null,
            'new_values' => $newValues ?: null,
            'ip_address' => request()?->ip(),
            'user_agent' => request()?->userAgent(),
        ]);
    }
}
