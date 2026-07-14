<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateArchiveStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'string', 'max:50'],
            'due_at' => ['nullable', 'date'],
            'requested_by' => ['nullable', 'string', 'max:255'],
        ];
    }
}