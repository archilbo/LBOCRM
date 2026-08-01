<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Services\PermissionRegistry;

class UpdateUserPermissionsRequest extends FormRequest
{
    public function authorize(): bool
    {
        if (! $this->user() || ! app(PermissionRegistry::class)->allows($this->user(), 'users.roles.manage')) {
            return false;
        }

        return $this->input('role') !== config('archilbo_roles.super_admin_role')
            || $this->user()->hasRole(config('archilbo_roles.super_admin_role'));
    }

    public function rules(): array
    {
        $moduleKeys = array_keys(config('archilbo_permissions.access_modules', []));

        return [
            'role' => [
                'required',
                'string',
                Rule::in($this->allowedRoles()),
            ],
            'isCustom' => 'required|boolean',
            'permissions' => ['required', 'array:'.implode(',', $moduleKeys)],
            'permissions.*.access' => ['required', Rule::in(['none', 'view', 'edit', 'delete'])],
            'permissions.*.scope' => ['required', Rule::in(['none', 'all'])],
        ];
    }

    private function allowedRoles(): array
    {
        $roles = config('archilbo_roles.assignable');

        return $this->user()?->hasRole(config('archilbo_roles.super_admin_role'))
            ? $roles
            : array_values(array_diff($roles, [config('archilbo_roles.super_admin_role')]));
    }
}
