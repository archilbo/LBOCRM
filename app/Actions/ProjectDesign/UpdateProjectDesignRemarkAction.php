<?php

namespace App\Actions\ProjectDesign;

use App\Enums\ProjectDesign\ProjectDesignRemarkStatus;
use App\Models\Dossier;
use App\Models\ProjectDesign\ProjectDesignRemark;
use App\Models\User;
use App\Services\ProjectDesign\ProjectDesignActivityService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

class UpdateProjectDesignRemarkAction
{
    private const TRANSITIONS = [
        ProjectDesignRemarkStatus::Open->value => [
            ProjectDesignRemarkStatus::Assigned->value,
            ProjectDesignRemarkStatus::InProgress->value,
            ProjectDesignRemarkStatus::Rejected->value,
        ],
        ProjectDesignRemarkStatus::Assigned->value => [
            ProjectDesignRemarkStatus::InProgress->value,
            ProjectDesignRemarkStatus::Rejected->value,
        ],
        ProjectDesignRemarkStatus::InProgress->value => [
            ProjectDesignRemarkStatus::Addressed->value,
            ProjectDesignRemarkStatus::Rejected->value,
        ],
        ProjectDesignRemarkStatus::Addressed->value => [
            ProjectDesignRemarkStatus::Verified->value,
            ProjectDesignRemarkStatus::Resolved->value,
            ProjectDesignRemarkStatus::Reopened->value,
        ],
        ProjectDesignRemarkStatus::Verified->value => [
            ProjectDesignRemarkStatus::Resolved->value,
            ProjectDesignRemarkStatus::Reopened->value,
        ],
        ProjectDesignRemarkStatus::Resolved->value => [ProjectDesignRemarkStatus::Reopened->value],
        ProjectDesignRemarkStatus::Reopened->value => [
            ProjectDesignRemarkStatus::Assigned->value,
            ProjectDesignRemarkStatus::InProgress->value,
            ProjectDesignRemarkStatus::Rejected->value,
        ],
        ProjectDesignRemarkStatus::Rejected->value => [ProjectDesignRemarkStatus::Reopened->value],
    ];

    public function __construct(private readonly ProjectDesignActivityService $activity) {}

    /** @param array<string, mixed> $changes */
    public function execute(User $actor, Dossier $dossier, ProjectDesignRemark $remark, array $changes): ProjectDesignRemark
    {
        $remark->loadMissing('version.file');

        if ((int) $remark->company_id !== (int) $actor->company_id
            || (int) $remark->version->file->dossier_id !== (int) $dossier->id) {
            throw new AuthorizationException();
        }

        $this->authorizeChanges($actor, $dossier, $remark, $changes);
        $oldValues = $remark->only(['severity', 'status', 'title', 'description', 'assigned_to', 'due_date']);
        $remark->fill($changes);

        if ($remark->isDirty('assigned_to') && ! array_key_exists('status', $changes)
            && $remark->status === ProjectDesignRemarkStatus::Open->value
            && $remark->assigned_to !== null) {
            $remark->status = ProjectDesignRemarkStatus::Assigned->value;
        }

        if (! $remark->isDirty()) {
            return $remark->load('createdBy', 'assignedTo', 'version.file');
        }

        $remark->record_version++;
        $remark->save();
        $remark->load('createdBy', 'assignedTo', 'version.file');

        $this->activity->record($dossier->id, 'project_design.remark_updated', [
            'remark_id' => $remark->id,
            'file_id' => $remark->version->file_id,
            'version_id' => $remark->version_id,
            'old' => $oldValues,
            'new' => $remark->only(['severity', 'status', 'title', 'description', 'assigned_to', 'due_date']),
        ]);

        return $remark;
    }

    /** @param array<string, mixed> $changes */
    private function authorizeChanges(User $actor, Dossier $dossier, ProjectDesignRemark $remark, array $changes): void
    {
        if (array_key_exists('assigned_to', $changes) || array_key_exists('due_date', $changes)) {
            Gate::forUser($actor)->authorize('assignRemark', [$remark, $dossier]);
        }

        if (isset($changes['status']) && $changes['status'] !== $remark->status) {
            $this->authorizeTransition($actor, $dossier, $remark, $changes['status']);
        }

        $contentFields = ['severity', 'title', 'description'];
        if (array_intersect($contentFields, array_keys($changes)) && (int) $remark->created_by !== (int) $actor->id) {
            Gate::forUser($actor)->authorize('addressRemark', [$remark, $dossier]);
        }
    }

    private function authorizeTransition(User $actor, Dossier $dossier, ProjectDesignRemark $remark, string $targetStatus): void
    {
        if (! in_array($targetStatus, self::TRANSITIONS[$remark->status] ?? [], true)) {
            throw ValidationException::withMessages([
                'status' => 'This remark cannot move to the selected workflow state.',
            ]);
        }

        $ability = match ($targetStatus) {
            ProjectDesignRemarkStatus::Assigned->value => 'assignRemark',
            ProjectDesignRemarkStatus::InProgress->value,
            ProjectDesignRemarkStatus::Addressed->value => 'addressRemark',
            ProjectDesignRemarkStatus::Verified->value,
            ProjectDesignRemarkStatus::Resolved->value,
            ProjectDesignRemarkStatus::Rejected->value => 'verifyRemark',
            ProjectDesignRemarkStatus::Reopened->value => 'reopenRemark',
        };

        Gate::forUser($actor)->authorize($ability, [$remark, $dossier]);
    }
}
