<?php

namespace Tests\Feature\Projects;

use App\Models\Company;
use App\Models\User;
use App\Services\PermissionRegistry;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ProjectEfficiencySheetPermissionsTest extends TestCase
{
    use RefreshDatabase;

    private const FICHE_PERMISSIONS = [
        'projects.efficiency_sheet.view',
        'projects.efficiency_sheet.create',
        'projects.efficiency_sheet.update',
        'projects.efficiency_sheet.generate',
        'projects.efficiency_sheet.download',
        'projects.efficiency_sheet.delete',
    ];

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolesAndPermissionsSeeder::class);
    }

    private function customUser(Company $company, string $baseRole, array $modules): User
    {
        $registry = app(PermissionRegistry::class);

        $customRole = Role::findOrCreate('custom', 'web');
        $customRole->syncPermissions([]);

        $configuration = $registry->normalizeModuleConfiguration($modules);
        $names = $registry->permissionsForModuleLevels($configuration);
        foreach ($names as $name) {
            Permission::findOrCreate($name, 'web');
        }

        $user = tap(User::factory()->create([
            'company_id' => $company->id,
            'branch_id' => null,
        ]), fn (User $user) => $user->assignRole($customRole));
        $user->syncPermissions($names);
        $user->module_permissions = [
            'base_role' => $baseRole,
            'is_custom' => true,
            'modules' => $configuration,
        ];
        $user->save();

        return $user->fresh();
    }

    private function assertAllowsOnly(User $user, array $allowed, array $denied): void
    {
        $registry = app(PermissionRegistry::class);

        foreach ($allowed as $permission) {
            $this->assertTrue($registry->allows($user, $permission), "Expected {$permission} to be allowed.");
        }

        foreach ($denied as $permission) {
            $this->assertFalse($registry->allows($user, $permission), "Expected {$permission} to be denied.");
        }
    }

    public function test_projects_aucun_grants_no_fiche_permissions(): void
    {
        $company = Company::factory()->create();
        $user = $this->customUser($company, 'manager', [
            'Projects' => ['access' => 'none', 'scope' => 'none'],
        ]);

        foreach (self::FICHE_PERMISSIONS as $permission) {
            $this->assertFalse(app(PermissionRegistry::class)->allows($user, $permission));
        }
    }

    public function test_projects_voir_grants_read_fiche_permissions_only(): void
    {
        $company = Company::factory()->create();
        $user = $this->customUser($company, 'manager', [
            'Projects' => ['access' => 'view', 'scope' => 'all'],
        ]);

        $this->assertAllowsOnly($user, [
            'projects.efficiency_sheet.view',
            'projects.efficiency_sheet.download',
        ], [
            'projects.efficiency_sheet.create',
            'projects.efficiency_sheet.update',
            'projects.efficiency_sheet.generate',
            'projects.efficiency_sheet.delete',
        ]);
    }

    public function test_projects_modifier_grants_manage_but_not_delete(): void
    {
        $company = Company::factory()->create();
        $user = $this->customUser($company, 'manager', [
            'Projects' => ['access' => 'edit', 'scope' => 'all'],
        ]);

        $this->assertAllowsOnly($user, [
            'projects.efficiency_sheet.view',
            'projects.efficiency_sheet.download',
            'projects.efficiency_sheet.create',
            'projects.efficiency_sheet.update',
            'projects.efficiency_sheet.generate',
        ], [
            'projects.efficiency_sheet.delete',
        ]);
    }

    public function test_projects_complet_grants_all_fiche_permissions(): void
    {
        $company = Company::factory()->create();
        $user = $this->customUser($company, 'manager', [
            'Projects' => ['access' => 'delete', 'scope' => 'all'],
        ]);

        $this->assertAllowsOnly($user, self::FICHE_PERMISSIONS, []);
    }

    public function test_custom_user_cannot_inherit_forbidden_fiche_permissions_from_base_role(): void
    {
        $company = Company::factory()->create();

        // The manager base role carries the full fiche set (seeded default);
        // the stored matrix must win over the inherited role permissions.
        $user = $this->customUser($company, 'manager', [
            'Projects' => ['access' => 'none', 'scope' => 'none'],
        ]);

        // Simulate the base role's unmanaged grants (dashboard is not
        // governed by the matrix and survives a restrictive configuration).
        $user->syncPermissions(['dashboard.view']);

        $registry = app(PermissionRegistry::class);

        foreach (self::FICHE_PERMISSIONS as $permission) {
            $this->assertFalse($registry->allows($user, $permission));
            $this->assertNotContains($permission, $registry->effectiveNames($user));
        }

        // Unmanaged abilities survive the restrictive matrix.
        $this->assertTrue($registry->allows($user, 'dashboard.view'));
    }

    public function test_protected_admin_keeps_full_fiche_access(): void
    {
        $company = Company::factory()->create();
        $admin = tap(
            User::factory()->create(['company_id' => $company->id, 'branch_id' => null]),
            fn (User $user) => $user->assignRole('admin')
        );

        $this->assertAllowsOnly($admin, self::FICHE_PERMISSIONS, []);
    }

    public function test_existing_project_permission_behavior_remains_unchanged(): void
    {
        $company = Company::factory()->create();
        $viewOnly = $this->customUser($company, 'manager', [
            'Projects' => ['access' => 'view', 'scope' => 'all'],
        ]);

        $registry = app(PermissionRegistry::class);

        $this->assertTrue($registry->allows($viewOnly, 'dossiers.view'));
        $this->assertTrue($registry->allows($viewOnly, 'project-design.view'));
        $this->assertFalse($registry->allows($viewOnly, 'project-design.review'));
        $this->assertFalse($registry->allows($viewOnly, 'project-design.archive'));

        $editor = $this->customUser($company, 'manager', [
            'Projects' => ['access' => 'edit', 'scope' => 'all'],
        ]);

        $this->assertTrue($registry->allows($editor, 'project-design.review'));
        $this->assertFalse($registry->allows($editor, 'project-design.delete'));
    }

    public function test_roles_without_project_access_receive_no_fiche_permissions(): void
    {
        $company = Company::factory()->create();
        $financeAdmin = tap(
            User::factory()->create(['company_id' => $company->id, 'branch_id' => null]),
            fn (User $user) => $user->assignRole('finance_admin')
        );

        foreach (self::FICHE_PERMISSIONS as $permission) {
            $this->assertFalse(app(PermissionRegistry::class)->allows($financeAdmin, $permission));
        }
    }

    public function test_seeded_roles_follow_project_document_access(): void
    {
        $company = Company::factory()->create();
        $registry = app(PermissionRegistry::class);

        // Manager and staff manage dossiers/contracts -> full fiche set.
        foreach (['manager', 'staff'] as $roleName) {
            $user = tap(
                User::factory()->create(['company_id' => $company->id, 'branch_id' => null]),
                fn (User $user) => $user->assignRole($roleName)
            );

            foreach (self::FICHE_PERMISSIONS as $permission) {
                $this->assertTrue($registry->allows($user, $permission), "{$roleName} must allow {$permission}.");
            }
        }

        // Viewer only reads Project documents -> read fiche set only.
        $viewer = tap(
            User::factory()->create(['company_id' => $company->id, 'branch_id' => null]),
            fn (User $user) => $user->assignRole('viewer')
        );

        $this->assertAllowsOnly($viewer, [
            'projects.efficiency_sheet.view',
            'projects.efficiency_sheet.download',
        ], [
            'projects.efficiency_sheet.create',
            'projects.efficiency_sheet.update',
            'projects.efficiency_sheet.generate',
            'projects.efficiency_sheet.delete',
        ]);
    }
}
