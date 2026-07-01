<?php

namespace App\Http\Controllers;

use App\Http\Requests\Task\StoreTaskRequestRequest;
use App\Http\Requests\Task\UpdateTaskRequestRequest;
use App\Http\Resources\TaskRequestResource;
use App\Models\TaskRequest;
use App\Services\Task\TaskRequestService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TaskRequestController extends Controller
{
    public function __construct(protected TaskRequestService $requests) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', TaskRequest::class);

        return Inertia::render('TaskRequests/Index', [
            'taskRequests' => TaskRequestResource::collection($this->requests->listFor($request->user()))->resolve(),
            'requestTypes' => config('archilbo_operations.task_request_types', []),
            'requestTypeLabels' => config('archilbo_operations.task_request_type_labels', []),
            'requestStatuses' => config('archilbo_operations.task_request_statuses', []),
            'requestStatusLabels' => config('archilbo_operations.task_request_status_labels', []),
            'taskRequestOptions' => $this->requests->formOptions(),
        ]);
    }

    public function store(StoreTaskRequestRequest $request): RedirectResponse
    {
        $this->authorize('create', TaskRequest::class);
        $this->requests->create($request->validated(), $request->user());

        return redirect()->back()->with('success', 'Request submitted.');
    }

    public function update(UpdateTaskRequestRequest $request, TaskRequest $taskRequest): RedirectResponse
    {
        $this->authorize('update', $taskRequest);
        $taskRequest->update($request->validated());

        return redirect()->back()->with('success', 'Request updated.');
    }

    public function accept(TaskRequest $taskRequest): RedirectResponse
    {
        $this->authorize('convert', $taskRequest);
        $this->requests->accept($taskRequest);

        return redirect()->back()->with('success', 'Request accepted.');
    }

    public function reject(Request $request, TaskRequest $taskRequest): RedirectResponse
    {
        $this->authorize('convert', $taskRequest);
        $data = $request->validate(['reason' => ['nullable', 'string']]);
        $this->requests->reject($taskRequest, $data['reason'] ?? null);

        return redirect()->back()->with('success', 'Request rejected.');
    }

    public function convert(Request $request, TaskRequest $taskRequest): RedirectResponse
    {
        $this->authorize('convert', $taskRequest);
        $this->requests->convertToTask($taskRequest, $request->user());

        return redirect()->route('tasks.index')->with('success', 'Request converted to task.');
    }
}
