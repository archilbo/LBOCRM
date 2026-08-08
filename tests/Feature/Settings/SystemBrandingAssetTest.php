<?php

namespace Tests\Feature\Settings;

use App\Models\Company;
use App\Models\CompanySetting;
use App\Models\User;
use App\Services\SystemBrandingAssetService;
use App\Services\SystemSettingsService;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Mockery\MockInterface;
use Tests\TestCase;

class SystemBrandingAssetTest extends TestCase
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

        Storage::fake('public');
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

    private function uploadPayload(array $overrides = []): array
    {
        return array_merge([
            'asset_type' => 'logo_light',
            'file' => UploadedFile::fake()->image('logo.png', 200, 200),
        ], $overrides);
    }

    private function storedPath(string $settingKey): ?string
    {
        $row = CompanySetting::query()
            ->where('group', 'system_branding')
            ->where('key', $settingKey)
            ->first();

        return $row?->value;
    }

    public function test_guest_is_redirected_to_login_when_uploading(): void
    {
        $this->post(route('settings.system-appearance.assets.store'), $this->uploadPayload())
            ->assertRedirect();
    }

    public function test_guest_is_redirected_to_login_when_removing(): void
    {
        $this->delete(route('settings.system-appearance.assets.destroy'), ['asset_type' => 'logo_light'])
            ->assertRedirect();
    }

    public function test_manager_without_permission_cannot_upload(): void
    {
        $this->actingAs($this->userWithRole('manager'))
            ->post(route('settings.system-appearance.assets.store'), $this->uploadPayload())
            ->assertStatus(403);
    }

    public function test_viewer_without_permission_cannot_upload(): void
    {
        $this->actingAs($this->userWithRole('viewer'))
            ->post(route('settings.system-appearance.assets.store'), $this->uploadPayload())
            ->assertStatus(403);
    }

    public function test_custom_system_view_user_cannot_upload(): void
    {
        $user = $this->userWithCustomModules('staff', [
            'Système' => ['access' => 'view', 'scope' => 'all'],
        ]);

        $this->actingAs($user)
            ->post(route('settings.system-appearance.assets.store'), $this->uploadPayload())
            ->assertStatus(403);
    }

    public function test_custom_system_edit_user_can_upload(): void
    {
        $user = $this->userWithCustomModules('staff', [
            'Système' => ['access' => 'edit', 'scope' => 'all'],
        ]);

        $this->actingAs($user)
            ->post(route('settings.system-appearance.assets.store'), $this->uploadPayload())
            ->assertRedirect();
    }

    public function test_custom_system_complet_user_can_upload(): void
    {
        $user = $this->userWithCustomModules('staff', [
            'Système' => ['access' => 'delete', 'scope' => 'all'],
        ]);

        $this->actingAs($user)
            ->post(route('settings.system-appearance.assets.store'), $this->uploadPayload())
            ->assertRedirect();
    }

    public function test_admin_can_upload_png_logo(): void
    {
        $admin = $this->userWithRole('admin');

        $this->actingAs($admin)
            ->post(route('settings.system-appearance.assets.store'), $this->uploadPayload())
            ->assertRedirect();

        $path = $this->storedPath('branding.logo_light');
        $this->assertNotNull($path);
        Storage::disk('public')->assertExists($path);
    }

    public function test_jpeg_logo_is_accepted(): void
    {
        $admin = $this->userWithRole('admin');

        $this->actingAs($admin)
            ->post(route('settings.system-appearance.assets.store'), $this->uploadPayload([
                'asset_type' => 'logo_dark',
                'file' => UploadedFile::fake()->image('logo.jpg', 200, 200),
            ]))
            ->assertRedirect();

        $this->assertNotNull($this->storedPath('branding.logo_dark'));
    }

    public function test_webp_logo_is_accepted(): void
    {
        $admin = $this->userWithRole('admin');

        $this->actingAs($admin)
            ->post(route('settings.system-appearance.assets.store'), $this->uploadPayload([
                'file' => UploadedFile::fake()->image('logo.webp', 200, 200),
            ]))
            ->assertRedirect();

        $this->assertNotNull($this->storedPath('branding.logo_light'));
    }

    public function test_svg_file_is_rejected(): void
    {
        $admin = $this->userWithRole('admin');

        $this->actingAs($admin)
            ->post(route('settings.system-appearance.assets.store'), $this->uploadPayload([
                'file' => UploadedFile::fake()->create('logo.svg', 10, 'image/svg+xml'),
            ]))
            ->assertSessionHasErrors('file');

        $this->assertDatabaseMissing('company_settings', ['key' => 'branding.logo_light']);
        $this->assertSame([], Storage::disk('public')->allFiles('system/branding'));
    }

    public function test_php_file_is_rejected(): void
    {
        $admin = $this->userWithRole('admin');

        $this->actingAs($admin)
            ->post(route('settings.system-appearance.assets.store'), $this->uploadPayload([
                'file' => UploadedFile::fake()->create('logo.php', 10, 'application/x-php'),
            ]))
            ->assertSessionHasErrors('file');
    }

    public function test_file_larger_than_2mb_is_rejected(): void
    {
        $admin = $this->userWithRole('admin');

        $this->actingAs($admin)
            ->post(route('settings.system-appearance.assets.store'), $this->uploadPayload([
                'file' => UploadedFile::fake()->create('logo.png', 2049, 'image/png'),
            ]))
            ->assertSessionHasErrors('file');

        $this->assertSame([], Storage::disk('public')->allFiles('system/branding'));
    }

    public function test_unknown_asset_type_is_rejected(): void
    {
        $admin = $this->userWithRole('admin');

        $this->actingAs($admin)
            ->post(route('settings.system-appearance.assets.store'), $this->uploadPayload([
                'asset_type' => 'banner',
            ]))
            ->assertSessionHasErrors('asset_type');
    }

    public function test_logo_smaller_than_32px_is_rejected(): void
    {
        $admin = $this->userWithRole('admin');

        $this->actingAs($admin)
            ->post(route('settings.system-appearance.assets.store'), $this->uploadPayload([
                'file' => UploadedFile::fake()->image('logo.png', 16, 16),
            ]))
            ->assertSessionHasErrors('file');
    }

    public function test_logo_larger_than_4096px_is_rejected(): void
    {
        $admin = $this->userWithRole('admin');

        $this->actingAs($admin)
            ->post(route('settings.system-appearance.assets.store'), $this->uploadPayload([
                'file' => UploadedFile::fake()->image('logo.png', 5000, 5000),
            ]))
            ->assertSessionHasErrors('file');
    }

    public function test_compact_logo_larger_than_2048px_is_rejected(): void
    {
        $admin = $this->userWithRole('admin');

        $this->actingAs($admin)
            ->post(route('settings.system-appearance.assets.store'), $this->uploadPayload([
                'asset_type' => 'logo_compact',
                'file' => UploadedFile::fake()->image('compact.png', 3000, 3000),
            ]))
            ->assertSessionHasErrors('file');
    }

    public function test_favicon_accepts_only_png_or_webp(): void
    {
        $admin = $this->userWithRole('admin');

        $this->actingAs($admin)
            ->post(route('settings.system-appearance.assets.store'), $this->uploadPayload([
                'asset_type' => 'favicon',
                'file' => UploadedFile::fake()->image('favicon.jpg', 64, 64),
            ]))
            ->assertSessionHasErrors('file');

        $this->actingAs($admin)
            ->post(route('settings.system-appearance.assets.store'), $this->uploadPayload([
                'asset_type' => 'favicon',
                'file' => UploadedFile::fake()->image('favicon.png', 64, 64),
            ]))
            ->assertRedirect();
    }

    public function test_file_is_stored_under_system_branding_with_random_name(): void
    {
        $admin = $this->userWithRole('admin');

        $this->actingAs($admin)
            ->post(route('settings.system-appearance.assets.store'), $this->uploadPayload())
            ->assertRedirect();

        $path = (string) $this->storedPath('branding.logo_light');
        $this->assertStringStartsWith('system/branding/', $path);
        $this->assertNotSame('logo.png', basename($path));
        $this->assertFalse(str_starts_with($path, '/'));
        $this->assertFalse(str_contains($path, '\\'));
        $this->assertFalse(str_contains($path, '..'));
        Storage::disk('public')->assertExists($path);
    }

    public function test_public_url_uses_storage_prefix_and_never_leaks_path(): void
    {
        $admin = $this->userWithRole('admin');

        $this->actingAs($admin)
            ->post(route('settings.system-appearance.assets.store'), $this->uploadPayload())
            ->assertRedirect();

        $path = (string) $this->storedPath('branding.logo_light');
        $url = $this->systemSettings->brandingArray()['logoLightUrl'];

        $this->assertIsString($url);
        $this->assertStringContainsString('/storage/system/branding/', $url);
        $this->assertNotSame($path, $url);
        $this->assertSame(
            '/storage/'.$path,
            parse_url($url, PHP_URL_PATH),
        );
    }

    public function test_replacing_logo_deletes_previous_file_after_success(): void
    {
        $admin = $this->userWithRole('admin');

        $this->actingAs($admin)
            ->post(route('settings.system-appearance.assets.store'), $this->uploadPayload())
            ->assertRedirect();
        $firstPath = (string) $this->storedPath('branding.logo_light');

        $this->actingAs($admin)
            ->post(route('settings.system-appearance.assets.store'), $this->uploadPayload())
            ->assertRedirect();
        $secondPath = (string) $this->storedPath('branding.logo_light');

        $this->assertNotSame($firstPath, $secondPath);
        Storage::disk('public')->assertMissing($firstPath);
        Storage::disk('public')->assertExists($secondPath);
        $this->assertSame($secondPath, $this->systemSettings->get('branding.logo_light'));
    }

    public function test_failed_persistence_removes_new_file_and_preserves_old(): void
    {
        $admin = $this->userWithRole('admin');

        // Seed the "previous" asset directly instead of uploading it first:
        // Laravel caches the resolved controller instance on the Route object
        // (Illuminate\Routing\Route::getController), so a controller built by
        // an earlier request in the same test would keep the REAL settings
        // service injected. Building it after the mock binding guarantees the
        // mocked service is used.
        $firstPath = 'system/branding/logo-light-00000000-0000-0000-0000-000000000000.png';
        Storage::disk('public')->put($firstPath, 'previous content');
        CompanySetting::create([
            'group' => 'system_branding',
            'key' => 'branding.logo_light',
            'value' => $firstPath,
            'type' => 'string',
            'is_public' => false,
            'updated_by' => $admin->id,
        ]);
        $this->systemSettings->clearCache();

        $this->mock(SystemSettingsService::class, function (MockInterface $mock) use ($firstPath): void {
            $mock->shouldReceive('get')->with('branding.logo_light')->andReturn($firstPath);
            $mock->shouldReceive('setMany')->andThrow(new \RuntimeException('database failure'));
        });

        $this->actingAs($admin)
            ->post(route('settings.system-appearance.assets.store'), $this->uploadPayload())
            ->assertStatus(500);

        // The failed upload's orphaned file must be removed, the previous one kept.
        $files = Storage::disk('public')->allFiles('system/branding');
        $this->assertCount(1, $files);
        $this->assertSame([$firstPath], $files);
        $this->assertSame($firstPath, $this->storedPath('branding.logo_light'));
    }

    public function test_remove_nulls_setting_and_deletes_file(): void
    {
        $admin = $this->userWithRole('admin');

        $this->actingAs($admin)
            ->post(route('settings.system-appearance.assets.store'), $this->uploadPayload())
            ->assertRedirect();
        $path = (string) $this->storedPath('branding.logo_light');

        $this->actingAs($admin)
            ->delete(route('settings.system-appearance.assets.destroy'), ['asset_type' => 'logo_light'])
            ->assertRedirect();

        $this->assertNull($this->storedPath('branding.logo_light'));
        $this->assertNull($this->systemSettings->get('branding.logo_light'));
        Storage::disk('public')->assertMissing($path);
    }

    public function test_remove_missing_asset_is_a_safe_noop(): void
    {
        $admin = $this->userWithRole('admin');

        $this->actingAs($admin)
            ->delete(route('settings.system-appearance.assets.destroy'), ['asset_type' => 'logo_light'])
            ->assertRedirect();

        $this->assertNull($this->storedPath('branding.logo_light'));
    }

    public function test_custom_system_view_user_cannot_remove(): void
    {
        $user = $this->userWithCustomModules('staff', [
            'Système' => ['access' => 'view', 'scope' => 'all'],
        ]);

        $this->actingAs($user)
            ->delete(route('settings.system-appearance.assets.destroy'), ['asset_type' => 'logo_light'])
            ->assertStatus(403);
    }

    public function test_custom_system_edit_user_can_remove(): void
    {
        $user = $this->userWithCustomModules('staff', [
            'Système' => ['access' => 'edit', 'scope' => 'all'],
        ]);

        $this->actingAs($user)
            ->delete(route('settings.system-appearance.assets.destroy'), ['asset_type' => 'logo_light'])
            ->assertRedirect();
    }

    public function test_malformed_stored_path_is_cleared_without_deleting_arbitrary_file(): void
    {
        $admin = $this->userWithRole('admin');

        CompanySetting::create([
            'group' => 'system_branding',
            'key' => 'branding.logo_light',
            'value' => '../../config/app.php',
            'type' => 'string',
            'is_public' => false,
            'updated_by' => $admin->id,
        ]);

        $this->actingAs($admin)
            ->delete(route('settings.system-appearance.assets.destroy'), ['asset_type' => 'logo_light'])
            ->assertRedirect();

        // The setting is cleared; the traversal path itself is left untouched
        // (the managed-path guard logs and skips — a disk assertion on
        // '../../config/app.php' would trip the adapter's traversal guard).
        $this->assertNull($this->storedPath('branding.logo_light'));
    }

    public function test_branding_upload_never_touches_finance_company_settings(): void
    {
        $admin = $this->userWithRole('admin');

        Storage::disk('public')->put('company/logos/logo.png', 'existing finance logo');
        CompanySetting::setValue('company', 'company_logo_path', 'company/logos/logo.png', 'string', 'Company logo path');

        $this->actingAs($admin)
            ->post(route('settings.system-appearance.assets.store'), $this->uploadPayload())
            ->assertRedirect();

        $this->assertSame(
            'company/logos/logo.png',
            CompanySetting::getValue('company', 'company_logo_path', ''),
        );
        Storage::disk('public')->assertExists('company/logos/logo.png');
    }

    public function test_asset_types_are_fixed_and_mapped_to_branding_keys(): void
    {
        $this->assertSame([
            'logo_light' => 'branding.logo_light',
            'logo_dark' => 'branding.logo_dark',
            'logo_compact' => 'branding.logo_compact',
            'favicon' => 'branding.favicon',
        ], SystemBrandingAssetService::ASSET_TYPES);
    }
}
