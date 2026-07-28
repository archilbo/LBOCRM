<?php

namespace App\Http\Requests\Task;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'type' => ['sometimes', Rule::in(config('archilbo_operations.task_types', []))],
            'status' => ['sometimes', Rule::in(config('archilbo_operations.task_statuses', []))],
            'priority' => ['sometimes', Rule::in(config('archilbo_operations.task_priorities', []))],
            'impact' => ['sometimes', Rule::in(config('archilbo_operations.task_impacts', []))],
            'category' => ['sometimes', Rule::in(config('archilbo_operations.task_categories', []))],
            'progress' => ['sometimes', 'integer', 'min:0', 'max:100'],
            'start_date' => ['nullable', 'date'],
            'due_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'reviewed_at' => ['nullable', 'date'],
            'blocked_reason' => ['nullable', 'string'],
            'estimated_minutes' => ['nullable', 'integer', 'min:0'],
            'actual_minutes' => ['nullable', 'integer', 'min:0'],
            'recurrence_rule' => ['nullable', 'string', 'max:255'],
            'assignee_ids' => ['nullable', 'array'],
            'assignee_ids.*' => ['exists:users,id'],
            'watcher_ids' => ['nullable', 'array'],
            'watcher_ids.*' => ['exists:users,id'],
            'dossier_id' => ['nullable', 'exists:dossiers,id'],
            'client_id' => ['nullable', 'exists:clients,id'],
            'dossier_document_id' => ['nullable', 'exists:dossier_documents,id'],
            'finance_document_id' => ['nullable', 'exists:finance_documents,id'],
            'contract_id' => ['nullable', 'exists:contracts,id'],
            'archive_record_id' => ['nullable', 'exists:archive_records,id'],
            'conversation_id' => ['nullable', 'exists:conversations,id'],
            'metadata' => ['nullable', 'array'],
        ];
    }
}
