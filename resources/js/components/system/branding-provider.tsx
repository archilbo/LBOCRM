import { router } from '@inertiajs/react';
import { useEffect, useState, type PropsWithChildren } from 'react';
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

type InertiaSuccessEvent = {
    detail?: {
        page?: {
            props?: {
                branding?: PublicBrandingSettings;
            };
        };
    };
};

type BrandingProviderProps = PropsWithChildren<{
    /** Branding captured from the initial page props (app.tsx setup). */
    initialBranding?: PublicBrandingSettings;
}>;

/**
 * Relative luminance of a `#RRGGBB` color (WCAG formula). Used to pick a
 * readable foreground for surfaces painted with the brand accent — dark
 * accents get white text, light accents keep the theme's dark foreground.
 */
function relativeLuminance(hex: string): number {
    const channel = (value: number) => {
        const c = value / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };

    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/**
 * Applies the saved brand accent color to the application CSS variables.
 *
 * Mounted above the Inertia root, so it must not call `usePage()` (the Inertia
 * context only exists below `<App>`). The initial value comes from the props
 * captured in app.tsx's setup callback; afterwards every successful Inertia
 * navigation carries the fresh shared `branding` prop.
 *
 * Only `--accent` (and the derived variables the theme already consumes:
 * `--accent-hover`, `--accent-pressed`, `--accent-soft`, `--focus-ring`) are
 * touched. Semantic colors (success/warning/danger/info) are never overridden.
 *
 * `document` is only accessed inside an effect, so SSR/hydration is safe.
 */
export function BrandingProvider({ initialBranding, children }: BrandingProviderProps) {
    const [branding, setBranding] = useState<PublicBrandingSettings>(initialBranding ?? FALLBACK_BRANDING);
    const accentColor = branding.accentColor;

    useEffect(() => {
        const removeListener = router.on('success', (event) => {
            const inertiaEvent = event as unknown as InertiaSuccessEvent;
            const next = inertiaEvent.detail?.page?.props?.branding;

            if (next) {
                setBranding(next);
            }
        });

        return removeListener;
    }, []);

    useEffect(() => {
        const root = document.documentElement;

        root.style.setProperty('--accent', accentColor);
        root.style.setProperty('--accent-hover', `color-mix(in srgb, ${accentColor} 88%, black)`);
        root.style.setProperty('--accent-pressed', `color-mix(in srgb, ${accentColor} 78%, black)`);
        root.style.setProperty('--accent-soft', `color-mix(in srgb, ${accentColor} 14%, transparent)`);
        root.style.setProperty('--focus-ring', accentColor);
        // Surfaces painted with the accent (buttons, tabs, selected states)
        // need a readable foreground: white for dark accents, the theme's
        // dark foreground for light accents such as the default gold.
        root.style.setProperty('--accent-foreground', relativeLuminance(accentColor) > 0.42 ? '#12110f' : '#ffffff');
        // Legacy token consumed by the login page and CRM feature components.
        root.style.setProperty('--crm-accent', accentColor);
    }, [accentColor]);

    // Keep the browser-tab icon in sync with the uploaded favicon. Only links
    // created here are ever removed, so the default favicon survives when the
    // setting is cleared again.
    useEffect(() => {
        const href = branding.faviconUrl;
        const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');

        if (!href) {
            if (link?.dataset.branding === 'true') {
                link.remove();
            }

            return;
        }

        if (!link) {
            const created = document.createElement('link');
            created.rel = 'icon';
            created.dataset.branding = 'true';
            document.head.appendChild(created);
            created.href = href;

            return;
        }

        link.href = href;
    }, [branding.faviconUrl]);

    return <>{children}</>;
}
