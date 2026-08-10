<?php

namespace App\Services\Dossiers;

use App\Models\Dossier;
use App\Models\DossierCahier;
use App\Models\User;
use Illuminate\Support\Facades\DB;

final class DossierCahierService
{
    public function __construct(private readonly DossierWorkflowRequirementService $workflowRequirements) {}

    /** @param array{cahier_number: string, received_at: string, delivered_at?: string|null} $data */
    public function save(Dossier $dossier, User $user, array $data): DossierCahier
    {
        return DB::transaction(function () use ($dossier, $user, $data): DossierCahier {
            $cahier = DossierCahier::query()->firstOrNew(['dossier_id' => $dossier->id]);
            $cahier->fill([
                'cahier_number' => $data['cahier_number'],
                'received_at' => $data['received_at'],
                'delivered_at' => $data['delivered_at'] ?? null,
                'updated_by' => $user->id,
            ]);
            if (! $cahier->exists) {
                $cahier->created_by = $user->id;
            }
            $cahier->save();

            $this->workflowRequirements->update($dossier, [
                'step_key' => 'cahier_chantier',
                'requirement_key' => 'cahier_received',
                'is_done' => true,
            ], $user);

            return $cahier->fresh(['createdBy', 'updatedBy']);
        });
    }
}
