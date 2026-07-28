<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Company;
use App\Models\Dossier;
use App\Models\DossierDocument;
use App\Models\Intermediary;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ClientSecurityHardeningTest extends TestCase
{
    use RefreshDatabase;

    public function test_client_search_api_and_global_search_are_tenant_scoped(): void
    {
        $companyA = Company::factory()->create();
        $companyB = Company::factory()->create();
        $user = $this->userFor($companyA, ['manage clients']);

        $ownClient = Client::factory()->create([
            'company_id' => $companyA->id,
            'branch_id' => null,
            'full_name' => 'Client Scoped Search A',
        ]);
        Client::factory()->create([
            'company_id' => $companyB->id,
            'branch_id' => null,
            'full_name' => 'Client Hidden Search B',
        ]);

        $this->actingAs($user)
            ->getJson(route('api.clients.search', ['q' => 'Client']))
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $ownClient->id);

        $this->actingAs($user)
            ->get(route('clients.show', $ownClient))
            ->assertOk();

        foreach (['overview', 'projects', 'workflow', 'documents', 'finance', 'notes', 'activity'] as $tab) {
            $this->actingAs($user)
                ->get(route('clients.show', ['client' => $ownClient, 'tab' => $tab]))
                ->assertOk();
        }

        $this->actingAs($user)
            ->getJson(route('global-search.index', ['q' => 'Client']))
            ->assertOk()
            ->assertSee('Client Scoped Search A')
            ->assertDontSee('Client Hidden Search B');
    }

    public function test_client_project_api_document_access_and_workflow_updates_respect_tenant_boundaries(): void
    {
        $companyA = Company::factory()->create();
        $companyB = Company::factory()->create();
        $user = $this->userFor($companyA, ['manage clients', 'manage dossiers', 'manage documents']);

        $ownClient = Client::factory()->create(['company_id' => $companyA->id, 'branch_id' => null]);
        $foreignClient = Client::factory()->create(['company_id' => $companyB->id, 'branch_id' => null]);
        $ownDossier = Dossier::factory()->create([
            'company_id' => $companyA->id,
            'branch_id' => null,
            'client_id' => $ownClient->id,
        ]);
        $foreignDossier = Dossier::factory()->create([
            'company_id' => $companyB->id,
            'branch_id' => null,
            'client_id' => $foreignClient->id,
        ]);
        $foreignDocument = DossierDocument::query()->create([
            'dossier_id' => $foreignDossier->id,
            'document_number' => 'DOC-FOREIGN-0001',
            'status' => 'missing',
        ]);

        $this->actingAs($user)
            ->getJson(route('api.clients.projects', $foreignClient))
            ->assertForbidden();

        $this->actingAs($user)
            ->get(route('documents.view', $foreignDocument))
            ->assertForbidden();

        $this->actingAs($user)
            ->put(route('dossiers.workflow-requirements.update', $foreignDossier), [
                'step_key' => 'documents',
                'requirement_key' => 'cin',
                'is_done' => true,
            ])
            ->assertForbidden();

        $this->actingAs($user)
            ->put(route('dossiers.update', $ownDossier), [
                'client_id' => $foreignClient->id,
                'project_object' => 'Attempted reassignment',
            ])
            ->assertNotFound();
    }

    public function test_intermediary_options_are_limited_to_the_current_tenant(): void
    {
        $companyA = Company::factory()->create();
        $companyB = Company::factory()->create();
        $user = $this->userFor($companyA, ['manage clients']);

        Intermediary::query()->create([
            'company_id' => $companyA->id,
            'branch_id' => null,
            'code' => 'INT-TENANT-A',
            'name' => 'Intermediary Visible A',
            'is_active' => true,
        ]);
        Intermediary::query()->create([
            'company_id' => $companyB->id,
            'branch_id' => null,
            'code' => 'INT-TENANT-B',
            'name' => 'Intermediary Hidden B',
            'is_active' => true,
        ]);

        $this->actingAs($user)
            ->get(route('clients.index'))
            ->assertOk()
            ->assertSee('Intermediary Visible A')
            ->assertDontSee('Intermediary Hidden B');
    }

    private function userFor(Company $company, array $permissions): User
    {
        $permissionModels = collect($permissions)
            ->map(fn (string $name) => Permission::findOrCreate($name, 'web'));

        $role = Role::findOrCreate('client_security_manager', 'web');
        $role->syncPermissions($permissionModels);

        return tap(User::factory()->create([
            'company_id' => $company->id,
            'branch_id' => null,
        ]), fn (User $user) => $user->assignRole($role));
    }
}
