<?php

namespace Tests\Feature;

use App\Models\CalendarEvent;
use App\Models\Company;
use App\Models\RecoveryRecord;
use App\Models\Task;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class RecoveryWorkspaceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
    }

    public function test_task_delete_creates_a_tenant_scoped_recovery_record_and_can_be_restored(): void
    {
        $company = Company::query()->firstOrFail();
        $user = $this->user($company, 'tasks.view', 'tasks.delete', 'system.recovery.view', 'system.recovery.restore');
        $task = Task::query()->create(['task_number' => 'TASK-REC-001', 'title' => 'Recover me', 'type' => 'general', 'created_by' => $user->id]);

        $this->actingAs($user)->delete(route('tasks.destroy', $task))->assertRedirect(route('tasks.index'));
        $this->assertSoftDeleted('tasks', ['id' => $task->id]);
        $record = RecoveryRecord::query()->where(['entity_type' => 'task', 'entity_id' => $task->id])->firstOrFail();

        $this->actingAs($user)->post(route('settings.recovery.restore', $record))->assertSessionHas('success');
        $this->assertDatabaseHas('tasks', ['id' => $task->id, 'deleted_at' => null]);
        $this->assertNotNull($record->fresh()->restored_at);
    }

    public function test_calendar_delete_is_recoverable_without_losing_the_event_identity(): void
    {
        $company = Company::query()->firstOrFail();
        $user = $this->user($company, 'calendar.view', 'calendar.delete', 'system.recovery.restore');
        $event = CalendarEvent::query()->create(['event_number' => 'CAL-REC-001', 'type' => 'meeting', 'title' => 'Recover event', 'starts_at' => now()->addDay(), 'created_by' => $user->id]);

        $this->actingAs($user)->delete(route('calendar.events.destroy', $event))->assertRedirect(route('calendar.index'));
        $record = RecoveryRecord::query()->where(['entity_type' => 'calendar_event', 'entity_id' => $event->id])->firstOrFail();

        $this->actingAs($user)->post(route('settings.recovery.restore', $record))->assertSessionHas('success');
        $this->assertDatabaseHas('calendar_events', ['id' => $event->id, 'deleted_at' => null]);
    }

    public function test_recovery_operations_reject_missing_permissions_and_other_company_records(): void
    {
        $companyA = Company::query()->firstOrFail();
        $companyB = Company::factory()->create();
        $owner = $this->user($companyA, 'tasks.view', 'tasks.delete', 'system.recovery.restore', 'system.recovery.purge');
        $task = Task::query()->create(['task_number' => 'TASK-REC-002', 'title' => 'Private task', 'type' => 'general', 'created_by' => $owner->id]);
        $this->actingAs($owner)->delete(route('tasks.destroy', $task));
        $record = RecoveryRecord::query()->firstOrFail();

        $withoutRestore = $this->user($companyA, 'tasks.view');
        $this->actingAs($withoutRestore)->post(route('settings.recovery.restore', $record))->assertForbidden();

        $otherCompany = $this->user($companyB, 'tasks.view', 'tasks.delete', 'system.recovery.restore', 'system.recovery.purge');
        $this->actingAs($otherCompany)->post(route('settings.recovery.restore', $record))->assertNotFound();
        $this->actingAs($otherCompany)->delete(route('settings.recovery.purge', $record))->assertNotFound();
    }

    public function test_recovery_view_permission_can_open_the_settings_tab_without_city_access(): void
    {
        $company = Company::query()->firstOrFail();
        $user = $this->user($company, 'system.recovery.view');

        $this->actingAs($user)->get(route('settings.index', ['tab' => 'recovery']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Settings')
                ->where('recovery.summary.total', 0));
    }

    private function user(Company $company, string ...$permissions): User
    {
        $user = User::factory()->create(['company_id' => $company->id]);
        $user->givePermissionTo(collect($permissions)->map(fn (string $permission) => Permission::findOrCreate($permission, 'web'))->all());

        return $user;
    }
}
