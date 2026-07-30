<?php

namespace App\Policies;

use App\Models\Contract;
use App\Models\User;
use App\Policies\Concerns\HandlesTenantAuthorization;

class ContractPolicy
{
    use HandlesTenantAuthorization;

    public function viewAny(User $user): bool { return $this->allowed($user, 'contracts.view'); }
    public function view(User $user, Contract $contract): bool { return $this->allowed($user, 'contracts.view') && $contract->dossier !== null && $this->sameScope($user, $contract->dossier); }
    public function create(User $user): bool { return $this->allowed($user, 'contracts.create'); }
    public function update(User $user, Contract $contract): bool { return $this->allowed($user, 'contracts.update') && $contract->dossier !== null && $this->sameScope($user, $contract->dossier); }
    public function delete(User $user, Contract $contract): bool { return $this->allowed($user, 'contracts.delete') && $contract->dossier !== null && $this->sameScope($user, $contract->dossier); }
    public function generate(User $user, Contract $contract): bool { return $this->allowed($user, 'contracts.generate') && $contract->dossier !== null && $this->sameScope($user, $contract->dossier); }
    public function download(User $user, Contract $contract): bool { return $this->allowed($user, 'contracts.download') && $contract->dossier !== null && $this->sameScope($user, $contract->dossier); }
    public function print(User $user, Contract $contract): bool { return $this->allowed($user, 'contracts.print') && $contract->dossier !== null && $this->sameScope($user, $contract->dossier); }
}
