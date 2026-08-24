<?php

namespace App\Services\Dossiers;

use App\Models\AuditLog;
use App\Models\Client;
use App\Models\Dossier;
use App\Models\User;
use App\Services\CompanyContext;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Centralized owner of Client <-> Dossier membership.
 *
 * Every attach / sync / primary mutation must go through this service so
 * tenant isolation, the single-primary invariant, the legacy client_id
 * mirror column, detach protection and auditing are never bypassed.
 */
class DossierClientService
{
    public function __construct(
        private readonly CompanyContext $companyContext,
    ) {
    }

    /**
     * Resolve the submitted client ids against the authenticated user's
     * company (and branch when the user is branch-scoped). Any foreign or
     * unknown id yields a 404, never a partial mutation.
     *
     * @param  array<int, int>  $clientIds
     */
    public function resolveClients(array $clientIds, User $user): Collection
    {
        $ids = array_values(array_unique(array_map('intval', $clientIds)));
        if ($ids === []) {
            return new Collection();
        }

        $clients = $this->companyContext->applyTo(Client::query(), $user)
            ->whereKey($ids)
            ->get();

        abort_unless($clients->count() === count($ids), 404);

        return $clients;
    }

    /**
     * Replace the dossier membership with $clientIds, mark exactly one
     * primary client, mirror the legacy dossiers.client_id column and audit
     * the change. Runs inside a transaction; safe to nest in a caller-owned
     * transaction (the caller may wrap dossier creation + membership + audit
     * in one DB::transaction).
     *
     * Detach protection: a client with own financial records on this dossier
     * cannot be silently removed.
     *
     * @param  array<int, int>  $clientIds
     */
    public function sync(Dossier $dossier, array $clientIds, ?int $primaryClientId, User $user): void
    {
        $clients = $this->resolveClients($clientIds, $user);

        if ($clients->isEmpty()) {
            $this->throwClientValidation('Sélectionnez au moins un client.');
        }

        $primaryId = $primaryClientId !== null
            ? (int) $primaryClientId
            : (int) $clients->first()->id;

        if (! $clients->contains(fn (Client $client) => (int) $client->id === $primaryId)) {
            $this->throwClientValidation('Le client principal doit faire partie des clients sélectionnés.');
        }

        $primaryClient = $clients->firstWhere('id', $primaryId);
        $this->assertCompatibleBranches($clients, $primaryClient?->branch_id);

        DB::transaction(function () use ($dossier, $clients, $primaryId, $user): void {
            $this->assertCanDetachMissing($dossier, $clients->pluck('id')->all());

            $dossier->clients()->sync(
                $clients
                    ->mapWithKeys(fn (Client $client) => [
                        $client->id => [
                            'is_primary' => (int) $client->id === $primaryId,
                            'role' => null,
                        ],
                    ])
                    ->all(),
            );

            $dossier->client_id = $primaryId;
            $dossier->save();

            AuditLog::query()->create([
                'user_id' => $user->id,
                'action' => 'dossier.clients.updated',
                'description' => "Updated dossier {$dossier->dossier_number} client memberships",
                'metadata' => [
                    'client_ids' => $clients->pluck('id')->map(fn (int $id) => (string) $id)->all(),
                    'primary_client_id' => (string) $primaryId,
                ],
                'auditable_type' => Dossier::class,
                'auditable_id' => $dossier->id,
                'created_at' => now(),
            ]);
        });
    }

    /**
     * Attach extra clients to an existing dossier without touching current
     * membership or the primary designation.
     *
     * @param  array<int, int>  $clientIds
     */
    public function attach(Dossier $dossier, array $clientIds, User $user): void
    {
        $clients = $this->resolveClients($clientIds, $user);
        $this->assertCompatibleBranches($clients, $dossier->branch_id);

        DB::transaction(function () use ($dossier, $clients, $user): void {
            foreach ($clients as $client) {
                $dossier->clients()->syncWithoutDetaching([
                    $client->id => ['is_primary' => false, 'role' => null],
                ]);
            }

            AuditLog::query()->create([
                'user_id' => $user->id,
                'action' => 'dossier.clients.attached',
                'description' => "Attached client(s) to dossier {$dossier->dossier_number}",
                'metadata' => ['client_ids' => $clients->pluck('id')->map(fn (int $id) => (string) $id)->all()],
                'auditable_type' => Dossier::class,
                'auditable_id' => $dossier->id,
                'created_at' => now(),
            ]);
        });
    }

    public function setPrimary(Dossier $dossier, int $primaryClientId, User $user): void
    {
        if (! $dossier->hasClientMembership($primaryClientId)) {
            $this->throwClientValidation('Le client principal doit être attaché au projet.');
        }

        DB::transaction(function () use ($dossier, $primaryClientId, $user): void {
            // Legacy records created before the pivot migration can still be
            // promoted safely: materialize their existing primary membership
            // before changing the primary flag.
            $dossier->clients()->syncWithoutDetaching([
                $primaryClientId => ['is_primary' => true, 'role' => null],
            ]);

            $dossier->clients()->updateExistingPivot($primaryClientId, ['is_primary' => true]);
            $dossier->clients()
                ->wherePivot('is_primary', true)
                ->whereKeyNot($primaryClientId)
                ->get()
                ->each(fn (Client $client) => $dossier->clients()->updateExistingPivot($client->id, ['is_primary' => false]));

            $dossier->client_id = $primaryClientId;
            $dossier->save();

            AuditLog::query()->create([
                'user_id' => $user->id,
                'action' => 'dossier.clients.primary',
                'description' => "Changed primary client of dossier {$dossier->dossier_number}",
                'metadata' => ['primary_client_id' => (string) $primaryClientId],
                'auditable_type' => Dossier::class,
                'auditable_id' => $dossier->id,
                'created_at' => now(),
            ]);
        });
    }

    /**
     * Block removing a client that owns financial history (documents,
     * payments, negotiated lines) on this dossier. Historical records are
     * never cascaded; the user must clean them up explicitly first.
     */
    public function assertCanDetach(Dossier $dossier, int $clientId): void
    {
        $financialCount = $dossier->documents()->where('client_id', $clientId)->count()
            + $dossier->financeDocuments()->where('client_id', $clientId)->count()
            + $dossier->payments()->where('client_id', $clientId)->count()
            + $dossier->negotiatedPaymentLines()->where('client_id', $clientId)->count();

        if ($financialCount > 0) {
            $this->throwClientValidation(
                'Ce client possède des documents ou paiements sur ce projet. Déplacez ou supprimez d\'abord son historique financier avant de le retirer du projet.',
            );
        }
    }

    /**
     * @param  array<int, int>  $expectedIds
     */
    private function assertCanDetachMissing(Dossier $dossier, array $expectedIds): void
    {
        $current = $dossier->clients()->pluck('clients.id');

        foreach ($current as $existingId) {
            if (! in_array((int) $existingId, $expectedIds, true)) {
                $this->assertCanDetach($dossier, (int) $existingId);
            }
        }
    }

    /**
     * An organisation-wide user may see more than one branch. Membership is
     * still constrained to the one branch stored on the dossier.
     *
     * @param  Collection<int, Client>  $clients
     */
    private function assertCompatibleBranches(Collection $clients, ?int $branchId): void
    {
        if ($clients->contains(fn (Client $client) => $client->branch_id !== $branchId)) {
            $this->throwClientValidation('All selected clients must belong to the same branch.');
        }
    }

    private function throwClientValidation(string $message): never
    {
        throw ValidationException::withMessages([
            'client_ids' => $message,
        ]);
    }
}
