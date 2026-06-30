<?php

namespace App\Services\Task;

use App\Models\Task;
use App\Models\User;

class TaskPermissionService
{
    public function canView(?User $user, Task $task): bool
    {
        if (! $user) return false;
        if ($user->can('manage tasks') || $user->hasRole('admin')) return true;
        return $task->assignees()->where('user_id', $user->id)->exists()
            || $task->watchers()->where('user_id', $user->id)->exists()
            || $task->created_by === $user->id;
    }

    public function canUpdate(?User $user, Task $task): bool
    {
        if (! $user) return false;
        if ($user->can('manage tasks') || $user->hasRole('admin')) return true;
        return $task->assignees()->where('user_id', $user->id)->exists()
            || $task->created_by === $user->id;
    }

    public function canDelete(?User $user, Task $task): bool
    {
        if (! $user) return false;
        return $user->can('manage tasks') || $user->hasRole('admin') || $task->created_by === $user->id;
    }
}
