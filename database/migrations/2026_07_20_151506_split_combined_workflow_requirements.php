<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $replacements = [
            ['step' => 'documents', 'old' => 'terrain_documents', 'new' => ['plan_cadastral', 'calcul_contenance', 'plan_parcellaire']],
            ['step' => 'bureau_etude', 'old' => 'implantation_topographie', 'new' => ['attestation_implantation', 'contrat_topographie']],
            ['step' => 'bureau_etude', 'old' => 'laboratoire_controle', 'new' => ['contrat_laboratoire', 'bureau_controle']],
        ];

        foreach ($replacements as $replacement) {
            $step = $replacement['step'];
            $oldKey = $replacement['old'];
            $newKeys = $replacement['new'];

            $oldRecords = DB::table('dossier_workflow_requirements')
                ->where('step_key', $step)
                ->where('requirement_key', $oldKey)
                ->get();

            foreach ($oldRecords as $record) {
                $now = now();
                foreach ($newKeys as $newKey) {
                    $exists = DB::table('dossier_workflow_requirements')
                        ->where('dossier_id', $record->dossier_id)
                        ->where('step_key', $step)
                        ->where('requirement_key', $newKey)
                        ->exists();

                    if (!$exists) {
                        DB::table('dossier_workflow_requirements')->insert([
                            'dossier_id' => $record->dossier_id,
                            'step_key' => $step,
                            'requirement_key' => $newKey,
                            'is_done' => $record->is_done,
                            'checked_at' => $record->checked_at,
                            'checked_by' => $record->checked_by,
                            'notes' => $record->notes,
                            'created_at' => $now,
                            'updated_at' => $now,
                        ]);
                    }
                }

                DB::table('dossier_workflow_requirements')
                    ->where('id', $record->id)
                    ->delete();
            }
        }
    }

    public function down(): void
    {
        $replacements = [
            ['step' => 'documents', 'old' => 'terrain_documents', 'new' => ['plan_cadastral', 'calcul_contenance', 'plan_parcellaire']],
            ['step' => 'bureau_etude', 'old' => 'implantation_topographie', 'new' => ['attestation_implantation', 'contrat_topographie']],
            ['step' => 'bureau_etude', 'old' => 'laboratoire_controle', 'new' => ['contrat_laboratoire', 'bureau_controle']],
        ];

        foreach ($replacements as $replacement) {
            $step = $replacement['step'];
            $oldKey = $replacement['old'];
            $newKeys = $replacement['new'];

            $newRecords = DB::table('dossier_workflow_requirements')
                ->where('step_key', $step)
                ->whereIn('requirement_key', $newKeys)
                ->get()
                ->groupBy('dossier_id');

            foreach ($newRecords as $dossierId => $records) {
                $anyDone = $records->contains('is_done', true);
                $first = $records->first();

                $oldExists = DB::table('dossier_workflow_requirements')
                    ->where('dossier_id', $dossierId)
                    ->where('step_key', $step)
                    ->where('requirement_key', $oldKey)
                    ->exists();

                if (!$oldExists) {
                    DB::table('dossier_workflow_requirements')->insert([
                        'dossier_id' => $dossierId,
                        'step_key' => $step,
                        'requirement_key' => $oldKey,
                        'is_done' => $anyDone,
                        'checked_at' => $anyDone ? now() : null,
                        'checked_by' => null,
                        'notes' => null,
                        'created_at' => $first->created_at,
                        'updated_at' => now(),
                    ]);
                }

                DB::table('dossier_workflow_requirements')
                    ->where('dossier_id', $dossierId)
                    ->where('step_key', $step)
                    ->whereIn('requirement_key', $newKeys)
                    ->delete();
            }
        }
    }
};
