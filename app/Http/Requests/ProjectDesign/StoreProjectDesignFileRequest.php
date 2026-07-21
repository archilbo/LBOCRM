<?php

namespace App\Http\Requests\ProjectDesign;

use Illuminate\Foundation\Http\FormRequest;

class StoreProjectDesignFileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('project-design.create-file') ?? false;
    }

    public function rules(): array
    {
        return [
            'folder_id' => ['nullable', 'exists:project_design_folders,id'],
            'name' => ['required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:5000'],
            'discipline' => ['nullable', 'string', 'max:100'],
            'category' => ['nullable', 'string', 'max:100'],
        ];
    }
}
