<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use App\Services\PermissionRegistry;

class StoreUserRequest extends FormRequest
{
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
        $roles = config('archilbo_roles.assignable');

        if (! $this->user()?->hasRole(config('archilbo_roles.super_admin_role'))) {
            $roles = array_values(array_diff($roles, [config('archilbo_roles.super_admin_role')]));
        }

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')],
            'role' => ['required', 'string', Rule::in($roles)],
            'password' => ['required', 'confirmed', Password::min(12)->mixedCase()->numbers()->symbols()],
        ];
    }
}
