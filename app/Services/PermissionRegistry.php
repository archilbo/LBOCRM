<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

class PermissionRegistry
{
    public function names(): array
    {
        return array_keys(config('archilbo_permissions.permissions', []));
    }

    public function metadata(): array
    {
        return config('archilbo_permissions.permissions', []);
    }

    public function permissionsForModuleLevels(array $modules): array
    {
        $granted = [];

        foreach ($this->accessModules() as $module => $modulePermissions) {
            $configuration = $modules[$module] ?? [];
            $level = $configuration['access'] ?? 'none';

            foreach (['view', 'edit', 'delete'] as $candidate) {
                if ($this->includesLevel($level, $candidate)) {
                    $granted = [...$granted, ...($modulePermissions[$candidate] ?? [])];
                }
            }
        }

        return array_values(array_intersect(array_unique($granted), $this->names()));
    }

    /**
     * Sanitized data contract for the permission editor. The configured access
     * modules remain the single source of truth; React receives labels only.
     */
    public function editorModules(): array
    {
        return collect($this->accessModules())
            ->map(fn (array $permissions, string $key) => [
                'key' => $key,
                'label' => Str::headline($key),
                'permissionCount' => count(array_unique(array_merge(
                    $permissions['view'] ?? [],
                    $permissions['edit'] ?? [],
                    $permissions['delete'] ?? [],
                ))),
            ])
            ->values()
            ->all();
    }

    public function rolePermissionMatrix(string $roleName): array
    {
        if (in_array($roleName, config('archilbo_roles.protected', []), true)) {
            return $this->fullPermissionMatrix();
        }

        $role = Role::query()->where('name', $roleName)->first();

        return $this->permissionMatrixForNames(
            $this->effectiveNamesFromGranted($role?->permissions()->pluck('name')->all() ?? []),
        );
    }

    public function rolePermissionMatrices(array $roleNames): array
    {
        return collect($roleNames)
            ->mapWithKeys(fn (string $roleName) => [$roleName => $this->rolePermissionMatrix($roleName)])
            ->all();
    }

    /**
     * There is no user-to-dossier assignment model yet, so every granted
     * module permission is explicitly company/branch scoped. Do not persist an
     * unimplemented "assigned only" scope from client input.
     */
    public function normalizeModuleConfiguration(array $modules): array
    {
        return collect($this->accessModules())
            ->mapWithKeys(function (array $permissions, string $module) use ($modules) {
                $access = $modules[$module]['access'] ?? 'none';

                return [$module => [
                    'access' => in_array($access, ['none', 'view', 'edit', 'delete'], true) ? $access : 'none',
                    'scope' => $access === 'none' ? 'none' : 'all',
                ]];
            })
            ->all();
    }

    public function routePermission(?string $routeName): ?string
    {
        $routes = config('archilbo_permissions.route_permissions', []);

        if (! $routeName) {
            return null;
        }

        if (isset($routes[$routeName])) {
            return $routes[$routeName];
        }

        foreach ($routes as $pattern => $permission) {
            if (Str::is($pattern, $routeName)) {
                return $permission;
            }
        }

        return null;
    }

    public function allows(User $user, string $permission): bool
    {
        if ($user->hasAnyRole(config('archilbo_roles.protected', []))) {
            return true;
        }

        return in_array($permission, $this->effectiveNames($user), true);
    }

    public function effectiveNames(User $user): array
    {
        $granted = collect($user->getAllPermissions())
            ->pluck('name')
            ->values()
            ->toArray();

        return $this->effectiveNamesFromGranted(
            $granted,
            $user->hasRole(config('archilbo_roles.super_admin_role')),
        );
    }

    private function accessModules(): array
    {
        return config('archilbo_permissions.access_modules', []);
    }

    private function effectiveNamesFromGranted(array $granted, bool $grantAll = false): array
    {
        if ($grantAll) {
            return array_values(array_unique([...$granted, ...$this->names()]));
        }

        $effective = $granted;

        foreach ($this->names() as $permission) {
            if ($this->hasLegacyAlias($permission, $granted)) {
                $effective[] = $permission;
            }
        }

        return array_values(array_unique($effective));
    }

    private function permissionMatrixForNames(array $permissionNames): array
    {
        return collect($this->accessModules())
            ->mapWithKeys(function (array $modulePermissions, string $module) use ($permissionNames) {
                $access = 'none';

                foreach (['view', 'edit', 'delete'] as $level) {
                    $required = array_merge(
                        $modulePermissions['view'] ?? [],
                        $level === 'view' ? [] : ($modulePermissions['edit'] ?? []),
                        $level === 'delete' ? ($modulePermissions['delete'] ?? []) : [],
                    );

                    if ($required !== [] && $required === array_values(array_intersect($required, $permissionNames))) {
                        $access = $level;
                    }
                }

                return [$module => [
                    'access' => $access,
                    'scope' => $access === 'none' ? 'none' : 'all',
                ]];
            })
            ->all();
    }

    private function fullPermissionMatrix(): array
    {
        return collect($this->accessModules())
            ->mapWithKeys(fn (array $permissions, string $module) => [$module => [
                'access' => ($permissions['delete'] ?? []) !== [] ? 'delete' : (($permissions['edit'] ?? []) !== [] ? 'edit' : 'view'),
                'scope' => 'all',
            ]])
            ->all();
    }

    private function hasLegacyAlias(string $permission, array $granted): bool
    {
        $aliases = config('archilbo_permissions.legacy_aliases', []);
        $candidates = $aliases[$permission] ?? $aliases[$this->wildcardKey($permission)] ?? [];

        return (bool) array_intersect($candidates, $granted);
    }

    private function wildcardKey(string $permission): string
    {
        $segments = explode('.', $permission);

        return count($segments) > 1 ? $segments[0].'.*' : $permission;
    }

    private function includesLevel(string $level, string $candidate): bool
    {
        $levels = ['none' => 0, 'view' => 1, 'edit' => 2, 'delete' => 3];

        return ($levels[$level] ?? 0) >= ($levels[$candidate] ?? PHP_INT_MAX);
    }
}
