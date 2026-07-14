<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserPermissionsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manage users') === true;
    }

    public function rules(): array
    {
        return [
            'role' => [
                'required',
                'string',
                Rule::in(['admin', 'manager', 'staff', 'viewer']),
            ],
            'isCustom' => 'required|boolean',
            'permissions' => 'required|array',
            'permissions.*.access' => ['required', Rule::in(['none', 'view', 'edit', 'delete'])],
            'permissions.*.scope' => ['required', Rule::in(['none', 'all', 'assigned_only'])],
        ];
    }
}
