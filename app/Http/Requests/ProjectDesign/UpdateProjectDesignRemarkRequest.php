<?php

namespace App\Http\Requests\ProjectDesign;

use App\Enums\ProjectDesign\ProjectDesignRemarkSeverity;
use App\Enums\ProjectDesign\ProjectDesignRemarkStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProjectDesignRemarkRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $user = $this->user();

        return [
            'severity' => ['sometimes', Rule::enum(ProjectDesignRemarkSeverity::class)],
            'status' => ['sometimes', Rule::enum(ProjectDesignRemarkStatus::class)],
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'assigned_to' => [
                'sometimes',
                'nullable',
                Rule::exists('users', 'id')->where('company_id', $user?->company_id),
            ],
            'due_date' => ['sometimes', 'nullable', 'date'],
        ];
    }
}
