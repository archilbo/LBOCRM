<?php

namespace App\Policies;

use App\Models\Intermediary;
use App\Models\User;
use App\Policies\Concerns\HandlesTenantAuthorization;

class IntermediaryPolicy
{
    use HandlesTenantAuthorization;

    public function viewAny(User $user): bool { return $this->allowed($user, 'intermediaries.view'); }
    public function view(User $user, Intermediary $intermediary): bool { return $this->allowed($user, 'intermediaries.view') && $this->sameScope($user, $intermediary); }
    public function create(User $user): bool { return $this->allowed($user, 'intermediaries.create'); }
    public function update(User $user, Intermediary $intermediary): bool { return $this->allowed($user, 'intermediaries.update') && $this->sameScope($user, $intermediary); }
    public function delete(User $user, Intermediary $intermediary): bool { return $this->allowed($user, 'intermediaries.delete') && $this->sameScope($user, $intermediary); }
}
