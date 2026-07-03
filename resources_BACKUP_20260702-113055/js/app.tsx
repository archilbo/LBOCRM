import '@fontsource-variable/geist/wght.css';
import '@fontsource-variable/geist-mono/wght.css';
import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { AppToastProvider } from '@/providers/AppToastProvider';
import { AppFlashToasts } from '@/components/layout/AppFlashToasts';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { configureEcho, echo } from '@laravel/echo-react';

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
    title: (title) => title ? `${title} - ARCHI LBO OS` : 'ARCHI LBO OS',
    resolve: (name) => {
        const pages = import.meta.glob('./pages/**/*.tsx', { eager: true });
        const page = pages[`./pages/${name}.tsx`];

        if (!page) {
            throw new Error(`Page not found: ${name}`);
        }

        return page;
    },
    setup({ el, App, props }) {
        createRoot(el).render(
            <ThemeProvider>
                <AppFlashToasts />
                                <AppToastProvider />
                <App {...props} />
            </ThemeProvider>,
        );
    },
    progress: {
        color: '#2563eb',
    },
});

