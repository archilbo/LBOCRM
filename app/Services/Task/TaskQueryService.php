<?php

namespace App\Services\Task;

use App\Http\Resources\TaskResource;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;

class TaskQueryService
{
    public function __construct(protected TaskRequestService $taskRequests) {}

    public function indexPayload(Request $request): array
    {
        $user = $request->user();
        $filter = $request->query('filter', 'all');
        $category = $request->query('category', 'all');
        $search = $request->query('search');

        $query = Task::query()
            ->with(['assignees', 'watchers', 'creator', 'assigner', 'checklistItems', 'dossier', 'client'])
            ->withCount(['comments', 'attachments']);

        if (! $user->can('manage tasks') && ! $user->hasRole('admin')) {
            $query->where(function ($q) use ($user) {
                $q->where('created_by', $user->id)
                    ->orWhereHas('assignees', fn ($assignees) => $assignees->where('user_id', $user->id))
                    ->orWhereHas('watchers', fn ($watchers) => $watchers->where('user_id', $user->id));
            });
        }

        match ($filter) {
            'my' => $query->whereHas('assignees', fn ($q) => $q->where('user_id', $user->id)),
            'assigned_by_me' => $query->where('assigned_by', $user->id),
            'watching' => $query->whereHas('watchers', fn ($q) => $q->where('user_id', $user->id)),
            'overdue' => $query->whereNotNull('due_date')->where('due_date', '<', now())->whereNotIn('status', ['completed', 'cancelled']),
            'due_today' => $query->whereDate('due_date', today()),
            'due_week' => $query->whereBetween('due_date', [now()->startOfWeek(), now()->endOfWeek()]),
            'blocked' => $query->where('status', 'blocked'),
            'completed' => $query->where('status', 'completed'),
            default => null,
        };

        if ($category !== 'all') {
            $query->where('category', $category);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('task_number', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $tasks = $query->latest()->get();

        return [
            'tasks' => TaskResource::collection($tasks)->resolve(),
            'users' => User::query()
                ->orderBy('name')
                ->get(['id', 'name', 'email'])
                ->map(fn (User $user) => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ]),
            'activeFilter' => $filter,
            'activeCategory' => $category,
            'operationsConfig' => [
                'statuses' => config('archilbo_operations.task_statuses', []),
                'types' => config('archilbo_operations.task_types', []),
                'categories' => config('archilbo_operations.task_categories', []),
                'priorities' => config('archilbo_operations.task_priorities', []),
                'impacts' => config('archilbo_operations.task_impacts', []),
            ],
            'taskRequestTypes' => config('archilbo_operations.task_request_types', []),
            'taskRequestTypeLabels' => config('archilbo_operations.task_request_type_labels', []),
            'taskRequestOptions' => $this->taskRequests->formOptions(),
        ];
    }
}
