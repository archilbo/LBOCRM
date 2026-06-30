<?php

namespace App\Http\Controllers;

use App\Http\Requests\Task\StoreTaskRequest;
use App\Http\Requests\Task\UpdateTaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\Dossier;
use App\Models\Task;
use App\Models\User;
use App\Services\Task\TaskActivityService;
use App\Services\Task\TaskNotificationService;
use App\Services\Task\TaskNumberService;
use App\Services\Task\TaskSuggestionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TaskController extends Controller
{
    public function __construct(
        protected TaskNumberService $numberService,
        protected TaskActivityService $activityService,
        protected TaskNotificationService $notificationService,
        protected TaskSuggestionService $suggestionService,
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $query = Task::with(['creator', 'assignees', 'watchers', 'dossier', 'client'])
            ->withCount(['comments', 'attachments']);

        $filter = $request->query('filter', 'all');
        if ($filter === 'my') {
            $query->whereHas('assignees', fn ($q) => $q->where('user_id', $user->id));
        } elseif ($filter === 'assigned_by_me') {
            $query->where('assigned_by', $user->id);
        } elseif ($filter === 'overdue') {
            $query->whereNotNull('due_date')->where('due_date', '<', now())->whereNotIn('status', ['completed', 'cancelled']);
        } elseif ($filter === 'due_today') {
            $query->whereDate('due_date', now());
        } elseif ($filter === 'due_week') {
            $query->whereBetween('due_date', [now()->startOfWeek(), now()->endOfWeek()]);
        } elseif ($filter === 'completed') {
            $query->where('status', 'completed');
        }

        $category = $request->query('category');
        if ($category && $category !== 'all') {
            $query->where('category', $category);
        }

        $search = $request->query('search');
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('task_number', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $tasks = $query->with(['assignees', 'watchers', 'creator', 'assigner', 'checklistItems'])->withCount(['comments', 'attachments'])->latest()->get();

        $users = User::orderBy('name')->get()->map(fn (User $u) => [
            'id' => $u->id, 'name' => $u->name, 'email' => $u->email,
        ]);

        $suggestions = $this->suggestionService->generateForDossier(
            Dossier::latest()->first()
        );

        return Inertia::render('Tasks/Index', [
            'tasks' => TaskResource::collection($tasks)->resolve(),
            'users' => $users,
            'activeFilter' => $filter,
            'activeCategory' => $category ?? 'all',
        ]);
    }

    public function store(StoreTaskRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['task_number'] = $this->numberService->generate();
        $data['created_by'] = $request->user()->id;
        $data['assigned_by'] = $request->user()->id;

        $task = Task::create($data);

        if (! empty($data['assignee_ids'])) {
            $task->assignees()->sync($data['assignee_ids']);
        }
        if (! empty($data['watcher_ids'])) {
            $task->watchers()->sync($data['watcher_ids']);
        }

        $this->activityService->log($task, $request->user()->id, 'created', 'Task created');
        foreach ($task->assignees as $assignee) {
            $this->notificationService->notifyAssigned($task, $assignee);
        }

        return redirect()->route('tasks.index')->with('success', 'Task created.');
    }

    public function show(Task $task): Response
    {
        $task->load([
            'creator', 'assigner', 'assignees', 'watchers',
            'checklistItems.completedBy',
            'comments.user',
            'attachments.user',
            'activityLogs.user',
            'dossier', 'client', 'document', 'financeDocument', 'contract', 'authorization', 'archiveRecord',
        ]);
        $task->loadCount(['comments', 'attachments']);

        return Inertia::render('Tasks/Show', [
            'task' => new TaskResource($task),
        ]);
    }

    public function update(UpdateTaskRequest $request, Task $task): RedirectResponse
    {
        $old = $task->replicate();
        $oldAssigneeIds = $task->assignees->pluck('id')->toArray();
        $data = $request->validated();

        $task->update($data);

        if (isset($data['assignee_ids'])) {
            $task->assignees()->sync($data['assignee_ids']);
            $newIds = $data['assignee_ids'];
            $added = array_diff($newIds, $oldAssigneeIds);
            $removed = array_diff($oldAssigneeIds, $newIds);
            foreach ($added as $uid) {
                if ($u = User::find($uid)) {
                    $this->notificationService->notifyAssigned($task, $u);
                }
            }
            foreach ($removed as $uid) {
                if ($u = User::find($uid)) {
                    $this->notificationService->notifyUser($u, $task, 'unassigned', 'You were unassigned from: ' . $task->title);
                }
            }
        }
        if (isset($data['watcher_ids'])) {
            $task->watchers()->sync($data['watcher_ids']);
        }

        if ($task->status === 'completed' && ! $task->completed_at) {
            $task->update(['completed_at' => now(), 'progress' => 100]);
        }

        $changes = [];
        foreach ($data as $key => $value) {
            if ($old->$key != $value) {
                $changes[] = $key . ' changed';
            }
        }

        if ($changes) {
            $this->activityService->log($task, $request->user()->id, 'updated', implode(', ', $changes));
            if ($old->status !== $task->status) {
                $this->notificationService->notifyStatusChanged($task, $old->status, $task->status);
            }
        }

        return redirect()->back()->with('success', 'Task updated.');
    }

    public function destroy(Task $task): RedirectResponse
    {
        $task->delete();
        return redirect()->route('tasks.index')->with('success', 'Task deleted.');
    }

    public function updateStatus(Request $request, Task $task): RedirectResponse
    {
        $request->validate(['status' => 'required|in:not_started,in_progress,in_review,completed,blocked,cancelled']);

        $oldStatus = $task->status;
        $task->update(['status' => $request->status]);

        if ($request->status === 'completed') {
            $task->update(['completed_at' => now(), 'progress' => 100]);
        }

        $this->activityService->log($task, $request->user()->id, 'status_changed', "Status changed from {$oldStatus} to {$request->status}",
            ['status' => $oldStatus], ['status' => $request->status]);

        $this->notificationService->notifyStatusChanged($task, $oldStatus, $request->status);

        return redirect()->back()->with('success', 'Status updated.');
    }
}
