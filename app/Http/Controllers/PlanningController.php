<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Services\PermissionRegistry;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PlanningController extends Controller
{
    public function index(Request $request, PermissionRegistry $permissions): Response
    {
        abort_unless($permissions->allows($request->user(), 'tasks.view'), 403);

        $tasks = Task::with(['dossier.primaryClient', 'assignees', 'creator'])
            ->orderBy('due_date')
            ->orderBy('created_at', 'desc')
            ->get();

        $rows = $tasks->map(function (Task $task) {
            $assignee = $task->assignees->first();
            $dossier = $task->dossier;
            $client = $dossier?->primaryClient;

            $dueDate = $task->due_date?->format('Y-m-d') ?? 'No date';
            $startsAt = $task->start_date?->diffForHumans() ?? 'Pending';

            $dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            $dayKey = $task->due_date ? $dayNames[$task->due_date->dayOfWeek] : 'monday';
            if ($dayKey === 'sunday') $dayKey = 'monday';

            return [
                'id' => $task->id,
                'title' => $task->title,
                'type' => $this->mapType($task->type),
                'dossierNumber' => $dossier?->dossier_number ?? $task->task_number,
                'projectObject' => $dossier?->project_object ?? $task->title,
                'client' => $client?->name ?? '—',
                'cin' => $client?->cin ?? '—',
                'assignee' => $assignee?->name ?? $task->creator?->name ?? 'Unassigned',
                'priority' => $task->priority ?? 'normal',
                'status' => $this->mapStatus($task->status),
                'startsAt' => $startsAt,
                'dueDate' => $dueDate,
                'dayKey' => $dayKey,
                'progress' => $task->progress ?? 0,
                'updatedAt' => $task->updated_at?->diffForHumans() ?? '—',
                'nextAction' => $task->description ?? 'Review and process.',
            ];
        });

        return Inertia::render('Planning/Index', [
            'tasks' => $rows,
            'metrics' => [
                'total' => $tasks->count(),
                'active' => $tasks->where('status', 'active')->count(),
                'overdue' => $tasks->filter(fn ($t) => $t->due_date && $t->due_date->isPast() && $t->status !== 'completed')->count(),
                'completed' => $tasks->where('status', 'completed')->count(),
            ],
        ]);
    }

    private function mapType(?string $type): string
    {
        $map = [
            'document' => 'documents',
            'verification' => 'verification',
            'contract' => 'contract',
            'authorization' => 'authorization',
            'site_visit' => 'siteVisit',
            'archive' => 'archive',
            'finance' => 'finance',
        ];
        return $map[$type] ?? 'documents';
    }

    private function mapStatus(?string $status): string
    {
        $map = [
            'pending' => 'pending',
            'active' => 'active',
            'in_progress' => 'active',
            'completed' => 'completed',
            'blocked' => 'blocked',
            'overdue' => 'overdue',
        ];
        return $map[$status] ?? 'pending';
    }
}
