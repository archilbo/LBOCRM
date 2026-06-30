<?php

namespace App\Http\Requests\Task;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['required', Rule::in(['not_started', 'in_progress', 'in_review', 'completed', 'blocked', 'cancelled'])],
            'priority' => ['required', Rule::in(['low', 'medium', 'high', 'urgent'])],
            'category' => ['required', Rule::in(['documents', 'client_follow_up', 'contract', 'authorization', 'finance', 'archive', 'general_admin'])],
            'start_date' => ['nullable', 'date'],
            'due_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'assignee_ids' => ['nullable', 'array'],
            'assignee_ids.*' => ['exists:users,id'],
            'watcher_ids' => ['nullable', 'array'],
            'watcher_ids.*' => ['exists:users,id'],
            'dossier_id' => ['nullable', 'exists:dossiers,id'],
            'client_id' => ['nullable', 'exists:clients,id'],
            'dossier_document_id' => ['nullable', 'exists:dossier_documents,id'],
            'finance_document_id' => ['nullable', 'exists:finance_documents,id'],
            'contract_id' => ['nullable', 'exists:contracts,id'],
            'authorization_id' => ['nullable', 'exists:authorizations,id'],
            'archive_record_id' => ['nullable', 'exists:archive_records,id'],
            'metadata' => ['nullable', 'json'],
        ];
    }
}
