<?php

namespace App\Services\Recovery;

use App\Models\AuditLog;
use App\Models\RecoveryRecord;
use App\Models\Client;
use App\Models\User;
use App\Services\CompanyContext;
use App\Services\PermissionRegistry;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

class RecoveryService
{
    public function __construct(
        private readonly RecoveryEntityRegistry $registry,
        private readonly CompanyContext $companyContext,
        private readonly PermissionRegistry $permissions,
    ) {
    }

    public function moveToTrash(Model $entity, User $user): RecoveryRecord
    {
        $type = $this->registry->typeFor($entity);

        $record = RecoveryRecord::query()->updateOrCreate(
            ['entity_type' => $type, 'entity_id' => $entity->getKey()],
            [
                ...$this->companyContext->payload($user),
                'display_label' => $this->registry->displayLabel($entity),
                'deleted_by' => $user->id,
                'deleted_at' => now(),
                'restored_by' => null,
                'restored_at' => null,
                'purged_by' => null,
                'purged_at' => null,
                'metadata' => $this->registry->context($entity),
            ],
        );

        $this->audit($record, $user, 'recovery.moved_to_trash', 'Moved '.$record->display_label.' to recovery trash');

        return $record;
    }

    public function restore(RecoveryRecord $record, User $user): void
    {
        abort_unless($this->companyContext->owns($user, $record), 404);
        $this->assertPermission($user, 'system.recovery.restore');

        DB::transaction(function () use ($record, $user): void {
            $record = RecoveryRecord::query()->lockForUpdate()->findOrFail($record->id);
            $entity = $this->registry->findDeleted($record->entity_type, $record->entity_id, $user);

            if (! $entity || $record->restored_at || $record->purged_at) {
                throw new ConflictHttpException('Cet élément ne peut plus être restauré.');
            }

            abort_unless($user->can('view', $entity), 403);
            $entity->restore();
            $record->update(['restored_by' => $user->id, 'restored_at' => now()]);
            $this->audit($record, $user, 'recovery.restored', 'Restored '.$record->display_label);
        });
    }

    public function purge(RecoveryRecord $record, User $user): void
    {
        abort_unless($this->companyContext->owns($user, $record), 404);
        $this->assertPermission($user, 'system.recovery.purge');

        DB::transaction(function () use ($record, $user): void {
            $record = RecoveryRecord::query()->lockForUpdate()->findOrFail($record->id);

            if (! $this->registry->isPurgeable($record->entity_type)) {
                throw new AccessDeniedHttpException('Cet élément ne peut pas être supprimé définitivement.');
            }

            $entity = $this->registry->findDeleted($record->entity_type, $record->entity_id, $user);

            if (! $entity || $record->restored_at || $record->purged_at) {
                throw new ConflictHttpException('Cet élément ne peut plus être supprimé définitivement.');
            }

            abort_unless($user->can('delete', $entity), 403);

            // A force-delete must never silently erase a shared project's
            // membership or leave it without a primary client. The operator
            // must first detach/reassign the client through the project UI.
            if ($entity instanceof Client && $entity->dossiers()->exists()) {
                throw new ConflictHttpException('Ce client est encore lié à un ou plusieurs projets. Retirez ou réattribuez ces liens avant la suppression définitive.');
            }

            $entity->forceDelete();
            $record->update(['purged_by' => $user->id, 'purged_at' => now()]);
            $this->audit($record, $user, 'recovery.purged', 'Permanently purged '.$record->display_label);
        });
    }

    private function assertPermission(User $user, string $permission): void
    {
        if (! $this->permissions->allows($user, $permission)) {
            throw new AccessDeniedHttpException;
        }
    }

    private function audit(RecoveryRecord $record, User $user, string $action, string $description): void
    {
        AuditLog::query()->create([
            'user_id' => $user->id,
            'action' => $action,
            'description' => $description,
            'metadata' => ['recovery_key' => $record->entity_type.':'.$record->entity_id],
            'auditable_type' => RecoveryRecord::class,
            'auditable_id' => $record->id,
            'created_at' => now(),
        ]);
    }
}
