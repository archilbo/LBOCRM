<?php

namespace App\Policies;

use App\Models\ArchiveRecord;
use App\Models\User;
use App\Policies\Concerns\HandlesTenantAuthorization;

class ArchiveRecordPolicy
{
    use HandlesTenantAuthorization;

    public function viewAny(User $user): bool
    {
        return $this->allowed($user, 'archive.view');
    }

    public function view(User $user, ArchiveRecord $record): bool
    {
        return $this->canAccessRecord($user, 'archive.view', $record);
    }

    public function create(User $user): bool
    {
        return $this->allowed($user, 'archive.create');
    }

    public function update(User $user, ArchiveRecord $record): bool
    {
        return $this->canAccessRecord($user, 'archive.update', $record);
    }

    public function delete(User $user, ArchiveRecord $record): bool
    {
        return $this->canAccessRecord($user, 'archive.delete', $record);
    }

    public function checkout(User $user, ArchiveRecord $record): bool
    {
        return $this->canAccessRecord($user, 'archive.checkout', $record);
    }

    public function checkin(User $user, ArchiveRecord $record): bool
    {
        return $this->canAccessRecord($user, 'archive.checkin', $record);
    }

    private function canAccessRecord(User $user, string $permission, ArchiveRecord $record): bool
    {
        $record->loadMissing('dossier');

        return $this->allowed($user, $permission)
            && $record->dossier !== null
            && $this->sameScope($user, $record->dossier);
    }
}
