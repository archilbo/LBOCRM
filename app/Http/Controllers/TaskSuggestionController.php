<?php

namespace App\Http\Controllers;

use App\Http\Resources\TaskSuggestionResource;
use App\Models\TaskSuggestion;
use App\Services\Task\TaskNumberService;
use App\Models\Task;
use App\Services\Task\TaskSuggestionService;
use App\Services\CompanyContext;
use App\Services\PermissionRegistry;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class TaskSuggestionController extends Controller
{
    public function __construct(
        protected TaskSuggestionService $suggestionService,
        protected TaskNumberService $numberService,
        protected CompanyContext $companyContext,
        protected PermissionRegistry $permissions,
    ) {}

    public function index(Request $request)
    {
        abort_unless($this->permissions->allows($request->user(), 'tasks.view'), 403);

        $suggestions = TaskSuggestion::where('is_dismissed', false)
            ->whereNull('created_task_id')
            ->where(function ($query) use ($request) {
                $query->whereHas('dossier', fn ($dossier) => $this->companyContext->applyTo($dossier, $request->user()))
                    ->orWhereHas('client', fn ($client) => $this->companyContext->applyTo($client, $request->user()));
            })
            ->with(['dossier', 'client'])
            ->latest()
            ->get();

        return response()->json([
            'suggestions' => TaskSuggestionResource::collection($suggestions)->resolve(),
        ]);
    }

    public function createFromSuggestion(Request $request, TaskSuggestion $suggestion): RedirectResponse
    {
        abort_unless($this->permissions->allows($request->user(), 'tasks.create'), 403);
        abort_unless($suggestion->dossier_id
            ? $this->companyContext->applyTo(\App\Models\Dossier::query(), $request->user())->whereKey($suggestion->dossier_id)->exists()
            : $this->companyContext->applyTo(\App\Models\Client::query(), $request->user())->whereKey($suggestion->client_id)->exists(), 404);

        $task = Task::create([
            'task_number' => $this->numberService->generate(),
            'title' => $suggestion->description,
            'description' => $suggestion->description,
            'status' => 'not_started',
            'priority' => 'medium',
            'category' => 'general_admin',
            'created_by' => $request->user()->id,
            'assigned_by' => $request->user()->id,
            'dossier_id' => $suggestion->dossier_id,
            'client_id' => $suggestion->client_id,
        ]);

        $suggestion->update(['created_task_id' => $task->id]);

        return redirect()->route('tasks.index')->with('success', 'Task created from suggestion.');
    }

    public function dismiss(TaskSuggestion $suggestion): RedirectResponse
    {
        abort_unless($this->permissions->allows(request()->user(), 'tasks.update'), 403);
        abort_unless($suggestion->dossier_id
            ? $this->companyContext->applyTo(\App\Models\Dossier::query(), request()->user())->whereKey($suggestion->dossier_id)->exists()
            : $this->companyContext->applyTo(\App\Models\Client::query(), request()->user())->whereKey($suggestion->client_id)->exists(), 404);

        $suggestion->update(['is_dismissed' => true, 'dismissed_at' => now()]);
        return redirect()->back()->with('success', 'Suggestion dismissed.');
    }
}
