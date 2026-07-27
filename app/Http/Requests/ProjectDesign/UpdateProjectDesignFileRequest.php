<?php

namespace App\Http\Requests\ProjectDesign;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProjectDesignFileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('project-design.update-file') ?? false;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'code' => ['sometimes', 'nullable', 'string', 'max:100'],
            'description' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'discipline' => ['sometimes', 'nullable', 'string', 'max:100'],
            'category' => ['sometimes', 'nullable', 'string', 'max:100'],
            'folder_id' => ['sometimes', 'nullable', 'integer', 'exists:project_design_folders,id'],
            'record_version' => ['required', 'integer', 'min:1'],
        ];
    }
}
