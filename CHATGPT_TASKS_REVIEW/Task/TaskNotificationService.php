<?php

namespace App\Services\Task;

use App\Models\Task;
use App\Models\User;
use App\Notifications\TaskNotification;

class TaskNotificationService
{
    public function notifyAssignees(Task $task, string $action, string $description): void
    {
        $task->assignees->each(fn (User $user) => $user->notify(new TaskNotification($task, $action, $description)));
    }

    public function notifyWatchers(Task $task, string $action, string $description): void
    {
        $task->watchers->each(fn (User $user) => $user->notify(new TaskNotification($task, $action, $description)));
    }

    public function notifyUser(User $user, Task $task, string $action, string $description): void
    {
        $user->notify(new TaskNotification($task, $action, $description));
    }

    public function notifyAssigned(Task $task, User $assignee): void
    {
        $assignee->notify(new TaskNotification($task, 'assigned', 'You have been assigned: ' . $task->title));
    }

    public function notifyReassigned(Task $task, User $oldAssignee, User $newAssignee): void
    {
        $oldAssignee->notify(new TaskNotification($task, 'reassigned', 'Task ' . $task->task_number . ' was reassigned from you'));
        $newAssignee->notify(new TaskNotification($task, 'assigned', 'You have been assigned: ' . $task->title));
    }

    public function notifyStatusChanged(Task $task, string $oldStatus, string $newStatus): void
    {
        $action = match ($newStatus) {
            'completed' => 'completed',
            'in_review' => 'in_review',
            'blocked' => 'blocked',
            default => 'status_changed',
        };
        $desc = "Task {$task->task_number} moved from {$oldStatus} to {$newStatus}";
        $this->notifyAssignees($task, $action, $desc);
        $this->notifyWatchers($task, $action, $desc);
    }

    public function notifyOverdue(Task $task): void
    {
        $desc = 'Task ' . $task->task_number . ' is overdue (due: ' . ($task->due_date?->format('Y-m-d') ?? 'N/A') . ')';
        $this->notifyAssignees($task, 'overdue', $desc);
        $this->notifyWatchers($task, 'overdue', $desc);
    }

    public function notifyDueTomorrow(Task $task): void
    {
        $desc = 'Task ' . $task->task_number . ' is due tomorrow';
        $this->notifyAssignees($task, 'due_tomorrow', $desc);
    }

    public function notifyMentioned(User $mentionedBy, Task $task, User $mentionedUser, string $context): void
    {
        $mentionedUser->notify(new TaskNotification($task, 'mentioned', $mentionedBy->name . ' mentioned you in ' . $context));
    }

    public function notifySuggestionCreated(string $description, ?User $user = null): void
    {
        if ($user) {
            $user->notify(new \App\Notifications\SuggestionNotification($description));
        }
    }
}
