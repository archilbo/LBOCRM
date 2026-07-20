<?php

namespace App\Policies\Concerns;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

trait HandlesFinanceAuthorization
{
    protected function allowed(User $user, string $permission): bool
    {
        return $user->hasRole('admin') || $user->can('manage finance') || $user->can($permission);
    }

    protected function sameScope(User $user, Model $model): bool
    {
        return (int) $model->getAttribute('company_id') === (int) $user->company_id
            && (! $user->branch_id || (int) $model->getAttribute('branch_id') === (int) $user->branch_id);
    }
}
