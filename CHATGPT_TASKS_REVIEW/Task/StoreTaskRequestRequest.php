<?php

namespace App\Http\Requests\Task;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTaskRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'request_type' => ['required', Rule::in(config('archilbo_operations.task_request_types', []))],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'target_user_id' => ['nullable', 'exists:users,id'],
            'client_id' => ['nullable', 'exists:clients,id'],
            'dossier_id' => ['nullable', 'exists:dossiers,id'],
            'dossier_document_id' => ['nullable', 'exists:dossier_documents,id'],
            'finance_document_id' => ['nullable', 'exists:finance_documents,id'],
            'contract_id' => ['nullable', 'exists:contracts,id'],
            'authorization_id' => ['nullable', 'exists:authorizations,id'],
            'archive_record_id' => ['nullable', 'exists:archive_records,id'],
            'metadata' => ['nullable', 'array'],
        ];
    }
}
