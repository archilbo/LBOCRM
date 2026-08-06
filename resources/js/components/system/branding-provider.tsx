import { useEffect, type PropsWithChildren } from 'react';
import { useBranding } from '@/hooks/useBranding';

/**
 * Applies the saved brand accent color to the application CSS variables.
 *
 * Only `--accent` (and the derived variables the theme already consumes:
 * `--accent-hover`, `--accent-pressed`, `--accent-soft`, `--focus-ring`) are
 * touched. Semantic colors (success/warning/danger/info) are never overridden.
 *
 * `document` is only accessed inside an effect, so SSR/hydration is safe.
 */
export function BrandingProvider({ children }: PropsWithChildren) {
    const branding = useBranding();
    const accentColor = branding.accentColor;

    useEffect(() => {
        const root = document.documentElement;

        root.style.setProperty('--accent', accentColor);
        root.style.setProperty('--accent-hover', `color-mix(in srgb, ${accentColor} 88%, black)`);
        root.style.setProperty('--accent-pressed', `color-mix(in srgb, ${accentColor} 78%, black)`);
        root.style.setProperty('--accent-soft', `color-mix(in srgb, ${accentColor} 14%, transparent)`);
        root.style.setProperty('--focus-ring', accentColor);
        // Legacy token consumed by the login page and CRM feature components.
        root.style.setProperty('--crm-accent', accentColor);
    }, [accentColor]);

    return <>{children}</>;
}
