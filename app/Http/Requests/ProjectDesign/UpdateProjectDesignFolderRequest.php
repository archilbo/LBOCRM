<?php

namespace App\Http\Requests\ProjectDesign;

use App\Services\PermissionRegistry;
use Illuminate\Foundation\Http\FormRequest;

class UpdateProjectDesignFolderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null
            && app(PermissionRegistry::class)->allows($this->user(), 'project-design.update-folder');
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'parent_id' => ['sometimes', 'nullable', 'integer', 'exists:project_design_folders,id'],
        ];
    }
}
