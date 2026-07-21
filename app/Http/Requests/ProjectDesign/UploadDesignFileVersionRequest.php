<?php

namespace App\Http\Requests\ProjectDesign;

use Illuminate\Foundation\Http\FormRequest;

class UploadDesignFileVersionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('project-design.upload') ?? false;
    }

    public function rules(): array
    {
        return [
            'note' => ['nullable', 'string', 'max:5000'],
            'change_summary' => ['nullable', 'string', 'max:5000'],
            'revision_code' => ['nullable', 'string', 'max:50'],
            'files' => ['required', 'array', 'min:1'],
            'files.*' => ['required', 'file', 'max:204800'],
            'asset_types' => ['nullable', 'array'],
            'asset_types.*' => ['nullable', 'string', 'in:source,review,supporting'],
            'idempotency_key' => ['nullable', 'string', 'max:64', 'unique:project_design_file_versions,idempotency_key'],
        ];
    }

    public function messages(): array
    {
        return [
            'files.*.max' => 'Each file must not exceed 200MB.',
            'idempotency_key.unique' => 'This upload was already submitted.',
        ];
    }
}
