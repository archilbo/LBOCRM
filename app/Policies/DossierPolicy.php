<?php

namespace App\Policies;

use App\Models\Dossier;
use App\Models\User;
use App\Policies\Concerns\HandlesTenantAuthorization;

class DossierPolicy
{
    use HandlesTenantAuthorization;

    public function viewAny(User $user): bool { return $this->allowed($user, 'manage dossiers'); }
    public function view(User $user, Dossier $dossier): bool { return $this->allowed($user, 'manage dossiers') && $this->sameScope($user, $dossier); }
    public function create(User $user): bool { return $this->allowed($user, 'manage dossiers'); }
    public function update(User $user, Dossier $dossier): bool { return $this->view($user, $dossier); }
    public function delete(User $user, Dossier $dossier): bool { return $this->view($user, $dossier); }
}
