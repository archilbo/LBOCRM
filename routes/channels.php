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

Broadcast::channel('user.{userId}.calendar', function ($user, $userId) {
    return (int) $user->id === (int) $userId
        && app(\App\Services\PermissionRegistry::class)->allows($user, 'calendar.view');
}, ['guards' => ['web']]);

Broadcast::channel('company.{companyId}.presence', function ($user, $companyId) {
    if ((int) $user->company_id !== (int) $companyId) return false;

    return ['id' => $user->id, 'name' => $user->name];
}, ['guards' => ['web']]);
Broadcast::channel('project-design.dossier.{dossierId}', function ($user, int $dossierId): bool {
    if (! $user->can('project-design.view') || ! $user->company_id) {
        return false;
    }

    return \App\Models\Dossier::query()
        ->whereKey($dossierId)
        ->where(function ($query) use ($user) {
            $query->whereHas('designFiles', fn ($files) => $files->where('company_id', $user->company_id))
                ->orWhereHas('designFolders', fn ($folders) => $folders->where('company_id', $user->company_id));
        })
        ->exists();
}, ['guards' => ['web']]);
