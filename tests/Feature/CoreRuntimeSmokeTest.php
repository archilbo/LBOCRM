<?php

namespace Tests\Feature;

use App\Models\Dossier;
use App\Models\Company;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class CoreRuntimeSmokeTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $company = Company::factory()->create();
        $this->user = User::factory()->create(['company_id' => $company->id]);
    }

    public function test_core_workspace_pages_boot_for_an_authorized_user(): void
    {
        $this->grant('view tasks', 'manage dossiers');
        $dossier = Dossier::factory()->create(['company_id' => $this->user->company_id]);
        $task = Task::query()->create([
            'task_number' => 'TASK-SMOKE-001',
            'title' => 'Runtime smoke task',
            'type' => 'general',
            'status' => 'not_started',
            'priority' => 'medium',
            'impact' => 'normal',
            'category' => 'general_admin',
            'created_by' => $this->user->id,
        ]);

        $this->actingAs($this->user)->get('/')->assertOk();
        $this->actingAs($this->user)->get('/dossiers')->assertOk();
        $this->actingAs($this->user)->get("/dossiers/{$dossier->id}")->assertOk();
        $this->actingAs($this->user)->get("/dossiers/{$dossier->id}?tab=project-design")->assertOk();
        $this->actingAs($this->user)->get('/tasks')->assertOk();
        $this->actingAs($this->user)->get("/tasks/{$task->id}")->assertOk();
        $this->actingAs($this->user)->get('/contracts')->assertOk();
    }

    private function grant(string ...$permissions): void
    {
        foreach ($permissions as $permission) {
            Permission::query()->firstOrCreate([
                'name' => $permission,
                'guard_name' => 'web',
            ]);
        }

        $this->user->givePermissionTo($permissions);
    }
}
