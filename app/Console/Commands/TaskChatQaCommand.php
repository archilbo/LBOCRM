<?php

namespace App\Console\Commands;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\Task;
use App\Models\TaskChecklistItem;
use App\Models\TaskComment;
use App\Models\User;
use Illuminate\Console\Command;

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

        $invalidStatuses = Task::whereNotIn('status', ['not_started', 'in_progress', 'in_review', 'completed', 'blocked', 'cancelled'])->count();
        if ($invalidStatuses > 0) {
            $this->warn("$invalidStatuses tasks with invalid status");
        } else {
            $this->line('All statuses valid');
        }

        $invalidPriorities = Task::whereNotIn('priority', ['low', 'medium', 'high', 'urgent'])->count();
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

        $this->info('QA complete.');
        return Command::SUCCESS;
    }
}
