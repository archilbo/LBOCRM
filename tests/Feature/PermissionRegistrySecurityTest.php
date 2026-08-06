<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\User;
use App\Services\PermissionRegistry;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\View\View;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class PermissionRegistrySecurityTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Regression for the reported defect: the permission editor showed
     * Finance = Aucun for the Manager role while /finance was reachable at
     * runtime. The matrix and the runtime now agree because the seeded
     * Manager role covers the full Finance view set.
     */
    public function test_manager_matrix_and_runtime_agree_on_finance_access(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $registry = app(PermissionRegistry::class);
        $matrix = $registry->rolePermissionMatrix('manager');

        $this->assertSame('view', $matrix['Finance']['access']);
        $this->assertSame('all', $matrix['Finance']['scope']);

        $company = Company::factory()->create();
        $manager = tap(User::factory()->create(['company_id' => $company->id]), fn (User $user) => $user->assignRole('manager'));

        $this->assertTrue($registry->allows($manager, 'finance.view'));
        $this->assertTrue($registry->allows($manager, 'finance.settings.view'));
        $this->assertFalse($registry->allows($manager, 'finance.documents.create'));
    }

    public function test_other_roles_keep_their_finance_levels(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $registry = app(PermissionRegistry::class);

        $this->assertSame('delete', $registry->rolePermissionMatrix('finance_admin')['Finance']['access']);
        $this->assertSame('view', $registry->rolePermissionMatrix('staff')['Finance']['access']);
        $this->assertSame('view', $registry->rolePermissionMatrix('viewer')['Finance']['access']);
        $this->assertSame('none', $registry->rolePermissionMatrix('operations_manager')['Finance']['access']);
    }

    public function test_custom_matrix_finance_none_denies_the_module_everywhere(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $registry = app(PermissionRegistry::class);
        $company = Company::factory()->create();
        $user = $this->customUser($company, 'manager', [
            'Clients' => ['access' => 'edit', 'scope' => 'all'],
            'Finance' => ['access' => 'none', 'scope' => 'none'],
        ]);

        $this->assertTrue($registry->hasCustomConfiguration($user));
        $this->assertFalse($registry->allows($user, 'finance.view'));
        $this->assertFalse($registry->allows($user, 'finance.documents.create'));
        $this->assertFalse($registry->allows($user, 'finance.payments.view'));
        $this->assertTrue($registry->allows($user, 'clients.view'));
        $this->assertTrue($registry->allows($user, 'clients.update'));
        $this->assertFalse($registry->allows($user, 'clients.delete'));

        // The base role (manager) would have granted finance read; the stored
        // matrix must win over the inherited role permissions.
        $this->assertNotContains('finance.view', $registry->effectiveNames($user));

        $this->actingAs($user)->get(route('finance.index'))->assertForbidden();
    }

    public function test_custom_matrix_finance_view_allows_the_module_page(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $registry = app(PermissionRegistry::class);
        $company = Company::factory()->create();
        $user = $this->customUser($company, 'manager', [
            'Finance' => ['access' => 'view', 'scope' => 'all'],
        ]);

        $this->assertTrue($registry->allows($user, 'finance.view'));
        $this->assertTrue($registry->allows($user, 'finance.payments.view'));
        $this->assertFalse($registry->allows($user, 'finance.documents.create'));

        $this->actingAs($user)->get(route('finance.index'))->assertOk();
    }

    public function test_shared_inertia_permissions_hide_finance_for_custom_user(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $company = Company::factory()->create();
        $user = $this->customUser($company, 'manager', [
            'Clients' => ['access' => 'view', 'scope' => 'all'],
            'Finance' => ['access' => 'none', 'scope' => 'none'],
        ]);

        $response = $this->actingAs($user)->get(route('clients.index'));
        $response->assertOk();

        $original = $response->getOriginalContent();
        $this->assertInstanceOf(View::class, $original);

        $page = $original->getData()['page'] ?? null;
        $this->assertNotNull($page);

        $permissions = $page['props']['auth']['user']['permissions'] ?? null;
        $this->assertNotNull($permissions);
        $this->assertContains('clients.view', $permissions);
        $this->assertNotContains('finance.view', $permissions);
    }

    public function test_protected_roles_are_never_narrowed_by_a_stale_custom_matrix(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $company = Company::factory()->create();
        $admin = tap(User::factory()->create(['company_id' => $company->id]), fn (User $user) => $user->assignRole('admin'));
        $admin->module_permissions = [
            'base_role' => 'manager',
            'is_custom' => true,
            'modules' => ['Finance' => ['access' => 'none', 'scope' => 'none']],
        ];
        $admin->save();

        $registry = app(PermissionRegistry::class);
        $this->assertTrue($registry->allows($admin, 'finance.view'));

        $this->actingAs($admin)->get(route('finance.index'))->assertOk();
    }

    public function test_legacy_manage_finance_aliases_into_the_finance_module(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        // The finance expansion must be explicit: no wildcard alias that would
        // silently inherit future finance permissions.
        $aliases = config('archilbo_permissions.legacy_aliases');
        $this->assertArrayNotHasKey('finance.*', $aliases);

        $company = Company::factory()->create();
        $role = Role::findOrCreate('legacy_finance', 'web');
        $role->syncPermissions([Permission::findOrCreate('manage finance', 'web')]);
        $user = tap(User::factory()->create(['company_id' => $company->id]), fn (User $user) => $user->assignRole($role));

        $registry = app(PermissionRegistry::class);
        $financePermissions = array_values(array_filter(
            array_keys(config('archilbo_permissions.permissions')),
            fn (string $name) => str_starts_with($name, 'finance.'),
        ));

        $this->assertNotEmpty($financePermissions);

        foreach ($financePermissions as $permission) {
            $this->assertSame(['manage finance'], $aliases[$permission], "{$permission} must expand explicitly from manage finance");
            $this->assertTrue($registry->allows($user, $permission), "manage finance must grant {$permission}");
        }
    }

    public function test_custom_matrix_preserves_unmanaged_role_permissions(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $registry = app(PermissionRegistry::class);
        $company = Company::factory()->create();
        $user = $this->customUser($company, 'manager', [
            'Clients' => ['access' => 'none', 'scope' => 'none'],
            'Finance' => ['access' => 'none', 'scope' => 'none'],
            'Projects' => ['access' => 'none', 'scope' => 'none'],
        ]);

        // The base role also carries permissions the matrix does not govern
        // (dashboard, users, settings...). Those must survive a restrictive
        // custom matrix.
        $user->syncPermissions([
            'dashboard.view',
            'users.view',
            'users.roles.manage',
            'settings.view',
            'view dashboard',
            'manage users',
        ]);

        $effective = $registry->effectiveNames($user);

        $this->assertContains('dashboard.view', $effective);
        $this->assertContains('users.view', $effective);
        $this->assertContains('users.roles.manage', $effective);
        $this->assertContains('settings.view', $effective);

        // Managed modules remain fully governed by the matrix.
        $this->assertNotContains('clients.view', $effective);
        $this->assertNotContains('finance.view', $effective);
        $this->assertNotContains('dossiers.view', $effective);
    }

    public function test_managed_grants_and_legacy_aliases_cannot_bypass_custom_matrix(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $registry = app(PermissionRegistry::class);
        $company = Company::factory()->create();
        $user = $this->customUser($company, 'manager', [
            'Clients' => ['access' => 'none', 'scope' => 'none'],
            'Finance' => ['access' => 'none', 'scope' => 'none'],
        ]);

        // Worst case: the inherited role grants managed permissions directly
        // AND through legacy aliases. The matrix must still win.
        $user->syncPermissions([
            'finance.view',
            'clients.view',
            'manage finance',
            'manage clients',
            'view dashboard',
        ]);

        $effective = $registry->effectiveNames($user);

        $this->assertNotContains('finance.view', $effective);
        $this->assertNotContains('clients.view', $effective);
        $this->assertFalse($registry->allows($user, 'finance.view'));
        $this->assertFalse($registry->allows($user, 'clients.view'));
        $this->assertFalse($registry->allows($user, 'finance.documents.create'));

        // The unmanaged legacy grant is preserved.
        $this->assertContains('dashboard.view', $effective);
        $this->assertTrue($registry->allows($user, 'dashboard.view'));
    }

    public function test_module_sets_cover_every_catalogue_permission_except_unmanaged_allowlist(): void
    {
        $catalogue = array_keys(config('archilbo_permissions.permissions'));
        $managed = collect(config('archilbo_permissions.access_modules'))
            ->flatMap(fn (array $module) => array_merge(
                $module['view'] ?? [],
                $module['edit'] ?? [],
                $module['delete'] ?? [],
            ))
            ->values()
            ->all();

        $unmanagedAllowlist = [
            'dashboard.view',
            'users.view',
            'users.create',
            'users.update',
            'users.delete',
            'users.roles.manage',
            'users.access.manage',
            'users.password.reset',
            'settings.view',
            'settings.update',
            'qa.view',
            'notifications.view',
            'notifications.manage',
        ];

        $this->assertSame([], array_values(array_diff($catalogue, $unmanagedAllowlist, $managed)));
        $this->assertSame([], array_values(array_diff($managed, $catalogue)));
        $this->assertSame($managed, array_values(array_unique($managed)));
    }

    public function test_projects_matrix_governs_all_project_design_permissions(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $registry = app(PermissionRegistry::class);
        $company = Company::factory()->create();
        $viewOnly = $this->customUser($company, 'manager', [
            'Projects' => ['access' => 'view', 'scope' => 'all'],
        ]);
        $viewOnly->syncPermissions([
            'project-design.view',
            'project-design.review',
            'project-design.approve',
            'project-design.archive',
            'project-design.manage',
        ]);

        $this->assertTrue($registry->allows($viewOnly, 'dossiers.view'));
        $this->assertTrue($registry->allows($viewOnly, 'project-design.view'));
        $this->assertFalse($registry->allows($viewOnly, 'project-design.review'));
        $this->assertFalse($registry->allows($viewOnly, 'project-design.approve'));
        $this->assertFalse($registry->allows($viewOnly, 'project-design.archive'));
        $this->assertFalse($registry->allows($viewOnly, 'project-design.manage'));

        $editor = $this->customUser($company, 'manager', [
            'Projects' => ['access' => 'edit', 'scope' => 'all'],
        ]);
        $editor->syncPermissions(['project-design.view']);

        $this->assertTrue($registry->allows($editor, 'project-design.review'));
        $this->assertTrue($registry->allows($editor, 'project-design.approve'));
        $this->assertTrue($registry->allows($editor, 'project-design.manage'));
        $this->assertFalse($registry->allows($editor, 'project-design.delete'));
        $this->assertFalse($registry->allows($editor, 'project-design.archive'));
    }

    public function test_cin_scan_route_requires_cin_scan_for_seeded_roles(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $company = Company::factory()->create();
        $manager = tap(User::factory()->create(['company_id' => $company->id, 'branch_id' => null]), fn (User $user) => $user->assignRole('manager'));
        $viewer = tap(User::factory()->create(['company_id' => $company->id, 'branch_id' => null]), fn (User $user) => $user->assignRole('viewer'));

        // Manager carries the legacy `manage clients` alias, which expands to
        // clients.cin.scan; viewer has read-only client access.
        $this->actingAs($manager)->postJson(route('clients.scan-cin'))->assertStatus(422);
        $this->actingAs($viewer)->postJson(route('clients.scan-cin'))->assertForbidden();
    }

    public function test_cin_scan_follows_the_clients_module_matrix(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $registry = app(PermissionRegistry::class);
        $company = Company::factory()->create();

        $editor = $this->customUser($company, 'manager', ['Clients' => ['access' => 'edit', 'scope' => 'all']]);
        $viewer = $this->customUser($company, 'manager', ['Clients' => ['access' => 'view', 'scope' => 'all']]);

        $this->assertTrue($registry->allows($editor, 'clients.cin.scan'));
        $this->assertFalse($registry->allows($viewer, 'clients.cin.scan'));

        $this->actingAs($editor)->postJson(route('clients.scan-cin'))->assertStatus(422);
        $this->actingAs($viewer)->postJson(route('clients.scan-cin'))->assertForbidden();
    }

    /**
     * Generated from config: for every access module and every level, a custom
     * user receives exactly the permissions declared for that level (and the
     * lower ones) — and nothing from the other modules.
     */
    public function test_every_module_level_grants_exactly_its_declared_permissions(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $registry = app(PermissionRegistry::class);
        $company = Company::factory()->create();
        $modules = config('archilbo_permissions.access_modules');

        foreach ($modules as $module => $sets) {
            foreach (['none', 'view', 'edit', 'delete'] as $level) {
                $user = $this->customUser($company, 'manager', [$module => ['access' => $level, 'scope' => 'all']]);

                foreach ($modules as $otherModule => $otherSets) {
                    foreach (['view', 'edit', 'delete'] as $candidate) {
                        foreach (($otherSets[$candidate] ?? []) as $permission) {
                            $expected = $otherModule === $module && $this->levelIncludes($level, $candidate);

                            $this->assertSame(
                                $expected,
                                $registry->allows($user, $permission),
                                "{$permission} must be ".($expected ? 'granted' : 'denied')." at {$module}={$level}",
                            );
                        }
                    }
                }
            }
        }
    }

    public function test_finance_settings_endpoints_require_settings_update(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $company = Company::factory()->create();
        $payload = [
            'finance' => [
                'default_tva_rate' => 20,
                'default_currency' => 'MAD',
                'default_payment_terms_days' => 30,
                'default_quote_validity_days' => 30,
                'default_unit_price_m2' => 900,
                'default_architect_rate' => 0.5,
            ],
            'company' => [],
            'bank' => [],
        ];

        // finance_admin: the legacy `manage finance` permission expands to
        // finance.settings.update through the explicit alias.
        $financeAdmin = tap(User::factory()->create(['company_id' => $company->id, 'branch_id' => null]), fn (User $user) => $user->assignRole('finance_admin'));
        $this->actingAs($financeAdmin)->put(route('finance.settings.update'), $payload)->assertRedirect();

        // staff carries `manage users` but must never reach finance settings:
        // the old raw `can('manage users')` fallback is gone.
        $staff = tap(User::factory()->create(['company_id' => $company->id, 'branch_id' => null]), fn (User $user) => $user->assignRole('staff'));
        $this->actingAs($staff)->put(route('finance.settings.update'), $payload)->assertForbidden();

        // Custom matrix governs the endpoint: Finance=edit grants it.
        $editor = $this->customUser($company, 'manager', ['Finance' => ['access' => 'edit', 'scope' => 'all']]);
        $this->actingAs($editor)->put(route('finance.settings.update'), $payload)->assertRedirect();

        // Finance=none denies it, even though the base role is manager.
        $none = $this->customUser($company, 'manager', ['Finance' => ['access' => 'none', 'scope' => 'none']]);
        $this->actingAs($none)->put(route('finance.settings.update'), $payload)->assertForbidden();
    }

    public function test_project_design_legacy_alias_is_resolved_by_the_registry(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $company = Company::factory()->create();
        $role = Role::findOrCreate('legacy_designer', 'web');
        $role->syncPermissions([Permission::findOrCreate('project_design', 'web')]);
        $user = tap(User::factory()->create(['company_id' => $company->id, 'branch_id' => null]), fn (User $user) => $user->assignRole($role));

        $registry = app(PermissionRegistry::class);
        $this->assertTrue($registry->allows($user, 'project-design.upload'));
        $this->assertTrue($registry->allows($user, 'project-design.review'));
        $this->assertTrue($registry->allows($user, 'project-design.approve'));

        // The legacy alias must not leak outside the project-design namespace.
        $this->assertFalse($registry->allows($user, 'dossiers.view'));
        $this->assertFalse($registry->allows($user, 'finance.view'));
    }

    public function test_allows_any_and_all_helpers(): void
    {
        $company = Company::factory()->create();
        $role = Role::findOrCreate('partial_reader', 'web');
        $role->syncPermissions([Permission::findOrCreate('clients.view', 'web')]);
        $user = tap(User::factory()->create(['company_id' => $company->id]), fn (User $user) => $user->assignRole($role));

        $registry = app(PermissionRegistry::class);
        $this->assertTrue($registry->allowsAny($user, ['clients.view', 'finance.view']));
        $this->assertFalse($registry->allowsAll($user, ['clients.view', 'finance.view']));
        $this->assertTrue($registry->allowsAll($user, ['clients.view']));
        $this->assertFalse($registry->allowsAll($user, []));
    }

    public function test_planning_route_requires_tasks_view(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $company = Company::factory()->create();
        $reader = Role::findOrCreate('planning_reader', 'web');
        $reader->syncPermissions([Permission::findOrCreate('tasks.view', 'web')]);
        $allowed = tap(User::factory()->create(['company_id' => $company->id]), fn (User $user) => $user->assignRole($reader));
        $denied = tap(User::factory()->create(['company_id' => $company->id]), fn (User $user) => $user->assignRole(Role::findOrCreate('plain', 'web')));

        $this->actingAs($denied)->get(route('planning.index'))->assertForbidden();
        $this->actingAs($allowed)->get(route('planning.index'))->assertOk();
    }

    public function test_ocr_api_requires_cin_scan_permission(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $company = Company::factory()->create();
        $scanner = Role::findOrCreate('ocr_scanner', 'web');
        $scanner->syncPermissions([Permission::findOrCreate('clients.cin.scan', 'web')]);
        $allowed = tap(User::factory()->create(['company_id' => $company->id]), fn (User $user) => $user->assignRole($scanner));
        $denied = tap(User::factory()->create(['company_id' => $company->id]), fn (User $user) => $user->assignRole(Role::findOrCreate('plain', 'web')));

        $this->actingAs($denied)->postJson(route('api.ocr.scan'))->assertForbidden();
        $this->actingAs($allowed)->postJson(route('api.ocr.scan'))->assertStatus(422);
    }

    private function levelIncludes(string $level, string $candidate): bool
    {
        $ranks = ['none' => 0, 'view' => 1, 'edit' => 2, 'delete' => 3];

        return ($ranks[$level] ?? 0) >= ($ranks[$candidate] ?? PHP_INT_MAX);
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
}
