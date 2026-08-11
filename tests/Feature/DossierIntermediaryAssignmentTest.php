<?php

namespace Tests\Feature;

use App\Models\City;
use App\Models\Client;
use App\Models\Company;
use App\Models\Dossier;
use App\Models\Intermediary;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class DossierIntermediaryAssignmentTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_project_can_be_created_with_an_intermediary_from_its_company(): void
    {
        [$user, $client, $city] = $this->projectContext();
        $intermediary = Intermediary::query()->create([
            'company_id' => $user->company_id,
            'code' => 'INT-TEST-001',
            'name' => 'Project referral',
            'type' => 'person',
            'is_active' => true,
        ]);

        $this->actingAs($user)->post(route('dossiers.store'), $this->payload($client, $city, $intermediary->id))
            ->assertRedirect(route('dossiers.index'));

        $this->assertDatabaseHas('dossiers', [
            'client_id' => $client->id,
            'intermediary_id' => $intermediary->id,
        ]);
    }

    public function test_a_project_cannot_use_an_intermediary_from_another_company(): void
    {
        [$user, $client, $city] = $this->projectContext();
        $foreignCompany = Company::factory()->create();
        $foreignIntermediary = Intermediary::query()->create([
            'company_id' => $foreignCompany->id,
            'code' => 'INT-TEST-002',
            'name' => 'Foreign referral',
            'type' => 'person',
            'is_active' => true,
        ]);

        $this->actingAs($user)->from(route('dossiers.index'))
            ->post(route('dossiers.store'), $this->payload($client, $city, $foreignIntermediary->id))
            ->assertRedirect(route('dossiers.index'))
            ->assertSessionHasErrors('intermediary_id');

        $this->assertDatabaseCount('dossiers', 0);
    }

    /** @return array{User, Client, City} */
    private function projectContext(): array
    {
        $company = Company::factory()->create();
        $user = User::factory()->create(['company_id' => $company->id]);
        Permission::query()->firstOrCreate(['name' => 'dossiers.create', 'guard_name' => 'web']);
        $user->givePermissionTo('dossiers.create');

        $client = Client::factory()->create([
            'company_id' => $company->id,
            'branch_id' => null,
        ]);
        $city = City::query()->create([
            'name' => 'Marrakech',
            'code' => 'MAR',
            'color' => '#000000',
            'is_active' => true,
        ]);

        return [$user, $client, $city];
    }

    /** @return array<string, int|string> */
    private function payload(Client $client, City $city, int $intermediaryId): array
    {
        return [
            'client_id' => $client->id,
            'intermediary_id' => $intermediaryId,
            'city_id' => $city->id,
            'project_object' => 'New project',
        ];
    }
}
