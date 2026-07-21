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
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:5000'],
            'discipline' => ['nullable', 'string', 'max:100'],
            'category' => ['nullable', 'string', 'max:100'],
            'record_version' => ['required', 'integer', 'min:1'],
        ];
    }
}
