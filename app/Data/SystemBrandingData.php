<?php

namespace App\Data;

/**
 * Immutable, normalized global branding values.
 *
 * Public contract only: safe URLs and normalized strings. No setting keys,
 * database metadata, storage paths, or internal configuration values are
 * exposed through this object.
 */
final class SystemBrandingData
{
    public function __construct(
        public readonly string $appName,
        public readonly string $shortName,
        public readonly ?string $description,
        public readonly string $accentColor,
        public readonly ?string $logoLightUrl,
        public readonly ?string $logoDarkUrl,
        public readonly ?string $logoCompactUrl,
        public readonly ?string $faviconUrl,
    ) {}
}
