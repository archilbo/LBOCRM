<?php

namespace App\Http\Requests\ProjectDesign;

use Illuminate\Foundation\Http\FormRequest;

class StoreProjectDesignVersionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('project_design') ?? false;
    }

    public function rules(): array
    {
        return [
            'file_id' => ['required', 'exists:project_design_files,id'],
            'file' => ['required', 'file', 'max:204800'], // 200MB
            'notes' => ['nullable', 'string', 'max:5000'],
        ];
    }
}
