import '@fontsource-variable/geist/wght.css';
import '@fontsource-variable/geist-mono/wght.css';
import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { AppToastProvider } from '@/providers/AppToastProvider';
import { AppFlashToasts } from '@/components/layout/AppFlashToasts';
import { ThemeProvider } from '@/providers/ThemeProvider';

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

