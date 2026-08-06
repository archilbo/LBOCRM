<?php

namespace App\Policies\Concerns;

trait HandlesFinanceAuthorization
{
    use HandlesTenantAuthorization { allowed as tenantAllowed; }

    protected function allowed(\App\Models\User $user, string $permission): bool
    {
        return $this->tenantAllowed($user, $permission);
    }
}
