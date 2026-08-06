<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\User;
use App\Services\PermissionRegistry;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AdminUserPermissionsEndpointTest extends TestCase
{
    use RefreshDatabase;

    public function test_update_permissions_stores_custom_matrix_and_enforces_it_on_the_next_request(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $company = Company::factory()->create();
        $actor = $this->permissionActorFor($company);
        $target = tap(User::factory()->create(['company_id' => $company->id, 'branch_id' => null]), fn (User $user) => $user->assignRole('manager'));

        $registry = app(PermissionRegistry::class);
        $this->assertTrue($registry->allows($target, 'finance.view'));
        $this->actingAs($target)->get(route('finance.index'))->assertOk();

        $payload = $this->modulePayload(['Clients' => 'edit', 'Finance' => 'none']);

        $this->actingAs($actor)
            ->put(route('admin.users.permissions', $target), [
                'role' => 'manager',
                'isCustom' => true,
                'permissions' => $payload,
            ])
            ->assertRedirect(route('admin.users.index'));

        $target->refresh();
        $this->assertTrue($target->hasRole('custom'));
        $this->assertFalse($target->hasRole('manager'));

        $configuration = $target->module_permissions;
        $this->assertSame('manager', $configuration['base_role']);
        $this->assertTrue($configuration['is_custom']);
        $this->assertSame('edit', $configuration['modules']['Clients']['access']);
        $this->assertSame('none', $configuration['modules']['Finance']['access']);

        $this->assertTrue($registry->allows($target, 'clients.view'));
        $this->assertTrue($registry->allows($target, 'clients.update'));
        $this->assertFalse($registry->allows($target, 'clients.delete'));
        $this->assertFalse($registry->allows($target, 'finance.view'));

        // The change is enforced on the very next request, no stale cache.
        $this->actingAs($target)->get(route('finance.index'))->assertForbidden();
        $this->actingAs($target)->get(route('clients.index'))->assertOk();
    }

    public function test_update_permissions_with_is_custom_false_restores_role_defaults(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $company = Company::factory()->create();
        $actor = $this->permissionActorFor($company);
        $target = tap(User::factory()->create(['company_id' => $company->id, 'branch_id' => null]), fn (User $user) => $user->assignRole('manager'));

        $registry = app(PermissionRegistry::class);
        $target->syncRoles(['custom']);
        $target->syncPermissions([]);
        $target->module_permissions = [
            'base_role' => 'manager',
            'is_custom' => true,
            'modules' => $this->normalize(['Finance' => 'none']),
        ];
        $target->save();

        $this->assertFalse($registry->allows($target, 'finance.view'));

        $this->actingAs($actor)
            ->put(route('admin.users.permissions', $target), [
                'role' => 'manager',
                'isCustom' => false,
                'permissions' => $this->modulePayload(),
            ])
            ->assertRedirect(route('admin.users.index'));

        $target->refresh();
        $this->assertTrue($target->hasRole('manager'));
        $this->assertFalse($target->hasRole('custom'));
        $this->assertNull($target->module_permissions);
        $this->assertTrue($registry->allows($target, 'finance.view'));
        $this->assertTrue($registry->allows($target, 'finance.settings.view'));

        $this->actingAs($target)->get(route('finance.index'))->assertOk();
    }

    public function test_update_role_clears_stale_custom_matrix(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $company = Company::factory()->create();
        $actor = $this->permissionActorFor($company);
        $target = tap(User::factory()->create(['company_id' => $company->id, 'branch_id' => null]), fn (User $user) => $user->assignRole('manager'));

        $registry = app(PermissionRegistry::class);
        $target->syncRoles(['custom']);
        $target->syncPermissions([]);
        $target->module_permissions = [
            'base_role' => 'manager',
            'is_custom' => true,
            'modules' => $this->normalize(['Finance' => 'none']),
        ];
        $target->save();

        $this->assertFalse($registry->allows($target, 'finance.view'));

        $this->actingAs($actor)
            ->put(route('admin.users.role', $target), ['role' => 'staff'])
            ->assertRedirect(route('admin.users.index'));

        $target->refresh();
        $this->assertTrue($target->hasRole('staff'));
        $this->assertNull($target->module_permissions);
        $this->assertTrue($registry->allows($target, 'finance.view'));

        $this->actingAs($target)->get(route('finance.index'))->assertOk();
    }

    public function test_bulk_update_role_clears_matrices_and_skips_protected_accounts(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $company = Company::factory()->create();
        $actor = $this->permissionActorFor($company);

        $customTarget = tap(User::factory()->create(['company_id' => $company->id, 'branch_id' => null]), fn (User $user) => $user->assignRole('manager'));
        $customTarget->syncRoles(['custom']);
        $customTarget->syncPermissions([]);
        $customTarget->module_permissions = [
            'base_role' => 'manager',
            'is_custom' => true,
            'modules' => $this->normalize(['Finance' => 'none']),
        ];
        $customTarget->save();

        $adminTarget = tap(User::factory()->create(['company_id' => $company->id, 'branch_id' => null]), fn (User $user) => $user->assignRole('admin'));

        $this->actingAs($actor)
            ->put(route('admin.users.bulk.role'), [
                'userIds' => [$customTarget->id, $adminTarget->id],
                'role' => 'viewer',
            ])
            ->assertRedirect(route('admin.users.index'));

        $customTarget->refresh();
        $adminTarget->refresh();

        $this->assertTrue($customTarget->hasRole('viewer'));
        $this->assertNull($customTarget->module_permissions);

        $this->assertTrue($adminTarget->hasRole('admin'));
        $this->assertTrue($adminTarget->hasPermissionTo('users.roles.manage'));
    }

    public function test_update_permissions_rejects_invalid_levels_and_protected_role_assignment(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $company = Company::factory()->create();
        $actor = $this->permissionActorFor($company);
        $target = User::factory()->create(['company_id' => $company->id, 'branch_id' => null]);

        $this->actingAs($actor)
            ->put(route('admin.users.permissions', $target), [
                'role' => 'viewer',
                'isCustom' => true,
                'permissions' => $this->modulePayload(['Clients' => 'full']),
            ])
            ->assertSessionHasErrors('permissions.Clients.access');

        // A non-super-admin cannot grant the super_admin role.
        $this->actingAs($actor)
            ->put(route('admin.users.permissions', $target), [
                'role' => 'super_admin',
                'isCustom' => false,
                'permissions' => $this->modulePayload(),
            ])
            ->assertForbidden();

        $target->refresh();
        $this->assertNull($target->module_permissions);
        $this->assertFalse($target->hasRole('super_admin'));
    }

    public function test_foreign_company_targets_cannot_be_modified(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $companyA = Company::factory()->create();
        $companyB = Company::factory()->create();
        $actor = $this->permissionActorFor($companyA);
        $foreign = tap(User::factory()->create(['company_id' => $companyB->id, 'branch_id' => null]), fn (User $user) => $user->assignRole('manager'));

        $this->actingAs($actor)
            ->put(route('admin.users.role', $foreign), ['role' => 'staff'])
            ->assertNotFound();

        $this->actingAs($actor)
            ->put(route('admin.users.permissions', $foreign), [
                'role' => 'viewer',
                'isCustom' => true,
                'permissions' => $this->modulePayload(),
            ])
            ->assertNotFound();

        $foreign->refresh();
        $this->assertTrue($foreign->hasRole('manager'));
        $this->assertNull($foreign->module_permissions);
    }

    private function permissionActorFor(Company $company): User
    {
        $role = Role::findOrCreate('endpoint_permission_actor', 'web');
        $role->syncPermissions([Permission::findOrCreate('users.roles.manage', 'web')]);

        return tap(User::factory()->create([
            'company_id' => $company->id,
            'branch_id' => null,
        ]), fn (User $user) => $user->assignRole($role));
    }

    /**
     * Full matrix payload for the editor: every module key with the given
     * overrides, everything else set to none.
     */
    private function modulePayload(array $overrides = []): array
    {
        $modules = array_keys(config('archilbo_permissions.access_modules'));
        $payload = [];

        foreach ($modules as $module) {
            $payload[$module] = [
                'access' => $overrides[$module] ?? 'none',
                'scope' => ($overrides[$module] ?? 'none') === 'none' ? 'none' : 'all',
            ];
        }

        return $payload;
    }

    private function normalize(array $overrides): array
    {
        return app(PermissionRegistry::class)->normalizeModuleConfiguration($this->modulePayload($overrides));
    }
}
