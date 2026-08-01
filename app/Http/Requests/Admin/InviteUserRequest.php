<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Services\PermissionRegistry;
use Illuminate\Support\Str;

class InviteUserRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge([
            'name' => trim((string) $this->input('name')),
            'email' => Str::lower(trim((string) $this->input('email'))),
        ]);
    }

    public function authorize(): bool
    {
        if (! $this->user()
            || ! app(PermissionRegistry::class)->allows($this->user(), 'users.create')
            || ! app(PermissionRegistry::class)->allows($this->user(), 'users.roles.manage')) {
            return false;
        }

        return $this->input('role') !== config('archilbo_roles.super_admin_role')
            || $this->user()->hasRole(config('archilbo_roles.super_admin_role'));
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users')],
            'role' => ['required', 'string', Rule::in($this->allowedRoles())],
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
