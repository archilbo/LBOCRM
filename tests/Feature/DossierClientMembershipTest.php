<?php

namespace Tests\Feature;

use App\Models\City;
use App\Models\Client;
use App\Models\Company;
use App\Models\Dossier;
use App\Models\User;
use App\Services\Dossiers\DossierClientService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class DossierClientMembershipTest extends TestCase
{
    use RefreshDatabase;

    public function test_project_creation_attaches_all_selected_clients_and_keeps_the_selected_primary_in_sync(): void
    {
        [$user, $company, $city] = $this->projectContext();
        $first = $this->client($company, 'First owner');
        $second = $this->client($company, 'Primary owner');

        $this->actingAs($user)
            ->post(route('dossiers.store'), $this->payload($city, [$first->id, $second->id], $second->id))
            ->assertRedirect(route('dossiers.index'));

        $dossier = Dossier::query()->sole();

        $this->assertSame($second->id, $dossier->client_id);
        $this->assertDatabaseHas('client_dossier', [
            'dossier_id' => $dossier->id,
            'client_id' => $first->id,
            'is_primary' => false,
        ]);
        $this->assertDatabaseHas('client_dossier', [
            'dossier_id' => $dossier->id,
            'client_id' => $second->id,
            'is_primary' => true,
        ]);
        $this->assertDatabaseCount('client_dossier', 2);
        $this->assertSame(1, $first->fresh()->dossiers()->count());
        $this->assertSame(1, $second->fresh()->dossiers()->count());

        app(DossierClientService::class)->setPrimary($dossier, $first->id, $user);

        $this->assertSame($first->id, $dossier->fresh()->client_id);
        $this->assertDatabaseHas('client_dossier', [
            'dossier_id' => $dossier->id,
            'client_id' => $first->id,
            'is_primary' => true,
        ]);
        $this->assertDatabaseHas('client_dossier', [
            'dossier_id' => $dossier->id,
            'client_id' => $second->id,
            'is_primary' => false,
        ]);

        // Re-sync is idempotent: unique client/dossier membership prevents
        // duplicate links when a request is retried.
        app(DossierClientService::class)->sync($dossier->fresh(), [$first->id, $second->id], $first->id, $user);
        $this->assertDatabaseCount('client_dossier', 2);
    }

    public function test_project_creation_rejects_a_client_from_another_company(): void
    {
        [$user, $company, $city] = $this->projectContext();
        $ownClient = $this->client($company, 'Own client');
        $foreignClient = $this->client(Company::factory()->create(), 'Foreign client');

        $this->actingAs($user)
            ->post(route('dossiers.store'), $this->payload($city, [$ownClient->id, $foreignClient->id], $ownClient->id))
            ->assertNotFound();

        $this->assertDatabaseCount('dossiers', 0);
        $this->assertDatabaseCount('client_dossier', 0);
    }

    /** @return array{User, Company, City} */
    private function projectContext(): array
    {
        $company = Company::factory()->create();
        $user = User::factory()->create(['company_id' => $company->id, 'branch_id' => null]);
        Permission::query()->firstOrCreate(['name' => 'dossiers.create', 'guard_name' => 'web']);
        $user->givePermissionTo('dossiers.create');

        $city = City::query()->create([
            'name' => 'Marrakech',
            'code' => 'MAR',
            'color' => '#000000',
            'is_active' => true,
        ]);

        return [$user, $company, $city];
    }

    private function client(Company $company, string $name): Client
    {
        return Client::factory()->create([
            'company_id' => $company->id,
            'branch_id' => null,
            'full_name' => $name,
        ]);
    }

    /** @param array<int, int> $clientIds */
    private function payload(City $city, array $clientIds, int $primaryClientId): array
    {
        return [
            'client_ids' => $clientIds,
            'primary_client_id' => $primaryClientId,
            'city_id' => $city->id,
            'project_object' => 'Projet multi-client',
        ];
    }
}
