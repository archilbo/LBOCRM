<?php

namespace App\Services\Task;

use App\Models\Task;
use App\Models\User;
use App\Services\Collaboration\RelatedRecordScopeGuard;

class TaskMutationService
{
    public function __construct(
        protected TaskNumberService $numberService,
        protected TaskActivityService $activityService,
        protected TaskNotificationService $notificationService,
        protected RelatedRecordScopeGuard $scopeGuard,
    ) {}

    public function create(array $data, User $user): Task
    {
        $assigneeIds = $data['assignee_ids'] ?? [];
        $watcherIds = $data['watcher_ids'] ?? [];
        $this->scopeGuard->assertTaskLinks($user, $data);
        unset($data['assignee_ids'], $data['watcher_ids']);

        $task = Task::create([
            ...$data,
            'task_number' => $data['task_number'] ?? $this->numberService->generate(),
            'type' => $data['type'] ?? 'general',
            'impact' => $data['impact'] ?? 'normal',
            'created_by' => $user->id,
            'assigned_by' => $user->id,
        ]);

        $task->assignees()->sync($assigneeIds);
        $task->watchers()->sync($watcherIds);
        $task->load('assignees', 'watchers');

        $this->activityService->log($task, $user->id, 'created', 'Task created');
        $task->assignees->each(fn (User $assignee) => $this->notificationService->notifyAssigned($task, $assignee));

        return $task;
    }

    public function update(Task $task, array $data, User $user): Task
    {
        $old = $task->replicate();
        $oldAssigneeIds = $task->assignees()->pluck('users.id')->all();
        $assigneeIds = $data['assignee_ids'] ?? null;
        $watcherIds = $data['watcher_ids'] ?? null;
        $this->scopeGuard->assertTaskLinks($user, $data);
        unset($data['assignee_ids'], $data['watcher_ids']);

        $task->update($data);

        if (is_array($assigneeIds)) {
            $task->assignees()->sync($assigneeIds);
            $this->notifyAssigneeChanges($task, $oldAssigneeIds, $assigneeIds);
        }

        if (is_array($watcherIds)) {
            $task->watchers()->sync($watcherIds);
        }

        $this->applyCompletionRules($task);

        $changes = collect($data)
            ->filter(fn ($value, $key) => $old->$key != $value)
            ->keys()
            ->map(fn ($key) => $key . ' changed')
            ->all();

        if ($changes) {
            $this->activityService->log($task, $user->id, 'updated', implode(', ', $changes));

            if ($old->status !== $task->status) {
                $this->notificationService->notifyStatusChanged($task, (string) $old->status, (string) $task->status);
            }
        }

        return $task->refresh();
    }

    public function updateStatus(Task $task, string $status, User $user): Task
    {
        $oldStatus = (string) $task->status;

        $updates = ['status' => $status];

        if ($status === 'completed') {
            $updates['completed_at'] = now();
            $updates['progress'] = 100;
        } elseif ($oldStatus === 'completed' && $status !== 'completed') {
            $updates['completed_at'] = null;
        }

        if ($status === 'in_review') {
            $updates['reviewed_at'] = null;
        }

        $task->update($updates);

        $this->activityService->log(
            $task,
            $user->id,
            'status_changed',
            "Status changed from {$oldStatus} to {$status}",
            ['status' => $oldStatus],
            ['status' => $status],
        );

        $this->notificationService->notifyStatusChanged($task, $oldStatus, $status);

        return $task->refresh();
    }

    protected function applyCompletionRules(Task $task): void
    {
        $needsUpdate = false;
        $updates = [];

        if ($task->status === 'completed' && ! $task->completed_at) {
            $updates['completed_at'] = now();
            $updates['progress'] = 100;
            $needsUpdate = true;
        } elseif ($task->getOriginal('status') === 'completed' && $task->status !== 'completed') {
            $updates['completed_at'] = null;
            $needsUpdate = true;
        }

        if ($needsUpdate) {
            $task->update($updates);
        }
    }

    private function notifyAssigneeChanges(Task $task, array $oldIds, array $newIds): void
    {
        foreach (array_diff($newIds, $oldIds) as $userId) {
            if ($user = User::find($userId)) {
                $this->notificationService->notifyAssigned($task, $user);
            }
        }

        foreach (array_diff($oldIds, $newIds) as $userId) {
            if ($user = User::find($userId)) {
                $this->notificationService->notifyUser($user, $task, 'unassigned', 'You were unassigned from: ' . $task->title);
            }
        }
    }
}
