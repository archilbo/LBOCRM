<?php

namespace App\Policies;

use App\Models\Client;
use App\Models\User;
use App\Policies\Concerns\HandlesTenantAuthorization;

class ClientPolicy
{
    use HandlesTenantAuthorization;

    public function viewAny(User $user): bool { return $this->allowed($user, 'clients.view'); }
    public function view(User $user, Client $client): bool { return $this->allowed($user, 'clients.view') && $this->sameScope($user, $client); }
    public function create(User $user): bool { return $this->allowed($user, 'clients.create'); }
    public function update(User $user, Client $client): bool { return $this->allowed($user, 'clients.update') && $this->sameScope($user, $client); }
    public function delete(User $user, Client $client): bool { return $this->allowed($user, 'clients.delete') && $this->sameScope($user, $client); }
    public function updateStatus(User $user, Client $client): bool { return $this->allowed($user, 'clients.status.update') && $this->sameScope($user, $client); }
    public function scanCin(User $user): bool { return $this->allowed($user, 'clients.cin.scan'); }
}
