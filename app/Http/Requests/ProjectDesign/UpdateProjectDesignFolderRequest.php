<?php

namespace App\Http\Requests\ProjectDesign;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProjectDesignFolderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('project-design.update-folder') ?? false;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'parent_id' => ['sometimes', 'nullable', 'integer', 'exists:project_design_folders,id'],
        ];
    }
}
