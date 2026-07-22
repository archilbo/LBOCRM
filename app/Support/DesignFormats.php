<?php

namespace App\Support;

use Illuminate\Support\Facades\Config;

class DesignFormats
{
    public static function all(): array
    {
        return Config::get('project_design_formats.formats', []);
    }

    public static function find(string $extension): ?array
    {
        return Config::get('project_design_formats.formats.' . strtolower($extension));
    }

    public static function findByMime(string $mime): ?array
    {
        foreach (self::all() as $format) {
            if (in_array($mime, $format['mime_types'] ?? [], true)) {
                return $format;
            }
        }
        return null;
    }

    public static function isKnown(string $extension): bool
    {
        return self::find($extension) !== null;
    }

    public static function previewStrategy(string $extension): string
    {
        return self::find($extension)['preview_strategy'] ?? 'download-only';
    }

    public static function supportedViewer(string $extension): ?string
    {
        return self::find($extension)['supported_viewer'] ?? null;
    }

    public static function directBrowserPreview(string $extension): bool
    {
        return self::find($extension)['direct_browser_preview'] ?? false;
    }

    public static function requiresConversion(string $extension): bool
    {
        $strategy = self::previewStrategy($extension);
        return in_array($strategy, ['autodesk-aps', 'server-conversion', 'ifc'], true);
    }

    public static function fallbackMessage(string $extension): ?string
    {
        return self::find($extension)['fallback_message'] ?? null;
    }

    public static function assetCategories(): array
    {
        return Config::get('project_design_formats.asset_categories', []);
    }

    public static function conversionProviders(): array
    {
        return Config::get('project_design_formats.conversion_providers', []);
    }

    public static function externalConversionPolicy(): string
    {
        return Config::get('project_design_formats.external_conversion.default_policy', 'disabled');
    }

    public static function isExternalConversionAllowed(): bool
    {
        $policy = self::externalConversionPolicy();
        return $policy === 'enabled' || $policy === 'administrators';
    }
}
