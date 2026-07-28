<?php

namespace Tests\Feature;

use App\Models\ArchiveRecord;
use App\Models\City;
use App\Models\Client;
use App\Models\Company;
use App\Models\Contract;
use App\Models\Dossier;
use App\Models\DossierDocument;
use App\Models\DossierWorkflowRequirementHistory;
use App\Models\FinanceDocument;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ProjectWorkspaceTest extends TestCase
{
    use RefreshDatabase;

    public function test_project_index_uses_scoped_backend_data_and_current_finance_counts(): void
    {
        [$companyA, $companyB, $user, $ownClient, $foreignClient] = $this->tenantFixture();

        $city = City::query()->create([
            'name' => 'Marrakech',
            'code' => 'RAK',
            'color' => '#C9A227',
            'is_active' => true,
        ]);

        $ownProject = Dossier::factory()->create([
            'company_id' => $companyA->id,
            'branch_id' => null,
            'client_id' => $ownClient->id,
            'city_id' => $city->id,
            'dossier_number' => 'DOS-PROJECT-OWN',
            'project_object' => 'Visible Project Workspace',
            'province' => 'Marrakech-Safi',
            'commune' => 'Marrakech',
            'status' => 'active',
            'updated_at' => now(),
        ]);

        Dossier::factory()->create([
            'company_id' => $companyB->id,
            'branch_id' => null,
            'client_id' => $foreignClient->id,
            'city_id' => $city->id,
            'dossier_number' => 'DOS-PROJECT-HIDDEN',
            'project_object' => 'Hidden Foreign Project',
            'province' => 'Marrakech-Safi',
            'commune' => 'Marrakech',
            'status' => 'active',
        ]);

        DossierDocument::query()->create([
            'dossier_id' => $ownProject->id,
            'document_number' => 'DOC-PROJECT-0001',
            'original_filename' => 'project-plan.pdf',
            'status' => 'uploaded',
            'uploaded_at' => now(),
        ]);

        FinanceDocument::query()->create([
            'company_id' => $companyA->id,
            'branch_id' => null,
            'client_id' => $ownClient->id,
            'dossier_id' => $ownProject->id,
            'type' => 'invoice',
            'number' => 'FAC-PROJECT-0001',
            'status' => 'partially_paid',
            'issue_date' => now()->toDateString(),
            'currency' => 'MAD',
            'total_ttc' => 12000,
            'paid_total' => 4000,
            'remaining_total' => 8000,
        ]);

        Contract::query()->create([
            'dossier_id' => $ownProject->id,
            'contract_number' => 'CTR-PROJECT-0001',
            'status' => 'generated',
            'surface' => 180,
            'price_per_square_meter' => 120,
            'fee_rate_percent' => 5,
            'calculation_mode' => 'percentage',
            'forfait_ttc' => 0,
            'ht' => 10000,
            'tva' => 2000,
            'ttc' => 12000,
            'generated_at' => now(),
        ]);

        ArchiveRecord::query()->create([
            'dossier_id' => $ownProject->id,
            'archive_number' => 'ARC-PROJECT-0001',
            'status' => 'stored',
            'room' => 'A',
            'shelf' => 'S1',
            'box' => 'B1',
            'folder' => 'F1',
            'in_date' => now()->toDateString(),
            'is_lost' => false,
        ]);

        $this->actingAs($user)
            ->get(route('dossiers.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dossiers/Index')
                ->has('dossiers', 1)
                ->where('dossiers.0.id', $ownProject->id)
                ->where('dossiers.0.projectObject', 'Visible Project Workspace')
                ->where('dossiers.0.documentsCount', 1)
                ->where('dossiers.0.financeDocumentsCount', 1)
                ->where('dossiers.0.hasContract', true)
                ->where('dossiers.0.hasArchiveRecord', true)
                ->where('metrics.total', 1)
                ->where('metrics.documentsTotal', 1)
                ->where('metrics.financeDocumentsTotal', 1)
                ->has('monthlyProjects')
                ->has('locationGroups')
                ->where('dossiers', fn (array $rows) => collect($rows)
                    ->pluck('projectObject')
                    ->doesntContain('Hidden Foreign Project'))
            );
    }

    public function test_project_show_tabs_receive_real_backend_data(): void
    {
        [$companyA, , $user, $ownClient] = $this->tenantFixture();

        $city = City::query()->create([
            'name' => 'Agadir',
            'code' => 'AGA',
            'color' => '#3B82F6',
            'is_active' => true,
        ]);

        $project = Dossier::factory()->create([
            'company_id' => $companyA->id,
            'branch_id' => null,
            'client_id' => $ownClient->id,
            'city_id' => $city->id,
            'dossier_number' => 'DOS-SHOW-0001',
            'project_object' => 'Backend Connected Project',
            'province' => 'Souss-Massa',
            'commune' => 'Agadir',
            'notes' => 'Project notes from backend.',
            'status' => 'active',
            'workflow_step' => 'documents',
        ]);

        DossierDocument::query()->create([
            'dossier_id' => $project->id,
            'document_number' => 'DOC-SHOW-0001',
            'original_filename' => 'permit.pdf',
            'status' => 'verified',
            'uploaded_at' => now()->subDay(),
            'verified_at' => now(),
        ]);

        $contract = Contract::query()->create([
            'dossier_id' => $project->id,
            'contract_number' => 'CTR-SHOW-0001',
            'status' => 'signed',
            'surface' => 200,
            'price_per_square_meter' => 100,
            'fee_rate_percent' => 5,
            'calculation_mode' => 'percentage',
            'forfait_ttc' => 0,
            'ht' => 10000,
            'tva' => 2000,
            'ttc' => 12000,
            'generated_at' => now()->subDay(),
            'signed_at' => now(),
        ]);

        $financeDocument = FinanceDocument::query()->create([
            'company_id' => $companyA->id,
            'branch_id' => null,
            'client_id' => $ownClient->id,
            'dossier_id' => $project->id,
            'type' => 'invoice',
            'number' => 'FAC-SHOW-0001',
            'status' => 'partially_paid',
            'issue_date' => now()->subDays(3)->toDateString(),
            'due_date' => now()->addDays(30)->toDateString(),
            'currency' => 'MAD',
            'total_ttc' => 12000,
            'paid_total' => 4000,
            'remaining_total' => 8000,
            'generated_at' => now()->subDays(2),
        ]);

        Payment::query()->create([
            'company_id' => $companyA->id,
            'branch_id' => null,
            'finance_document_id' => $financeDocument->id,
            'payment_kind' => 'invoice',
            'client_id' => $ownClient->id,
            'dossier_id' => $project->id,
            'payment_number' => 'PAY-SHOW-0001',
            'amount' => 4000,
            'method' => 'bank_transfer',
            'reference' => 'TRANSFER-0001',
            'paid_at' => now()->toDateString(),
            'created_by' => $user->id,
        ]);

        ArchiveRecord::query()->create([
            'dossier_id' => $project->id,
            'archive_number' => 'ARC-SHOW-0001',
            'status' => 'stored',
            'room' => 'R1',
            'shelf' => 'S2',
            'box' => 'B3',
            'folder' => 'F4',
            'in_date' => now()->toDateString(),
            'is_lost' => false,
        ]);

        DossierWorkflowRequirementHistory::query()->create([
            'dossier_id' => $project->id,
            'step_key' => 'documents',
            'requirement_key' => 'cin',
            'old_is_done' => false,
            'new_is_done' => true,
            'changed_by' => $user->id,
            'changed_at' => now(),
        ]);

        $this->actingAs($user)
            ->get(route('dossiers.show', $project))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dossiers/Show')
                ->where('dossier.id', $project->id)
                ->where('dossier.projectObject', 'Backend Connected Project')
                ->where('dossier.notes', 'Project notes from backend.')
                ->has('workflow.steps')
                ->has('documents', 1)
                ->where('documents.0.documentNumber', 'DOC-SHOW-0001')
                ->where('contract.id', $contract->id)
                ->where('contract.contractNumber', 'CTR-SHOW-0001')
                ->has('financeDocuments', 1)
                ->where('financeDocuments.0.number', 'FAC-SHOW-0001')
                ->where('financeDocuments.0.totalTtc', 12000.0)
                ->has('payments', 1)
                ->where('payments.0.paymentNumber', 'PAY-SHOW-0001')
                ->where('archiveRecord.archiveNumber', 'ARC-SHOW-0001')
                ->has('activity')
                ->where('activity', fn (array $items) => $this->activityContains(
                    $items,
                    ['project_created', 'workflow_updated', 'document_created', 'contract_created', 'finance_document_created', 'payment_recorded', 'archive_created'],
                ))
                ->has('clients')
                ->has('cities')
                ->has('dossiers')
                ->has('templates')
            );

        foreach (['overview', 'workflow', 'project-design', 'documents', 'contract', 'finance', 'notes', 'activity'] as $tab) {
            $this->actingAs($user)
                ->get(route('dossiers.show', ['dossier' => $project, 'tab' => $tab]))
                ->assertOk()
                ->assertInertia(fn (Assert $page) => $page
                    ->component('Dossiers/Show')
                    ->where('dossier.id', $project->id)
                );
        }
    }

    public function test_project_edit_updates_city_and_returns_to_the_selected_tab(): void
    {
        [$companyA, , $user, $ownClient] = $this->tenantFixture();

        $firstCity = City::query()->create([
            'name' => 'Marrakech',
            'code' => 'RAK-EDIT',
            'color' => '#C9A227',
            'is_active' => true,
        ]);
        $secondCity = City::query()->create([
            'name' => 'Casablanca',
            'code' => 'CAS-EDIT',
            'color' => '#2563EB',
            'is_active' => true,
        ]);

        $project = Dossier::factory()->create([
            'company_id' => $companyA->id,
            'branch_id' => null,
            'client_id' => $ownClient->id,
            'city_id' => $firstCity->id,
            'dossier_number' => 'DOS-EDIT-0001',
            'project_object' => 'Project Before Edit',
            'status' => 'active',
            'workflow_step' => 'documents',
            'opened_at' => '2026-07-01',
        ]);

        $returnTo = "/dossiers/{$project->id}?tab=notes";

        $this->actingAs($user)
            ->put(route('dossiers.update', $project), [
                'client_id' => $ownClient->id,
                'city_id' => $secondCity->id,
                'project_object' => 'Project After Edit',
                'description' => 'Updated description',
                'project_address' => 'Updated address',
                'province' => 'Casablanca-Settat',
                'commune' => 'Casablanca',
                'land_title_number' => 'TF-EDIT-01',
                'land_surface' => 300,
                'floor_area' => 220,
                'status' => 'active',
                'workflow_step' => 'documents',
                'opened_at' => '2026-07-01',
                'closed_at' => null,
                'notes' => 'Updated notes',
                'return_to' => $returnTo,
            ])
            ->assertRedirect($returnTo);

        $this->assertDatabaseHas('dossiers', [
            'id' => $project->id,
            'city_id' => $secondCity->id,
            'project_object' => 'Project After Edit',
            'status' => 'active',
            'workflow_step' => 'documents',
            'notes' => 'Updated notes',
        ]);
    }

    public function test_foreign_company_cannot_open_project_workspace(): void
    {
        [$companyA, $companyB, $user, , $foreignClient] = $this->tenantFixture();

        $foreignProject = Dossier::factory()->create([
            'company_id' => $companyB->id,
            'branch_id' => null,
            'client_id' => $foreignClient->id,
            'dossier_number' => 'DOS-FOREIGN-0001',
            'project_object' => 'Foreign Project',
        ]);

        $this->assertNotSame($companyA->id, $foreignProject->company_id);

        $this->actingAs($user)
            ->get(route('dossiers.show', $foreignProject))
            ->assertForbidden();
    }

    private function tenantFixture(): array
    {
        $companyA = Company::factory()->create();
        $companyB = Company::factory()->create();
        $user = $this->userFor($companyA, ['manage dossiers', 'manage documents']);
        $ownClient = Client::factory()->create([
            'company_id' => $companyA->id,
            'branch_id' => null,
        ]);
        $foreignClient = Client::factory()->create([
            'company_id' => $companyB->id,
            'branch_id' => null,
        ]);

        return [$companyA, $companyB, $user, $ownClient, $foreignClient];
    }

    private function userFor(Company $company, array $permissions): User
    {
        $permissionModels = collect($permissions)
            ->map(fn (string $name) => Permission::findOrCreate($name, 'web'));
        $role = Role::findOrCreate('project_workspace_manager', 'web');
        $role->syncPermissions($permissionModels);

        return tap(User::factory()->create([
            'company_id' => $company->id,
            'branch_id' => null,
        ]), fn (User $user) => $user->assignRole($role));
    }

    private function activityContains(array $items, array $expectedTypes): bool
    {
        $types = collect($items)->pluck('type');

        return collect($expectedTypes)->every(
            fn (string $type) => $types->contains($type),
        );
    }
}
