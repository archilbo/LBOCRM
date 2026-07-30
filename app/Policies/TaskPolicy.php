<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\User;
use App\Policies\Concerns\HandlesTenantAuthorization;

class TaskPolicy
{
    use HandlesTenantAuthorization;

    public function viewAny(User $user): bool
    {
        return $this->allowed($user, 'tasks.view');
    }

    public function view(User $user, Task $task): bool
    {
        if (! $this->allowed($user, 'tasks.view') || ! $task->belongsToScope($user)) {
            return false;
        }

        if ($this->allowed($user, 'tasks.update') || $this->allowed($user, 'tasks.assign')) {
            return true;
        }

        return $task->assignees()->where('user_id', $user->id)->exists()
            || $task->watchers()->where('user_id', $user->id)->exists()
            || $task->created_by === $user->id;
    }

    public function create(User $user): bool
    {
        return $this->allowed($user, 'tasks.create');
    }

    public function update(User $user, Task $task): bool
    {
        return $this->allowed($user, 'tasks.update')
            && $task->belongsToScope($user);
    }

    public function updateStatus(User $user, Task $task): bool
    {
        return $this->allowed($user, 'tasks.complete')
            && $task->belongsToScope($user);
    }

    public function assign(User $user, Task $task): bool
    {
        return $this->allowed($user, 'tasks.assign')
            && $task->belongsToScope($user);
    }

    public function delete(User $user, Task $task): bool
    {
        return $this->allowed($user, 'tasks.delete')
            && $task->belongsToScope($user);
    }
}
