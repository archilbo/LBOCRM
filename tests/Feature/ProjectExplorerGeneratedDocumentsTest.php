<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\City;
use App\Models\Client;
use App\Models\Company;
use App\Models\Contract;
use App\Models\Dossier;
use App\Models\DossierDocument;
use App\Models\ProjectEfficiencySheet;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * STEP 0 — Shared Project Document Explorer: the single `explorerDocuments`
 * aggregator must expose every generated file (uploaded project documents,
 * current contract DOCX/PDF, current efficiency-sheet DOCX/PDF) without
 * copying files, duplicating rows or leaking storage paths.
 */
class ProjectExplorerGeneratedDocumentsTest extends TestCase
{
    use RefreshDatabase;

    private function projectWithArtifacts(
        Company $company,
        Branch $branch,
        City $city,
        User $user,
        string $number,
        bool $ficheWithPdf = true,
        ?int $ficheVersion = 2,
    ): Dossier {
        $client = Client::factory()->create([
            'company_id' => $company->id,
            'branch_id' => $branch->id,
        ]);

        $project = Dossier::factory()->create([
            'company_id' => $company->id,
            'branch_id' => $branch->id,
            'client_id' => $client->id,
            'city_id' => $city->id,
            'dossier_number' => $number,
            'project_object' => 'Explorer Step 0',
            'status' => 'active',
        ]);

        Contract::query()->create([
            'dossier_id' => $project->id,
            'contract_number' => 'CTR-'.$number,
            'status' => 'generated',
            'generated_document_path' => 'contracts/CTR-'.$number.'.docx',
            'pdf_path' => 'contracts/CTR-'.$number.'.pdf',
            'generated_at' => now(),
        ]);

        ProjectEfficiencySheet::factory()->create([
            'dossier_id' => $project->id,
            'status' => 'generated',
            'version' => $ficheVersion,
            'docx_path' => 'fiches/Fiche_v'.$ficheVersion.'.docx',
            'pdf_path' => $ficheWithPdf ? 'fiches/Fiche_v'.$ficheVersion.'.pdf' : null,
            'generated_at' => now(),
        ]);

        return $project;
    }

    public function test_explorer_exposes_uploaded_contract_and_efficiency_sheet_files(): void
    {
        $company = Company::factory()->create();
        $branch = $this->branch($company, 'MAIN');
        $user = $this->userWithPermissions($company, $branch, [
            'dossiers.view',
            'documents.view',
            'documents.download',
            'contracts.view',
            'projects.efficiency_sheet.view',
        ]);
        $city = $this->city('Marrakech', 'RAK-V2');

        $project = $this->projectWithArtifacts($company, $branch, $city, $user, 'DOS-EXP-0001');
        $upload = DossierDocument::query()->create([
            'dossier_id' => $project->id,
            'document_number' => 'DOC-EXP-0001',
            'status' => 'uploaded',
            'original_filename' => 'plan.pdf',
            'mime_type' => 'application/pdf',
            'size_bytes' => 2048,
            'stored_path' => 'private/tests/plan.pdf',
        ]);

        $contractKey = 'contract:'.$project->contract->id;
        $ficheKey = 'efficiency_sheet:'.$project->efficiencySheet->id;

        $this->actingAs($user)
            ->get(route('dossiers.show', $project))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dossiers/Show')
                ->has('explorerDocuments', 5)
                ->where('explorerDocuments.0.key', 'project:'.$upload->id)
                ->where('explorerDocuments.0.sourceType', 'project')
                ->where('explorerDocuments.0.generated', false)
                ->where('explorerDocuments.0.version', null)
                ->where('explorerDocuments.0.canDelete', false)
                ->where('explorerDocuments.1.key', $contractKey.':docx')
                ->where('explorerDocuments.1.sourceType', 'contract')
                ->where('explorerDocuments.1.sourceLabel', 'Contrat')
                ->where('explorerDocuments.1.generated', true)
                ->where('explorerDocuments.1.version', null)
                ->where('explorerDocuments.1.extension', 'docx')
                ->where('explorerDocuments.1.canPreview', false)
                ->where('explorerDocuments.1.canDelete', false)
                ->where('explorerDocuments.1.downloadUrl', fn (string $url) => str_contains($url, 'contract'))
                ->where('explorerDocuments.2.key', $contractKey.':pdf')
                ->where('explorerDocuments.2.extension', 'pdf')
                ->where('explorerDocuments.3.key', $ficheKey.':v2:docx')
                ->where('explorerDocuments.3.sourceType', 'efficiency_sheet')
                ->where('explorerDocuments.3.sourceLabel', 'Fiche efficacité')
                ->where('explorerDocuments.3.generated', true)
                ->where('explorerDocuments.3.version', 2)
                ->where('explorerDocuments.3.extension', 'docx')
                ->where('explorerDocuments.3.canPreview', false)
                ->where('explorerDocuments.3.canDelete', false)
                ->where('explorerDocuments.3.downloadUrl', fn (string $url) => str_contains($url, 'efficiency-sheet'))
                ->where('explorerDocuments.4.key', $ficheKey.':v2:pdf')
                ->where('explorerDocuments.4.extension', 'pdf')
                ->where('explorerDocuments.4.canPreview', true)
                ->where('explorerDocuments.4.viewUrl', fn (string $url) => str_contains($url, 'efficiency-sheet'))
                ->where('explorerDocuments.4.printUrl', fn (string $url) => str_contains($url, 'efficiency-sheet'))
                ->where('explorerDocuments.4.downloadUrl', fn (string $url) => str_contains($url, 'efficiency-sheet'))
            );
    }

    public function test_efficiency_sheet_pdf_artifact_only_appears_when_pdf_exists(): void
    {
        $company = Company::factory()->create();
        $branch = $this->branch($company, 'MAIN');
        $user = $this->userWithPermissions($company, $branch, [
            'dossiers.view',
            'documents.view',
            'contracts.view',
            'projects.efficiency_sheet.view',
        ]);
        $city = $this->city('Marrakech', 'RAK-V2');

        $project = $this->projectWithArtifacts($company, $branch, $city, $user, 'DOS-EXP-0002', ficheWithPdf: false);
        $ficheKey = 'efficiency_sheet:'.$project->efficiencySheet->id;

        $this->actingAs($user)
            ->get(route('dossiers.show', $project))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dossiers/Show')
                ->has('explorerDocuments', 3)
                ->where('explorerDocuments.2.key', $ficheKey.':v2:docx')
                ->where('explorerDocuments', fn ($docs) => collect($docs)
                    ->pluck('key')
                    ->doesntContain($ficheKey.':v2:pdf'))
            );
    }

    public function test_draft_efficiency_sheet_without_paths_is_not_exposed(): void
    {
        $company = Company::factory()->create();
        $branch = $this->branch($company, 'MAIN');
        $user = $this->userWithPermissions($company, $branch, [
            'dossiers.view',
            'documents.view',
            'contracts.view',
            'projects.efficiency_sheet.view',
        ]);
        $city = $this->city('Marrakech', 'RAK-V2');

        $project = $this->projectWithArtifacts($company, $branch, $city, $user, 'DOS-EXP-0004', ficheWithPdf: true);
        $project->efficiencySheet->update([
            'status' => 'draft',
            'docx_path' => null,
            'pdf_path' => null,
        ]);

        $this->actingAs($user)
            ->get(route('dossiers.show', $project))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dossiers/Show')
                ->has('explorerDocuments', 2)
                ->where('explorerDocuments', fn ($docs) => collect($docs)
                    ->pluck('key')
                    ->every(fn (string $key) => ! str_starts_with($key, 'efficiency_sheet:')))
            );
    }

    public function test_payload_never_exposes_storage_paths(): void
    {
        $company = Company::factory()->create();
        $branch = $this->branch($company, 'MAIN');
        $user = $this->userWithPermissions($company, $branch, [
            'dossiers.view',
            'documents.view',
            'contracts.view',
            'projects.efficiency_sheet.view',
        ]);
        $city = $this->city('Marrakech', 'RAK-V2');

        $project = $this->projectWithArtifacts($company, $branch, $city, $user, 'DOS-EXP-0005');
        DossierDocument::query()->create([
            'dossier_id' => $project->id,
            'document_number' => 'DOC-EXP-0005',
            'status' => 'uploaded',
            'original_filename' => 'plan.pdf',
            'mime_type' => 'application/pdf',
            'size_bytes' => 2048,
            'stored_path' => 'private/tests/plan.pdf',
        ]);

        $forbiddenKeys = ['docx_path', 'pdf_path', 'generated_document_path', 'stored_path', 'storage_path', 'path'];

        $this->actingAs($user)
            ->get(route('dossiers.show', $project))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dossiers/Show')
                ->where('explorerDocuments', fn ($docs) => collect($docs)
                    ->every(fn (array $entry) => collect($forbiddenKeys)
                        ->every(fn (string $key) => ! array_key_exists($key, $entry))))
                ->where('explorerDocuments.1.storageLocation', null)
            );
    }

    public function test_explorer_is_strictly_scoped_to_the_current_project(): void
    {
        $company = Company::factory()->create();
        $branch = $this->branch($company, 'MAIN');
        $user = $this->userWithPermissions($company, $branch, [
            'dossiers.view',
            'documents.view',
            'contracts.view',
            'projects.efficiency_sheet.view',
        ]);
        $city = $this->city('Marrakech', 'RAK-V2');

        $project = $this->projectWithArtifacts($company, $branch, $city, $user, 'DOS-EXP-0006');
        $other = $this->projectWithArtifacts($company, $branch, $city, $user, 'DOS-EXP-0007');

        $foreignCompany = Company::factory()->create();
        $foreignBranch = $this->branch($foreignCompany, 'MAIN');
        $foreignCity = $this->city('Agadir', 'AGA-V2');
        $foreignClient = Client::factory()->create([
            'company_id' => $foreignCompany->id,
            'branch_id' => $foreignBranch->id,
        ]);
        $foreignProject = Dossier::factory()->create([
            'company_id' => $foreignCompany->id,
            'branch_id' => $foreignBranch->id,
            'client_id' => $foreignClient->id,
            'city_id' => $foreignCity->id,
            'dossier_number' => 'DOS-EXP-FOREIGN',
            'project_object' => 'Foreign Tenant Project',
            'status' => 'active',
        ]);

        $foreignKeys = [
            'contract:'.$other->contract->id.':docx',
            'contract:'.$other->contract->id.':pdf',
            'efficiency_sheet:'.$other->efficiencySheet->id.':v2:docx',
            'efficiency_sheet:'.$other->efficiencySheet->id.':v2:pdf',
        ];

        $this->actingAs($user)
            ->get(route('dossiers.show', $project))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dossiers/Show')
                ->has('explorerDocuments', 4)
                ->where('explorerDocuments', fn ($docs) => collect($docs)
                    ->pluck('key')
                    ->intersect($foreignKeys)
                    ->isEmpty())
            );

        $this->actingAs($user)
            ->get(route('dossiers.show', $other))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dossiers/Show')
                ->has('explorerDocuments', 4)
                ->where('explorerDocuments.3.key', 'efficiency_sheet:'.$other->efficiencySheet->id.':v2:pdf')
            );

        $this->actingAs($user)
            ->get(route('dossiers.show', $foreignProject))
            ->assertForbidden();
    }

    public function test_efficiency_sheet_artifacts_hidden_without_view_permission(): void
    {
        $company = Company::factory()->create();
        $branch = $this->branch($company, 'MAIN');
        $user = $this->userWithPermissions($company, $branch, [
            'dossiers.view',
            'documents.view',
            'contracts.view',
        ]);
        $city = $this->city('Marrakech', 'RAK-V2');

        $project = $this->projectWithArtifacts($company, $branch, $city, $user, 'DOS-EXP-0008');

        $this->actingAs($user)
            ->get(route('dossiers.show', $project))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dossiers/Show')
                ->where('capabilities.canViewEfficiencySheet', false)
                ->has('explorerDocuments', 2)
                ->where('explorerDocuments', fn ($docs) => collect($docs)
                    ->pluck('key')
                    ->every(fn (string $key) => ! str_starts_with($key, 'efficiency_sheet:')))
            );
    }

    public function test_explorer_reads_never_create_or_modify_rows(): void
    {
        $company = Company::factory()->create();
        $branch = $this->branch($company, 'MAIN');
        $user = $this->userWithPermissions($company, $branch, [
            'dossiers.view',
            'documents.view',
            'contracts.view',
            'projects.efficiency_sheet.view',
        ]);
        $city = $this->city('Marrakech', 'RAK-V2');

        $project = $this->projectWithArtifacts($company, $branch, $city, $user, 'DOS-EXP-0009');
        DossierDocument::query()->create([
            'dossier_id' => $project->id,
            'document_number' => 'DOC-EXP-0009',
            'status' => 'uploaded',
            'original_filename' => 'plan.pdf',
            'mime_type' => 'application/pdf',
            'size_bytes' => 2048,
            'stored_path' => 'private/tests/plan.pdf',
        ]);

        $fiche = $project->efficiencySheet;

        $this->actingAs($user)
            ->get(route('dossiers.show', $project))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dossiers/Show')
                ->has('explorerDocuments', 5)
            );

        // No copies, no duplicate rows, no path rewrites.
        $this->assertSame(1, DossierDocument::count());
        $this->assertSame(1, Contract::count());
        $this->assertSame(1, ProjectEfficiencySheet::count());
        $this->assertSame('fiches/Fiche_v2.docx', $fiche->fresh()->docx_path);
        $this->assertSame('fiches/Fiche_v2.pdf', $fiche->fresh()->pdf_path);
        $this->assertSame(2, $fiche->fresh()->version);
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

        $roleName = 'project_explorer_'.substr(md5(implode('|', $permissionNames)), 0, 12);
        $role = Role::findOrCreate($roleName, 'web');
        $role->syncPermissions($permissions);

        return tap(User::factory()->create([
            'company_id' => $company->id,
            'branch_id' => $branch->id,
        ]), fn (User $user) => $user->assignRole($role));
    }
}
