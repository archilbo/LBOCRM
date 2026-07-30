<?php

namespace Tests\Feature;

use App\Models\CalendarEvent;
use App\Models\Company;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class CollaborationPermissionScopeTest extends TestCase
{
    use RefreshDatabase;

    public function test_task_view_permission_does_not_cross_company_scope(): void
    {
        [$reader, $otherUser] = $this->usersWithPermission('tasks.view');

        $task = Task::query()->create([
            'task_number' => 'TASK-SCOPE-0001',
            'title' => 'Other company task',
            'status' => 'not_started',
            'priority' => 'medium',
            'category' => 'general_admin',
            'created_by' => $otherUser->id,
        ]);

        $this->assertFalse($reader->can('view', $task));
        $this->actingAs($reader)->get(route('tasks.show', $task))->assertForbidden();
    }

    public function test_calendar_view_permission_does_not_cross_company_scope(): void
    {
        [$reader, $otherUser] = $this->usersWithPermission('calendar.view');

        $event = CalendarEvent::query()->create([
            'event_number' => 'CAL-SCOPE-0001',
            'type' => 'meeting',
            'title' => 'Other company meeting',
            'starts_at' => now(),
            'ends_at' => now()->addHour(),
            'visibility' => 'team',
            'created_by' => $otherUser->id,
        ]);

        $this->assertFalse($reader->can('view', $event));
        $this->actingAs($reader)->get(route('calendar.events.show', $event))->assertForbidden();
    }

    /** @return array{User, User} */
    private function usersWithPermission(string $permission): array
    {
        $permissionModel = Permission::findOrCreate($permission, 'web');
        $role = Role::findOrCreate('collaboration_reader_'.$permission, 'web');
        $role->syncPermissions([$permissionModel]);

        $readerCompany = Company::factory()->create();
        $otherCompany = Company::factory()->create();

        $reader = User::factory()->create(['company_id' => $readerCompany->id]);
        $reader->assignRole($role);

        $otherUser = User::factory()->create(['company_id' => $otherCompany->id]);

        return [$reader, $otherUser];
    }
}
