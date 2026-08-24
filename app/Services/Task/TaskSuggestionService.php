<?php

namespace App\Services\Task;

use App\Models\Client;
use App\Models\Contract;
use App\Models\Dossier;
use App\Models\DossierDocument;
use App\Models\FinanceDocument;
use App\Models\TaskSuggestion;
use Carbon\Carbon;

class TaskSuggestionService
{
    public function generateForDossier(Dossier $dossier): array
    {
        $suggestions = [];

        if ($this->isMissingRequiredDocuments($dossier)) {
            $suggestions[] = $this->make('missing_document', 'Upload missing required documents for ' . ($dossier->project_object ?? 'dossier'), $dossier);
        }

        if ($this->isContractReadyButNotGenerated($dossier)) {
            $suggestions[] = $this->make('contract_ready', 'Contract is ready but not yet generated for ' . ($dossier->project_object ?? 'dossier'), $dossier);
        }

        $financeSuggestions = $this->checkFinanceOverdue($dossier);
        foreach ($financeSuggestions as $s) {
            $suggestions[] = $s;
        }

        if ($this->isProjectStuck($dossier)) {
            $suggestions[] = $this->make('project_stuck', 'Project stuck in "' . ($dossier->workflow_step ?? 'current') . '" step — review blocker', $dossier);
        }

        if ($this->isArchiveMissing($dossier)) {
            $suggestions[] = $this->make('archive_missing', 'Project is closed but archive record is missing', $dossier);
        }

        if ($this->isCinExpiringSoon($dossier)) {
            $suggestions[] = $this->make('cin_expiring', 'Client CIN is expiring soon — request renewal', $dossier);
        }

        return $suggestions;
    }

    public function createSuggestion(string $type, string $description, ?Dossier $dossier = null, mixed $related = null): TaskSuggestion
    {
        return TaskSuggestion::create([
            'type' => $type,
            'description' => $description,
            'dossier_id' => $dossier?->id,
            'client_id' => $dossier?->client_id,
            'related_entity_id' => $related?->id,
            'related_entity_type' => $related ? get_class($related) : null,
        ]);
    }

    private function make(string $type, string $desc, Dossier $dossier): TaskSuggestion
    {
        return $this->createSuggestion($type, $desc, $dossier);
    }

    private function isMissingRequiredDocuments(Dossier $dossier): bool
    {
        $required = $dossier->workflowRequirements()->where('step_key', 'documents')->where('is_done', false)->count();
        return $required > 0;
    }

    private function isContractReadyButNotGenerated(Dossier $dossier): bool
    {
        if ($dossier->contract()->where('status', 'signed')->exists()) return false;
        if ($dossier->contract()->where('status', 'generated')->exists()) return false;
        $hasDraft = $dossier->contract()->where('status', 'draft')->exists();
        return $hasDraft;
    }

    private function checkFinanceOverdue(Dossier $dossier): array
    {
        $res = [];
        $overdue = $dossier->financeDocuments()->where('status', 'overdue')->get();
        foreach ($overdue as $doc) {
            $res[] = $this->createSuggestion('finance_overdue', 'Invoice ' . ($doc->number ?? '#') . ' is overdue — payment follow-up required', $dossier, $doc);
        }
        $due = $dossier->financeDocuments()->where('status', 'sent')->whereNotNull('due_date')->get();
        foreach ($due as $doc) {
            if (Carbon::parse($doc->due_date)->diffInDays(now()) <= 3) {
                $res[] = $this->createSuggestion('finance_due_soon', 'Invoice ' . ($doc->number ?? '#') . ' is due soon — prepare reminder', $dossier, $doc);
            }
        }
        return $res;
    }

    private function isProjectStuck(Dossier $dossier): bool
    {
        if ($dossier->status === 'closed') return false;
        return $dossier->updated_at->diffInDays(now()) > 21;
    }

    private function isArchiveMissing(Dossier $dossier): bool
    {
        if ($dossier->status !== 'closed') return false;
        return ! $dossier->archiveRecord()->exists();
    }

    private function isCinExpiringSoon(Dossier $dossier): bool
    {
        $client = $dossier->primaryClient;
        if (! $client || ! $client->cni_expiration_date) return false;
        return Carbon::parse($client->cni_expiration_date)->diffInDays(now()) <= 30;
    }
}
