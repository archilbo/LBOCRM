<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\Company;
use App\Models\User;
use App\Services\PermissionRegistry;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SystemSettingsPermissionTest extends TestCase
{
    use RefreshDatabase;

    private PermissionRegistry $registry;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
        $this->registry = app(PermissionRegistry::class);
    }

    private function userWithRole(string $role): User
    {
        $user = User::factory()->create();
        $user->assignRole($role);

        return $user;
    }

    private function userWithCustomModules(string $baseRole, array $modules): User
    {
        $user = User::factory()->create();
        $user->assignRole('custom');
        $user->update([
            'module_permissions' => [
                'base_role' => $baseRole,
                'is_custom' => true,
                'modules' => $modules,
            ],
        ]);

        return $user;
    }

    private function assertNoSystemPermissions(User $user): void
    {
        foreach (['system.settings.view', 'system.settings.update', 'system.branding.update'] as $permission) {
            $this->assertFalse($this->registry->allows($user, $permission));
        }
    }

    public function test_super_admin_can_view_and_update_system_settings(): void
    {
        $user = $this->userWithRole('super_admin');

        $this->assertTrue($this->registry->allows($user, 'system.settings.view'));
        $this->assertTrue($this->registry->allows($user, 'system.settings.update'));
        $this->assertTrue($this->registry->allows($user, 'system.branding.update'));
    }

    public function test_admin_can_view_and_update_system_settings(): void
    {
        $user = $this->userWithRole('admin');

        $this->assertTrue($this->registry->allows($user, 'system.settings.view'));
        $this->assertTrue($this->registry->allows($user, 'system.settings.update'));
        $this->assertTrue($this->registry->allows($user, 'system.branding.update'));
    }

    public function test_manager_cannot_access_system_settings_by_default(): void
    {
        $this->assertNoSystemPermissions($this->userWithRole('manager'));
    }

    public function test_finance_admin_cannot_access_system_settings_by_default(): void
    {
        $this->assertNoSystemPermissions($this->userWithRole('finance_admin'));
    }

    public function test_operations_manager_cannot_access_system_settings_by_default(): void
    {
        $this->assertNoSystemPermissions($this->userWithRole('operations_manager'));
    }

    public function test_staff_cannot_access_system_settings_by_default(): void
    {
        $this->assertNoSystemPermissions($this->userWithRole('staff'));
    }

    public function test_viewer_cannot_access_system_settings(): void
    {
        $this->assertNoSystemPermissions($this->userWithRole('viewer'));
    }

    public function test_custom_module_aucun_revokes_managed_system_access(): void
    {
        // "Aucun": the Système module is absent from the matrix -> no system permissions.
        $user = $this->userWithCustomModules('staff', [
            'Finance' => ['access' => 'view', 'scope' => 'all'],
        ]);

        $this->assertNoSystemPermissions($user);
    }

    public function test_custom_module_aucun_revokes_inherited_managed_permissions(): void
    {
        // Even with a privileged base role, an absent Système module revokes all
        // system permissions: the custom matrix is authoritative.
        $user = $this->userWithCustomModules('manager', [
            'Finance' => ['access' => 'view', 'scope' => 'all'],
        ]);

        $this->assertNoSystemPermissions($user);
    }

    public function test_custom_module_voir_grants_view_only(): void
    {
        $user = $this->userWithCustomModules('staff', [
            'Système' => ['access' => 'view', 'scope' => 'all'],
        ]);

        $this->assertTrue($this->registry->allows($user, 'system.settings.view'));
        $this->assertFalse($this->registry->allows($user, 'system.settings.update'));
        $this->assertFalse($this->registry->allows($user, 'system.branding.update'));
    }

    public function test_custom_module_modifier_grants_view_update_and_branding(): void
    {
        $user = $this->userWithCustomModules('staff', [
            'Système' => ['access' => 'edit', 'scope' => 'all'],
        ]);

        $this->assertTrue($this->registry->allows($user, 'system.settings.view'));
        $this->assertTrue($this->registry->allows($user, 'system.settings.update'));
        $this->assertTrue($this->registry->allows($user, 'system.branding.update'));
    }

    public function test_custom_module_complet_grants_the_same_as_modifier(): void
    {
        $user = $this->userWithCustomModules('staff', [
            'Système' => ['access' => 'delete', 'scope' => 'all'],
        ]);

        // This module is non-destructive: the highest level equals "Modifier".
        $this->assertTrue($this->registry->allows($user, 'system.settings.view'));
        $this->assertTrue($this->registry->allows($user, 'system.settings.update'));
        $this->assertTrue($this->registry->allows($user, 'system.branding.update'));
    }

    public function test_protected_administrators_remain_protected(): void
    {
        $admin = $this->userWithRole('admin');
        $superAdmin = $this->userWithRole('super_admin');

        // Protected roles bypass the module matrix entirely.
        $this->assertTrue($this->registry->allows($admin, 'system.settings.update'));
        $this->assertTrue($this->registry->allows($superAdmin, 'system.settings.update'));
        $this->assertFalse($admin->hasRole('custom'));
        $this->assertFalse($superAdmin->hasRole('custom'));
    }

    public function test_stale_custom_matrix_cannot_lock_out_a_protected_super_admin(): void
    {
        $superAdmin = $this->userWithRole('super_admin');
        $superAdmin->update([
            'module_permissions' => [
                'base_role' => 'viewer',
                'is_custom' => true,
                'modules' => [
                    'Système' => ['access' => 'none', 'scope' => 'none'],
                ],
            ],
        ]);

        // Protected roles ignore the custom matrix.
        $this->assertTrue($this->registry->allows($superAdmin, 'system.settings.view'));
        $this->assertTrue($this->registry->allows($superAdmin, 'system.settings.update'));
        $this->assertTrue($this->registry->allows($superAdmin, 'system.branding.update'));
    }

    public function test_existing_finance_module_permissions_remain_unchanged(): void
    {
        $user = $this->userWithCustomModules('staff', [
            'Finance' => ['access' => 'edit', 'scope' => 'all'],
        ]);

        // Finance module still grants its own managed permissions...
        $this->assertTrue($this->registry->allows($user, 'finance.view'));
        $this->assertTrue($this->registry->allows($user, 'finance.settings.view'));
        $this->assertTrue($this->registry->allows($user, 'finance.settings.update'));

        // ...and still nothing from the new Système module.
        $this->assertNoSystemPermissions($user);
    }

    public function test_company_and_tenant_behavior_is_unchanged(): void
    {
        [$company, , $user] = $this->tenant('alpha');
        [$otherCompany] = $this->tenant('beta');

        // Tenant scoping helper still works and roles are granted inside a company.
        $this->assertSame($company->id, $user->company_id);
        $this->assertNotSame($company->id, $otherCompany->id);
    }

    /** @return array{Company, Branch, User} */
    private function tenant(string $suffix): array
    {
        $company = Company::factory()->create(['slug' => "company-{$suffix}"]);
        $branch = Branch::create([
            'company_id' => $company->id,
            'name' => "Branch {$suffix}",
            'code' => strtoupper($suffix),
            'is_active' => true,
        ]);
        $user = User::factory()->create([
            'company_id' => $company->id,
            'branch_id' => $branch->id,
        ]);

        return [$company, $branch, $user];
    }
}
