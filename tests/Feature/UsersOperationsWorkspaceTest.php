<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class UsersOperationsWorkspaceTest extends TestCase
{
    use RefreshDatabase;

    public function test_workload_report_user_can_open_only_the_workload_workspace(): void
    {
        $company = Company::factory()->create();
        $permission = Permission::findOrCreate('reports.workload.view', 'web');
        $role = Role::findOrCreate('workload_reporter', 'web');
        $role->syncPermissions([$permission]);
        $user = tap(User::factory()->create(['company_id' => $company->id]), fn (User $candidate) => $candidate->assignRole($role));

        $this->actingAs($user)
            ->get(route('admin.users.index', ['tab' => 'workload']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Users/Index')
                ->where('canViewUsers', false)
                ->where('canViewWorkload', true)
                ->where('canViewOperationsReports', false)
                ->has('users', 0)
                ->has('workload')
            );
    }

    public function test_legacy_workload_route_redirects_after_permission_check(): void
    {
        $company = Company::factory()->create();
        $permission = Permission::findOrCreate('reports.workload.view', 'web');
        $role = Role::findOrCreate('workload_reporter', 'web');
        $role->syncPermissions([$permission]);
        $user = tap(User::factory()->create(['company_id' => $company->id]), fn (User $candidate) => $candidate->assignRole($role));

        $this->actingAs($user)
            ->get(route('workload.index'))
            ->assertRedirect(route('admin.users.index', ['tab' => 'workload']));
    }
}
