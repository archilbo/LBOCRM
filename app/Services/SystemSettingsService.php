<?php

namespace App\Services;

use App\Data\SystemBrandingData;
use App\Models\AuditLog;
use App\Models\CompanySetting;
use App\Models\User;
use DomainException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

/**
 * Single application source for global (system-level) settings.
 *
 * Database rows in company_settings (group "system_branding") hold explicit
 * overrides only; every key falls back to config/system_branding.php when no
 * database value exists. Stored values are never trusted directly: types are
 * cast from the stored type column and the accent color is re-validated on
 * every read with a safe fallback to the configured default.
 *
 * The fixed allow-list (KNOWN_KEYS) is the only accepted set of keys; unknown
 * keys are rejected on write.
 */
class SystemSettingsService
{
    private const CACHE_KEY = 'system_branding.v2';

    private const CACHE_TTL_SECONDS = 3600;

    private const SETTINGS_GROUP = 'system_branding';

    /** Fixed allow-list of supported global branding keys. */
    public const KNOWN_KEYS = [
        'app.name',
        'app.short_name',
        'app.description',
        'branding.accent_color',
        'branding.logo_light',
        'branding.logo_dark',
        'branding.logo_compact',
        'branding.favicon',
    ];

    /** Dotted setting key => config/system_branding.php fallback key. */
    private const KEY_FALLBACKS = [
        'app.name' => 'app_name',
        'app.short_name' => 'short_name',
        'app.description' => 'description',
        'branding.accent_color' => 'accent_color',
        'branding.logo_light' => 'logo_light',
        'branding.logo_dark' => 'logo_dark',
        'branding.logo_compact' => 'logo_compact',
        'branding.favicon' => 'favicon',
    ];

    /** Keys that may be explicitly nulled (removing the override). */
    private const NULLABLE_KEYS = [
        'app.description',
        'branding.logo_light',
        'branding.logo_dark',
        'branding.logo_compact',
        'branding.favicon',
    ];

    public function branding(): SystemBrandingData
    {
        return new SystemBrandingData(...$this->brandingArray());
    }

    /**
     * Cached public branding values as a plain array — never an object.
     *
     * The database cache store serializes PHP objects, so a cache row written
     * before a DTO namespace move unserializes as __PHP_Incomplete_Class and
     * breaks the typed return of branding(). Arrays are immune to class
     * moves, therefore only arrays are ever cached.
     */
    public function brandingArray(): array
    {
        return Cache::remember(self::CACHE_KEY, self::CACHE_TTL_SECONDS, function () {
            return $this->loadBrandingArray();
        });
    }

    public function get(string $key, mixed $default = null): mixed
    {
        if (!in_array($key, self::KNOWN_KEYS, true)) {
            return $default;
        }

        $setting = $this->storedSettings()->get($key);

        if ($setting === null || $setting->value === null) {
            return $this->configFallback($key, $default);
        }

        if ($key === 'branding.accent_color') {
            return $this->safeAccentFromStorage($setting->value);
        }

        return $this->castStoredValue($setting->type, $setting->value);
    }

    /**
     * Persist validated overrides for known keys only.
     *
     * Runs inside a database transaction so a failure anywhere rolls back
     * every setting of the batch. The branding cache is cleared after the
     * transaction commits.
     */
    public function setMany(array $settings, User $updatedBy): void
    {
        $normalized = $this->normalizeForStorage($settings);

        DB::transaction(function () use ($normalized, $updatedBy) {
            $existing = $this->storedSettings();
            $changes = [];

            foreach ($normalized as $key => $value) {
                $current = $existing->get($key);
                $oldValue = $current?->value;
                $newValue = $value === null ? null : (string) $value;

                if ($current) {
                    $current->update([
                        'value' => $newValue,
                        'updated_by' => $updatedBy->id,
                    ]);
                } else {
                    CompanySetting::create([
                        'group' => self::SETTINGS_GROUP,
                        'key' => $key,
                        'value' => $newValue,
                        'type' => 'string',
                        'is_public' => false,
                        'updated_by' => $updatedBy->id,
                    ]);
                }

                $changes[$key] = ['old' => $oldValue, 'new' => $newValue];
            }

            $this->recordAudit($updatedBy, $changes);
        });

        $this->clearCache();
    }

    public function clearCache(): void
    {
        Cache::forget(self::CACHE_KEY);
    }

    /**
     * Safe public branding contract shared with the frontend.
     *
     * Approved fields only: no setting keys, database IDs, storage paths,
     * updated_by, timestamps, or private configuration values.
     */
    public function publicBrandingArray(): array
    {
        return $this->brandingArray();
    }

    /**
     * Single centralized accent-color normalizer.
     *
     * Accepts only six-digit hexadecimal colors (e.g. #C9A227), trims spaces,
     * and normalizes valid values to uppercase. Rejects CSS expressions,
     * url(...), CSS variables, alpha colors, three-digit shorthand, and color
     * names.
     *
     * @throws DomainException when the value is not a valid six-digit hex color
     */
    public function normalizeAccentColor(mixed $value): string
    {
        if (!is_string($value)) {
            throw new DomainException('Invalid accent color: expected a six-digit hexadecimal color (e.g. #C9A227).');
        }

        $value = trim($value);

        if (preg_match('/^#[0-9A-Fa-f]{6}$/', $value) !== 1) {
            throw new DomainException(sprintf(
                'Invalid accent color "%s": expected a six-digit hexadecimal color (e.g. #C9A227).',
                $value,
            ));
        }

        return strtoupper($value);
    }

    private function loadBrandingArray(): array
    {
        $settings = $this->storedSettings();

        $value = function (string $key, mixed $default = null) use ($settings): mixed {
            $setting = $settings->get($key);

            if ($setting === null || $setting->value === null) {
                return $this->configFallback($key, $default);
            }

            if ($key === 'branding.accent_color') {
                return $this->safeAccentFromStorage($setting->value);
            }

            return $this->castStoredValue($setting->type, $setting->value);
        };

        $description = $value('app.description');

        return [
            'appName' => (string) $value('app.name', 'ARCHI LBO OS'),
            'shortName' => (string) $value('app.short_name', 'LBO OS'),
            'description' => is_string($description) ? $description : null,
            'accentColor' => (string) $value('branding.accent_color', '#F6B725'),
            'logoLightUrl' => $this->resolvePublicUrl($value('branding.logo_light')),
            'logoDarkUrl' => $this->resolvePublicUrl($value('branding.logo_dark')),
            'logoCompactUrl' => $this->resolvePublicUrl($value('branding.logo_compact')),
            'faviconUrl' => $this->resolvePublicUrl($value('branding.favicon')),
        ];
    }

    /**
     * All branding overrides in one query, keyed by the dotted setting key.
     */
    private function storedSettings(): Collection
    {
        return CompanySetting::query()
            ->where('group', self::SETTINGS_GROUP)
            ->get()
            ->keyBy('key');
    }

    private function configFallback(string $key, mixed $default): mixed
    {
        $fallback = self::KEY_FALLBACKS[$key] ?? null;

        if ($fallback === null) {
            return $default;
        }

        return config("system_branding.{$fallback}") ?? $default;
    }

    private function castStoredValue(string $type, string $value): mixed
    {
        return match ($type) {
            'integer' => (int) $value,
            'decimal', 'float', 'number' => (float) $value,
            'boolean' => filter_var($value, FILTER_VALIDATE_BOOLEAN),
            'json' => json_decode($value, true) ?: $value,
            default => $value,
        };
    }

    /**
     * Malformed stored accent colors fall back to the configured default
     * instead of throwing: reads never fail on legacy/bad data.
     */
    private function safeAccentFromStorage(string $raw): string
    {
        try {
            return $this->normalizeAccentColor($raw);
        } catch (DomainException) {
            return (string) config('system_branding.accent_color', '#F6B725');
        }
    }

    /**
     * Convert a stored relative public-disk path into a safe public URL.
     *
     * Only plain relative paths are accepted (no traversal, no leading slash,
     * no URL scheme); anything else resolves to null so internal storage paths
     * can never leak into the public contract.
     */
    private function resolvePublicUrl(mixed $path): ?string
    {
        if (!is_string($path) || trim($path) === '') {
            return null;
        }

        $path = trim($path);

        if (
            str_contains($path, '..')
            || str_starts_with($path, '/')
            || preg_match('#^[a-z][a-z0-9+.\-]*://#i', $path) === 1
        ) {
            return null;
        }

        // The public disk's configured URL (APP_URL/storage) prefixes stored
        // relative paths, so branding URLs resolve to /storage/system/branding/…
        return Storage::disk('public')->url($path);
    }

    private function recordAudit(User $user, array $changes): void
    {
        if ($changes === []) {
            return;
        }

        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'system.branding.updated',
            'description' => 'Branding settings updated: '.implode(', ', array_keys($changes)),
            'metadata' => [
                'keys' => array_keys($changes),
                'changes' => $changes,
            ],
            'created_at' => now(),
        ]);
    }

    private function normalizeForStorage(array $settings): array
    {
        $unknown = array_diff(array_keys($settings), self::KNOWN_KEYS);

        if ($unknown !== []) {
            throw new DomainException('Unknown system setting key(s): '.implode(', ', $unknown));
        }

        $normalized = [];

        foreach ($settings as $key => $value) {
            if ($value === null) {
                if (!in_array($key, self::NULLABLE_KEYS, true)) {
                    throw new DomainException("Setting '{$key}' cannot be null.");
                }

                $normalized[$key] = null;

                continue;
            }

            if ($key === 'branding.accent_color') {
                $normalized[$key] = $this->normalizeAccentColor($value);

                continue;
            }

            if (!is_scalar($value)) {
                throw new DomainException("Setting '{$key}' must be a scalar value.");
            }

            $normalized[$key] = trim((string) $value);
        }

        return $normalized;
    }
}
