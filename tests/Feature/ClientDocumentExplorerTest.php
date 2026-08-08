<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\City;
use App\Models\Client;
use App\Models\Company;
use App\Models\Contract;
use App\Models\DocumentTemplate;
use App\Models\Dossier;
use App\Models\DossierDocument;
use App\Models\ProjectEfficiencySheet;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Document Explorer scoping (corrected business rule).
 *
 * PROJECT → Documents: only that exact Project's artifacts.
 * CLIENT → Documents: aggregation of ALL documents from ALL of the Client's
 * Projects (uploaded files + generated Contract/Fiche artifacts). There is
 * no direct Client document pool, so no "client" source entries are ever
 * produced; tenant scope alone is not enough — Client → Project ownership
 * is enforced on the backend for every source.
 */
class ClientDocumentExplorerTest extends TestCase
{
    use RefreshDatabase;

    public function test_client_explorer_aggregates_all_client_projects_with_generated_artifacts(): void
    {
        $company = Company::factory()->create();
        $branch = $this->branch($company, 'MAIN');
        $city = $this->city('Marrakech', 'RAK-V2');
        $user = $this->userWithPermissions($company, $branch, [
            'clients.view',
            'dossiers.view',
            'documents.view',
            'contracts.view',
            'projects.efficiency_sheet.view',
        ]);
        $client = $this->client($company, $branch);

        $a1 = $this->projectWithArtifacts($company, $branch, $city, $client, 'DOS-CLI-A1');
        $a2 = $this->projectWithArtifacts($company, $branch, $city, $client, 'DOS-CLI-A2', ficheVersion: 3);

        // A1: 3 uploaded files. A2: 4 uploaded files.
        $this->uploadedDocuments($a1, 3);
        $this->uploadedDocuments($a2, 4);

        // Every project contributes uploaded + contract (docx/pdf) + fiche (docx/pdf).
        $expectedKeys = [
            "project:{$this->docIds($a1)[0]}",
            "project:{$this->docIds($a1)[1]}",
            "project:{$this->docIds($a1)[2]}",
            "contract:{$a1->contract->id}:docx",
            "contract:{$a1->contract->id}:pdf",
            "efficiency_sheet:{$a1->efficiencySheet->id}:v2:docx",
            "efficiency_sheet:{$a1->efficiencySheet->id}:v2:pdf",
            "project:{$this->docIds($a2)[0]}",
            "project:{$this->docIds($a2)[1]}",
            "project:{$this->docIds($a2)[2]}",
            "project:{$this->docIds($a2)[3]}",
            "contract:{$a2->contract->id}:docx",
            "contract:{$a2->contract->id}:pdf",
            "efficiency_sheet:{$a2->efficiencySheet->id}:v3:docx",
            "efficiency_sheet:{$a2->efficiencySheet->id}:v3:pdf",
        ];

        $this->actingAs($user)
            ->get(route('clients.show', $client))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Clients/Show')
                ->where('workspace.explorer.context.type', 'client')
                ->where('workspace.explorer.context.clientId', $client->id)
                ->has('workspace.explorer.documents', 15)
                ->where('workspace.explorer.documents', fn ($docs) => collect($docs)
                    ->pluck('key')
                    ->diff($expectedKeys)
                    ->isEmpty())
                // Every entry knows its owning Project (id/name/code).
                ->where('workspace.explorer.documents', fn ($docs) => collect($docs)
                    ->every(fn (array $entry) => isset($entry['projectId'])
                        && is_array($entry['project'])
                        && isset($entry['project']['id'], $entry['project']['name'], $entry['project']['code'])))
            );
    }

    public function test_project_explorer_is_isolated_from_sibling_projects(): void
    {
        $company = Company::factory()->create();
        $branch = $this->branch($company, 'MAIN');
        $city = $this->city('Marrakech', 'RAK-V2');
        $user = $this->userWithPermissions($company, $branch, [
            'dossiers.view',
            'documents.view',
            'contracts.view',
            'projects.efficiency_sheet.view',
        ]);
        $client = $this->client($company, $branch);

        $a1 = $this->projectWithArtifacts($company, $branch, $city, $client, 'DOS-SIB-A1');
        $a2 = $this->projectWithArtifacts($company, $branch, $city, $client, 'DOS-SIB-A2', ficheVersion: 3);
        $this->uploadedDocuments($a1, 2);
        $this->uploadedDocuments($a2, 2);

        $a2Keys = [
            "contract:{$a2->contract->id}:docx",
            "contract:{$a2->contract->id}:pdf",
            "efficiency_sheet:{$a2->efficiencySheet->id}:v3:docx",
            "efficiency_sheet:{$a2->efficiencySheet->id}:v3:pdf",
            "project:{$this->docIds($a2)[0]}",
            "project:{$this->docIds($a2)[1]}",
        ];

        // Project A1 explorer: only A1 artifacts (2 uploaded + 2 contract + 2 fiche).
        $this->actingAs($user)
            ->get(route('dossiers.show', $a1))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dossiers/Show')
                ->has('explorerDocuments', 6)
                ->where('explorerDocuments', fn ($docs) => collect($docs)
                    ->pluck('key')
                    ->intersect($a2Keys)
                    ->isEmpty())
            );

        // Project A2 explorer: only A2 artifacts.
        $this->actingAs($user)
            ->get(route('dossiers.show', $a2))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dossiers/Show')
                ->has('explorerDocuments', 6)
                ->where('explorerDocuments', fn ($docs) => collect($docs)
                    ->pluck('key')
                    ->every(fn (string $key) => in_array($key, $a2Keys, true)))
            );
    }

    public function test_cross_client_and_same_tenant_isolation(): void
    {
        // Client A and Client B in the SAME company and branch.
        $company = Company::factory()->create();
        $branch = $this->branch($company, 'MAIN');
        $city = $this->city('Marrakech', 'RAK-V2');
        $user = $this->userWithPermissions($company, $branch, [
            'clients.view',
            'dossiers.view',
            'documents.view',
            'contracts.view',
            'projects.efficiency_sheet.view',
        ]);

        $clientA = $this->client($company, $branch);
        $clientB = $this->client($company, $branch);

        $a1 = $this->projectWithArtifacts($company, $branch, $city, $clientA, 'DOS-ISO-A1');
        $b1 = $this->projectWithArtifacts($company, $branch, $city, $clientB, 'DOS-ISO-B1', ficheVersion: 5);
        $this->uploadedDocuments($a1, 2);
        $this->uploadedDocuments($b1, 2);

        $b1Keys = [
            "contract:{$b1->contract->id}:docx",
            "contract:{$b1->contract->id}:pdf",
            "efficiency_sheet:{$b1->efficiencySheet->id}:v5:docx",
            "efficiency_sheet:{$b1->efficiencySheet->id}:v5:pdf",
            "project:{$this->docIds($b1)[0]}",
            "project:{$this->docIds($b1)[1]}",
        ];

        $a1Keys = [
            "contract:{$a1->contract->id}:docx",
            "contract:{$a1->contract->id}:pdf",
            "efficiency_sheet:{$a1->efficiencySheet->id}:v2:docx",
            "efficiency_sheet:{$a1->efficiencySheet->id}:v2:pdf",
            "project:{$this->docIds($a1)[0]}",
            "project:{$this->docIds($a1)[1]}",
        ];

        // Client A sees ONLY A1 artifacts.
        $this->actingAs($user)
            ->get(route('clients.show', $clientA))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Clients/Show')
                ->has('workspace.explorer.documents', 6)
                ->where('workspace.explorer.documents', fn ($docs) => collect($docs)
                    ->pluck('key')
                    ->intersect($b1Keys)
                    ->isEmpty())
                ->where('workspace.explorer.documents', fn ($docs) => collect($docs)
                    ->pluck('key')
                    ->every(fn (string $key) => in_array($key, $a1Keys, true)))
            );

        // Client B sees ONLY B1 artifacts.
        $this->actingAs($user)
            ->get(route('clients.show', $clientB))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Clients/Show')
                ->has('workspace.explorer.documents', 6)
                ->where('workspace.explorer.documents', fn ($docs) => collect($docs)
                    ->pluck('key')
                    ->intersect($a1Keys)
                    ->isEmpty())
            );
    }

    public function test_client_explorer_deduplicates_by_source_key(): void
    {
        $company = Company::factory()->create();
        $branch = $this->branch($company, 'MAIN');
        $city = $this->city('Marrakech', 'RAK-V2');
        $user = $this->userWithPermissions($company, $branch, [
            'clients.view',
            'documents.view',
            'contracts.view',
            'projects.efficiency_sheet.view',
        ]);
        $client = $this->client($company, $branch);

        $a1 = $this->projectWithArtifacts($company, $branch, $city, $client, 'DOS-DEDUP-A1');
        $this->uploadedDocuments($a1, 3);

        $this->actingAs($user)
            ->get(route('clients.show', $client))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Clients/Show')
                ->where('workspace.explorer.documents', fn ($docs) => count($docs) === collect($docs)->pluck('key')->unique()->count())
            );
    }

    public function test_client_explorer_never_exposes_storage_paths(): void
    {
        $company = Company::factory()->create();
        $branch = $this->branch($company, 'MAIN');
        $city = $this->city('Marrakech', 'RAK-V2');
        $user = $this->userWithPermissions($company, $branch, [
            'clients.view',
            'documents.view',
            'contracts.view',
            'projects.efficiency_sheet.view',
        ]);
        $client = $this->client($company, $branch);

        $a1 = $this->projectWithArtifacts($company, $branch, $city, $client, 'DOS-PATH-A1');
        $this->uploadedDocuments($a1, 1);

        $forbiddenKeys = ['docx_path', 'pdf_path', 'generated_document_path', 'stored_path', 'storage_path', 'path'];

        $this->actingAs($user)
            ->get(route('clients.show', $client))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Clients/Show')
                ->where('workspace.explorer.documents', fn ($docs) => collect($docs)
                    ->every(fn (array $entry) => collect($forbiddenKeys)
                        ->every(fn (string $key) => ! array_key_exists($key, $entry))))
            );
    }

    public function test_client_explorer_respects_permission_gates(): void
    {
        $company = Company::factory()->create();
        $branch = $this->branch($company, 'MAIN');
        $city = $this->city('Marrakech', 'RAK-V2');
        // No contracts.view, no projects.efficiency_sheet.view.
        $user = $this->userWithPermissions($company, $branch, [
            'clients.view',
            'documents.view',
        ]);
        $client = $this->client($company, $branch);

        $a1 = $this->projectWithArtifacts($company, $branch, $city, $client, 'DOS-PERM-A1');
        $this->uploadedDocuments($a1, 2);

        $this->actingAs($user)
            ->get(route('clients.show', $client))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Clients/Show')
                ->has('workspace.explorer.documents', 2)
                ->where('workspace.explorer.documents', fn ($docs) => collect($docs)
                    ->pluck('key')
                    ->every(fn (string $key) => ! str_starts_with($key, 'contract:')
                        && ! str_starts_with($key, 'efficiency_sheet:')))
            );
    }

    public function test_client_upload_rejects_project_of_another_client(): void
    {
        $company = Company::factory()->create();
        $branch = $this->branch($company, 'MAIN');
        $city = $this->city('Marrakech', 'RAK-V2');
        $user = $this->userWithPermissions($company, $branch, [
            'documents.view',
            'documents.create',
        ]);
        $clientA = $this->client($company, $branch);
        $clientB = $this->client($company, $branch);

        $a1 = $this->project($company, $branch, $city, $clientA, 'DOS-UP-A1');
        $b1 = $this->project($company, $branch, $city, $clientB, 'DOS-UP-B1');
        $template = DocumentTemplate::query()->create([
            'name' => 'Plan',
            'code' => 'plan',
            'document_type' => 'manual',
            'is_required' => false,
            'is_active' => true,
        ]);

        // Client A tries to upload into Client B's Project → rejected.
        $this->actingAs($user)
            ->post('/documents', [
                'dossier_id' => $b1->id,
                'client_id' => $clientA->id,
                'document_template_id' => $template->id,
                'status' => 'uploaded',
                'file' => UploadedFile::fake()->create('plan.pdf', 10, 'application/pdf'),
            ])
            ->assertForbidden();

        $this->assertSame(0, $b1->documents()->count());

        // Same upload with the correct Client → accepted.
        $this->actingAs($user)
            ->post('/documents', [
                'dossier_id' => $b1->id,
                'client_id' => $clientB->id,
                'document_template_id' => $template->id,
                'status' => 'uploaded',
                'file' => UploadedFile::fake()->create('plan.pdf', 10, 'application/pdf'),
            ])
            ->assertRedirect();

        $this->assertSame(1, $b1->documents()->count());
    }

    public function test_project_explorer_exposes_context_payload(): void
    {
        $company = Company::factory()->create();
        $branch = $this->branch($company, 'MAIN');
        $city = $this->city('Marrakech', 'RAK-V2');
        $user = $this->userWithPermissions($company, $branch, [
            'dossiers.view',
            'documents.view',
        ]);
        $client = $this->client($company, $branch);
        $project = $this->project($company, $branch, $city, $client, 'DOS-CTX-01');

        $this->actingAs($user)
            ->get(route('dossiers.show', $project))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dossiers/Show')
                ->where('explorerContext.type', 'project')
                ->where('explorerContext.projectId', $project->id)
            );
    }

    private function projectWithArtifacts(
        Company $company,
        Branch $branch,
        City $city,
        Client $client,
        string $number,
        ?int $ficheVersion = 2,
    ): Dossier {
        $project = $this->project($company, $branch, $city, $client, $number);

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
            'pdf_path' => 'fiches/Fiche_v'.$ficheVersion.'.pdf',
            'generated_at' => now(),
        ]);

        return $project;
    }

    private function project(Company $company, Branch $branch, City $city, Client $client, string $number): Dossier
    {
        return Dossier::factory()->create([
            'company_id' => $company->id,
            'branch_id' => $branch->id,
            'client_id' => $client->id,
            'city_id' => $city->id,
            'dossier_number' => $number,
            'project_object' => 'Projet '.$number,
            'status' => 'active',
        ]);
    }

    private function uploadedDocuments(Dossier $project, int $count): void
    {
        for ($i = 1; $i <= $count; $i++) {
            DossierDocument::query()->create([
                'dossier_id' => $project->id,
                'document_number' => 'DOC-'.$project->dossier_number.'-'.$i,
                'status' => 'uploaded',
                'original_filename' => 'document-'.$i.'.pdf',
                'mime_type' => 'application/pdf',
                'size_bytes' => 1024 * $i,
                'stored_path' => 'private/tests/doc-'.$i.'.pdf',
            ]);
        }
    }

    private function docIds(Dossier $project): array
    {
        return $project->documents()->pluck('id')->all();
    }

    private function client(Company $company, Branch $branch): Client
    {
        return Client::factory()->create([
            'company_id' => $company->id,
            'branch_id' => $branch->id,
        ]);
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

        $roleName = 'client_explorer_'.substr(md5(implode('|', $permissionNames)), 0, 12);
        $role = Role::findOrCreate($roleName, 'web');
        $role->syncPermissions($permissions);

        return tap(User::factory()->create([
            'company_id' => $company->id,
            'branch_id' => $branch->id,
        ]), fn (User $user) => $user->assignRole($role));
    }
}
