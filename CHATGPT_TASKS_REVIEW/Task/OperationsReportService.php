<?php

namespace App\Services\Task;

use App\Models\Task;

class OperationsReportService
{
    public function summary(): array
    {
        $base = Task::query();

        return [
            'totalTasks' => (clone $base)->count(),
            'openTasks' => (clone $base)->whereNotIn('status', ['completed', 'cancelled'])->count(),
            'completedTasks' => (clone $base)->where('status', 'completed')->count(),
            'blockedTasks' => (clone $base)->where('status', 'blocked')->count(),
            'overdueTasks' => (clone $base)
                ->whereNotNull('due_date')
                ->where('due_date', '<', now())
                ->whereNotIn('status', ['completed', 'cancelled'])
                ->count(),
            'byModule' => (clone $base)
                ->selectRaw('category, count(*) as total')
                ->groupBy('category')
                ->pluck('total', 'category')
                ->all(),
            'byPriority' => (clone $base)
                ->selectRaw('priority, count(*) as total')
                ->groupBy('priority')
                ->pluck('total', 'priority')
                ->all(),
        ];
    }
}
