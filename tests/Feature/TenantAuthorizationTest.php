<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Company;
use App\Models\Dossier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class TenantAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_manager_cannot_view_another_company_client_or_dossier(): void
    {
        $companyA = Company::factory()->create();
        $companyB = Company::factory()->create();
        $user = $this->managerFor($companyA);

        $foreignClient = Client::factory()->create([
            'company_id' => $companyB->id,
            'branch_id' => null,
        ]);
        $foreignDossier = Dossier::factory()->create([
            'company_id' => $companyB->id,
            'branch_id' => null,
            'client_id' => $foreignClient->id,
        ]);

        $this->actingAs($user)
            ->get(route('clients.show', $foreignClient))
            ->assertForbidden();

        $this->actingAs($user)
            ->get(route('dossiers.show', $foreignDossier))
            ->assertForbidden();
    }

    public function test_client_and_dossier_indexes_are_limited_to_the_current_company(): void
    {
        $companyA = Company::factory()->create();
        $companyB = Company::factory()->create();
        $user = $this->managerFor($companyA);

        $ownClient = Client::factory()->create([
            'company_id' => $companyA->id,
            'branch_id' => null,
            'full_name' => 'Client Visible Tenant A',
        ]);
        $ownDossier = Dossier::factory()->create([
            'company_id' => $companyA->id,
            'branch_id' => null,
            'client_id' => $ownClient->id,
            'project_object' => 'Dossier Visible Tenant A',
        ]);

        $foreignClient = Client::factory()->create([
            'company_id' => $companyB->id,
            'branch_id' => null,
            'full_name' => 'Client Hidden Tenant B',
        ]);
        Dossier::factory()->create([
            'company_id' => $companyB->id,
            'branch_id' => null,
            'client_id' => $foreignClient->id,
            'project_object' => 'Dossier Hidden Tenant B',
        ]);

        $this->actingAs($user)
            ->get(route('clients.index'))
            ->assertOk()
            ->assertSee('Client Visible Tenant A')
            ->assertDontSee('Client Hidden Tenant B');

        $this->actingAs($user)
            ->get(route('dossiers.index'))
            ->assertOk()
            ->assertSee('Dossier Visible Tenant A')
            ->assertDontSee('Dossier Hidden Tenant B');
    }

    private function managerFor(Company $company): User
    {
        $permissions = collect(['manage clients', 'manage dossiers'])
            ->map(fn (string $name) => Permission::findOrCreate($name, 'web'));

        $role = Role::findOrCreate('tenant_manager', 'web');
        $role->syncPermissions($permissions);

        return tap(User::factory()->create([
            'company_id' => $company->id,
            'branch_id' => null,
        ]), fn (User $user) => $user->assignRole($role));
    }
}
