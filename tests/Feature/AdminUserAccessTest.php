<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\User;
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
