<?php

namespace App\Http\Requests\ProjectDesign;

use Illuminate\Foundation\Http\FormRequest;

class UploadDesignFileVersionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('project_design') ?? false;
    }

    public function rules(): array
    {
        return [
            'file_id' => ['required', 'exists:project_design_files,id'],
            'file' => ['required', 'file', 'max:204800'],
            'notes' => ['nullable', 'string', 'max:5000'],
            'idempotency_key' => ['nullable', 'string', 'max:64'],
            'checksum' => ['nullable', 'string', 'max:64'],
        ];
    }

    public function messages(): array
    {
        return [
            'file.max' => 'The file must not exceed 200MB.',
        ];
    }
}
