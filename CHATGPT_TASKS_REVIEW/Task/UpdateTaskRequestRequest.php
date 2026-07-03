<?php

namespace App\Http\Requests\Task;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTaskRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'request_type' => ['sometimes', Rule::in(config('archilbo_operations.task_request_types', []))],
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'target_user_id' => ['nullable', 'exists:users,id'],
            'status' => ['sometimes', Rule::in(config('archilbo_operations.task_request_statuses', []))],
            'metadata' => ['nullable', 'array'],
        ];
    }
}
