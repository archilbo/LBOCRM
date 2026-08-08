<?php

namespace App\Policies\Concerns;

use App\Models\User;
use App\Services\CompanyContext;
use App\Services\PermissionRegistry;
use Illuminate\Database\Eloquent\Model;

trait HandlesTenantAuthorization
{
    protected function allowed(User $user, string $permission): bool
    {
        return app(PermissionRegistry::class)->allows($user, $permission);
    }

    protected function isProtected(User $user): bool
    {
        return app(PermissionRegistry::class)->isProtected($user);
    }

    protected function sameScope(User $user, Model $model): bool
    {
        return app(CompanyContext::class)->owns($user, $model);
    }
}
