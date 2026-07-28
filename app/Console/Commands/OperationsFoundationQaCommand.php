<?php

namespace App\Console\Commands;

use App\Services\Task\OperationsReportService;
use App\Services\Task\WorkloadService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Permission;

class OperationsFoundationQaCommand extends Command
{
    protected $signature = 'archilbo:operations-foundation-qa';

    protected $description = 'Validate the Operations Center backend foundation.';

    public function handle(
        WorkloadService $workload,
        OperationsReportService $reports,
    ): int {
        $this->info('Checking Operations Center foundation...');

        foreach (['tasks', 'conversations', 'messages', 'notifications'] as $table) {
            if (! Schema::hasTable($table)) {
                $this->error("Missing table: {$table}");
                return self::FAILURE;
            }
        }

        foreach ([
            'type',
            'impact',
            'reviewed_at',
            'blocked_reason',
            'estimated_minutes',
            'actual_minutes',
            'recurrence_rule',
            'conversation_id',
        ] as $column) {
            if (! Schema::hasColumn('tasks', $column)) {
                $this->error("Missing tasks column: {$column}");
                return self::FAILURE;
            }
        }

        foreach ([
            'task_statuses',
            'task_types',
            'task_priorities',
            'task_impacts',
        ] as $key) {
            if (empty(config("archilbo_operations.{$key}"))) {
                $this->error("Missing operations config: {$key}");
                return self::FAILURE;
            }
        }

        foreach ([
            'tasks.index',
            'tasks.store',
            'workload.index',
            'operations.reports.index',
            'inbox.index',
            'notifications.index',
        ] as $routeName) {
            if (! Route::has($routeName)) {
                $this->error("Missing route: {$routeName}");
                return self::FAILURE;
            }
        }

        $missingPermissions = collect([
            'view tasks',
            'manage tasks',
            'view inbox',
            'manage inbox',
            'view notifications',
            'manage notifications',
            'view workload',
            'view operations reports',
        ])->reject(fn (string $permission) => Permission::query()->where('name', $permission)->exists());

        if ($missingPermissions->isNotEmpty()) {
            $this->error('Missing permissions: ' . $missingPermissions->implode(', '));
            return self::FAILURE;
        }

        if (! is_array($workload->summary()) || ! is_array($reports->summary())) {
            $this->error('Operations services did not return arrays.');
            return self::FAILURE;
        }

        $this->info('Operations Center foundation QA passed.');

        return self::SUCCESS;
    }
}
