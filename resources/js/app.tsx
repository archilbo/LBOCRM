import '@fontsource-variable/geist/wght.css';
import '@fontsource-variable/geist-mono/wght.css';
import '@heroui/react/styles';
import '../css/app.css';

import { createInertiaApp, router } from '@inertiajs/react';
import { configureEcho } from '@laravel/echo-react';
import { createRoot } from 'react-dom/client';
import { AppProviders } from '@/providers/AppProviders';
import type { PublicBrandingSettings } from '@/types/branding';

// Cached by the setup callback from the initial shared props, so the document
// title helper can resolve the brand name synchronously.
let sharedBranding: PublicBrandingSettings | null = null;

const reverbKey = import.meta.env.VITE_REVERB_APP_KEY || 'local';
const reverbHost = import.meta.env.VITE_REVERB_HOST || '127.0.0.1';
const reverbPort = import.meta.env.VITE_REVERB_PORT || '8080';
const reverbScheme = import.meta.env.VITE_REVERB_SCHEME || 'http';
const useTLS = reverbScheme === 'https';
const csrfToken = (window as any).csrfToken
    || document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content
    || '';

configureEcho({
    broadcaster: 'reverb',
    key: reverbKey,
    wsHost: reverbHost,
    wsPort: Number(reverbPort),
    wssPort: Number(reverbPort),
    forceTLS: useTLS,
    enabledTransports: useTLS ? ['wss', 'ws'] : ['ws'],
    authEndpoint: '/broadcasting/auth',
    csrfToken,
    auth: {
        headers: {
            'X-CSRF-TOKEN': csrfToken,
            'X-Requested-With': 'XMLHttpRequest',
        },
    },
});

createInertiaApp({
    title: (title) => {
        const appName = sharedBranding?.appName || 'ARCHI LBO OS';
        return title ? `${title} · ${appName}` : appName;
    },
    resolve: (name) => {
        const pages = import.meta.glob('./pages/**/*.tsx', { eager: true });
        const page = pages[`./pages/${name}.tsx`];

        if (!page) {
            throw new Error(`Page not found: ${name}`);
        }

        return page;
    },
    setup({ el, App, props }) {
        const initial = (props.initialPage as { props?: { branding?: PublicBrandingSettings } }).props?.branding;
        if (initial) {
            sharedBranding = initial;
        }

        // Keep the title helper's brand cache fresh on every navigation
        // (including the redirect-back after saving settings), so browser
        // titles follow renamed applications without a full reload.
        router.on('success', (event) => {
            const next = (event.detail?.page?.props as { branding?: PublicBrandingSettings } | undefined)?.branding;
            if (next) {
                sharedBranding = next;
            }
        });

        createRoot(el).render(
            <AppProviders initialBranding={initial ?? undefined}>
                <App {...props} />
            </AppProviders>,
        );
    },
    progress: {
        // Resolved at paint time against the runtime `--accent` so the
        // progress bar follows the saved brand color (CSS fallback: gold).
        color: 'var(--accent)',
    },
});