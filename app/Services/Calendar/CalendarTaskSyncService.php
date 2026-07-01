<?php

namespace App\Services\Calendar;

use App\Models\CalendarEvent;
use App\Models\Task;
use App\Models\User;
use App\Services\Task\TaskNumberService;

class CalendarTaskSyncService
{
    public function __construct(
        protected TaskNumberService $taskNumberService,
        protected CalendarActivityService $activityService,
    ) {}

    public function createTaskFromEvent(CalendarEvent $event, User $user): Task
    {
        $task = Task::create([
            'task_number' => $this->taskNumberService->generate(),
            'title' => $event->title,
            'description' => $event->description,
            'type' => 'calendar',
            'category' => $this->mapTypeToCategory($event->type),
            'status' => 'not_started',
            'priority' => $event->priority,
            'start_date' => $event->starts_at?->toDateString(),
            'due_date' => $event->ends_at?->toDateString() ?? $event->starts_at?->toDateString(),
            'created_by' => $user->id,
            'dossier_id' => $event->dossier_id,
            'client_id' => $event->client_id,
            'dossier_document_id' => $event->dossier_document_id,
            'finance_document_id' => $event->finance_document_id,
            'contract_id' => $event->contract_id,
            'authorization_id' => $event->authorization_id,
            'archive_record_id' => $event->archive_record_id,
        ]);

        $participantIds = $event->participants()
            ->whereIn('role', ['owner', 'assignee'])
            ->pluck('user_id')
            ->all();

        if ($participantIds) {
            $task->assignees()->sync($participantIds);
        }

        $event->update(['task_id' => $task->id]);

        $this->activityService->log($event, $user->id, 'task_created', null, ['task_id' => $task->id, 'task_number' => $task->task_number]);

        return $task;
    }

    public function syncEventDatesToTask(CalendarEvent $event): void
    {
        if (!$event->task_id) return;

        Task::where('id', $event->task_id)->update([
            'start_date' => $event->starts_at?->toDateString(),
            'due_date' => $event->ends_at?->toDateString() ?? $event->starts_at?->toDateString(),
        ]);
    }

    public function syncTaskStatusToEvent(Task $task): void
    {
        CalendarEvent::where('task_id', $task->id)->each(function (CalendarEvent $event) use ($task) {
            $event->update([
                'status' => $task->status === 'completed' ? 'completed'
                    : ($task->status === 'cancelled' ? 'cancelled'
                        : ($task->status === 'in_progress' ? 'in_progress' : 'scheduled')),
            ]);
        });
    }

    private function mapTypeToCategory(string $type): string
    {
        return match ($type) {
            'client_follow_up' => 'client_follow_up',
            'finance_follow_up' => 'finance',
            'authorization_follow_up' => 'authorization',
            'contract_follow_up' => 'contract',
            'archive_follow_up' => 'archive',
            'meeting', 'deadline', 'task' => 'general_admin',
            default => 'general_admin',
        };
    }
}
