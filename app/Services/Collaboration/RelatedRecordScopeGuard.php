<?php

namespace App\Services\Collaboration;

use App\Models\ArchiveRecord;
use App\Models\Client;
use App\Models\Contract;
use App\Models\Conversation;
use App\Models\Dossier;
use App\Models\DossierDocument;
use App\Models\FinanceDocument;
use App\Models\Task;
use App\Models\User;
use App\Services\CompanyContext;
use Illuminate\Database\Eloquent\Builder;

class RelatedRecordScopeGuard
{
    public function __construct(private readonly CompanyContext $companyContext)
    {
    }

    public function assertTaskLinks(User $user, array $data): void
    {
        $this->assertDossierLink($user, $data['dossier_id'] ?? null);
        $this->assertClientLink($user, $data['client_id'] ?? null);
        $this->assertDossierScopedLink($user, DossierDocument::class, $data['dossier_document_id'] ?? null);
        $this->assertDirectLink($user, FinanceDocument::class, $data['finance_document_id'] ?? null);
        $this->assertDossierScopedLink($user, Contract::class, $data['contract_id'] ?? null);
        $this->assertDossierScopedLink($user, ArchiveRecord::class, $data['archive_record_id'] ?? null);
        $this->assertConversationLink($user, $data['conversation_id'] ?? null);
        $this->assertUserIds($user, $data['assignee_ids'] ?? []);
        $this->assertUserIds($user, $data['watcher_ids'] ?? []);
    }

    public function assertCalendarLinks(User $user, array $data): void
    {
        $this->assertDossierLink($user, $data['dossier_id'] ?? null);
        $this->assertClientLink($user, $data['client_id'] ?? null);
        $this->assertDossierScopedLink($user, DossierDocument::class, $data['dossier_document_id'] ?? null);
        $this->assertDirectLink($user, FinanceDocument::class, $data['finance_document_id'] ?? null);
        $this->assertDossierScopedLink($user, Contract::class, $data['contract_id'] ?? null);
        $this->assertDossierScopedLink($user, ArchiveRecord::class, $data['archive_record_id'] ?? null);
        $this->assertTaskLink($user, $data['task_id'] ?? null);
        $this->assertUserIds($user, array_filter([
            $data['owner_id'] ?? null,
            ...($data['participant_ids'] ?? []),
        ]));
    }

    public function assertUserIds(User $user, array $userIds): void
    {
        $ids = array_values(array_unique(array_filter($userIds)));

        if ($ids === []) {
            return;
        }

        $count = $this->companyContext
            ->applyTo(User::query(), $user)
            ->whereIn('id', $ids)
            ->count();

        abort_unless($count === count($ids), 404);
    }

    private function assertDossierLink(User $user, mixed $id): void
    {
        if ($id) {
            abort_unless($this->companyContext->applyTo(Dossier::query(), $user)->whereKey($id)->exists(), 404);
        }
    }

    private function assertClientLink(User $user, mixed $id): void
    {
        if ($id) {
            abort_unless($this->companyContext->applyTo(Client::query(), $user)->whereKey($id)->exists(), 404);
        }
    }

    private function assertDossierScopedLink(User $user, string $model, mixed $id): void
    {
        if ($id) {
            abort_unless($model::query()
                ->whereKey($id)
                ->whereHas('dossier', fn (Builder $dossier) => $this->companyContext->applyTo($dossier, $user))
                ->exists(), 404);
        }
    }

    private function assertDirectLink(User $user, string $model, mixed $id): void
    {
        if ($id) {
            abort_unless($this->companyContext->applyTo($model::query(), $user)->whereKey($id)->exists(), 404);
        }
    }

    private function assertConversationLink(User $user, mixed $id): void
    {
        if ($id) {
            $conversation = Conversation::query()->find($id);
            abort_unless($conversation?->belongsToScope($user), 404);
        }
    }

    private function assertTaskLink(User $user, mixed $id): void
    {
        if ($id) {
            $task = Task::query()->find($id);
            abort_unless($task?->belongsToScope($user), 404);
        }
    }
}
