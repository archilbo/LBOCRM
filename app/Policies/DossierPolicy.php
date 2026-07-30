<?php

namespace App\Policies;

use App\Models\Dossier;
use App\Models\User;
use App\Policies\Concerns\HandlesTenantAuthorization;

class DossierPolicy
{
    use HandlesTenantAuthorization;

    public function viewAny(User $user): bool { return $this->allowed($user, 'dossiers.view'); }
    public function view(User $user, Dossier $dossier): bool { return $this->allowed($user, 'dossiers.view') && $this->sameScope($user, $dossier); }
    public function create(User $user): bool { return $this->allowed($user, 'dossiers.create'); }
    public function update(User $user, Dossier $dossier): bool { return $this->allowed($user, 'dossiers.update') && $this->sameScope($user, $dossier); }
    public function delete(User $user, Dossier $dossier): bool { return $this->allowed($user, 'dossiers.delete') && $this->sameScope($user, $dossier); }
    public function updateWorkflow(User $user, Dossier $dossier): bool { return $this->allowed($user, 'dossiers.workflow.update') && $this->sameScope($user, $dossier); }
}
