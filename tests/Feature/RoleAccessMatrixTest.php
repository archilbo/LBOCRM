<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class RoleAccessMatrixTest extends TestCase
{
    use RefreshDatabase;

    public function test_finance_and_operations_roles_are_scoped_to_their_modules(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $manager = Role::findByName('manager', 'web');
        $financeAdmin = Role::findByName('finance_admin', 'web');
        $operationsManager = Role::findByName('operations_manager', 'web');

        $this->assertTrue($manager->hasPermissionTo('finance.view'));
        $this->assertFalse($manager->hasPermissionTo('finance.documents.update'));
        $this->assertFalse($manager->hasPermissionTo('finance.payments.create'));

        $this->assertTrue($financeAdmin->hasPermissionTo('finance.documents.update'));
        $this->assertTrue($financeAdmin->hasPermissionTo('finance.payments.create'));
        $this->assertFalse($financeAdmin->hasPermissionTo('manage clients'));

        $this->assertTrue($operationsManager->hasPermissionTo('manage clients'));
        $this->assertTrue($operationsManager->hasPermissionTo('manage dossiers'));
        $this->assertFalse($operationsManager->hasPermissionTo('finance.view'));
    }

    public function test_only_super_admin_can_create_a_super_admin_account(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $company = Company::factory()->create();
        $superAdmin = tap(User::factory()->create(['company_id' => $company->id]), fn (User $user) => $user->assignRole('super_admin'));
        $manager = tap(User::factory()->create(['company_id' => $company->id]), fn (User $user) => $user->assignRole('admin'));

        $payload = [
            'name' => 'New Super Admin',
            'email' => 'new.super.admin@example.test',
            'role' => 'super_admin',
            'password' => 'StrongPassword!2026',
            'password_confirmation' => 'StrongPassword!2026',
        ];

        $this->actingAs($manager)
            ->post(route('admin.users.store'), $payload)
            ->assertForbidden();

        $this->actingAs($superAdmin)
            ->post(route('admin.users.store'), $payload)
            ->assertRedirect(route('admin.users.index'));

        $this->assertDatabaseHas('users', ['email' => $payload['email'], 'company_id' => $company->id]);
        $this->assertTrue(User::query()->where('email', $payload['email'])->firstOrFail()->hasRole('super_admin'));
    }
}
