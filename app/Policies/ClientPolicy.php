<?php

namespace App\Policies;

use App\Models\Client;
use App\Models\User;
use App\Policies\Concerns\HandlesTenantAuthorization;

class ClientPolicy
{
    use HandlesTenantAuthorization;

    public function viewAny(User $user): bool { return $this->allowed($user, 'manage clients'); }
    public function view(User $user, Client $client): bool { return $this->allowed($user, 'manage clients') && $this->sameScope($user, $client); }
    public function create(User $user): bool { return $this->allowed($user, 'manage clients'); }
    public function update(User $user, Client $client): bool { return $this->view($user, $client); }
    public function delete(User $user, Client $client): bool { return $this->view($user, $client); }
}
