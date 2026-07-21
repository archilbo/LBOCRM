<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Dossier;
use App\Models\ProjectDesign\ProjectDesignFile;
use App\Models\ProjectDesign\ProjectDesignFileVersion;
use App\Models\ProjectDesign\ProjectDesignFolder;
use App\Models\ProjectDesign\ProjectDesignRemark;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class ProjectDesignTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Company $company;

    protected function setUp(): void
    {
        parent::setUp();
        $this->company = Company::factory()->create();
        $this->user = User::factory()->create(['company_id' => $this->company->id]);
    }

    private function grant(string ...$permissions): void
    {
        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'web']);
        }
        $this->user->givePermissionTo($permissions);
    }

    private function dossier(): Dossier
    {
        return Dossier::factory()->create();
    }

    private function pdUrl(Dossier $dossier, string $path = ''): string
    {
        $base = "/dossiers/{$dossier->id}/project-design";
        return $path ? "{$base}/{$path}" : $base;
    }

    public function test_summary_returns_zero_counts_when_empty(): void
    {
        $this->grant('project-design.view');
        $dossier = $this->dossier();

        $response = $this->actingAs($this->user)
            ->getJson($this->pdUrl($dossier, 'summary'));

        $response->assertOk();
        $response->assertJson([
            'folders' => 0,
            'files' => 0,
            'versions' => 0,
            'activities' => 0,
        ]);
    }

    public function test_summary_requires_view_permission(): void
    {
        $dossier = $this->dossier();

        $response = $this->actingAs($this->user)
            ->getJson($this->pdUrl($dossier, 'summary'));

        $response->assertForbidden();
    }

    public function test_can_create_file(): void
    {
        $this->grant('project-design.view', 'project-design.create-file');
        $dossier = $this->dossier();
        $folder = ProjectDesignFolder::factory()->create(['dossier_id' => $dossier->id, 'company_id' => $this->company->id]);

        $response = $this->actingAs($this->user)
            ->postJson($this->pdUrl($dossier, 'files'), [
                'folder_id' => $folder->id,
                'name' => 'Ground Floor Plan',
                'discipline' => 'architecture',
            ]);

        $response->assertCreated();
        $response->assertJsonPath('name', 'Ground Floor Plan');
        $this->assertDatabaseHas('project_design_files', [
            'dossier_id' => $dossier->id,
            'name' => 'Ground Floor Plan',
        ]);
    }

    public function test_create_file_requires_permission(): void
    {
        $dossier = $this->dossier();

        $response = $this->actingAs($this->user)
            ->postJson($this->pdUrl($dossier, 'files'), [
                'name' => 'Test',
            ]);

        $response->assertForbidden();
    }

    public function test_can_update_file_with_optimistic_concurrency(): void
    {
        $this->grant('project-design.view', 'project-design.update-file');
        $dossier = $this->dossier();
        $file = ProjectDesignFile::factory()->create([
            'dossier_id' => $dossier->id,
            'company_id' => $this->company->id,
            'record_version' => 1,
        ]);

        $response = $this->actingAs($this->user)
            ->putJson($this->pdUrl($dossier, "files/{$file->id}"), [
                'name' => 'Updated Plan',
                'record_version' => 1,
            ]);

        $response->assertOk();
        $response->assertJsonPath('name', 'Updated Plan');
        $this->assertEquals(2, $file->fresh()->record_version);
    }

    public function test_update_returns_409_on_stale_record_version(): void
    {
        $this->grant('project-design.view', 'project-design.update-file');
        $dossier = $this->dossier();
        $file = ProjectDesignFile::factory()->create([
            'dossier_id' => $dossier->id,
            'company_id' => $this->company->id,
            'record_version' => 2,
        ]);

        $response = $this->actingAs($this->user)
            ->putJson($this->pdUrl($dossier, "files/{$file->id}"), [
                'name' => 'Stale Update',
                'record_version' => 1,
            ]);

        $response->assertStatus(409);
        $response->assertJsonPath('message', 'This record was changed by another user. Reload the latest data before saving.');
    }

    public function test_can_archive_file(): void
    {
        $this->grant('project-design.view', 'project-design.delete');
        $dossier = $this->dossier();
        $file = ProjectDesignFile::factory()->create([
            'dossier_id' => $dossier->id,
            'company_id' => $this->company->id,
        ]);

        $response = $this->actingAs($this->user)
            ->deleteJson($this->pdUrl($dossier, "files/{$file->id}"));

        $response->assertOk();
        $response->assertJsonPath('message', 'File archived.');
        $this->assertEquals('archived', $file->fresh()->status);
        $this->assertNotNull($file->fresh()->archived_at);
    }

    public function test_list_files_is_project_scoped(): void
    {
        $this->grant('project-design.view');
        $dossier1 = $this->dossier();
        $dossier2 = $this->dossier();
        ProjectDesignFile::factory()->count(3)->create(['dossier_id' => $dossier1->id, 'company_id' => $this->company->id]);
        ProjectDesignFile::factory()->count(2)->create(['dossier_id' => $dossier2->id, 'company_id' => $this->company->id]);

        $response = $this->actingAs($this->user)
            ->getJson($this->pdUrl($dossier1, 'files'));

        $response->assertOk();
        $response->assertJsonStructure(['data']);
        $data = $response->json('data');
        $this->assertCount(3, $data);
    }

    public function test_summary_is_project_scoped(): void
    {
        $this->grant('project-design.view');
        $dossier1 = $this->dossier();
        $dossier2 = $this->dossier();
        ProjectDesignFile::factory()->count(3)->create(['dossier_id' => $dossier1->id, 'company_id' => $this->company->id]);
        ProjectDesignFile::factory()->create(['dossier_id' => $dossier2->id, 'company_id' => $this->company->id]);

        $response = $this->actingAs($this->user)
            ->getJson($this->pdUrl($dossier1, 'summary'));

        $response->assertOk();
        $response->assertJsonPath('files', 3);
    }

    public function test_summary_includes_review_and_remark_metrics(): void
    {
        $this->grant('project-design.view');
        $dossier = $this->dossier();

        $submittedFile = ProjectDesignFile::factory()->create([
            'dossier_id' => $dossier->id,
            'company_id' => $this->company->id,
            'requires_approval' => true,
        ]);

        $submittedVersion = ProjectDesignFileVersion::factory()->create([
            'file_id' => $submittedFile->id,
            'dossier_id' => $dossier->id,
            'company_id' => $this->company->id,
            'version_number' => 1,
            'review_status' => 'submitted',
        ]);

        ProjectDesignRemark::factory()->create([
            'version_id' => $submittedVersion->id,
            'company_id' => $this->company->id,
            'status' => 'open',
            'due_date' => now()->subDay(),
            'created_by' => $this->user->id,
        ]);

        $approvedFile = ProjectDesignFile::factory()->create([
            'dossier_id' => $dossier->id,
            'company_id' => $this->company->id,
            'requires_approval' => true,
        ]);

        $approvedVersion = ProjectDesignFileVersion::factory()->create([
            'file_id' => $approvedFile->id,
            'dossier_id' => $dossier->id,
            'company_id' => $this->company->id,
            'version_number' => 1,
            'review_status' => 'approved',
        ]);

        $approvedFile->update(['latest_approved_version_id' => $approvedVersion->id]);

        $response = $this->actingAs($this->user)
            ->getJson($this->pdUrl($dossier, 'summary'));

        $response->assertOk();
        $response->assertJsonPath('awaitingReview', 1);
        $response->assertJsonPath('openRemarks', 1);
        $response->assertJsonPath('overdueRemarks', 1);
        $response->assertJsonPath('approvedFiles', 1);
        $response->assertJsonPath('approvalProgress', 50);
    }

    public function test_can_create_folder(): void
    {
        $this->grant('project-design.view', 'project-design.create-folder');
        $dossier = $this->dossier();

        $response = $this->actingAs($this->user)
            ->postJson($this->pdUrl($dossier, 'folders'), [
                'name' => 'Architecture',
            ]);

        $response->assertCreated();
        $response->assertJsonPath('name', 'Architecture');
        $this->assertDatabaseHas('project_design_folders', [
            'dossier_id' => $dossier->id,
            'name' => 'Architecture',
        ]);
    }

    public function test_can_search_files_by_name(): void
    {
        $this->grant('project-design.view');
        $dossier = $this->dossier();
        ProjectDesignFile::factory()->create(['dossier_id' => $dossier->id, 'company_id' => $this->company->id, 'name' => 'Ground Floor Plan']);
        ProjectDesignFile::factory()->create(['dossier_id' => $dossier->id, 'company_id' => $this->company->id, 'name' => 'First Floor Plan']);
        ProjectDesignFile::factory()->create(['dossier_id' => $dossier->id, 'company_id' => $this->company->id, 'name' => 'Elevation']);

        $response = $this->actingAs($this->user)
            ->getJson($this->pdUrl($dossier, 'files?search=Floor'));

        $response->assertOk();
        $data = $response->json('data');
        $this->assertCount(2, $data);
    }

    public function test_version_belongs_to_file(): void
    {
        $dossier = $this->dossier();
        $file = ProjectDesignFile::factory()->create(['dossier_id' => $dossier->id, 'company_id' => $this->company->id]);
        $version = ProjectDesignFileVersion::factory()->create([
            'file_id' => $file->id,
            'dossier_id' => $dossier->id,
            'company_id' => $this->company->id,
            'version_number' => 1,
        ]);

        $this->assertEquals($file->id, $version->file_id);
        $this->assertTrue($version->file->is($file));
    }

    public function test_remark_belongs_to_version(): void
    {
        $dossier = $this->dossier();
        $file = ProjectDesignFile::factory()->create(['dossier_id' => $dossier->id, 'company_id' => $this->company->id]);
        $version = ProjectDesignFileVersion::factory()->create([
            'file_id' => $file->id,
            'dossier_id' => $dossier->id,
            'company_id' => $this->company->id,
            'version_number' => 1,
        ]);
        $remark = ProjectDesignRemark::factory()->create([
            'version_id' => $version->id,
            'created_by' => $this->user->id,
        ]);

        $this->assertEquals($version->id, $remark->version_id);
        $this->assertTrue($remark->version->is($version));
    }
}
