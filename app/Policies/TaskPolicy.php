<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class TaskPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
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
        return true;
    }

    public function update(User $user, Task $task): bool
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
