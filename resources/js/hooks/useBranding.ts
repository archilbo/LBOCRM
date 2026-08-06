import { usePage } from '@inertiajs/react';
import type { PublicBrandingSettings } from '@/types/branding';

const FALLBACK_BRANDING: PublicBrandingSettings = {
    appName: 'ARCHI LBO OS',
    shortName: 'LBO OS',
    description: null,
    accentColor: '#F6B725',
    logoLightUrl: null,
    logoDarkUrl: null,
    logoCompactUrl: null,
    faviconUrl: null,
};

/**
 * Reads the globally shared `branding` Inertia prop (shared once by
 * HandleInertiaRequests). Never triggers an extra API request.
 */
export function useBranding(): PublicBrandingSettings {
    const page = usePage<{ branding?: PublicBrandingSettings }>();

    return page.props.branding ?? FALLBACK_BRANDING;
}
