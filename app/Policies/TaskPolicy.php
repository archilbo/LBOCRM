<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\User;
class TaskPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('view tasks') || $user->can('manage tasks') || $user->hasRole('admin');
    }

    public function view(User $user, Task $task): bool
    {
        if ($user->can('manage tasks') || $user->hasRole('admin')) return true;
        return $task->assignees()->where('user_id', $user->id)->exists()
            || $task->watchers()->where('user_id', $user->id)->exists()
            || $task->created_by === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->can('manage tasks') || $user->can('view tasks') || $user->hasRole('admin');
    }

    public function update(User $user, Task $task): bool
    {
        if ($user->can('manage tasks') || $user->hasRole('admin')) return true;
        return $task->assignees()->where('user_id', $user->id)->exists()
            || $task->created_by === $user->id;
    }

    public function updateStatus(User $user, Task $task): bool
    {
        if ($user->can('manage tasks') || $user->hasRole('admin')) return true;

        return $task->assignees()->where('user_id', $user->id)->exists()
            || $task->created_by === $user->id;
    }

    public function delete(User $user, Task $task): bool
    {
        if ($user->can('manage tasks') || $user->hasRole('admin')) return true;
        return $task->created_by === $user->id;
    }
}
