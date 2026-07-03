<?php

namespace App\Policies;

use App\Models\TaskRequest;
use App\Models\User;

class TaskRequestPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('view task requests') || $user->can('manage task requests') || $user->hasRole('admin');
    }

    public function view(User $user, TaskRequest $taskRequest): bool
    {
        if ($user->can('manage task requests') || $user->hasRole('admin')) {
            return true;
        }

        return $taskRequest->requested_by === $user->id || $taskRequest->target_user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->can('manage task requests') || $user->can('view task requests') || $user->hasRole('admin');
    }

    public function update(User $user, TaskRequest $taskRequest): bool
    {
        if ($user->can('manage task requests') || $user->hasRole('admin')) {
            return true;
        }

        return $taskRequest->requested_by === $user->id && $taskRequest->status === 'submitted';
    }

    public function delete(User $user, TaskRequest $taskRequest): bool
    {
        return $user->can('manage task requests') || $user->hasRole('admin');
    }

    public function convert(User $user, TaskRequest $taskRequest): bool
    {
        return $user->can('manage task requests') || $user->hasRole('admin');
    }
}
