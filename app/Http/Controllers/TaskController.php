<?php

namespace App\Http\Controllers;

use App\Http\Requests\Task\StoreTaskRequest;
use App\Http\Requests\Task\UpdateTaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\Task;
use App\Services\Task\TaskMutationService;
use App\Services\Task\TaskQueryService;
use App\Services\Task\TaskActivityService;
use App\Services\Recovery\RecoveryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class TaskController extends Controller
{
    public function __construct(
        protected TaskQueryService $tasks,
        protected TaskMutationService $mutations,
    ) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Task::class);

        return Inertia::render('Tasks/Index', $this->tasks->indexPayload($request));
    }

    public function store(StoreTaskRequest $request): RedirectResponse
    {
        $this->authorize('create', Task::class);
        $this->mutations->create($request->validated(), $request->user());

        return redirect()->route('tasks.index')->with('success', 'Task created.');
    }

    public function show(Task $task): Response
    {
        $this->authorize('view', $task);

        $task->load([
            'creator', 'assigner', 'assignees', 'watchers',
            'checklistItems.completedBy',
            'comments.user',
            'attachments.user',
            'activityLogs.user',
            'dossier', 'client', 'document', 'financeDocument', 'contract', 'archiveRecord',
        ]);
        $task->loadCount(['comments', 'attachments']);

        return Inertia::render('Tasks/Show', [
            'task' => new TaskResource($task),
        ]);
    }

    public function detail(Task $task): JsonResponse
    {
        $this->authorize('view', $task);

        $task->load([
            'creator', 'assigner', 'assignees', 'watchers',
            'checklistItems.completedBy',
            'comments.user',
            'attachments.user',
            'activityLogs.user',
            'dossier', 'client', 'document', 'financeDocument', 'contract', 'archiveRecord',
        ]);
        $task->loadCount(['comments', 'attachments']);

        return response()->json(new TaskResource($task));
    }

    public function update(UpdateTaskRequest $request, Task $task): RedirectResponse
    {
        $this->authorize('update', $task);

        if ($request->hasAny(['assignee_ids', 'watcher_ids'])) {
            $this->authorize('assign', $task);
        }

        $this->mutations->update($task, $request->validated(), $request->user());

        return redirect()->back()->with('success', 'Task updated.');
    }

    public function destroy(Task $task, RecoveryService $recovery, TaskActivityService $activity): RedirectResponse
    {
        $this->authorize('delete', $task);
        $user = request()->user();

        DB::transaction(function () use ($task, $recovery, $activity, $user): void {
            $task->delete();
            $recovery->moveToTrash($task, $user);
            $activity->log($task, $user->id, 'moved_to_trash', 'Task moved to recovery trash.');
        });

        return redirect()->route('tasks.index')->with('success', 'Tâche déplacée dans la corbeille.');
    }

    public function updateStatus(Request $request, Task $task): RedirectResponse
    {
        $this->authorize('updateStatus', $task);
        $data = $request->validate(['status' => ['required', Rule::in(config('archilbo_operations.task_statuses', []))]]);
        $this->mutations->updateStatus($task, $data['status'], $request->user());

        return redirect()->back()->with('success', 'Status updated.');
    }
}
