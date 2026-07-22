<?php

namespace App\Http\Requests\ProjectDesign;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProjectDesignAnnotationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'geometry' => ['sometimes', 'required', 'array'],
            'geometry.x' => ['nullable', 'numeric', 'min:0', 'max:1'],
            'geometry.y' => ['nullable', 'numeric', 'min:0', 'max:1'],
            'geometry.width' => ['nullable', 'numeric', 'min:0', 'max:10'],
            'geometry.height' => ['nullable', 'numeric', 'min:0', 'max:10'],
            'geometry.start.x' => ['nullable', 'numeric', 'min:0', 'max:1'],
            'geometry.start.y' => ['nullable', 'numeric', 'min:0', 'max:1'],
            'geometry.end.x' => ['nullable', 'numeric', 'min:0', 'max:1'],
            'geometry.end.y' => ['nullable', 'numeric', 'min:0', 'max:1'],
            'geometry.points' => ['nullable', 'array', 'max:10000'],
            'geometry.points.*.x' => ['numeric', 'min:0', 'max:1'],
            'geometry.points.*.y' => ['numeric', 'min:0', 'max:1'],
            'style' => ['nullable', 'array'],
            'record_version' => ['required', 'integer', 'min:1'],
        ];
    }
}
