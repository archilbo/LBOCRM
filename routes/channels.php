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

Broadcast::channel('company.{companyId}.presence', function ($user, $companyId) {
    if ((int) $user->company_id !== (int) $companyId) return false;

    return ['id' => $user->id, 'name' => $user->name];
}, ['guards' => ['web']]);
Broadcast::channel('project-design.dossier.{dossierId}', function ($user, int $dossierId): bool {
    return \App\Models\Dossier::query()
        ->whereKey($dossierId)
        ->where('company_id', $user->company_id)
        ->exists();
}, ['guards' => ['web']]);
