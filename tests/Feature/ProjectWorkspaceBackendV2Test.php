<?php

namespace Tests\Feature;

use App\Enums\PaymentKind;
use App\Models\Branch;
use App\Models\City;
use App\Models\Client;
use App\Models\Company;
use App\Models\Dossier;
use App\Models\FinanceDocument;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ProjectWorkspaceBackendV2Test extends TestCase
{
    use RefreshDatabase;

    public function test_index_and_show_use_current_finance_data_inside_company_and_branch_scope(): void
    {
        $company = Company::factory()->create();
        $branch = $this->branch($company, 'MAIN');
        $otherBranch = $this->branch($company, 'OTHER');
        $user = $this->userWithPermissions($company, $branch, [
            'dossiers.view',
            'dossiers.update',
            'dossiers.workflow.update',
            'documents.view',
            'documents.download',
            'contracts.view',
            'finance.view',
            'archive.view',
            'project-design.view',
        ]);

        $city = $this->city('Marrakech', 'RAK-V2');
        $client = Client::factory()->create([
            'company_id' => $company->id,
            'branch_id' => $branch->id,
        ]);

        $project = Dossier::factory()->create([
            'company_id' => $company->id,
            'branch_id' => $branch->id,
            'client_id' => $client->id,
            'city_id' => $city->id,
            'dossier_number' => 'DOS-V2-0001',
            'project_object' => 'Projects Backend V2',
            'status' => 'active',
        ]);

        $otherClient = Client::factory()->create([
            'company_id' => $company->id,
            'branch_id' => $otherBranch->id,
        ]);

        Dossier::factory()->create([
            'company_id' => $company->id,
            'branch_id' => $otherBranch->id,
            'client_id' => $otherClient->id,
            'city_id' => $city->id,
            'dossier_number' => 'DOS-V2-HIDDEN',
            'project_object' => 'Other Branch Project',
        ]);

        $invoice = FinanceDocument::query()->create([
            'company_id' => $company->id,
            'branch_id' => $branch->id,
            'client_id' => $client->id,
            'dossier_id' => $project->id,
            'type' => 'invoice',
            'number' => 'FAC-V2-0001',
            'status' => 'partially_paid',
            'issue_date' => now()->toDateString(),
            'currency' => 'MAD',
            'total_ttc' => 12000,
            'paid_total' => 4000,
            'remaining_total' => 8000,
            'created_by' => $user->id,
        ]);

        Payment::query()->create([
            'company_id' => $company->id,
            'branch_id' => $branch->id,
            'finance_document_id' => $invoice->id,
            'payment_kind' => PaymentKind::Invoice->value,
            'client_id' => $client->id,
            'dossier_id' => $project->id,
            'payment_number' => 'PAY-V2-0001',
            'amount' => 4000,
            'method' => 'bank_transfer',
            'paid_at' => now()->toDateString(),
            'created_by' => $user->id,
        ]);

        Payment::query()->create([
            'company_id' => $company->id,
            'branch_id' => $branch->id,
            'finance_document_id' => null,
            'payment_kind' => PaymentKind::Advance->value,
            'client_id' => $client->id,
            'dossier_id' => $project->id,
            'payment_number' => 'ADV-V2-0001',
            'amount' => 1500,
            'method' => 'cash',
            'paid_at' => now()->subDay()->toDateString(),
            'created_by' => $user->id,
        ]);

        $this->actingAs($user)
            ->get(route('dossiers.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dossiers/Index')
                ->has('dossiers', 1)
                ->where('dossiers.0.id', $project->id)
                ->where('dossiers.0.financeDocumentsCount', 1)
                ->where('dossiers.0.financeRecordsCount', 1)
                ->where('metrics.financeDocumentsTotal', 1)
                ->where('capabilities.canViewFinance', true)
            );

        $this->actingAs($user)
            ->get(route('dossiers.show', $project))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dossiers/Show')
                ->where('dossier.id', $project->id)
                ->where('capabilities.canViewFinance', true)
                ->has('financeDocuments', 1)
                ->where('financeDocuments.0.number', 'FAC-V2-0001')
                ->has('financeRecords', 1)
                ->where('financeRecords.0.recordNumber', 'FAC-V2-0001')
                ->has('payments', 2)
                ->where('finance.summary.totalTtc', 12000)
                ->where('finance.summary.paidTotal', 4000)
                ->where('finance.summary.remainingTotal', 8000)
                ->where('finance.summary.unappliedAdvancesTotal', 1500)
                ->has('finance.advances', 1)
                ->where('finance.eligibility.canCreateInvoice', false)
                ->where('activity', fn ($items) => collect($items)
                    ->pluck('type')
                    ->contains('payment_recorded')
                    && collect($items)->pluck('type')->contains('advance_recorded'))
            );
    }

    public function test_finance_payload_and_counts_are_not_exposed_without_finance_permission(): void
    {
        $company = Company::factory()->create();
        $branch = $this->branch($company, 'NOFIN');
        $user = $this->userWithPermissions($company, $branch, [
            'dossiers.view',
        ]);

        $city = $this->city('Agadir', 'AGA-V2');
        $client = Client::factory()->create([
            'company_id' => $company->id,
            'branch_id' => $branch->id,
        ]);

        $project = Dossier::factory()->create([
            'company_id' => $company->id,
            'branch_id' => $branch->id,
            'client_id' => $client->id,
            'city_id' => $city->id,
        ]);

        FinanceDocument::query()->create([
            'company_id' => $company->id,
            'branch_id' => $branch->id,
            'client_id' => $client->id,
            'dossier_id' => $project->id,
            'type' => 'invoice',
            'number' => 'FAC-PRIVATE-0001',
            'status' => 'draft',
            'currency' => 'MAD',
            'total_ttc' => 9000,
            'paid_total' => 0,
            'remaining_total' => 9000,
        ]);

        $this->actingAs($user)
            ->get(route('dossiers.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('dossiers.0.financeDocumentsCount', 0)
                ->where('dossiers.0.financeRecordsCount', 0)
                ->where('metrics.financeDocumentsTotal', 0)
                ->where('capabilities.canViewFinance', false)
            );

        $this->actingAs($user)
            ->get(route('dossiers.show', $project))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('capabilities.canViewFinance', false)
                ->where('finance', null)
                ->has('financeDocuments', 0)
                ->has('financeRecords', 0)
                ->has('payments', 0)
                ->has('financeDossiers', 0)
                ->where('activity', fn ($items) => collect($items)
                    ->pluck('category')
                    ->doesntContain('finance'))
            );
    }

    public function test_update_supports_city_and_only_honours_safe_local_return_paths(): void
    {
        $company = Company::factory()->create();
        $branch = $this->branch($company, 'EDIT');
        $user = $this->userWithPermissions($company, $branch, [
            'dossiers.view',
            'dossiers.update',
        ]);

        $firstCity = $this->city('Rabat', 'RBT-V2');
        $secondCity = $this->city('Casablanca', 'CAS-V2');
        $client = Client::factory()->create([
            'company_id' => $company->id,
            'branch_id' => $branch->id,
        ]);

        $project = Dossier::factory()->create([
            'company_id' => $company->id,
            'branch_id' => $branch->id,
            'client_id' => $client->id,
            'city_id' => $firstCity->id,
            'project_object' => 'Before Update',
        ]);

        $safeReturn = "/dossiers/{$project->id}?tab=notes";

        $this->actingAs($user)
            ->put(route('dossiers.update', $project), $this->updatePayload(
                $client,
                $secondCity,
                'After Safe Update',
                $safeReturn,
            ))
            ->assertRedirect($safeReturn);

        $this->assertDatabaseHas('dossiers', [
            'id' => $project->id,
            'city_id' => $secondCity->id,
            'project_object' => 'After Safe Update',
        ]);

        $this->actingAs($user)
            ->put(route('dossiers.update', $project), $this->updatePayload(
                $client,
                $secondCity,
                'After Unsafe Update',
                '//evil.example/steal',
            ))
            ->assertRedirect(route('dossiers.index'));
    }

    public function test_company_and_branch_boundaries_block_direct_project_access(): void
    {
        $company = Company::factory()->create();
        $otherCompany = Company::factory()->create();
        $branch = $this->branch($company, 'A');
        $otherBranch = $this->branch($company, 'B');
        $foreignBranch = $this->branch($otherCompany, 'C');

        $user = $this->userWithPermissions($company, $branch, [
            'dossiers.view',
        ]);

        $sameCompanyOtherBranchClient = Client::factory()->create([
            'company_id' => $company->id,
            'branch_id' => $otherBranch->id,
        ]);

        $foreignCompanyClient = Client::factory()->create([
            'company_id' => $otherCompany->id,
            'branch_id' => $foreignBranch->id,
        ]);

        $otherBranchProject = Dossier::factory()->create([
            'company_id' => $company->id,
            'branch_id' => $otherBranch->id,
            'client_id' => $sameCompanyOtherBranchClient->id,
        ]);

        $foreignCompanyProject = Dossier::factory()->create([
            'company_id' => $otherCompany->id,
            'branch_id' => $foreignBranch->id,
            'client_id' => $foreignCompanyClient->id,
        ]);

        $this->actingAs($user)
            ->get(route('dossiers.show', $otherBranchProject))
            ->assertForbidden();

        $this->actingAs($user)
            ->get(route('dossiers.show', $foreignCompanyProject))
            ->assertForbidden();
    }

    private function branch(Company $company, string $code): Branch
    {
        return Branch::query()->create([
            'company_id' => $company->id,
            'name' => 'Branch '.$code,
            'code' => $code,
            'is_active' => true,
        ]);
    }

    private function city(string $name, string $code): City
    {
        return City::query()->create([
            'name' => $name,
            'code' => $code,
            'color' => '#C9A227',
            'is_active' => true,
        ]);
    }

    private function userWithPermissions(
        Company $company,
        Branch $branch,
        array $permissionNames,
    ): User {
        $permissions = collect($permissionNames)
            ->map(fn (string $name) => Permission::findOrCreate($name, 'web'));

        $roleName = 'project_backend_v2_'.substr(md5(implode('|', $permissionNames)), 0, 12);
        $role = Role::findOrCreate($roleName, 'web');
        $role->syncPermissions($permissions);

        return tap(User::factory()->create([
            'company_id' => $company->id,
            'branch_id' => $branch->id,
        ]), fn (User $user) => $user->assignRole($role));
    }

    private function updatePayload(
        Client $client,
        City $city,
        string $projectObject,
        string $returnTo,
    ): array {
        return [
            'client_id' => $client->id,
            'city_id' => $city->id,
            'project_object' => $projectObject,
            'description' => null,
            'project_address' => null,
            'province' => null,
            'commune' => null,
            'land_title_number' => null,
            'land_surface' => null,
            'floor_area' => null,
            'status' => 'active',
            'workflow_step' => 'client',
            'opened_at' => now()->toDateString(),
            'closed_at' => null,
            'notes' => null,
            'return_to' => $returnTo,
        ];
    }
}
