<?php

namespace App\Services\Task;

use App\Models\Client;
use App\Models\Dossier;
use App\Models\TaskRequest;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class TaskRequestService
{
    public function __construct(protected TaskMutationService $tasks) {}

    public function listFor(User $user): array
    {
        $query = TaskRequest::query()
            ->with(['requester', 'targetUser', 'client', 'dossier'])
            ->latest();

        if (! $user->can('manage task requests') && ! $user->hasRole('admin')) {
            $query->where(function ($q) use ($user) {
                $q->where('requested_by', $user->id)
                    ->orWhere('target_user_id', $user->id);
            });
        }

        return $query->get()->all();
    }

    public function formOptions(): array
    {
        return [
            'users' => User::query()
                ->orderBy('name')
                ->get(['id', 'name', 'email'])
                ->map(fn (User $user) => [
                    'id' => $user->id,
                    'label' => $user->name,
                    'description' => $user->email,
                ])
                ->values(),
            'clients' => Client::query()
                ->orderBy('full_name')
                ->limit(150)
                ->get(['id', 'full_name', 'client_number'])
                ->map(fn (Client $client) => [
                    'id' => $client->id,
                    'label' => trim(($client->client_number ? $client->client_number . ' - ' : '') . $client->full_name),
                ])
                ->values(),
            'dossiers' => Dossier::query()
                ->with('client:id,full_name')
                ->orderBy('dossier_number')
                ->limit(200)
                ->get(['id', 'client_id', 'dossier_number', 'project_object'])
                ->map(fn (Dossier $dossier) => [
                    'id' => $dossier->id,
                    'clientId' => $dossier->client_id,
                    'label' => trim($dossier->dossier_number . ' - ' . ($dossier->project_object ?? '-') . ' - ' . ($dossier->client?->full_name ?? '-')),
                ])
                ->values(),
        ];
    }

    public function nextNumber(): string
    {
        $prefix = 'REQ-' . now()->format('Y') . '-';
        $last = TaskRequest::query()
            ->where('request_number', 'like', $prefix . '%')
            ->latest('id')
            ->value('request_number');

        $next = $last ? ((int) substr($last, -4)) + 1 : 1;

        return $prefix . str_pad((string) $next, 4, '0', STR_PAD_LEFT);
    }

    public function create(array $data, User $requester): TaskRequest
    {
        return TaskRequest::create([
            ...$data,
            'request_number' => $data['request_number'] ?? $this->nextNumber(),
            'requested_by' => $data['requested_by'] ?? $requester->id,
            'status' => $data['status'] ?? 'submitted',
        ]);
    }

    public function accept(TaskRequest $taskRequest): TaskRequest
    {
        $this->ensureCanChangeDecision($taskRequest);

        if ($taskRequest->status === 'accepted') {
            return $taskRequest->refresh();
        }

        $taskRequest->update(['status' => 'accepted']);

        return $taskRequest->refresh();
    }

    public function reject(TaskRequest $taskRequest, ?string $reason = null): TaskRequest
    {
        $this->ensureCanChangeDecision($taskRequest);

        $metadata = $taskRequest->metadata ?? [];

        if ($reason) {
            $metadata['rejection_reason'] = $reason;
        }

        $taskRequest->update([
            'status' => 'rejected',
            'metadata' => $metadata,
        ]);

        return $taskRequest->refresh();
    }

    public function markConverted(TaskRequest $taskRequest, int $taskId): TaskRequest
    {
        $taskRequest->update([
            'status' => 'converted',
            'converted_task_id' => $taskId,
        ]);

        return $taskRequest->refresh();
    }

    public function convertToTask(TaskRequest $taskRequest, User $user): TaskRequest
    {
        if ($taskRequest->status === 'rejected') {
            throw ValidationException::withMessages([
                'task_request' => 'Rejected requests cannot be converted.',
            ]);
        }

        if ($taskRequest->converted_task_id) {
            return $taskRequest->refresh();
        }

        $mapping = config("archilbo_operations.task_request_task_mapping.{$taskRequest->request_type}", [
            'type' => 'internal_admin',
            'category' => 'general_admin',
        ]);

        $task = $this->tasks->create([
            'title' => $taskRequest->title,
            'description' => $taskRequest->description,
            'type' => $mapping['type'],
            'category' => $mapping['category'],
            'status' => 'not_started',
            'priority' => 'medium',
            'impact' => 'normal',
            'assignee_ids' => array_values(array_filter([$taskRequest->target_user_id])),
            'watcher_ids' => array_values(array_filter([$taskRequest->requested_by])),
            'client_id' => $taskRequest->client_id,
            'dossier_id' => $taskRequest->dossier_id,
            'dossier_document_id' => $taskRequest->dossier_document_id,
            'finance_document_id' => $taskRequest->finance_document_id,
            'contract_id' => $taskRequest->contract_id,
            'authorization_id' => $taskRequest->authorization_id,
            'archive_record_id' => $taskRequest->archive_record_id,
        ], $user);

        return $this->markConverted($taskRequest, $task->id);
    }

    private function ensureCanChangeDecision(TaskRequest $taskRequest): void
    {
        if (in_array($taskRequest->status, ['rejected', 'converted'], true)) {
            throw ValidationException::withMessages([
                'task_request' => 'This request is already closed.',
            ]);
        }
    }
}
