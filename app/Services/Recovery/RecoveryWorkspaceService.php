<?php

namespace App\Services\Recovery;

use App\Models\RecoveryRecord;
use App\Models\User;
use App\Services\CompanyContext;
use App\Services\PermissionRegistry;

class RecoveryWorkspaceService
{
    public function __construct(
        private readonly CompanyContext $companyContext,
        private readonly PermissionRegistry $permissions,
        private readonly RecoveryEntityRegistry $registry,
    ) {
    }

    /** @return array<string, mixed> */
    public function payload(User $user, array $filters): array
    {
        abort_unless($this->permissions->allows($user, 'system.recovery.view'), 403);

        $query = $this->companyContext->applyTo(RecoveryRecord::query(), $user)
            ->with('deletedBy:id,name')
            ->whereNull('restored_at')
            ->whereNull('purged_at')
            ->latest('deleted_at');

        if ($filters['type'] ?? null) {
            abort_unless($this->registry->has($filters['type']), 422);
            $query->where('entity_type', $filters['type']);
        }

        if ($search = trim((string) ($filters['search'] ?? ''))) {
            $query->where('display_label', 'like', '%'.$search.'%');
        }

        if ($deletedBy = $filters['deleted_by'] ?? null) {
            $query->where('deleted_by', $deletedBy);
        }

        $records = $query->paginate(15)->withQueryString();
        $summary = $this->companyContext->applyTo(RecoveryRecord::query(), $user)
            ->whereNull('restored_at')->whereNull('purged_at')
            ->selectRaw('entity_type, count(*) as count')->groupBy('entity_type')->pluck('count', 'entity_type');

        return [
            'recovery' => [
                'items' => $records->getCollection()->map(fn (RecoveryRecord $record) => [
                    'key' => $record->entity_type.':'.$record->entity_id,
                    'id' => $record->id,
                    'entityType' => $record->entity_type,
                    'entityLabel' => $this->registry->label($record->entity_type),
                    'title' => $record->display_label,
                    'subtitle' => $record->metadata['subtitle'] ?? null,
                    'deletedAt' => $record->deleted_at?->toIso8601String(),
                    'deletedBy' => $record->deletedBy ? ['id' => $record->deletedBy->id, 'name' => $record->deletedBy->name] : null,
                    'capabilities' => [
                        'restore' => $this->permissions->allows($user, 'system.recovery.restore'),
                        'purge' => $this->permissions->allows($user, 'system.recovery.purge') && $this->registry->isPurgeable($record->entity_type),
                    ],
                ])->values(),
                'pagination' => [
                    'currentPage' => $records->currentPage(), 'lastPage' => $records->lastPage(),
                    'perPage' => $records->perPage(), 'total' => $records->total(),
                ],
                'filters' => ['search' => $filters['search'] ?? '', 'type' => $filters['type'] ?? '', 'deletedBy' => $filters['deleted_by'] ?? ''],
                'types' => collect($this->registry->types())->map(fn (array $type, string $key) => [
                    'key' => $key, 'label' => $type['label'], 'count' => (int) ($summary[$key] ?? 0),
                ])->values(),
                'summary' => ['total' => (int) $summary->sum(), 'tasks' => (int) ($summary['task'] ?? 0), 'calendar' => (int) ($summary['calendar_event'] ?? 0)],
            ],
        ];
    }
}
