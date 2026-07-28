<?php

namespace App\Policies;

use App\Models\Intermediary;
use App\Models\User;
use App\Policies\Concerns\HandlesTenantAuthorization;

class IntermediaryPolicy
{
    use HandlesTenantAuthorization;

    public function viewAny(User $user): bool { return $this->allowed($user, 'manage clients'); }
    public function view(User $user, Intermediary $intermediary): bool { return $this->allowed($user, 'manage clients') && $this->sameScope($user, $intermediary); }
    public function create(User $user): bool { return $this->allowed($user, 'manage clients'); }
    public function update(User $user, Intermediary $intermediary): bool { return $this->view($user, $intermediary); }
    public function delete(User $user, Intermediary $intermediary): bool { return $this->view($user, $intermediary); }
}
