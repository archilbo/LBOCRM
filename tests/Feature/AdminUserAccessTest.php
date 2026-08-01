<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Branch;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AdminUserAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_manager_can_suspend_and_restore_a_user_only_in_their_company(): void
    {
        $companyA = Company::factory()->create();
        $companyB = Company::factory()->create();
        $manager = $this->managerFor($companyA);
        $managedUser = User::factory()->create(['company_id' => $companyA->id, 'branch_id' => null]);
        $foreignUser = User::factory()->create(['company_id' => $companyB->id, 'branch_id' => null]);

        $this->actingAs($manager)
            ->put(route('admin.users.access.update', $managedUser), ['is_active' => false])
            ->assertRedirect();

        $this->assertDatabaseMissing('users', ['id' => $managedUser->id, 'suspended_at' => null]);
        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $manager->id,
            'action' => 'user.access.suspended',
        ]);

        $this->actingAs($manager)
            ->put(route('admin.users.access.update', $managedUser), ['is_active' => true])
            ->assertRedirect();

        $this->assertDatabaseHas('users', ['id' => $managedUser->id, 'suspended_at' => null]);

        $this->actingAs($manager)
            ->put(route('admin.users.access.update', $foreignUser), ['is_active' => false])
            ->assertNotFound();

        $this->assertDatabaseHas('users', ['id' => $foreignUser->id, 'suspended_at' => null]);
    }

    public function test_protected_administrator_accounts_cannot_be_suspended_by_another_user_manager(): void
    {
        $company = Company::factory()->create();
        $manager = $this->managerFor($company);
        $adminRole = Role::findOrCreate('admin', 'web');
        $admin = tap(User::factory()->create(['company_id' => $company->id, 'branch_id' => null]), fn (User $user) => $user->assignRole($adminRole));

        $this->actingAs($manager)
            ->put(route('admin.users.access.update', $admin), ['is_active' => false])
            ->assertForbidden();

        $this->assertDatabaseHas('users', ['id' => $admin->id, 'suspended_at' => null]);
    }

    public function test_a_branch_user_cannot_change_an_account_from_another_branch(): void
    {
        $company = Company::factory()->create();
        $branchA = Branch::query()->create(['company_id' => $company->id, 'name' => 'Marrakech', 'code' => 'RAK', 'is_active' => true]);
        $branchB = Branch::query()->create(['company_id' => $company->id, 'name' => 'Rabat', 'code' => 'RAB', 'is_active' => true]);
        $manager = $this->managerFor($company);
        $manager->update(['branch_id' => $branchA->id]);
        $foreignBranchUser = User::factory()->create(['company_id' => $company->id, 'branch_id' => $branchB->id]);

        $this->actingAs($manager)
            ->put(route('admin.users.access.update', $foreignBranchUser), ['is_active' => false])
            ->assertNotFound();

        $this->assertDatabaseHas('users', ['id' => $foreignBranchUser->id, 'suspended_at' => null]);
    }

    public function test_permission_editor_rejects_unknown_modules_and_unimplemented_assignment_scope(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $company = Company::factory()->create();
        $role = Role::findOrCreate('permission_editor', 'web');
        $role->syncPermissions([Permission::findByName('users.roles.manage', 'web')]);
        $actor = tap(User::factory()->create(['company_id' => $company->id]), fn (User $user) => $user->assignRole($role));
        $target = User::factory()->create(['company_id' => $company->id]);

        $this->actingAs($actor)
            ->put(route('admin.users.permissions', $target), [
                'role' => 'viewer',
                'isCustom' => true,
                'permissions' => [
                    'Unknown module' => ['access' => 'delete', 'scope' => 'all'],
                ],
            ])
            ->assertSessionHasErrors('permissions');

        $this->actingAs($actor)
            ->put(route('admin.users.permissions', $target), [
                'role' => 'viewer',
                'isCustom' => true,
                'permissions' => [
                    'Clients' => ['access' => 'view', 'scope' => 'assigned_only'],
                ],
            ])
            ->assertSessionHasErrors('permissions.Clients.scope');
    }

    private function managerFor(Company $company): User
    {
        $permission = Permission::findOrCreate('manage users', 'web');
        $role = Role::findOrCreate('user_access_manager', 'web');
        $role->syncPermissions([$permission]);

        return tap(User::factory()->create([
            'company_id' => $company->id,
            'branch_id' => null,
        ]), fn (User $user) => $user->assignRole($role));
    }
}
