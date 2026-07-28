<?php

namespace App\Policies\Concerns;

use App\Models\User;
use App\Services\CompanyContext;
use Illuminate\Database\Eloquent\Model;

trait HandlesTenantAuthorization
{
    protected function allowed(User $user, string $permission): bool
    {
        return $user->hasRole('admin') || $user->can($permission);
    }

    protected function sameScope(User $user, Model $model): bool
    {
        return app(CompanyContext::class)->owns($user, $model);
    }
}
