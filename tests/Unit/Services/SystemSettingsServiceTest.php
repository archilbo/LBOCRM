<?php

namespace Tests\Unit\Services;

use App\Data\SystemBrandingData;
use App\Models\CompanySetting;
use App\Models\User;
use App\Services\SystemSettingsService;
use DomainException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

final class SystemSettingsServiceTest extends TestCase
{
    use RefreshDatabase;

    private SystemSettingsService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new SystemSettingsService();
        $this->service->clearCache();
    }

    public function test_empty_database_uses_configuration_defaults(): void
    {
        $branding = $this->service->branding();

        $this->assertSame((string) config('system_branding.app_name'), $branding->appName);
        $this->assertSame('LBO OS', $branding->shortName);
        $this->assertNull($branding->description);
        $this->assertSame('#F6B725', $branding->accentColor);
        $this->assertNull($branding->logoLightUrl);
        $this->assertNull($branding->logoDarkUrl);
        $this->assertNull($branding->logoCompactUrl);
        $this->assertNull($branding->faviconUrl);
    }

    public function test_database_value_overrides_the_configuration_default(): void
    {
        $user = User::factory()->create();

        $this->service->setMany([
            'app.name' => 'ACME Bureau',
            'branding.accent_color' => '#2563EB',
        ], $user);

        $branding = $this->service->branding();

        $this->assertSame('ACME Bureau', $branding->appName);
        $this->assertSame('#2563EB', $branding->accentColor);
    }

    public function test_multiple_settings_load_without_one_query_per_setting(): void
    {
        $user = User::factory()->create();

        $this->service->setMany([
            'app.name' => 'ACME',
            'app.short_name' => 'ACME',
            'app.description' => 'Bureau d\'architecture',
            'branding.accent_color' => '#10B981',
        ], $user);
        $this->service->clearCache();

        DB::enableQueryLog();
        $this->service->branding();
        $queries = DB::getQueryLog();
        DB::disableQueryLog();

        $settingsQueries = array_values(array_filter(
            $queries,
            fn (array $q) => str_contains($q['query'], 'company_settings')
                && str_starts_with(strtolower(trim($q['query'])), 'select'),
        ));

        $this->assertCount(1, $settingsQueries);
    }

    public function test_unknown_keys_cannot_be_saved(): void
    {
        $user = User::factory()->create();

        $this->expectException(DomainException::class);

        $this->service->setMany(['app.secret_flag' => 'x'], $user);
    }

    public function test_unknown_keys_are_not_mentioned_in_stored_data(): void
    {
        $user = User::factory()->create();

        $this->service->setMany(['app.name' => 'ACME'], $user);

        $this->assertDatabaseCount('company_settings', 1);
    }

    public function test_invalid_accent_colors_cannot_be_saved(): void
    {
        $user = User::factory()->create();

        foreach (['gold', '#FFF', '#FF00', 'rgba(0,0,0,1)', 'var(--accent)', 'url(/logo.png)', 'javascript:alert(1)', '#11223344'] as $invalid) {
            try {
                $this->service->setMany(['branding.accent_color' => $invalid], $user);
                $this->fail("Expected DomainException for accent '{$invalid}'.");
            } catch (DomainException) {
                // Expected: invalid accent rejected.
            }
        }

        $this->assertDatabaseCount('company_settings', 0);
    }

    public function test_valid_accent_color_is_normalized_to_uppercase(): void
    {
        $user = User::factory()->create();

        $this->service->setMany(['branding.accent_color' => '#2563eb'], $user);

        $this->assertSame('#2563EB', $this->service->get('branding.accent_color'));
        $this->assertSame('#2563EB', $this->service->branding()->accentColor);
    }

    public function test_accent_color_input_is_trimmed_and_normalized(): void
    {
        $user = User::factory()->create();

        $this->service->setMany(['branding.accent_color' => '  #7c3aed  '], $user);

        $this->assertSame('#7C3AED', $this->service->get('branding.accent_color'));
        $this->assertSame('#7C3AED', $this->service->branding()->accentColor);
    }

    public function test_set_many_updates_atomically(): void
    {
        $user = User::factory()->create();

        $this->service->setMany([
            'app.name' => 'ACME',
            'app.short_name' => 'ACME',
            'app.description' => 'Description',
            'branding.accent_color' => '#10B981',
        ], $user);

        $this->assertDatabaseCount('company_settings', 4);
        $this->assertSame('ACME', $this->service->get('app.name'));
        $this->assertSame('ACME', $this->service->get('app.short_name'));
        $this->assertSame('Description', $this->service->get('app.description'));
        $this->assertSame('#10B981', $this->service->get('branding.accent_color'));
    }

    public function test_a_failed_update_rolls_back_every_setting(): void
    {
        $user = User::factory()->create();

        $failNext = true;
        CompanySetting::registerModelEvent('creating', function ($model) use (&$failNext) {
            if ($failNext && $model->key === 'branding.accent_color') {
                throw new \RuntimeException('simulated write failure');
            }
        });

        try {
            $this->service->setMany([
                'app.name' => 'ACME',
                'branding.accent_color' => '#10B981',
            ], $user);
            $this->fail('Expected RuntimeException.');
        } catch (\RuntimeException) {
            // Expected: write failure propagated.
        }

        $failNext = false;

        $this->assertDatabaseCount('company_settings', 0);
        $this->assertSame((string) config('system_branding.app_name'), $this->service->get('app.name'));
    }

    public function test_cache_is_cleared_after_a_successful_update(): void
    {
        $user = User::factory()->create();

        $this->service->branding(); // Prime the cache.
        $this->service->setMany(['app.name' => 'Renamed'], $user);

        $this->assertSame('Renamed', $this->service->branding()->appName);
    }

    public function test_cache_stores_a_plain_array_never_a_serialized_object(): void
    {
        $user = User::factory()->create();
        $this->service->setMany(['app.name' => 'ACME'], $user);

        // Prime the cache the way HandleInertiaRequests does: array only.
        $this->service->publicBrandingArray();

        $cached = Cache::get('system_branding.v2');
        $this->assertIsArray($cached);
        $this->assertSame('ACME', $cached['appName']);

        // A later object read must rebuild from the cached array, never fail.
        $this->assertInstanceOf(SystemBrandingData::class, $this->service->branding());
        $this->assertSame('ACME', $this->service->branding()->appName);
    }

    public function test_public_branding_array_contains_only_approved_fields(): void
    {
        $user = User::factory()->create();

        $this->service->setMany(['app.name' => 'ACME'], $user);

        $public = $this->service->publicBrandingArray();

        $this->assertSame([
            'appName',
            'shortName',
            'description',
            'accentColor',
            'logoLightUrl',
            'logoDarkUrl',
            'logoCompactUrl',
            'faviconUrl',
        ], array_keys($public));
        $this->assertSame('ACME', $public['appName']);
        $this->assertSame('#F6B725', $public['accentColor']);
        $this->assertNull($public['logoLightUrl']);
    }

    public function test_internal_storage_paths_are_never_exposed(): void
    {
        $user = User::factory()->create();

        $this->service->setMany(['branding.logo_light' => '../../etc/passwd'], $user);

        $this->assertNull($this->service->branding()->logoLightUrl);
        $this->assertNull($this->service->publicBrandingArray()['logoLightUrl']);
    }

    public function test_internal_database_metadata_is_not_exposed(): void
    {
        $user = User::factory()->create();

        $this->service->setMany(['app.name' => 'ACME'], $user);

        $public = $this->service->publicBrandingArray();

        foreach (['id', 'key', 'group', 'type', 'updated_by', 'created_at', 'updated_at'] as $internal) {
            $this->assertArrayNotHasKey($internal, $public);
        }
    }

    public function test_settings_outside_the_branding_group_are_not_exposed(): void
    {
        CompanySetting::setValue('finance', 'default_tva_rate', 20, 'decimal', 'Default TVA rate');
        $user = User::factory()->create();

        $branding = $this->service->branding();

        $this->assertSame((string) config('system_branding.app_name'), $branding->appName);
        $this->assertSame(20.0, CompanySetting::getValue('finance', 'default_tva_rate', 20));
        $this->assertArrayNotHasKey('finance', $this->service->publicBrandingArray());
    }

    public function test_empty_string_is_distinct_from_a_missing_value(): void
    {
        $user = User::factory()->create();

        $this->service->setMany(['app.description' => ''], $user);

        $this->assertSame('', $this->service->get('app.description'));
        $this->assertSame('', $this->service->branding()->description);
    }

    public function test_unknown_key_returns_the_passed_default(): void
    {
        $this->assertSame('fallback', $this->service->get('unknown.key', 'fallback'));
        $this->assertNull($this->service->get('unknown.key'));
    }

    public function test_known_key_without_stored_value_returns_config_fallback(): void
    {
        $this->assertSame((string) config('system_branding.app_name'), $this->service->get('app.name'));
        $this->assertSame('#F6B725', $this->service->get('branding.accent_color'));
        $this->assertNull($this->service->get('app.description'));
    }

    public function test_invalid_stored_accent_falls_back_to_the_config_default(): void
    {
        CompanySetting::create([
            'group' => 'system_branding',
            'key' => 'branding.accent_color',
            'value' => 'url(javascript:alert(1))',
            'type' => 'string',
            'is_public' => false,
        ]);

        $this->assertSame('#F6B725', $this->service->get('branding.accent_color'));
        $this->assertSame('#F6B725', $this->service->branding()->accentColor);
        $this->assertSame('#F6B725', $this->service->publicBrandingArray()['accentColor']);
    }

    public function test_audit_log_records_changed_keys_and_values(): void
    {
        $user = User::factory()->create();

        $this->service->setMany([
            'app.name' => 'ACME',
            'branding.accent_color' => '#2563EB',
        ], $user);

        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $user->id,
            'action' => 'system.branding.updated',
        ]);

        $log = \App\Models\AuditLog::query()->latest('id')->first();

        $this->assertSame(['app.name', 'branding.accent_color'], $log->metadata['keys']);
        $this->assertArrayHasKey('app.name', $log->metadata['changes']);
        $this->assertSame(['old' => null, 'new' => 'ACME'], $log->metadata['changes']['app.name']);
    }
}
