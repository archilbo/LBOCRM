<?php

namespace App\Http\Controllers;

use App\Http\Requests\Task\StoreChecklistRequest;
use App\Models\Task;
use App\Models\TaskChecklistItem;
use App\Services\Task\TaskActivityService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class TaskChecklistController extends Controller
{
    public function __construct(protected TaskActivityService $activityService) {}

    public function index(Task $task)
    {
        $this->authorize('view', $task);
        return $task->checklistItems()->orderBy('position')->get();
    }

    public function store(StoreChecklistRequest $request, Task $task): RedirectResponse
    {
        $this->authorize('update', $task);
        $item = $task->checklistItems()->create([
            'label' => $request->validated('label'),
            'position' => $task->checklistItems()->count(),
        ]);

        $this->activityService->log($task, $request->user()->id, 'checklist_added', 'Checklist item added: ' . $item->label);

        return redirect()->back()->with('success', 'Checklist item added.');
    }

    public function toggle(Task $task, TaskChecklistItem $item): RedirectResponse
    {
        $this->authorize('updateStatus', $task);
        abort_unless($item->task_id === $task->id, 404);

        $item->update([
            'is_done' => ! $item->is_done,
            'completed_by' => $item->is_done ? null : request()->user()->id,
            'completed_at' => $item->is_done ? null : now(),
        ]);

        $progress = $task->checklistItems()->count() > 0
            ? round(($task->checklistItems()->where('is_done', true)->count() / $task->checklistItems()->count()) * 100)
            : 0;
        $task->update(['progress' => $progress]);

        $this->activityService->log($task, request()->user()->id, 'checklist_toggled', 'Checklist item ' . ($item->is_done ? 'completed' : 'reopened') . ': ' . $item->label);

        return redirect()->back()->with('success', 'Checklist updated.');
    }

    public function destroy(Task $task, TaskChecklistItem $item): RedirectResponse
    {
        $this->authorize('update', $task);
        abort_unless($item->task_id === $task->id, 404);
        $item->delete();
        return redirect()->back()->with('success', 'Checklist item removed.');
    }
}
