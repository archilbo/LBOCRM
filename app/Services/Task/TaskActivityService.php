<?php

namespace App\Services\Task;

use App\Models\Task;
use App\Models\TaskActivityLog;

class TaskActivityService
{
    public function log(Task $task, int $userId, string $action, ?string $description = null, mixed $old = null, mixed $new = null): TaskActivityLog
    {
        return TaskActivityLog::create([
            'task_id' => $task->id,
            'user_id' => $userId,
            'action' => $action,
            'description' => $description,
            'old_values' => $old,
            'new_values' => $new,
        ]);
    }
}
