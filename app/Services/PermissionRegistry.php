<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Str;

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

        foreach ($modules as $module => $configuration) {
            $level = $configuration['access'] ?? 'none';
            $modulePermissions = config("archilbo_permissions.access_modules.{$module}", []);

            foreach (['view', 'edit', 'delete'] as $candidate) {
                if ($this->includesLevel($level, $candidate)) {
                    $granted = [...$granted, ...($modulePermissions[$candidate] ?? [])];
                }
            }
        }

        return array_values(array_intersect(array_unique($granted), $this->names()));
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

        if ($user->hasRole(config('archilbo_roles.super_admin_role'))) {
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
