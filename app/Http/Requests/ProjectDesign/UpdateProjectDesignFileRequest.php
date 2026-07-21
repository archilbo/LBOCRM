<?php

namespace App\Http\Requests\ProjectDesign;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProjectDesignFileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('project_design') ?? false;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'folder_id' => ['nullable', 'exists:project_design_folders,id'],
            'status' => ['sometimes', 'required', 'string', 'in:active,archived'],
            'record_version' => ['required', 'integer', 'min:1'],
        ];
    }
}
