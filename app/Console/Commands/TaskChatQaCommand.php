<?php

namespace App\Console\Commands;

use App\Http\Resources\TaskResource;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Task;
use App\Models\TaskChecklistItem;
use App\Models\TaskComment;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Route;

class TaskChatQaCommand extends Command
{
    protected $signature = 'app:qa-tasks-chat';
    protected $description = 'QA checks for Task, Chat, and Notification modules';

    public function handle(): int
    {
        $this->info('=== Task & Chat QA ===');

        $tasks = Task::count();
        $this->line("Tasks: $tasks");
        if ($tasks === 0) {
            $this->warn('No tasks found');
        }

        $validStatuses = config('archilbo_operations.task_statuses', []);
        $invalidStatuses = Task::whereNotIn('status', $validStatuses)->count();
        if ($invalidStatuses > 0) {
            $this->warn("$invalidStatuses tasks with invalid status");
        } else {
            $this->line('All statuses valid');
        }

        $validPriorities = config('archilbo_operations.task_priorities', []);
        $invalidPriorities = Task::whereNotIn('priority', $validPriorities)->count();
        if ($invalidPriorities > 0) {
            $this->warn("$invalidPriorities tasks with invalid priority");
        } else {
            $this->line('All priorities valid');
        }

        $tasklessChecklist = TaskChecklistItem::whereDoesntHave('task')->count();
        if ($tasklessChecklist > 0) {
            $this->warn("$tasklessChecklist orphaned checklist items");
        }

        $tasklessComments = TaskComment::whereDoesntHave('task')->count();
        if ($tasklessComments > 0) {
            $this->warn("$tasklessComments orphaned comments");
        }

        $convs = Conversation::count();
        $this->line("Conversations: $convs");

        $msgs = Message::count();
        $this->line("Messages: $msgs");

        $msglessConvs = Conversation::whereDoesntHave('messages')->count();
        if ($msglessConvs > 0) {
            $this->warn("$msglessConvs conversations with no messages");
        }

        $participantlessConvs = Conversation::whereDoesntHave('participants')->count();
        if ($participantlessConvs > 0) {
            $this->warn("$participantlessConvs conversations with no participants");
        }

        $notifications = User::all()->sum(fn ($u) => $u->notifications()->count());
        $this->line("Total notifications: $notifications");

        $this->line('');

        // Extended QA
        $this->line('--- Extended resource checks ---');

        $resourceClass = class_exists(\App\Http\Resources\TaskAttachmentResource::class);
        $this->line($resourceClass ? 'TaskAttachmentResource class exists' : 'WARN: TaskAttachmentResource missing');

        $hasCommentNoteColumn = \Illuminate\Support\Facades\Schema::hasColumn('task_comments', 'is_note');
        $this->line($hasCommentNoteColumn ? 'task_comments.is_note column exists' : 'WARN: is_note column missing');

        $taskRoutes = Route::getRoutes()->getRoutesByMethod()['GET'] ?? [];
        $hasTasksRoute = collect($taskRoutes)->contains(fn ($r) => $r->uri() === 'tasks' || $r->uri() === 'tasks/{task}');
        $this->line($hasTasksRoute ? 'Task GET routes registered' : 'WARN: Task routes missing');

        // TaskResource numeric counts check
        $sampleTask = Task::withCount(['comments', 'attachments'])->first();
        if ($sampleTask) {
            $resource = new TaskResource($sampleTask);
            $data = $resource->resolve();
            $commentsCount = $data['commentsCount'] ?? null;
            $attachmentsCount = $data['attachmentsCount'] ?? null;
            $this->line(is_int($commentsCount) ? "commentsCount is int: $commentsCount" : 'WARN: commentsCount not int');
            $this->line(is_int($attachmentsCount) ? "attachmentsCount is int: $attachmentsCount" : 'WARN: attachmentsCount not int');
            $this->line('assignees default: ' . (is_array($data['assignees'] ?? null) ? 'array' : 'WARN: not array'));
            $this->line('watchers default: ' . (is_array($data['watchers'] ?? null) ? 'array' : 'WARN: not array'));
            $this->line('checklistItems default: ' . (is_array($data['checklistItems'] ?? null) ? 'array' : 'WARN: not array'));
        }

        $this->line('');

        // Source file checks
        $files = [
            resource_path('js/pages/Tasks/Index.tsx'),
            resource_path('js/features/tasks/types.ts'),
            resource_path('js/features/tasks/components/TaskBoard.tsx'),
            resource_path('js/features/tasks/components/TaskCard.tsx'),
            resource_path('js/features/tasks/components/TaskDetailDrawer.tsx'),
            resource_path('js/features/tasks/components/TaskCreateDrawer.tsx'),
            resource_path('js/features/tasks/components/TaskFilters.tsx'),
            resource_path('js/features/tasks/components/TaskList.tsx'),
            resource_path('js/features/tasks/components/TaskCalendar.tsx'),
        ];
        foreach ($files as $file) {
            $this->line(file_exists($file) ? "OK: $file" : "WARN: Missing $file");
        }

        $this->info('QA complete.');
        return Command::SUCCESS;
    }
}
