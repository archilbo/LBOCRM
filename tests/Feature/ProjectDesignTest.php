<?php

namespace Tests\Feature;

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

    protected function setUp(): void
    {
        parent::setUp();
        Permission::create(['name' => 'project_design', 'guard_name' => 'web']);
        $this->user = User::factory()->create();
    }

    public function test_summary_returns_zero_counts_when_empty(): void
    {
        $this->user->givePermissionTo('project_design');
        $dossier = Dossier::factory()->create();

        $response = $this->actingAs($this->user)
            ->getJson("/dossiers/{$dossier->id}/design/summary");

        $response->assertOk();
        $response->assertJson([
            'folders' => 0,
            'files' => 0,
            'versions' => 0,
            'activities' => 0,
        ]);
    }

    public function test_summary_requires_project_design_permission(): void
    {
        $dossier = Dossier::factory()->create();

        $response = $this->actingAs($this->user)
            ->getJson("/dossiers/{$dossier->id}/design/summary");

        $response->assertForbidden();
    }

    public function test_can_create_file(): void
    {
        $this->user->givePermissionTo('project_design');
        $dossier = Dossier::factory()->create();

        $response = $this->actingAs($this->user)
            ->postJson('/dossiers/design/files', [
                'dossier_id' => $dossier->id,
                'name' => 'Ground Floor Plan',
                'type' => 'source',
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
        $dossier = Dossier::factory()->create();

        $response = $this->actingAs($this->user)
            ->postJson('/dossiers/design/files', [
                'dossier_id' => $dossier->id,
                'name' => 'Test',
                'type' => 'source',
            ]);

        $response->assertForbidden();
    }

    public function test_can_update_file_with_optimistic_concurrency(): void
    {
        $this->user->givePermissionTo('project_design');
        $dossier = Dossier::factory()->create();
        $file = ProjectDesignFile::factory()->create([
            'dossier_id' => $dossier->id,
            'record_version' => 1,
        ]);

        $response = $this->actingAs($this->user)
            ->putJson("/dossiers/design/files/{$file->id}", [
                'name' => 'Updated Plan',
                'record_version' => 1,
            ]);

        $response->assertOk();
        $response->assertJsonPath('name', 'Updated Plan');
        $this->assertEquals(2, $file->fresh()->record_version);
    }

    public function test_update_returns_409_on_stale_record_version(): void
    {
        $this->user->givePermissionTo('project_design');
        $dossier = Dossier::factory()->create();
        $file = ProjectDesignFile::factory()->create([
            'dossier_id' => $dossier->id,
            'record_version' => 2,
        ]);

        $response = $this->actingAs($this->user)
            ->putJson("/dossiers/design/files/{$file->id}", [
                'name' => 'Stale Update',
                'record_version' => 1,
            ]);

        $response->assertStatus(409);
        $response->assertJsonPath('message', 'This record was changed by another user. Reload the latest data before saving.');
    }

    public function test_can_delete_file(): void
    {
        $this->user->givePermissionTo('project_design');
        $dossier = Dossier::factory()->create();
        $file = ProjectDesignFile::factory()->create(['dossier_id' => $dossier->id]);

        $response = $this->actingAs($this->user)
            ->deleteJson("/dossiers/design/files/{$file->id}");

        $response->assertNoContent();
        $this->assertSoftDeleted($file);
    }

    public function test_list_files_is_project_scoped(): void
    {
        $this->user->givePermissionTo('project_design');
        $dossier1 = Dossier::factory()->create();
        $dossier2 = Dossier::factory()->create();
        ProjectDesignFile::factory()->count(3)->create(['dossier_id' => $dossier1->id]);
        ProjectDesignFile::factory()->count(2)->create(['dossier_id' => $dossier2->id]);

        $response = $this->actingAs($this->user)
            ->getJson("/dossiers/{$dossier1->id}/design/files");

        $response->assertOk();
        $response->assertJsonPath('meta.total', 3);
    }

    public function test_summary_is_project_scoped(): void
    {
        $this->user->givePermissionTo('project_design');
        $dossier1 = Dossier::factory()->create();
        $dossier2 = Dossier::factory()->create();
        ProjectDesignFile::factory()->count(3)->create(['dossier_id' => $dossier1->id]);
        ProjectDesignFile::factory()->create(['dossier_id' => $dossier2->id]);

        $response = $this->actingAs($this->user)
            ->getJson("/dossiers/{$dossier1->id}/design/summary");

        $response->assertOk();
        $response->assertJsonPath('files', 3);
    }

    public function test_can_create_folder(): void
    {
        $this->user->givePermissionTo('project_design');
        $dossier = Dossier::factory()->create();

        $folder = ProjectDesignFolder::create([
            'dossier_id' => $dossier->id,
            'name' => 'Architecture',
            'slug' => 'architecture',
        ]);

        $this->assertDatabaseHas('project_design_folders', [
            'dossier_id' => $dossier->id,
            'name' => 'Architecture',
        ]);
        $this->assertEquals(0, $folder->sort_order);
    }

    public function test_file_has_indexes(): void
    {
        $this->user->givePermissionTo('project_design');
        $dossier = Dossier::factory()->create();
        ProjectDesignFile::factory()->count(5)->create(['dossier_id' => $dossier->id, 'type' => 'source']);

        $response = $this->actingAs($this->user)
            ->getJson("/dossiers/{$dossier->id}/design/files?type=source");

        $response->assertOk();
        $response->assertJsonPath('meta.total', 5);
    }

    public function test_can_filter_files_by_type(): void
    {
        $this->user->givePermissionTo('project_design');
        $dossier = Dossier::factory()->create();
        ProjectDesignFile::factory()->count(3)->create(['dossier_id' => $dossier->id, 'type' => 'source']);
        ProjectDesignFile::factory()->count(2)->create(['dossier_id' => $dossier->id, 'type' => 'review']);

        $response = $this->actingAs($this->user)
            ->getJson("/dossiers/{$dossier->id}/design/files?type=review");

        $response->assertOk();
        $response->assertJsonPath('meta.total', 2);
    }

    public function test_can_search_files_by_name(): void
    {
        $this->user->givePermissionTo('project_design');
        $dossier = Dossier::factory()->create();
        ProjectDesignFile::factory()->create(['dossier_id' => $dossier->id, 'name' => 'Ground Floor Plan']);
        ProjectDesignFile::factory()->create(['dossier_id' => $dossier->id, 'name' => 'First Floor Plan']);
        ProjectDesignFile::factory()->create(['dossier_id' => $dossier->id, 'name' => 'Elevation']);

        $response = $this->actingAs($this->user)
            ->getJson("/dossiers/{$dossier->id}/design/files?search=Floor");

        $response->assertOk();
        $response->assertJsonPath('meta.total', 2);
    }

    public function test_version_belongs_to_file(): void
    {
        $dossier = Dossier::factory()->create();
        $file = ProjectDesignFile::factory()->create(['dossier_id' => $dossier->id]);
        $version = ProjectDesignFileVersion::factory()->create([
            'file_id' => $file->id,
            'version_number' => 1,
        ]);

        $this->assertEquals($file->id, $version->file_id);
        $this->assertTrue($version->file->is($file));
    }

    public function test_remark_belongs_to_version(): void
    {
        $dossier = Dossier::factory()->create();
        $file = ProjectDesignFile::factory()->create(['dossier_id' => $dossier->id]);
        $version = ProjectDesignFileVersion::factory()->create([
            'file_id' => $file->id,
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
