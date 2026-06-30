<?php

namespace App\Console\Commands;

use App\Models\Task;
use App\Services\Task\TaskNotificationService;
use Carbon\Carbon;
use Illuminate\Console\Command;

class TaskOverdueNotificationsCommand extends Command
{
    protected $signature = 'app:task-overdue-notify';
    protected $description = 'Send notifications for overdue tasks and tasks due tomorrow';

    public function handle(TaskNotificationService $notifier): int
    {
        $overdue = Task::whereNotNull('due_date')
            ->where('due_date', '<', Carbon::today())
            ->whereNotIn('status', ['completed', 'cancelled'])
            ->with('assignees', 'watchers')
            ->get();

        foreach ($overdue as $task) {
            $notifier->notifyOverdue($task);
            $this->line("Overdue: {$task->task_number}");
        }

        $dueTomorrow = Task::whereDate('due_date', Carbon::tomorrow())
            ->whereNotIn('status', ['completed', 'cancelled'])
            ->with('assignees')
            ->get();

        foreach ($dueTomorrow as $task) {
            $notifier->notifyDueTomorrow($task);
            $this->line("Due tomorrow: {$task->task_number}");
        }

        $this->info("Sent " . ($overdue->count() + $dueTomorrow->count()) . " notifications.");
        return Command::SUCCESS;
    }
}
