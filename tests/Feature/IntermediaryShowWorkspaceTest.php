<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Company;
use App\Models\Dossier;
use App\Models\Intermediary;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class IntermediaryShowWorkspaceTest extends TestCase
{
    use RefreshDatabase;

    public function test_show_workspace_tabs_receive_real_backend_data(): void
    {
        $company = Company::factory()->create();
        $user = $this->userFor($company);

        $intermediary = Intermediary::query()->create([
            'company_id' => $company->id,
            'branch_id' => null,
            'code' => 'INT-SHOW-0001',
            'name' => 'Agence Intermédiaire Démo',
            'type' => 'agency',
            'phone' => '+212 5 00 00 00 00',
            'email' => 'intermediary@example.test',
            'notes' => 'Workspace verification record.',
            'is_active' => true,
        ]);

        $client = Client::factory()->create([
            'company_id' => $company->id,
            'branch_id' => null,
            'intermediary_id' => $intermediary->id,
            'full_name' => 'Client Intermédiaire Démo',
            'status' => 'active',
        ]);

        $dossier = Dossier::factory()->create([
            'company_id' => $company->id,
            'branch_id' => null,
            'client_id' => $client->id,
            'project_object' => 'Projet Intermédiaire Démo',
            'commune' => 'Agadir',
            'status' => 'active',
        ]);

        foreach (['overview', 'clients', 'projects', 'analytics', 'activity'] as $tab) {
            $this->actingAs($user)
                ->get(route('intermediaries.show', [
                    'intermediary' => $intermediary,
                    'tab' => $tab,
                ]))
                ->assertOk()
                ->assertInertia(fn (Assert $page) => $page
                    ->component('Intermediaries/Show')
                    ->where('intermediary.id', $intermediary->id)
                    ->where('metrics.totalClients', 1)
                    ->where('metrics.activeClients', 1)
                    ->where('metrics.totalProjects', 1)
                    ->where('metrics.activeProjects', 1)
                    ->has('monthlyClients', 1)
                    ->has('monthlyProjects', 1)
                    ->has('clientStatusBreakdown', 3)
                    ->has('projectStatusBreakdown', 1)
                    ->has('clients', 1, fn (Assert $clientItem) => $clientItem
                        ->where('id', $client->id)
                        ->where('fullName', $client->full_name)
                        ->where('projectsCount', 1)
                        ->etc())
                    ->has('projects', 1, fn (Assert $projectItem) => $projectItem
                        ->where('id', $dossier->id)
                        ->where('projectObject', $dossier->project_object)
                        ->where('clientName', $client->full_name)
                        ->etc())
                    ->has('activity', 3)
                    ->where('activity.0.occurredAtHuman', fn ($value) => is_string($value) && $value !== '')
                    ->etc());
        }
    }

    public function test_foreign_company_cannot_open_intermediary_show(): void
    {
        $companyA = Company::factory()->create();
        $companyB = Company::factory()->create();
        $user = $this->userFor($companyA);

        $foreignIntermediary = Intermediary::query()->create([
            'company_id' => $companyB->id,
            'branch_id' => null,
            'code' => 'INT-FOREIGN-0001',
            'name' => 'Foreign Intermediary',
            'type' => 'person',
            'is_active' => true,
        ]);

        $this->actingAs($user)
            ->get(route('intermediaries.show', $foreignIntermediary))
            ->assertForbidden();
    }

    private function userFor(Company $company): User
    {
        $permission = Permission::findOrCreate('manage clients', 'web');
        $role = Role::findOrCreate('intermediary_show_manager', 'web');
        $role->syncPermissions([$permission]);

        return tap(User::factory()->create([
            'company_id' => $company->id,
            'branch_id' => null,
        ]), fn (User $user) => $user->assignRole($role));
    }
}
