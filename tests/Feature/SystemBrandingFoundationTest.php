<?php

namespace Tests\Feature;

use App\Models\CompanySetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class SystemBrandingFoundationTest extends TestCase
{
    use RefreshDatabase;

    public function test_company_settings_table_has_updated_by_column(): void
    {
        $this->assertTrue(Schema::hasColumn('company_settings', 'updated_by'));
    }

    public function test_updated_by_is_nulled_when_the_user_is_deleted(): void
    {
        $user = User::factory()->create();
        $setting = CompanySetting::create([
            'group' => 'system_branding',
            'key' => 'app_name',
            'value' => 'ARCHI LBO OS',
            'type' => 'string',
            'is_public' => true,
            'updated_by' => $user->id,
        ]);

        $user->delete();

        $this->assertNull($setting->fresh()->updated_by);
    }

    public function test_group_and_public_scopes_filter_settings(): void
    {
        CompanySetting::create(['group' => 'system_branding', 'key' => 'accent_color', 'value' => '#C9A227', 'type' => 'string', 'is_public' => true]);
        CompanySetting::create(['group' => 'system_branding', 'key' => 'app_name', 'value' => 'Secret', 'type' => 'string', 'is_public' => false]);
        CompanySetting::create(['group' => 'finance', 'key' => 'default_tva_rate', 'value' => '20', 'type' => 'decimal', 'is_public' => false]);

        $this->assertSame(2, CompanySetting::group('system_branding')->count());
        $this->assertSame(1, CompanySetting::public()->count());
    }

    public function test_system_branding_config_has_safe_defaults(): void
    {
        $this->assertSame('LBO OS', config('system_branding.short_name'));
        $this->assertSame('#F6B725', config('system_branding.accent_color'));
        $this->assertMatchesRegularExpression('/^#[0-9A-Fa-f]{6}$/', config('system_branding.accent_color'));
        $this->assertNotNull(config('system_branding.app_name'));
    }
}
