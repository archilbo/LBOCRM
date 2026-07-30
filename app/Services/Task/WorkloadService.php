<?php

namespace App\Services\Task;

use App\Models\User;
use App\Services\CompanyContext;

class WorkloadService
{
    public function __construct(private readonly CompanyContext $companyContext)
    {
    }

    public function summary(User $user): array
    {
        return $this->companyContext->applyTo(User::query(), $user)
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
