<?php

namespace App\Services\Task;

use App\Models\Task;
use App\Models\User;
use App\Services\PermissionRegistry;

class TaskPermissionService
{
    public function __construct(
        private readonly PermissionRegistry $permissions,
    ) {
    }

    public function canView(?User $user, Task $task): bool
    {
        if (! $user) return false;
        if ($this->permissions->allows($user, 'tasks.view')) return true;
        return $task->assignees()->where('user_id', $user->id)->exists()
            || $task->watchers()->where('user_id', $user->id)->exists()
            || $task->created_by === $user->id;
    }

    public function canUpdate(?User $user, Task $task): bool
    {
        if (! $user) return false;
        if ($this->permissions->allows($user, 'tasks.update')) return true;
        return $task->assignees()->where('user_id', $user->id)->exists()
            || $task->created_by === $user->id;
    }

    public function canDelete(?User $user, Task $task): bool
    {
        if (! $user) return false;
        return $this->permissions->allows($user, 'tasks.delete') || $task->created_by === $user->id;
    }
}
