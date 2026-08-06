import '@fontsource-variable/geist/wght.css';
import '@fontsource-variable/geist-mono/wght.css';
import '@heroui/react/styles';
import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
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
        return title ? `${title} - ${appName}` : appName;
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

        createRoot(el).render(
            <AppProviders>
                <App {...props} />
            </AppProviders>,
        );
    },
    progress: {
        color: '#f6b725',
    },
});