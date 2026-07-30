<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Company;
use App\Models\Intermediary;
use App\Models\User;
use App\Services\PermissionRegistry;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class GranularClientPermissionTest extends TestCase
{
    use RefreshDatabase;

    public function test_view_only_client_user_cannot_mutate_client_records(): void
    {
        $company = Company::factory()->create();
        $user = $this->userFor($company, ['clients.view']);
        $client = Client::factory()->create(['company_id' => $company->id, 'branch_id' => null]);

        $this->assertTrue($user->can('view', $client));
        $this->assertFalse($user->can('create', Client::class));
        $this->assertFalse($user->can('update', $client));
        $this->assertFalse($user->can('delete', $client));
        $this->assertFalse($user->can('updateStatus', $client));

        $this->actingAs($user)->get(route('clients.index'))->assertOk();
        $this->actingAs($user)->get(route('clients.show', $client))->assertOk();
        $this->actingAs($user)->post(route('clients.store'), [])->assertForbidden();
        $this->actingAs($user)->put(route('clients.update', $client), [])->assertForbidden();
        $this->actingAs($user)->patch(route('clients.status.update', $client), ['status' => 'inactive'])->assertForbidden();
        $this->actingAs($user)->delete(route('clients.destroy', $client))->assertForbidden();
    }

    public function test_view_only_intermediary_user_cannot_mutate_intermediaries(): void
    {
        $company = Company::factory()->create();
        $user = $this->userFor($company, ['intermediaries.view']);
        $intermediary = Intermediary::query()->create([
            'company_id' => $company->id,
            'branch_id' => null,
            'code' => 'INT-READ-0001',
            'name' => 'Read only intermediary',
            'is_active' => true,
        ]);

        $this->assertTrue($user->can('view', $intermediary));
        $this->assertFalse($user->can('create', Intermediary::class));
        $this->assertFalse($user->can('update', $intermediary));
        $this->assertFalse($user->can('delete', $intermediary));

        $this->withoutExceptionHandling();
        $this->actingAs($user)->get(route('intermediaries.index'))->assertOk();
        $this->withExceptionHandling();
        $this->actingAs($user)->get(route('intermediaries.show', $intermediary))->assertOk();
        $this->actingAs($user)->post(route('intermediaries.store'), [])->assertForbidden();
        $this->actingAs($user)->put(route('intermediaries.update', $intermediary), [])->assertForbidden();
        $this->actingAs($user)->delete(route('intermediaries.destroy', $intermediary))->assertForbidden();
    }

    public function test_custom_module_access_grants_edit_without_delete(): void
    {
        $company = Company::factory()->create();
        $client = Client::factory()->create(['company_id' => $company->id, 'branch_id' => null]);
        $user = User::factory()->create(['company_id' => $company->id, 'branch_id' => null]);
        $customRole = Role::findOrCreate('custom', 'web');
        $customRole->syncPermissions([]);
        $user->assignRole($customRole);

        $permissions = app(PermissionRegistry::class)->permissionsForModuleLevels([
            'Clients' => ['access' => 'edit', 'scope' => 'all'],
        ]);
        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }
        $user->syncPermissions($permissions);

        $this->assertTrue($user->can('view', $client));
        $this->assertTrue($user->can('update', $client));
        $this->assertTrue($user->can('updateStatus', $client));
        $this->assertFalse($user->can('delete', $client));
        $this->assertFalse(app(PermissionRegistry::class)->allows($user, 'finance.view'));

        $this->actingAs($user)->delete(route('clients.destroy', $client))->assertForbidden();
    }

    private function userFor(Company $company, array $permissions): User
    {
        $permissionModels = collect($permissions)
            ->map(fn (string $name) => Permission::findOrCreate($name, 'web'));

        $role = Role::findOrCreate('granular_client_reader', 'web');
        $role->syncPermissions($permissionModels);

        return tap(User::factory()->create([
            'company_id' => $company->id,
            'branch_id' => null,
        ]), fn (User $user) => $user->assignRole($role));
    }
}
