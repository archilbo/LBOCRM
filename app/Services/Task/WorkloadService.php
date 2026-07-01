<?php

namespace App\Services\Task;

use App\Models\User;

class WorkloadService
{
    public function summary(): array
    {
        return User::query()
            ->withCount([
                'tasksAssigned as open_tasks_count' => fn ($query) => $query->whereNotIn('status', ['completed', 'cancelled']),
                'tasksAssigned as urgent_tasks_count' => fn ($query) => $query->where('priority', 'urgent')->whereNotIn('status', ['completed', 'cancelled']),
                'tasksAssigned as blocked_tasks_count' => fn ($query) => $query->where('status', 'blocked'),
                'tasksAssigned as overdue_tasks_count' => fn ($query) => $query->whereNotNull('due_date')->where('due_date', '<', now())->whereNotIn('status', ['completed', 'cancelled']),
            ])
            ->orderBy('name')
            ->get()
            ->map(fn (User $user) => [
                'userId' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'openTasks' => (int) $user->open_tasks_count,
                'urgentTasks' => (int) $user->urgent_tasks_count,
                'blockedTasks' => (int) $user->blocked_tasks_count,
                'overdueTasks' => (int) $user->overdue_tasks_count,
            ])
            ->values()
            ->all();
    }
}
