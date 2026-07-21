<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Dossier;
use App\Models\ProjectDesign\ProjectDesignFile;
use App\Models\ProjectDesign\ProjectDesignUploadSession;
use App\Models\ProjectDesign\ProjectDesignUploadSessionFile;
use App\Models\User;
use App\Services\Tus\TusServer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class ProjectDesignUploadSessionTest extends TestCase
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
        return $path
            ? "/dossiers/{$dossier->id}/project-design/{$path}"
            : "/dossiers/{$dossier->id}/project-design";
    }

    private function validFiles(): array
    {
        return [
            [
                'client_file_upload_id' => (string) Str::uuid(),
                'asset_type' => 'source',
                'original_filename' => 'plan.dwg',
                'size_bytes' => 1024,
            ],
        ];
    }

    private function validPayload(array $overrides = []): array
    {
        return array_merge([
            'client_upload_id' => (string) Str::uuid(),
            'operation' => 'new_file',
            'files' => $this->validFiles(),
        ], $overrides);
    }

    // ─── create tests ─────────────────────────────────────────────────

    public function test_can_create_upload_session(): void
    {
        $this->grant('project-design.view');
        $dossier = $this->dossier();

        $response = $this->actingAs($this->user)
            ->postJson($this->pdUrl($dossier, 'upload-sessions'), $this->validPayload());

        $response->assertCreated();
        $response->assertJsonStructure([
            'uploadSessionId', 'uuid', 'clientUploadId', 'tusEndpoint',
            'expiresAt', 'maximumSize', 'allowedAssetTypes', 'files',
        ]);
        $this->assertDatabaseHas('project_design_upload_sessions', [
            'dossier_id' => $dossier->id,
            'user_id' => $this->user->id,
            'status' => 'pending',
        ]);
        $this->assertDatabaseHas('project_design_upload_session_files', [
            'original_filename' => 'plan.dwg',
            'status' => 'queued',
        ]);
    }

    public function test_create_requires_project_design_view_permission(): void
    {
        $dossier = $this->dossier();

        $response = $this->actingAs($this->user)
            ->postJson($this->pdUrl($dossier, 'upload-sessions'), $this->validPayload());

        $response->assertForbidden();
    }

    public function test_create_validates_required_fields(): void
    {
        $this->grant('project-design.view');
        $dossier = $this->dossier();

        $response = $this->actingAs($this->user)
            ->postJson($this->pdUrl($dossier, 'upload-sessions'), []);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['client_upload_id', 'operation', 'files']);
    }

    public function test_create_validates_operation_values(): void
    {
        $this->grant('project-design.view');
        $dossier = $this->dossier();

        $response = $this->actingAs($this->user)
            ->postJson($this->pdUrl($dossier, 'upload-sessions'), $this->validPayload([
                'operation' => 'invalid',
            ]));

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['operation']);
    }

    public function test_create_validates_asset_type_values(): void
    {
        $this->grant('project-design.view');
        $dossier = $this->dossier();

        $response = $this->actingAs($this->user)
            ->postJson($this->pdUrl($dossier, 'upload-sessions'), $this->validPayload([
                'files' => [
                    [
                        'client_file_upload_id' => (string) Str::uuid(),
                        'asset_type' => 'invalid',
                        'original_filename' => 'test.txt',
                        'size_bytes' => 1024,
                    ],
                ],
            ]));

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['files.0.asset_type']);
    }

    public function test_create_validates_max_files(): void
    {
        $this->grant('project-design.view');
        $dossier = $this->dossier();

        $response = $this->actingAs($this->user)
            ->postJson($this->pdUrl($dossier, 'upload-sessions'), $this->validPayload([
                'files' => [],
            ]));

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['files']);
    }

    public function test_create_validates_submission_intent(): void
    {
        $this->grant('project-design.view');
        $dossier = $this->dossier();

        $response = $this->actingAs($this->user)
            ->postJson($this->pdUrl($dossier, 'upload-sessions'), $this->validPayload([
                'submission_intent' => 'invalid',
            ]));

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['submission_intent']);
    }

    public function test_create_stores_metadata(): void
    {
        $this->grant('project-design.view');
        $dossier = $this->dossier();

        $response = $this->actingAs($this->user)
            ->postJson($this->pdUrl($dossier, 'upload-sessions'), $this->validPayload([
                'name' => 'Ground Floor Plan',
                'discipline' => 'architecture',
                'code' => 'A-101',
            ]));

        $response->assertCreated();
        $session = ProjectDesignUploadSession::find($response->json('uploadSessionId'));
        $metadata = json_decode($session->metadata_json, true);
        $this->assertEquals('Ground Floor Plan', $metadata['name']);
        $this->assertEquals('architecture', $metadata['discipline']);
        $this->assertEquals('A-101', $metadata['code']);
    }

    public function test_create_rejects_files_exceeding_max_size(): void
    {
        $this->grant('project-design.view');
        $dossier = $this->dossier();
        $maxBytes = config('project_design.validation.max_file_size') * 1024;

        $response = $this->actingAs($this->user)
            ->postJson($this->pdUrl($dossier, 'upload-sessions'), $this->validPayload([
                'files' => [
                    [
                        'client_file_upload_id' => (string) Str::uuid(),
                        'asset_type' => 'source',
                        'original_filename' => 'huge.dwg',
                        'size_bytes' => $maxBytes + 1,
                    ],
                ],
            ]));

        $response->assertStatus(422);
        $response->assertJsonPath('message', 'File huge.dwg exceeds maximum size.');
    }

    public function test_create_scopes_session_to_dossier(): void
    {
        $this->grant('project-design.view');
        $dossier1 = $this->dossier();
        $dossier2 = $this->dossier();

        $response = $this->actingAs($this->user)
            ->postJson($this->pdUrl($dossier1, 'upload-sessions'), $this->validPayload());

        $response->assertCreated();
        $sessionId = $response->json('uploadSessionId');
        $session = ProjectDesignUploadSession::find($sessionId);
        $this->assertEquals($dossier1->id, $session->dossier_id);
        $this->assertNotEquals($dossier2->id, $session->dossier_id);
    }

    public function test_create_with_submit_intent(): void
    {
        $this->grant('project-design.view');
        $dossier = $this->dossier();

        $response = $this->actingAs($this->user)
            ->postJson($this->pdUrl($dossier, 'upload-sessions'), $this->validPayload([
                'submission_intent' => 'submit',
            ]));

        $response->assertCreated();
        $this->assertDatabaseHas('project_design_upload_sessions', [
            'id' => $response->json('uploadSessionId'),
            'submission_intent' => 'submit',
        ]);
    }

    public function test_create_with_design_file_id(): void
    {
        $this->grant('project-design.view');
        $dossier = $this->dossier();
        $file = ProjectDesignFile::factory()->create([
            'dossier_id' => $dossier->id,
            'company_id' => $this->company->id,
        ]);

        $response = $this->actingAs($this->user)
            ->postJson($this->pdUrl($dossier, 'upload-sessions'), $this->validPayload([
                'operation' => 'new_version',
                'design_file_id' => $file->id,
            ]));

        $response->assertCreated();
        $this->assertDatabaseHas('project_design_upload_sessions', [
            'id' => $response->json('uploadSessionId'),
            'design_file_id' => $file->id,
        ]);
    }

    // ─── status tests ─────────────────────────────────────────────────

    public function test_can_get_session_status(): void
    {
        $this->grant('project-design.view');
        $dossier = $this->dossier();
        $session = ProjectDesignUploadSession::create([
            'uuid' => (string) Str::uuid(),
            'client_upload_id' => (string) Str::uuid(),
            'company_id' => $this->company->id,
            'dossier_id' => $dossier->id,
            'user_id' => $this->user->id,
            'operation' => 'new_file',
            'status' => 'pending',
            'total_files' => 1,
            'total_bytes' => 1024,
            'expires_at' => now()->addDay(),
        ]);
        $session->files()->create([
            'client_file_upload_id' => (string) Str::uuid(),
            'asset_type' => 'source',
            'original_filename' => 'plan.dwg',
            'size_bytes' => 1024,
            'status' => 'queued',
        ]);

        $response = $this->actingAs($this->user)
            ->getJson($this->pdUrl($dossier, "upload-sessions/{$session->id}"));

        $response->assertOk();
        $response->assertJsonPath('id', $session->id);
        $response->assertJsonPath('status', 'pending');
        $response->assertJsonStructure([
            'id', 'clientUploadId', 'status', 'totalFiles', 'completedFiles',
            'totalBytes', 'uploadedBytes', 'processingProgress',
            'errorCode', 'errorMessage', 'files',
        ]);
    }

    public function test_status_requires_permission(): void
    {
        $dossier = $this->dossier();
        $session = ProjectDesignUploadSession::create([
            'uuid' => (string) Str::uuid(),
            'client_upload_id' => (string) Str::uuid(),
            'company_id' => $this->company->id,
            'dossier_id' => $dossier->id,
            'user_id' => $this->user->id,
            'operation' => 'new_file',
            'status' => 'pending',
            'total_files' => 1,
            'total_bytes' => 1024,
            'expires_at' => now()->addDay(),
        ]);

        $response = $this->actingAs($this->user)
            ->getJson($this->pdUrl($dossier, "upload-sessions/{$session->id}"));

        $response->assertForbidden();
    }

    public function test_status_returns_403_for_wrong_dossier(): void
    {
        $this->grant('project-design.view');
        $dossier = $this->dossier();
        $otherDossier = $this->dossier();
        $session = ProjectDesignUploadSession::create([
            'uuid' => (string) Str::uuid(),
            'client_upload_id' => (string) Str::uuid(),
            'company_id' => $this->company->id,
            'dossier_id' => $otherDossier->id,
            'user_id' => $this->user->id,
            'operation' => 'new_file',
            'status' => 'pending',
            'total_files' => 1,
            'total_bytes' => 1024,
            'expires_at' => now()->addDay(),
        ]);

        $response = $this->actingAs($this->user)
            ->getJson($this->pdUrl($dossier, "upload-sessions/{$session->id}"));

        $response->assertForbidden();
    }

    // ─── cancel tests ─────────────────────────────────────────────────

    public function test_can_cancel_session(): void
    {
        $this->grant('project-design.view');
        $dossier = $this->dossier();
        $session = ProjectDesignUploadSession::create([
            'uuid' => (string) Str::uuid(),
            'client_upload_id' => (string) Str::uuid(),
            'company_id' => $this->company->id,
            'dossier_id' => $dossier->id,
            'user_id' => $this->user->id,
            'operation' => 'new_file',
            'status' => 'pending',
            'total_files' => 0,
            'total_bytes' => 0,
            'expires_at' => now()->addDay(),
        ]);

        $response = $this->actingAs($this->user)
            ->postJson($this->pdUrl($dossier, "upload-sessions/{$session->id}/cancel"));

        $response->assertOk();
        $response->assertJsonPath('message', 'Upload canceled.');
        $this->assertEquals('canceled', $session->fresh()->status);
        $this->assertNotNull($session->fresh()->canceled_at);
    }

    public function test_cancel_requires_permission(): void
    {
        $dossier = $this->dossier();
        $session = ProjectDesignUploadSession::create([
            'uuid' => (string) Str::uuid(),
            'client_upload_id' => (string) Str::uuid(),
            'company_id' => $this->company->id,
            'dossier_id' => $dossier->id,
            'user_id' => $this->user->id,
            'operation' => 'new_file',
            'status' => 'pending',
            'total_files' => 0,
            'total_bytes' => 0,
            'expires_at' => now()->addDay(),
        ]);

        $response = $this->actingAs($this->user)
            ->postJson($this->pdUrl($dossier, "upload-sessions/{$session->id}/cancel"));

        $response->assertForbidden();
    }

    public function test_cancel_returns_403_for_wrong_dossier(): void
    {
        $this->grant('project-design.view');
        $dossier = $this->dossier();
        $otherDossier = $this->dossier();
        $session = ProjectDesignUploadSession::create([
            'uuid' => (string) Str::uuid(),
            'client_upload_id' => (string) Str::uuid(),
            'company_id' => $this->company->id,
            'dossier_id' => $otherDossier->id,
            'user_id' => $this->user->id,
            'operation' => 'new_file',
            'status' => 'pending',
            'total_files' => 0,
            'total_bytes' => 0,
            'expires_at' => now()->addDay(),
        ]);

        $response = $this->actingAs($this->user)
            ->postJson($this->pdUrl($dossier, "upload-sessions/{$session->id}/cancel"));

        $response->assertForbidden();
    }

    // ─── finalize tests ───────────────────────────────────────────────

    public function test_finalize_returns_403_for_wrong_user(): void
    {
        $this->grant('project-design.view');
        $dossier = $this->dossier();
        $otherUser = User::factory()->create(['company_id' => $this->company->id]);
        $session = ProjectDesignUploadSession::create([
            'uuid' => (string) Str::uuid(),
            'client_upload_id' => (string) Str::uuid(),
            'company_id' => $this->company->id,
            'dossier_id' => $dossier->id,
            'user_id' => $otherUser->id,
            'operation' => 'new_file',
            'status' => 'transferred',
            'total_files' => 0,
            'total_bytes' => 0,
            'expires_at' => now()->addDay(),
        ]);

        $response = $this->actingAs($this->user)
            ->postJson($this->pdUrl($dossier, "upload-sessions/{$session->id}/finalize"));

        $response->assertForbidden();
    }

    public function test_finalize_returns_422_for_completed_session(): void
    {
        $this->grant('project-design.view');
        $dossier = $this->dossier();
        $session = ProjectDesignUploadSession::create([
            'uuid' => (string) Str::uuid(),
            'client_upload_id' => (string) Str::uuid(),
            'company_id' => $this->company->id,
            'dossier_id' => $dossier->id,
            'user_id' => $this->user->id,
            'operation' => 'new_file',
            'status' => 'completed',
            'total_files' => 0,
            'total_bytes' => 0,
            'expires_at' => now()->addDay(),
        ]);

        $response = $this->actingAs($this->user)
            ->postJson($this->pdUrl($dossier, "upload-sessions/{$session->id}/finalize"));

        $response->assertStatus(422);
    }

    public function test_finalize_returns_422_for_canceled_session(): void
    {
        $this->grant('project-design.view');
        $dossier = $this->dossier();
        $session = ProjectDesignUploadSession::create([
            'uuid' => (string) Str::uuid(),
            'client_upload_id' => (string) Str::uuid(),
            'company_id' => $this->company->id,
            'dossier_id' => $dossier->id,
            'user_id' => $this->user->id,
            'operation' => 'new_file',
            'status' => 'canceled',
            'total_files' => 0,
            'total_bytes' => 0,
            'expires_at' => now()->addDay(),
        ]);

        $response = $this->actingAs($this->user)
            ->postJson($this->pdUrl($dossier, "upload-sessions/{$session->id}/finalize"));

        $response->assertStatus(422);
    }

    public function test_finalize_returns_422_for_failed_session(): void
    {
        $this->grant('project-design.view');
        $dossier = $this->dossier();
        $session = ProjectDesignUploadSession::create([
            'uuid' => (string) Str::uuid(),
            'client_upload_id' => (string) Str::uuid(),
            'company_id' => $this->company->id,
            'dossier_id' => $dossier->id,
            'user_id' => $this->user->id,
            'operation' => 'new_file',
            'status' => 'failed',
            'total_files' => 0,
            'total_bytes' => 0,
            'expires_at' => now()->addDay(),
        ]);

        $response = $this->actingAs($this->user)
            ->postJson($this->pdUrl($dossier, "upload-sessions/{$session->id}/finalize"));

        $response->assertStatus(422);
    }

    public function test_finalize_returns_500_when_tus_upload_not_complete(): void
    {
        $this->grant('project-design.view');
        $dossier = $this->dossier();
        $session = ProjectDesignUploadSession::create([
            'uuid' => (string) Str::uuid(),
            'client_upload_id' => (string) Str::uuid(),
            'company_id' => $this->company->id,
            'dossier_id' => $dossier->id,
            'user_id' => $this->user->id,
            'operation' => 'new_file',
            'status' => 'transferred',
            'total_files' => 1,
            'total_bytes' => 1024,
            'expires_at' => now()->addDay(),
        ]);
        $sessionFile = $session->files()->create([
            'client_file_upload_id' => (string) Str::uuid(),
            'tus_upload_id' => (string) Str::uuid(),
            'asset_type' => 'source',
            'original_filename' => 'plan.dwg',
            'size_bytes' => 1024,
            'status' => 'queued',
        ]);

        $this->mock(TusServer::class, function ($mock) use ($sessionFile) {
            $mock->shouldReceive('isComplete')
                ->with($sessionFile->tus_upload_id)
                ->andReturn(false);
        });

        $response = $this->actingAs($this->user)
            ->postJson($this->pdUrl($dossier, "upload-sessions/{$session->id}/finalize"));

        $response->assertStatus(500);
        $this->assertEquals('failed', $session->fresh()->status);
    }

    public function test_finalize_returns_500_when_tus_file_missing(): void
    {
        $this->grant('project-design.view');
        $dossier = $this->dossier();
        $session = ProjectDesignUploadSession::create([
            'uuid' => (string) Str::uuid(),
            'client_upload_id' => (string) Str::uuid(),
            'company_id' => $this->company->id,
            'dossier_id' => $dossier->id,
            'user_id' => $this->user->id,
            'operation' => 'new_file',
            'status' => 'transferred',
            'total_files' => 1,
            'total_bytes' => 1024,
            'expires_at' => now()->addDay(),
        ]);
        $sessionFile = $session->files()->create([
            'client_file_upload_id' => (string) Str::uuid(),
            'tus_upload_id' => (string) Str::uuid(),
            'asset_type' => 'source',
            'original_filename' => 'plan.dwg',
            'size_bytes' => 1024,
            'status' => 'queued',
        ]);

        $this->mock(TusServer::class, function ($mock) use ($sessionFile) {
            $mock->shouldReceive('isComplete')
                ->with($sessionFile->tus_upload_id)
                ->andReturn(true);
            $mock->shouldReceive('getFilePath')
                ->with($sessionFile->tus_upload_id)
                ->andReturn(null);
        });

        $response = $this->actingAs($this->user)
            ->postJson($this->pdUrl($dossier, "upload-sessions/{$session->id}/finalize"));

        $response->assertStatus(500);
        $this->assertEquals('failed', $session->fresh()->status);
    }

    public function test_can_finalize_session(): void
    {
        $this->grant('project-design.view');
        $dossier = $this->dossier();
        $session = ProjectDesignUploadSession::create([
            'uuid' => (string) Str::uuid(),
            'client_upload_id' => (string) Str::uuid(),
            'company_id' => $this->company->id,
            'dossier_id' => $dossier->id,
            'user_id' => $this->user->id,
            'operation' => 'new_file',
            'status' => 'transferred',
            'total_files' => 1,
            'total_bytes' => 1024,
            'expires_at' => now()->addDay(),
        ]);

        $tusUploadId = (string) Str::uuid();
        $tusDir = storage_path("tus/{$tusUploadId}");
        @mkdir($tusDir, 0755, true);
        file_put_contents("{$tusDir}/file", 'test content');
        file_put_contents("{$tusDir}/meta.json", json_encode([
            'size' => 12,
            'offset' => 12,
            'metadata' => [],
            'expires_at' => time() + 86400,
        ]));

        $sessionFile = $session->files()->create([
            'client_file_upload_id' => (string) Str::uuid(),
            'tus_upload_id' => $tusUploadId,
            'asset_type' => 'source',
            'original_filename' => 'plan.dwg',
            'size_bytes' => 12,
            'status' => 'queued',
        ]);

        $response = $this->actingAs($this->user)
            ->postJson($this->pdUrl($dossier, "upload-sessions/{$session->id}/finalize"));

        $response->assertOk();
        $response->assertJsonPath('message', 'Upload finalized successfully.');
        $this->assertEquals('completed', $session->fresh()->status);
        $this->assertNotNull($session->fresh()->completed_at);
        $this->assertNotNull($session->fresh()->finalized_at);
        $this->assertFileDoesNotExist($tusDir);
    }

    public function test_finalize_handles_files_without_tus_upload_id(): void
    {
        $this->grant('project-design.view');
        $dossier = $this->dossier();
        $session = ProjectDesignUploadSession::create([
            'uuid' => (string) Str::uuid(),
            'client_upload_id' => (string) Str::uuid(),
            'company_id' => $this->company->id,
            'dossier_id' => $dossier->id,
            'user_id' => $this->user->id,
            'operation' => 'new_file',
            'status' => 'transferred',
            'total_files' => 1,
            'total_bytes' => 1024,
            'expires_at' => now()->addDay(),
        ]);
        $session->files()->create([
            'client_file_upload_id' => (string) Str::uuid(),
            'asset_type' => 'source',
            'original_filename' => 'plan.dwg',
            'size_bytes' => 1024,
            'status' => 'queued',
        ]);

        $response = $this->actingAs($this->user)
            ->postJson($this->pdUrl($dossier, "upload-sessions/{$session->id}/finalize"));

        $response->assertOk();
        $this->assertEquals('completed', $session->fresh()->status);
    }
}
