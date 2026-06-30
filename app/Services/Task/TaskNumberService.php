<?php

namespace App\Services\Task;

use App\Models\Task;

class TaskNumberService
{
    public function generate(): string
    {
        $prefix = 'TASK-';
        $last = Task::withTrashed()->where('task_number', 'like', $prefix . date('Y') . '-%')
            ->orderBy('id', 'desc')->value('task_number');

        if ($last) {
            $num = (int) substr($last, strrpos($last, '-') + 1) + 1;
        } else {
            $num = 1;
        }

        return $prefix . date('Y') . '-' . str_pad((string) $num, 4, '0', STR_PAD_LEFT);
    }
}
