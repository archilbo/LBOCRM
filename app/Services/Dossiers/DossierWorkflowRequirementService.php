<?php

namespace App\Services\Dossiers;

use App\Models\Dossier;
use App\Models\DossierWorkflowRequirement;
use App\Models\DossierWorkflowRequirementHistory;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class DossierWorkflowRequirementService
{
    public function update(Dossier $dossier, array $data): DossierWorkflowRequirement
    {
        $this->assertRequirementExists((string) $data['step_key'], (string) $data['requirement_key']);

        return DB::transaction(function () use ($dossier, $data) {
            $keys = [
                'dossier_id' => $dossier->id,
                'step_key' => $data['step_key'],
                'requirement_key' => $data['requirement_key'],
            ];

            $existing = DossierWorkflowRequirement::where($keys)->first();
            $oldDone = $existing?->is_done;
            $oldNotes = $existing?->notes;
            $newDone = (bool) $data['is_done'];
            $newNotes = $data['notes'] ?? $oldNotes;

            $requirement = DossierWorkflowRequirement::updateOrCreate(
                $keys,
                [
                    'is_done' => $newDone,
                    'checked_at' => $newDone ? now() : null,
                    'checked_by' => $newDone ? Auth::id() : null,
                    'notes' => $newNotes,
                ],
            );

            DossierWorkflowRequirementHistory::create([
                'dossier_id' => $dossier->id,
                'dossier_workflow_requirement_id' => $requirement->id,
                'step_key' => $data['step_key'],
                'requirement_key' => $data['requirement_key'],
                'old_is_done' => $oldDone,
                'new_is_done' => $newDone,
                'old_notes' => $oldNotes,
                'new_notes' => $newNotes,
                'changed_by' => Auth::id(),
                'changed_at' => now(),
            ]);

            return $requirement;
        });
    }

    private function assertRequirementExists(string $stepKey, string $requirementKey): void
    {
        foreach ((array) config('archilbo_workflow.client_project_steps', []) as $step) {
            if (($step['key'] ?? null) !== $stepKey) {
                continue;
            }

            foreach (($step['requirements'] ?? []) as $requirement) {
                if (($requirement['key'] ?? null) === $requirementKey) {
                    return;
                }
            }
        }

        throw ValidationException::withMessages([
            'requirement_key' => 'Element workflow inconnu.',
        ]);
    }
}
