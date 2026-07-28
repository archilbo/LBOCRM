<?php

namespace App\Policies;

use App\Models\DossierDocument;
use App\Models\User;
use App\Policies\Concerns\HandlesTenantAuthorization;

class DossierDocumentPolicy
{
    use HandlesTenantAuthorization;

    public function viewAny(User $user): bool
    {
        return $this->managesDocuments($user);
    }

    public function view(User $user, DossierDocument $document): bool
    {
        return $this->managesDocuments($user)
            && $document->dossier !== null
            && $this->sameScope($user, $document->dossier);
    }

    public function create(User $user): bool
    {
        return $this->managesDocuments($user);
    }

    public function update(User $user, DossierDocument $document): bool
    {
        return $this->view($user, $document);
    }

    public function delete(User $user, DossierDocument $document): bool
    {
        return $this->view($user, $document);
    }

    public function download(User $user, DossierDocument $document): bool
    {
        return $this->view($user, $document);
    }

    private function managesDocuments(User $user): bool
    {
        return $user->hasRole('admin') || $user->can('manage documents');
    }
}
