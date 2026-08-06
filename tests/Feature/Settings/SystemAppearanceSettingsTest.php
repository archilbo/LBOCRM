<?php

namespace Tests\Feature\Settings;

use App\Models\Company;
use App\Models\CompanySetting;
use App\Models\User;
use App\Services\SystemSettingsService;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SystemAppearanceSettingsTest extends TestCase
{
    use RefreshDatabase;

    private Company $company;

    private SystemSettingsService $systemSettings;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolesAndPermissionsSeeder::class);
        $this->company = Company::factory()->create();
        $this->systemSettings = app(SystemSettingsService::class);
        $this->systemSettings->clearCache();
    }

    private function userWithRole(string $role): User
    {
        $user = User::factory()->create(['company_id' => $this->company->id]);
        $user->assignRole($role);

        return $user;
    }

    private function userWithCustomModules(string $baseRole, array $modules): User
    {
        $user = User::factory()->create(['company_id' => $this->company->id]);
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

    private function validPayload(array $overrides = []): array
    {
        return array_merge([
            'app_name' => 'ACME Bureau',
            'short_name' => 'ACME',
            'description' => 'Bureau d’architecture',
            'accent_color' => '#2563EB',
        ], $overrides);
    }

    public function test_guest_is_redirected_to_login(): void
    {
        $this->get(route('settings.system-appearance.index'))
            ->assertRedirect();
    }

    public function test_manager_without_permission_cannot_open_the_page(): void
    {
        $this->actingAs($this->userWithRole('manager'))
            ->get(route('settings.system-appearance.index'))
            ->assertStatus(403);
    }

    public function test_viewer_without_permission_cannot_open_the_page(): void
    {
        $this->actingAs($this->userWithRole('viewer'))
            ->get(route('settings.system-appearance.index'))
            ->assertStatus(403);
    }

    public function test_user_with_view_permission_can_open_the_page(): void
    {
        $user = $this->userWithCustomModules('staff', [
            'Système' => ['access' => 'view', 'scope' => 'all'],
        ]);

        $this->actingAs($user)
            ->get(route('settings.system-appearance.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('settings/system-appearance')
                ->where('permissions.view', true)
                ->where('permissions.update', false)
                ->where('branding.appName', (string) config('system_branding.app_name')));
    }

    public function test_view_only_user_cannot_update_settings(): void
    {
        $user = $this->userWithCustomModules('staff', [
            'Système' => ['access' => 'view', 'scope' => 'all'],
        ]);

        $this->actingAs($user)
            ->put(route('settings.system-appearance.update'), $this->validPayload())
            ->assertStatus(403);

        $this->assertDatabaseCount('company_settings', 0);
    }

    public function test_admin_can_save_valid_settings(): void
    {
        $admin = $this->userWithRole('admin');

        $this->actingAs($admin)
            ->put(route('settings.system-appearance.update'), $this->validPayload())
            ->assertRedirect()
            ->assertSessionHas('success', 'Les paramètres système ont été mis à jour.');

        $this->assertDatabaseHas('company_settings', [
            'group' => 'system_branding',
            'key' => 'app.name',
            'value' => 'ACME Bureau',
            'updated_by' => $admin->id,
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $admin->id,
            'action' => 'system.branding.updated',
        ]);
    }

    public function test_valid_values_are_stored_normalized_and_cached(): void
    {
        $admin = $this->userWithRole('admin');

        $this->actingAs($admin)
            ->put(route('settings.system-appearance.update'), $this->validPayload([
                'accent_color' => '  #2563eb  ',
                'description' => '',
            ]))
            ->assertRedirect();

        // Accent is trimmed and uppercased; a cleared description is stored
        // as NULL (ConvertEmptyStringsToNull middleware) and read back as null.
        $this->assertSame('#2563EB', $this->systemSettings->get('branding.accent_color'));
        $this->assertSame('ACME Bureau', $this->systemSettings->get('app.name'));
        $this->assertNull($this->systemSettings->get('app.description'));

        $this->assertDatabaseCount('company_settings', 4);
    }

    public function test_invalid_accent_color_is_rejected(): void
    {
        $admin = $this->userWithRole('admin');

        $this->actingAs($admin)
            ->put(route('settings.system-appearance.update'), $this->validPayload([
                'accent_color' => 'gold',
            ]))
            ->assertSessionHasErrors('accent_color');

        $this->assertDatabaseCount('company_settings', 0);
    }

    public function test_app_name_longer_than_80_characters_is_rejected(): void
    {
        $admin = $this->userWithRole('admin');

        $this->actingAs($admin)
            ->put(route('settings.system-appearance.update'), $this->validPayload([
                'app_name' => str_repeat('a', 81),
            ]))
            ->assertSessionHasErrors('app_name');

        $this->assertDatabaseCount('company_settings', 0);
    }

    public function test_unknown_fields_are_safely_ignored(): void
    {
        $admin = $this->userWithRole('admin');

        $this->actingAs($admin)
            ->put(route('settings.system-appearance.update'), $this->validPayload([
                'hacker_field' => 'injection',
                'branding.logo_light' => 'php://filter',
            ]))
            ->assertRedirect();

        // Only the four allowed keys are ever persisted.
        $this->assertDatabaseCount('company_settings', 4);
        $this->assertDatabaseMissing('company_settings', [
            'group' => 'system_branding',
            'key' => 'hacker_field',
        ]);
    }

    public function test_saved_values_are_reflected_in_page_props(): void
    {
        $admin = $this->userWithRole('admin');

        $this->actingAs($admin)
            ->put(route('settings.system-appearance.update'), $this->validPayload())
            ->assertRedirect();

        $this->actingAs($admin)
            ->get(route('settings.system-appearance.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('branding.appName', 'ACME Bureau')
                ->where('branding.shortName', 'ACME')
                ->where('branding.accentColor', '#2563EB')
                ->where('branding.description', 'Bureau d’architecture'));
    }

    public function test_protected_super_admin_keeps_full_access(): void
    {
        $superAdmin = $this->userWithRole('super_admin');

        $this->actingAs($superAdmin)
            ->get(route('settings.system-appearance.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('permissions.update', true));

        $this->actingAs($superAdmin)
            ->put(route('settings.system-appearance.update'), $this->validPayload([
                'app_name' => 'ARCHI HOLDING',
            ]))
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertSame('ARCHI HOLDING', $this->systemSettings->get('app.name'));
    }
}
