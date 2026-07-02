<?php

use App\Models\Conversation;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('conversation.{conversationId}', function ($user, $conversationId) {
    return Conversation::whereKey($conversationId)
        ->whereHas('participants', fn ($q) => $q->where('user_id', $user->id))
        ->exists();
}, ['guards' => ['web']]);

Broadcast::channel('user.{userId}.inbox', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
}, ['guards' => ['web']]);
