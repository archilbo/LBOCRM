<?php

namespace App\Http\Requests\ProjectDesign;

use Illuminate\Foundation\Http\FormRequest;

class StoreProjectDesignFileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('project_design') ?? false;
    }

    public function rules(): array
    {
        return [
            'dossier_id' => ['required', 'exists:dossiers,id'],
            'folder_id' => ['nullable', 'exists:project_design_folders,id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'type' => ['required', 'string', 'in:source,review,supporting'],
        ];
    }
}
