# FRONTEND REBUILD REVIEW CONTEXT
Generated: 07/02/2026 12:13:33



# GIT STATUS



## git status --short
```
 M PROMPT.ps1
 M docs/AI_WORK_REPORT.md
 D docs/STEP_36_FINANCE_LIVE_BUILDER_UI.md
 D docs/STEP_37_FINANCE_PDF_EXCEL_EXPORT.md
 D docs/STEP_38_FINANCE_TEMPLATE_EDITOR.md
 M final.txt
 M package-lock.json
 M package.json
 M resources/css/app.css
 M resources/js/app.tsx
 M resources/js/components/layout/AppGlobalSearch.tsx
 M resources/js/components/layout/AppMobileNav.tsx
 M resources/js/components/layout/AppShell.tsx
 M resources/js/components/layout/AppSidebar.tsx
 M resources/js/components/layout/navigation.ts
 M resources/js/components/ui/AppDataTable.tsx
 M resources/js/components/ui/AppMetricCard.tsx
 M resources/js/components/ui/AppPageHeader.tsx
 M resources/js/config/archilboTheme.ts
 M resources/js/features/dossiers/drawers/ProjectDrawer.tsx
 M resources/js/pages/Archives/Index.tsx
 M resources/js/pages/Authorizations/Index.tsx
 M resources/js/pages/Clients/Index.tsx
 M resources/js/pages/Contracts/Index.tsx
 M resources/js/pages/Documents/Index.tsx
 M resources/js/pages/Dossiers/Index.tsx
 M resources/js/pages/Finance/Documents/Show.tsx
 M resources/js/pages/Finance/Index.tsx
 M resources/js/pages/Finance/Settings/Index.tsx
 M resources/js/pages/Finance/Templates/Index.tsx
 M resources/js/pages/Finance/Templates/Versions.tsx
 M resources/js/pages/FrontendQa/Index.tsx
 M resources/js/pages/Intermediaries/Index.tsx
 M resources/js/providers/ThemeProvider.tsx
?? .ai-context/
?? resources/js/components/ui/AppModal.tsx
?? resources/js/components/ui/AvatarPill.tsx
?? resources/js/config/navigation.ts
?? resources/js/config/statuses.ts
?? resources/js/providers/AppProviders.tsx
?? resources_BACKUP_20260702-113055/
?? resources_BACKUP_20260702-115510/

```


# PACKAGE / CONFIG



## FILE: package.json
```
{
    "$schema": "https://www.schemastore.org/package.json",
    "private": true,
    "type": "module",
    "scripts": {
        "build": "vite build",
        "dev": "vite"
    },
    "devDependencies": {
        "@tailwindcss/vite": "^4.0.0",
        "@types/react": "^19.2.17",
        "concurrently": "^9.0.1",
        "laravel-vite-plugin": "^3.1",
        "tailwindcss": "^4.0.0",
        "typescript": "^6.0.3",
        "vite": "^8.0.0"
    },
    "dependencies": {
        "@codemirror/autocomplete": "^6.20.3",
        "@codemirror/commands": "^6.10.4",
        "@codemirror/lang-css": "^6.3.1",
        "@codemirror/lang-html": "^6.4.11",
        "@codemirror/theme-one-dark": "^6.1.3",
        "@codemirror/view": "^6.43.4",
        "@fontsource-variable/geist": "^5.2.9",
        "@fontsource-variable/geist-mono": "^5.2.8",
        "@fullcalendar/daygrid": "^6.1.21",
        "@fullcalendar/interaction": "^6.1.21",
        "@fullcalendar/react": "^6.1.21",
        "@fullcalendar/timegrid": "^6.1.21",
        "@heroui/react": "^3.2.1",
        "@hookform/resolvers": "^5.4.0",
        "@inertiajs/react": "^3.4.0",
        "@laravel/echo-react": "^2.3.7",
        "@tanstack/react-table": "^8.21.3",
        "@uiw/react-codemirror": "^4.25.10",
        "@vitejs/plugin-react": "^6.0.2",
        "class-variance-authority": "^0.7.1",
        "clsx": "^2.1.1",
        "framer-motion": "^12.42.2",
        "laravel-echo": "^2.3.7",
        "lucide-react": "^1.21.0",
        "pusher-js": "^8.5.0",
        "react": "^19.2.7",
        "react-aria-components": "^1.19.0",
        "react-dom": "^19.2.7",
        "react-hook-form": "^7.80.0",
        "sonner": "^2.0.7",
        "tailwind-merge": "^3.6.0",
        "tailwindcss-react-aria-components": "^2.2.0",
        "zod": "^4.4.3"
    }
}

```


## FILE: vite.config.ts
```
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import { bunny } from 'laravel-vite-plugin/fonts';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            refresh: true,
            fonts: [
                bunny('Instrument Sans', {
                    weights: [400, 500, 600],
                }),
            ],
        }),
        react(),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './resources/js'),
        },
    },
    server: {
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});

```


## FILE: vite.config.js
```
MISSING
```


## FILE: tailwind.config.ts
```
MISSING
```


## FILE: tailwind.config.js
```
MISSING
```


## FILE: postcss.config.js
```
MISSING
```


## FILE: tsconfig.json
```
{
    "compilerOptions": {
        "target": "ES2020",
        "useDefineForClassFields": true,
        "lib": ["DOM", "DOM.Iterable", "ES2020"],
        "allowJs": false,
        "skipLibCheck": true,
        "esModuleInterop": true,
        "allowSyntheticDefaultImports": true,
        "strict": true,
        "forceConsistentCasingInFileNames": true,
        "module": "ESNext",
        "moduleResolution": "Node",
        "resolveJsonModule": true,
        "isolatedModules": true,
        "noEmit": true,
        "jsx": "react-jsx",
        "baseUrl": ".",
        "paths": {
            "@/*": ["resources/js/*"]
        }
    },
    "include": ["resources/js/**/*.ts", "resources/js/**/*.tsx", "resources/js/**/*.d.ts"]
}

```


# APP ENTRY / GLOBAL STYLES



## FILE: resources\js\app.tsx
```
import '@fontsource-variable/geist/wght.css';
import '@fontsource-variable/geist-mono/wght.css';
import '@heroui/react/styles';
import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { configureEcho } from '@laravel/echo-react';
import { createRoot } from 'react-dom/client';
import { AppProviders } from '@/providers/AppProviders';

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
            <AppProviders>
                <App {...props} />
            </AppProviders>,
        );
    },
    progress: {
        color: '#f6b725',
    },
});
```


## FILE: resources\js\bootstrap.ts
```
MISSING
```


## FILE: resources\css\app.css
```
@import './archilbo-theme.css';
@import "tailwindcss";
@plugin "tailwindcss-react-aria-components";
@import './calendar.css';

:root {
    color-scheme: light;

    --tint: #fcb12d;

    --background: #ffffff;
    --foreground: #12110f;

    --surface: #ffffff;
    --surface-2: #f7f7f7;
    --surface-3: #eeeeee;

    --border: #e5e5e5;
    --border-strong: #d4d4d4;

    --text-muted: #6b6b6b;
    --text-subtle: #9a9a9a;

    --accent: #fcb12d;
    --accent-hover: #e69f1f;
    --accent-pressed: #d08d16;
    --accent-foreground: #12110f;

    --danger: #dc2626;
    --danger-hover: #b91c1c;

    --success: #16a34a;
    --warning: #d97706;
    --info: #0284c7;

    --focus-ring: #fcb12d;

    --radius-sm: 6px;
    --radius-md: 8px;
    --radius-lg: 12px;
    --radius-xl: 16px;

    --font-sans: "Geist Variable", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    --font-mono: "Geist Mono Variable", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
}

.dark {
    color-scheme: dark;

    --tint: #fcb12d;

    --background: #12110f;
    --foreground: #fdfdfd;

    --surface: #1a1815;
    --surface-2: #26231e;
    --surface-3: #333028;

    --border: #2d2a22;
    --border-strong: #474337;

    --text-muted: #a3a096;
    --text-subtle: #726e62;

    --accent: #fcb12d;
    --accent-hover: #e69f1f;
    --accent-pressed: #d08d16;
    --accent-foreground: #12110f;

    --danger: #f87171;
    --danger-hover: #ef4444;

    --success: #4ade80;
    --warning: #fbbf24;
    --info: #38bdf8;

    --focus-ring: #fcb12d;
}

html,
body {
    min-height: 100%;
}

body {
    margin: 0;
    background:
        radial-gradient(circle at top left, color-mix(in srgb, var(--accent) 8%, transparent), transparent 32rem),
        var(--background);
    color: var(--foreground);
    font-family: var(--font-sans);
    font-size: 14px;
    letter-spacing: -0.006em;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
}

code,
pre,
kbd,
samp {
    font-family: var(--font-mono);
}

* {
    border-color: var(--border);
}

::selection {
    background: color-mix(in srgb, var(--accent) 20%, transparent);
}

/* React Aria base styling */

.react-aria-Button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    height: 2.25rem;
    padding: 0 0.875rem;
    border-radius: var(--radius-md);
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--foreground);
    font-size: 13px;
    font-weight: 500;
    line-height: 1;
    letter-spacing: -0.004em;
    outline: none;
    transition:
        background-color 140ms ease,
        border-color 140ms ease,
        color 140ms ease,
        box-shadow 140ms ease,
        transform 80ms ease;
}

.react-aria-Button[data-hovered] {
    background: var(--surface-2);
    border-color: var(--border-strong);
}

.react-aria-Button[data-pressed] {
    transform: translateY(1px);
    background: var(--surface-3);
}

.react-aria-Button[data-focus-visible] {
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--focus-ring) 28%, transparent);
    border-color: var(--focus-ring);
}

.react-aria-Button[data-disabled] {
    opacity: 0.5;
    cursor: not-allowed;
}

.react-aria-TextField {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
}

.react-aria-Label {
    color: var(--foreground);
    font-size: 0.8125rem;
    font-weight: 500;
}

.react-aria-Input,
.react-aria-TextArea,
.react-aria-SearchField input {
    width: 100%;
    min-height: 2.25rem;
    border-radius: var(--radius-md);
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--foreground);
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    outline: none;
    transition:
        border-color 140ms ease,
        box-shadow 140ms ease,
        background-color 140ms ease;
}

.react-aria-Input[data-focused],
.react-aria-TextArea[data-focused],
.react-aria-SearchField[data-focused] input {
    border-color: var(--focus-ring);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--focus-ring) 22%, transparent);
}

.react-aria-Input[data-invalid],
.react-aria-TextArea[data-invalid] {
    border-color: var(--danger);
}

.react-aria-FieldError {
    color: var(--danger);
    font-size: 0.75rem;
}

.react-aria-Text {
    color: var(--text-muted);
    font-size: 0.8125rem;
}

.react-aria-Popover,
.react-aria-Modal {
    background: var(--surface);
    color: var(--foreground);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    box-shadow:
        0 20px 25px -5px rgb(15 23 42 / 0.12),
        0 8px 10px -6px rgb(15 23 42 / 0.12);
}

.react-aria-Dialog {
    outline: none;
}

.react-aria-ListBox,
.react-aria-Menu {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    padding: 0.375rem;
    outline: none;
}

.react-aria-ListBoxItem,
.react-aria-MenuItem {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-height: 2rem;
    padding: 0.375rem 0.625rem;
    border-radius: var(--radius-sm);
    color: var(--foreground);
    font-size: 0.875rem;
    outline: none;
    cursor: default;
}

.react-aria-ListBoxItem[data-hovered],
.react-aria-MenuItem[data-hovered],
.react-aria-ListBoxItem[data-focused],
.react-aria-MenuItem[data-focused] {
    background: var(--surface-2);
}

.react-aria-ListBoxItem[data-selected] {
    background: color-mix(in srgb, var(--accent) 14%, transparent);
    color: var(--accent);
}

.react-aria-Tabs {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.react-aria-TabList {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    border-bottom: 1px solid var(--border);
}

.react-aria-Tab {
    position: relative;
    padding: 0.625rem 0.75rem;
    color: var(--text-muted);
    font-size: 0.875rem;
    font-weight: 500;
    outline: none;
    cursor: default;
}

.react-aria-Tab[data-hovered] {
    color: var(--foreground);
}

.react-aria-Tab[data-selected] {
    color: var(--accent);
}

.react-aria-Tab[data-selected]::after {
    content: "";
    position: absolute;
    left: 0.75rem;
    right: 0.75rem;
    bottom: -1px;
    height: 2px;
    border-radius: 999px;
    background: var(--accent);
}

.react-aria-Table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    font-size: 0.875rem;
}

.react-aria-Column {
    color: var(--text-muted);
    font-size: 11px;
    line-height: 16px;
    font-weight: 600;
    text-align: left;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding: 0.5rem 0.625rem;
    border-bottom: 1px solid var(--border);
    white-space: nowrap;
}

.react-aria-Cell {
    vertical-align: middle;
    padding: 0.5rem 0.625rem;
    border-bottom: 1px solid var(--border);
}

.react-aria-Row[data-hovered] .react-aria-Cell {
    background: color-mix(in srgb, var(--surface-2) 70%, transparent);
}

/* App utilities */

.app-surface {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-xl);
    box-shadow: 0 1px 2px rgb(15 23 42 / 0.05);
}

.app-muted {
    color: var(--text-muted);
}

.app-compact-badge {
    white-space: nowrap;
    flex-shrink: 0;
    font-size: 11px;
    line-height: 16px;
    letter-spacing: -0.01em;
    padding: 1px 7px;
}

.app-table-nowrap td,
.app-table-nowrap th {
    white-space: nowrap;
}

.app-table-primary-cell {
    white-space: normal;
    min-width: 240px;
}

.app-focus-ring {
    outline: none;
}

.app-focus-ring:focus-visible {
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--focus-ring) 28%, transparent);
}

.app-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: color-mix(in srgb, var(--border-strong) 80%, transparent) transparent;
}

.app-scrollbar::-webkit-scrollbar {
    width: 10px;
    height: 10px;
}

.app-scrollbar::-webkit-scrollbar-thumb {
    background: color-mix(in srgb, var(--border-strong) 80%, transparent);
    border: 3px solid transparent;
    border-radius: 999px;
    background-clip: content-box;
}

/* Step 5 - Drawer and modal helpers */

.app-modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 60;
    display: flex;
    background: rgb(15 23 42 / 0.38);
    backdrop-filter: blur(8px);
}

.app-drawer-overlay {
    align-items: stretch;
    justify-content: flex-end;
}

.app-dialog-overlay {
    align-items: center;
    justify-content: center;
    padding: 1rem;
}

.app-drawer-panel {
    width: min(100vw, 520px);
    height: 100%;
    background: var(--surface);
    color: var(--foreground);
    border-left: 1px solid var(--border);
    box-shadow: -24px 0 60px rgb(15 23 42 / 0.18);
    outline: none;
}

.app-dialog-panel {
    width: min(100vw - 2rem, 440px);
    background: var(--surface);
    color: var(--foreground);
    border: 1px solid var(--border);
    border-radius: var(--radius-xl);
    box-shadow:
        0 20px 25px -5px rgb(15 23 42 / 0.18),
        0 8px 10px -6px rgb(15 23 42 / 0.16);
    outline: none;
}

/* STEP_15_GLOBAL_POLISH */
html {
    scroll-behavior: smooth;
}

body {
    overflow-x: hidden;
}

.app-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: color-mix(in srgb, var(--text-muted) 35%, transparent) transparent;
}

.app-scrollbar::-webkit-scrollbar {
    height: 8px;
    width: 8px;
}

.app-scrollbar::-webkit-scrollbar-thumb {
    border-radius: 999px;
    background: color-mix(in srgb, var(--text-muted) 28%, transparent);
}

.app-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.react-aria-Table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
}

.react-aria-Cell,
.react-aria-Column {
    vertical-align: middle;
}

.app-table-primary-cell {
    min-width: 0;
}

@media (max-width: 1023px) {
    .app-drawer-panel {
        width: min(100vw, 720px);
    }
}

/* Step 36 finance live builder */
.finance-builder-container {
    container-type: inline-size;
}

.finance-builder-layout {
    display: grid;
    gap: 1.25rem;
    min-width: 0;
}

.finance-builder-preview {
    position: static;
    min-width: 0;
}

@container (min-width: 980px) {
    .finance-builder-layout {
        grid-template-columns: minmax(0, 1fr) minmax(360px, 440px);
        align-items: start;
    }

    .finance-builder-preview {
        position: sticky;
        top: 1rem;
    }
}

html.login-no-scroll,
body.login-no-scroll {
    width: 100%;
    height: 100%;
    overflow: hidden !important;
    overscroll-behavior: none;
}

body.login-no-scroll #app {
    width: 100vw;
    height: 100dvh;
    overflow: hidden !important;
}
/* STEP_51_SHELL_OVERFLOW_FIX */
html,
body,
#app {
    width: 100%;
    height: 100%;
    min-height: 0;
    overflow: hidden;
}

body {
    overscroll-behavior: none;
}

.crm-shell {
    min-height: 0;
    max-height: 100dvh;
    overflow: hidden;
}

.crm-shell > .flex-1,
.crm-shell > div[class*="flex-1"] {
    min-height: 0;
}

.crm-topbar {
    flex: 0 0 var(--crm-topbar-h);
}

.crm-page {
    box-sizing: border-box;
    min-height: 0;
    overscroll-behavior: contain;
}

@media (min-width: 768px) {
    .crm-page {
        padding-bottom: var(--crm-page-pad);
    }
}
```


## FILE: resources\css\archilbo-theme.css
```
:root {
    color-scheme: dark;

    --crm-bg: #070808;
    --crm-bg-2: #0b0c0d;
    --crm-bg-3: #0f1011;

    --crm-surface: #101111;
    --crm-surface-2: #151513;
    --crm-surface-3: #1b1a16;
    --crm-surface-hover: #1f1d18;

    --crm-border: #2b2921;
    --crm-border-strong: #3a3528;
    --crm-border-soft: color-mix(in srgb, var(--crm-border) 70%, transparent);

    --crm-text: #f5f1e8;
    --crm-text-muted: #a9a294;
    --crm-text-soft: #756f64;

    --crm-gold: #f6b725;
    --crm-gold-2: #d79516;
    --crm-gold-soft: color-mix(in srgb, var(--crm-gold) 14%, transparent);

    --crm-success: #4ade80;
    --crm-success-soft: color-mix(in srgb, var(--crm-success) 14%, transparent);
    --crm-danger: #fb5c5c;
    --crm-danger-soft: color-mix(in srgb, var(--crm-danger) 14%, transparent);
    --crm-info: #7fb0ff;
    --crm-info-soft: color-mix(in srgb, var(--crm-info) 14%, transparent);
    --crm-violet: #a78bfa;
    --crm-violet-soft: color-mix(in srgb, var(--crm-violet) 14%, transparent);

    --crm-sidebar-w: 264px;
    --crm-topbar-h: 64px;
    --crm-right-panel-w: 360px;
    --app-topbar-h: 64px;
    --mobile-bottom-nav-h: 72px;

    --crm-page-pad: 32px;
    --crm-page-gap: 24px;
    --crm-panel-gap: 18px;
    --crm-card-pad: 18px;
    --crm-card-pad-sm: 14px;

    --crm-radius-xs: 6px;
    --crm-radius-sm: 8px;
    --crm-radius-md: 12px;
    --crm-radius-lg: 16px;
    --crm-radius-xl: 20px;

    --crm-shadow-panel: 0 18px 60px rgb(0 0 0 / 0.36);
    --crm-shadow-gold: 0 0 0 1px color-mix(in srgb, var(--crm-gold) 24%, transparent), 0 10px 30px rgb(246 183 37 / 0.08);

    --crm-font-sans: Geist, Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    --crm-font-mono: "Geist Mono", "SFMono-Regular", Consolas, monospace;
}

html,
body {
    height: 100%;
    overflow: hidden;
    background:
        radial-gradient(circle at top left, rgb(246 183 37 / 0.06), transparent 28rem),
        radial-gradient(circle at top right, rgb(127 176 255 / 0.04), transparent 24rem),
        var(--crm-bg);
    color: var(--crm-text);
}

body {
    margin: 0;
    font-family: var(--crm-font-sans);
}

#app {
    height: 100%;
    overflow: hidden;
}

.crm-shell {
    height: 100dvh;
    width: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: row;
    background:
        linear-gradient(180deg, rgb(255 255 255 / 0.018), transparent 180px),
        var(--crm-bg);
}

.crm-panel {
    border: 1px solid var(--crm-border);
    background:
        linear-gradient(180deg, rgb(255 255 255 / 0.025), transparent),
        var(--crm-surface);
    border-radius: var(--crm-radius-lg);
    box-shadow: var(--crm-shadow-panel);
}

.crm-panel-flat {
    border: 1px solid var(--crm-border);
    background: var(--crm-surface);
    border-radius: var(--crm-radius-md);
}

.crm-panel-soft {
    border: 1px solid var(--crm-border-soft);
    background: color-mix(in srgb, var(--crm-surface) 84%, transparent);
    border-radius: var(--crm-radius-md);
}

.crm-page {
    width: 100%;
    max-width: 1600px;
    margin-inline: auto;
    padding: var(--crm-page-pad);
    display: grid;
    gap: 8px;
    align-content: start;
    overflow-y: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
}

.crm-page::-webkit-scrollbar {
    display: none;
}

.crm-topbar {
    height: var(--crm-topbar-h);
    border-bottom: 1px solid var(--crm-border);
    background: color-mix(in srgb, var(--crm-bg-2) 92%, transparent);
    backdrop-filter: blur(18px);
}

.crm-command-input {
    height: 42px;
    border: 1px solid var(--crm-border);
    border-radius: var(--crm-radius-md);
    background: color-mix(in srgb, var(--crm-surface) 88%, transparent);
    color: var(--crm-text);
}

.crm-command-input:focus-within {
    border-color: color-mix(in srgb, var(--crm-gold) 58%, var(--crm-border));
    box-shadow: 0 0 0 3px rgb(246 183 37 / 0.08);
}

/* â”€â”€ Sidebar â€“ Compact Expanded â”€â”€ */
.crm-sidebar {
    border-right: 1px solid var(--crm-border);
    background: var(--crm-bg-2);
}

.crm-sidebar-expanded {
    flex: 0 0 216px;
    width: 216px;
}

.crm-sidebar-rail {
    flex: 0 0 56px;
    width: 56px;
}

@media (max-width: 767px) {
    .crm-sidebar {
        display: none;
    }
}

/* â”€â”€ Sidebar Nav Item â”€â”€ */
.crm-nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    border-radius: 8px;
    padding-inline: 10px;
    height: 30px;
    font-size: 11px;
    font-weight: 600;
    color: var(--crm-text-muted);
    transition: background 140ms ease, color 140ms ease;
}

.crm-nav-item:hover {
    background: rgba(255, 255, 255, 0.04);
    color: var(--crm-text);
}

.crm-nav-item-active {
    background: rgba(246, 183, 37, 0.12);
    color: var(--crm-gold);
}

.crm-nav-item-rail {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    margin: 0 auto;
    color: var(--crm-text-muted);
    transition: background 140ms ease, color 140ms ease;
}

.crm-nav-item-rail:hover {
    background: rgba(255, 255, 255, 0.06);
    color: var(--crm-text);
}

.crm-nav-item-rail-active {
    background: rgba(246, 183, 37, 0.15);
    color: var(--crm-gold);
}

/* â”€â”€ Sidebar Section Label â”€â”€ */
.crm-sidebar-section {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--crm-text-soft);
    padding-inline: 10px;
    margin-bottom: 6px;
    margin-top: 4px;
}

/* â”€â”€ Sidebar Tooltip â”€â”€ */
.crm-sidebar-tooltip {
    position: absolute;
    left: calc(100% + 8px);
    top: 50%;
    transform: translateY(-50%);
    z-index: 9999;
    pointer-events: none;
    opacity: 0;
    transition: opacity 120ms ease;
    white-space: nowrap;
    padding: 4px 10px;
    border-radius: 6px;
    background: #111;
    color: #fff;
    font-size: 10px;
    font-weight: 600;
    line-height: 1.3;
    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
}

*:hover > .crm-sidebar-tooltip {
    opacity: 1;
}

/* â”€â”€ Sidebar Popover â”€â”€ */
.crm-popover-card {
    min-width: 200px;
    border: 1px solid var(--crm-border);
    border-radius: 10px;
    background: var(--crm-elevated, #161712);
    box-shadow: 0 12px 40px rgba(0,0,0,0.5);
    padding: 4px;
}

.crm-popover-item {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 7px 10px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
    color: var(--crm-text-muted);
    text-align: left;
    transition: background 120ms ease, color 120ms ease;
}

.crm-popover-item:hover {
    background: rgba(255, 255, 255, 0.05);
    color: var(--crm-text);
}

.crm-popover-item-active {
    background: rgba(246, 183, 37, 0.12);
    color: var(--crm-gold);
}

.crm-popover-divider {
    height: 1px;
    background: var(--crm-border);
    margin: 4px 0;
}

/* â”€â”€ Sidebar Search â”€â”€ */
.crm-sb-search {
    height: 28px;
    border: 1px solid var(--crm-border);
    border-radius: 8px;
    background: var(--crm-surface);
    padding-inline: 8px;
    font-size: 11px;
    color: var(--crm-text);
    outline: none;
    width: 100%;
}

.crm-sb-search::placeholder {
    color: var(--crm-text-soft);
}

.crm-sb-search:focus {
    border-color: rgba(246,183,37,0.5);
}

/* â”€â”€ Workspace Dot â”€â”€ */
.crm-ws-dot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    display: inline-block;
    flex-shrink: 0;
}

.crm-page-title {
    letter-spacing: -0.015em;
    font-size: 28px;
    line-height: 1.1;
    font-weight: 720;
}

.crm-eyebrow {
    font-size: 11px;
    font-weight: 760;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--crm-gold);
}

.crm-kpi-grid {
    display: grid;
    gap: var(--crm-panel-gap);
    grid-template-columns: repeat(5, minmax(0, 1fr));
}

.crm-kpi-card {
    min-height: 88px;
    border: 1px solid var(--crm-border);
    background: linear-gradient(180deg, rgb(255 255 255 / 0.028), transparent), var(--crm-surface);
    border-radius: var(--crm-radius-md);
    padding: 14px;
}

.crm-kpi-label {
    font-size: 11px;
    font-weight: 650;
    color: var(--crm-text-muted);
}

.crm-kpi-value {
    margin-top: 8px;
    font-size: 24px;
    line-height: 1;
    font-weight: 760;
    letter-spacing: -0.02em;
}

.crm-segmented {
    display: inline-flex;
    gap: 3px;
    padding: 4px;
    border: 1px solid var(--crm-border);
    border-radius: var(--crm-radius-md);
    background: var(--crm-surface);
}

.crm-segmented-button {
    height: 32px;
    border-radius: var(--crm-radius-sm);
    padding-inline: 12px;
    font-size: 12px;
    font-weight: 680;
    color: var(--crm-text-muted);
    transition: background 160ms ease, color 160ms ease;
}

.crm-segmented-button:hover {
    background: var(--crm-surface-2);
    color: var(--crm-text);
}

.crm-segmented-button-active {
    background: var(--crm-gold);
    color: #111;
}

.crm-table-wrap {
    overflow: hidden;
    border: 1px solid var(--crm-border);
    border-radius: var(--crm-radius-md);
    background: var(--crm-surface);
}

.crm-table-shell {
    overflow: hidden;
    border: 1px solid var(--crm-border);
    border-radius: var(--crm-radius-lg);
    background: linear-gradient(180deg, rgb(255 255 255 / 0.025), transparent), var(--crm-surface);
}

.crm-table-toolbar {
    display: grid;
    grid-template-columns: minmax(220px, 1fr) auto;
    gap: 10px;
    align-items: center;
    border-bottom: 1px solid var(--crm-border);
    padding: 12px;
}

.crm-table-filter-row {
    display: flex;
    min-width: 0;
    flex-wrap: wrap;
    gap: 7px;
    align-items: center;
}

.crm-table-filter {
    display: inline-flex;
    min-height: 32px;
    align-items: center;
    gap: 7px;
    border: 1px solid var(--crm-border);
    border-radius: 999px;
    padding-inline: 11px;
    background: var(--crm-elevated);
    color: var(--crm-text-muted);
    font-size: 12px;
    font-weight: 760;
    transition: border-color 160ms ease, background 160ms ease, color 160ms ease, transform 160ms ease;
}

.crm-table-filter:hover {
    border-color: var(--crm-border-strong);
    color: var(--crm-text);
}

.crm-table-filter-active {
    border-color: color-mix(in srgb, var(--crm-gold) 58%, var(--crm-border));
    background: var(--crm-gold);
    color: #111;
}

.crm-table-search {
    position: relative;
    min-width: 0;
}

.crm-table-search input {
    height: 38px;
    width: 100%;
    border: 1px solid var(--crm-border);
    border-radius: 13px;
    background: var(--crm-bg-2);
    padding-inline: 38px 12px;
    color: var(--crm-text);
    font-size: 13px;
    outline: none;
}

.crm-table-search input:focus {
    border-color: color-mix(in srgb, var(--crm-gold) 55%, var(--crm-border));
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--crm-gold) 12%, transparent);
}

.crm-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    font-size: 12px;
}

.crm-table th {
    position: sticky;
    top: 0;
    z-index: 1;
    height: 34px;
    padding-inline: 11px;
    border-bottom: 1px solid var(--crm-border);
    color: var(--crm-text-soft);
    font-size: 10px;
    font-weight: 780;
    text-align: left;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    background: color-mix(in srgb, var(--crm-surface-2) 74%, transparent);
}

.crm-table td {
    height: 48px;
    padding: 8px 11px;
    border-bottom: 1px solid color-mix(in srgb, var(--crm-border) 72%, transparent);
    color: var(--crm-text-muted);
    vertical-align: middle;
}

.crm-table tr:hover td {
    background: color-mix(in srgb, var(--crm-gold) 4%, transparent);
    color: var(--crm-text);
}

.crm-table tr.is-selected td {
    background: color-mix(in srgb, var(--crm-gold) 10%, transparent);
}

.crm-avatar-chip {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
}

.crm-avatar-chip-mark {
    display: inline-flex;
    width: 34px;
    height: 34px;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    background: color-mix(in srgb, var(--crm-gold) 16%, transparent);
    color: var(--crm-gold);
    font-size: 11px;
    font-weight: 900;
}

.crm-mobile-record-list {
    display: none;
}

.crm-mobile-record-card {
    border: 1px solid var(--crm-border);
    border-radius: var(--crm-radius-md);
    background: var(--crm-elevated);
    padding: 12px;
}

.crm-reference-table-shell {
    color: var(--crm-text);
    border-radius: 18px;
    background:
        linear-gradient(180deg, rgb(246 183 37 / 0.035), transparent 180px),
        var(--crm-bg-2);
    padding: 12px;
    border: 1px solid var(--crm-border);
    box-shadow: 0 18px 50px rgb(0 0 0 / 0.22);
}

.crm-reference-toolbar {
    display: grid;
    grid-template-columns: minmax(180px, 260px) auto 1fr auto;
    gap: 12px;
    align-items: center;
    padding-bottom: 12px;
}

.crm-reference-search {
    position: relative;
}

.crm-reference-search input {
    width: 100%;
    height: 34px;
    border: 1px solid var(--crm-border);
    border-radius: 9px;
    background: var(--crm-surface);
    padding: 0 12px 0 34px;
    color: var(--crm-text);
    font-size: 12px;
    outline: none;
    box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.025);
}

.crm-reference-search input:focus {
    border-color: #f0a43b;
    box-shadow: 0 0 0 3px rgb(240 164 59 / 0.16);
}

.crm-reference-toolbar-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
}

.crm-reference-button {
    display: inline-flex;
    height: 34px;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: 1px solid var(--crm-border);
    border-radius: 9px;
    background: var(--crm-surface);
    padding: 0 13px;
    color: var(--crm-text);
    font-size: 12px;
    font-weight: 650;
    box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.025);
    transition: transform 140ms ease, border-color 140ms ease, box-shadow 140ms ease;
}

.crm-reference-button:hover {
    border-color: color-mix(in srgb, var(--crm-gold) 48%, var(--crm-border));
    background: var(--crm-surface-2);
    box-shadow: 0 8px 20px rgb(0 0 0 / 0.18);
    transform: translateY(-1px);
}

.crm-reference-button-primary {
    border-color: color-mix(in srgb, var(--crm-gold) 70%, var(--crm-border));
    background: linear-gradient(180deg, #ffc247, var(--crm-gold));
    color: #111;
}

.crm-reference-filter-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
}

.crm-reference-filter {
    display: inline-flex;
    height: 28px;
    align-items: center;
    gap: 6px;
    border: 1px solid var(--crm-border);
    border-radius: 999px;
    background: var(--crm-surface);
    padding: 0 10px;
    color: var(--crm-text-muted);
    font-size: 11px;
    font-weight: 650;
}

.crm-reference-filter-active {
    border-color: color-mix(in srgb, var(--crm-gold) 70%, var(--crm-border));
    background: color-mix(in srgb, var(--crm-gold) 18%, var(--crm-surface));
    color: var(--crm-gold);
}

.crm-reference-table-card {
    overflow: hidden;
    border: 1px solid var(--crm-border);
    border-radius: 16px;
    background: var(--crm-surface);
}

.crm-reference-table-scroll {
    overflow-x: auto;
}

.crm-reference-table {
    width: 100%;
    min-width: 1040px;
    border-collapse: separate;
    border-spacing: 0;
    color: var(--crm-text-muted);
    font-size: 12px;
}

.crm-reference-table th {
    height: 42px;
    border-bottom: 1px solid var(--crm-border);
    padding: 0 13px;
    color: var(--crm-text-soft);
    font-size: 11px;
    font-weight: 680;
    text-align: left;
    white-space: nowrap;
    background: var(--crm-surface-2);
}

.crm-reference-table td {
    height: 44px;
    border-bottom: 1px solid color-mix(in srgb, var(--crm-border) 74%, transparent);
    padding: 0 13px;
    color: var(--crm-text-muted);
    vertical-align: middle;
}

.crm-reference-table tbody tr:nth-child(even) td {
    background: color-mix(in srgb, var(--crm-surface-2) 48%, transparent);
}

.crm-reference-table tbody tr:hover td {
    background: color-mix(in srgb, var(--crm-gold) 6%, var(--crm-surface));
    color: var(--crm-text);
}

.crm-reference-table tbody tr.is-selected td {
    background: color-mix(in srgb, var(--crm-gold) 11%, var(--crm-surface));
}

.crm-reference-check {
    width: 14px;
    height: 14px;
    border: 1px solid var(--crm-border-strong);
    border-radius: 4px;
    accent-color: #f6a531;
}

.crm-reference-header-cell {
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

.crm-reference-header-sort {
    color: var(--crm-text-soft);
}

.crm-reference-avatar {
    display: inline-flex;
    width: 18px;
    height: 18px;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    background: var(--crm-gold-soft);
    color: var(--crm-gold);
    font-size: 9px;
    font-weight: 800;
}

.crm-reference-status {
    display: inline-flex;
    min-width: 96px;
    height: 22px;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    padding: 0 10px;
    font-size: 10px;
    font-weight: 700;
}

.crm-reference-status-success {
    background: var(--crm-success-soft);
    color: var(--crm-success);
}

.crm-reference-status-warning {
    background: var(--crm-gold-soft);
    color: var(--crm-gold);
}

.crm-reference-status-info {
    background: var(--crm-info-soft);
    color: var(--crm-info);
}

.crm-reference-status-danger {
    background: var(--crm-danger-soft);
    color: var(--crm-danger);
}

.crm-reference-status-muted {
    background: color-mix(in srgb, var(--crm-text-muted) 12%, transparent);
    color: var(--crm-text-muted);
}

.crm-reference-assignee {
    display: inline-flex;
    max-width: 150px;
    align-items: center;
    gap: 6px;
    border: 1px solid var(--crm-border);
    border-radius: 7px;
    background: var(--crm-surface);
    padding: 3px 8px 3px 4px;
    color: var(--crm-text);
    font-size: 10px;
    font-weight: 650;
}

.crm-reference-kebab {
    display: inline-flex;
    width: 26px;
    height: 26px;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--crm-border);
    border-radius: 8px;
    background: var(--crm-surface);
    color: var(--crm-text-muted);
}

.crm-reference-kebab:hover {
    border-color: color-mix(in srgb, var(--crm-gold) 48%, var(--crm-border));
    background: var(--crm-surface-2);
    color: var(--crm-gold);
}

.crm-reference-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    border-top: 1px solid var(--crm-border);
    background: var(--crm-surface);
    padding: 10px 12px;
    color: var(--crm-text-muted);
    font-size: 11px;
}

.crm-reference-mobile-list {
    display: none;
}

.crm-reference-mobile-card {
    border: 1px solid var(--crm-border);
    border-radius: 14px;
    background: var(--crm-surface);
    padding: 12px;
    color: var(--crm-text);
}

.crm-status-pill {
    display: inline-flex;
    min-height: 22px;
    align-items: center;
    border-radius: 999px;
    padding-inline: 8px;
    font-size: 11px;
    font-weight: 700;
    white-space: nowrap;
}

.crm-status-warning {
    background: var(--crm-gold-soft);
    color: var(--crm-gold);
}

.crm-status-success {
    background: var(--crm-success-soft);
    color: var(--crm-success);
}

.crm-status-danger {
    background: var(--crm-danger-soft);
    color: var(--crm-danger);
}

.crm-status-info {
    background: var(--crm-info-soft);
    color: var(--crm-info);
}

.crm-action-button {
    height: 34px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: 1px solid var(--crm-border);
    border-radius: var(--crm-radius-sm);
    padding-inline: 11px;
    background: var(--crm-surface);
    color: var(--crm-text);
    font-size: 12px;
    font-weight: 700;
    transition: background 160ms ease, border-color 160ms ease, color 160ms ease;
}

.crm-action-button:hover {
    border-color: var(--crm-border-strong);
    background: var(--crm-surface-2);
}

.crm-action-button-primary {
    border-color: color-mix(in srgb, var(--crm-gold) 60%, var(--crm-border));
    background: var(--crm-gold);
    color: #111;
}

.crm-action-button-primary:hover {
    background: #ffc63a;
}

.crm-right-panel {
    width: var(--crm-right-panel-w);
    min-width: 0;
}

.crm-divider {
    height: 1px;
    background: var(--crm-border);
}

.crm-scroll-thin {
    scrollbar-width: thin;
    scrollbar-color: var(--crm-border-strong) transparent;
}

.crm-scroll-thin::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}

.crm-scroll-thin::-webkit-scrollbar-thumb {
    background: var(--crm-border-strong);
    border-radius: 999px;
}

.crm-scroll-thin::-webkit-scrollbar-track {
    background: transparent;
}

@media (max-width: 1279px) {
    .crm-kpi-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .crm-right-panel {
        width: 100%;
    }
}

@media (max-width: 767px) {
    :root {
        --crm-page-pad: 16px;
        --crm-page-gap: 18px;
        --crm-panel-gap: 14px;
    }

    .crm-page-title {
        font-size: 23px;
    }

    .crm-kpi-grid {
        grid-template-columns: 1fr;
    }

    .crm-table td,
    .crm-table th {
        padding-inline: 10px;
    }

    .crm-table-toolbar {
        grid-template-columns: 1fr;
    }

    .crm-table-desktop {
        display: none;
    }

    .crm-mobile-record-list {
        display: grid;
        gap: 10px;
        padding: 12px;
    }

    .crm-reference-table-shell {
        border-radius: 16px;
        padding: 10px;
    }

    .crm-reference-toolbar {
        grid-template-columns: 1fr;
    }

    .crm-reference-table-scroll {
        display: none;
    }

    .crm-reference-mobile-list {
        display: grid;
        gap: 10px;
        padding: 10px;
    }

    .crm-reference-footer {
        flex-direction: column;
        align-items: stretch;
    }
}

.scrollbar-none {
    scrollbar-width: none;
    -ms-overflow-style: none;
}

.scrollbar-none::-webkit-scrollbar {
    display: none;
}

/* Bottom nav â€” mobile only < 768px */
#app-bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 50;
    height: var(--mobile-bottom-nav-h);
    padding-bottom: env(safe-area-inset-bottom, 0px);
    border-top: 1px solid var(--crm-border);
    background: color-mix(in srgb, var(--crm-bg-2) 94%, transparent);
    backdrop-filter: blur(18px);
    display: none;
}

@media (max-width: 767px) {
    #app-bottom-nav {
        display: flex;
    }
}

/* Hide bottom nav when chat is open on mobile */
#app-bottom-nav.hide-bottom-nav {
    display: none !important;
}

/* Shell gets padding when bottom nav visible on mobile */
@media (max-width: 767px) {
    .crm-shell {
        padding-bottom: var(--mobile-bottom-nav-h);
    }
    .crm-shell.no-bottom-nav {
        padding-bottom: 0;
    }
}

/* Safe area helper for mobile content */
.app-safe-bottom {
    padding-bottom: calc(var(--mobile-bottom-nav-h) + env(safe-area-inset-bottom, 0px));
}

@keyframes typing-dot {
    0%, 65%, 100% {
        opacity: 0.35;
        transform: translateY(0) scale(0.82);
    }

    35% {
        opacity: 1;
        transform: translateY(-4px) scale(1);
    }
}

@keyframes typing-bubble-in {
    from {
        opacity: 0;
        transform: translateY(6px) scale(0.98);
    }

    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

@keyframes typing-avatar-pulse {
    0%, 100% {
        box-shadow: 0 0 0 0 color-mix(in srgb, var(--crm-gold) 34%, transparent);
    }

    50% {
        box-shadow: 0 0 0 4px transparent;
    }
}

.typing-indicator {
    animation: typing-bubble-in 180ms ease-out both;
}

.typing-avatar {
    animation: typing-avatar-pulse 1.8s ease-in-out infinite;
}

.typing-dot {
    display: inline-block;
    width: 0.32rem;
    height: 0.32rem;
    border-radius: 999px;
    background: var(--crm-gold);
    animation: typing-dot 1.15s ease-in-out infinite;
}

.typing-dot:nth-child(2) {
    animation-delay: 0.2s;
}

.typing-dot:nth-child(3) {
    animation-delay: 0.4s;
}

@keyframes msg-slide-in {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
}

.msg-slide-in {
    animation: msg-slide-in 0.2s ease-out;
}

@keyframes badge-pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
}

.badge-pulse {
    animation: badge-pulse 0.4s ease-in-out;
}

```


## FILE: resources\views\app.blade.php
```
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title inertia>{{ config('app.name', 'ARCHI LBO OS') }}</title>
    <script>
        window.csrfToken = '{{ csrf_token() }}';
        window.userId = {{ auth()->id() ?? 'null' }};
        window.Laravel = { csrfToken: '{{ csrf_token() }}' };
    </script>
    @routes
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.tsx'])
    @inertiaHead
</head>
<body>
    @inertia
</body>
</html>

```


# NEW FRONTEND FOUNDATION



## FILE: resources\js\providers\AppProviders.tsx
```
import type { ReactNode } from 'react';
import { AppFlashToasts } from '@/components/layout/AppFlashToasts';
import { AppToastProvider } from '@/providers/AppToastProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';

type AppProvidersProps = {
    children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
    return (
        <ThemeProvider>
            <AppFlashToasts />
            <AppToastProvider />
            {children}
        </ThemeProvider>
    );
}
```


## FILE: resources\js\providers\HeroProvider.tsx
```
MISSING
```


## FILE: resources\js\providers\ThemeProvider.tsx
```
import {
    createContext,
    PropsWithChildren,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { applyArchilboTheme } from '@/config/archilboTheme';

type Theme = 'light' | 'dark';

type ThemeContextValue = {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
    sidebarCollapsed: boolean;
    setSidebarCollapsed: (collapsed: boolean) => void;
    toggleSidebar: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getInitialTheme(): Theme {
    if (typeof window === 'undefined') {
        return 'light';
    }

    const stored = window.localStorage.getItem('archilbo-theme');

    if (stored === 'light' || stored === 'dark') {
        return stored;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getInitialSidebarCollapsed(): boolean {
    if (typeof window === 'undefined') {
        return false;
    }

    const stored = window.localStorage.getItem('archi-sidebar-collapsed') || window.localStorage.getItem('archilbo-sidebar-collapsed');
    if (stored === 'true') return true;
    if (stored === 'false') return false;

    return window.matchMedia('(min-width: 768px) and (max-width: 1279px)').matches;
}

export function ThemeProvider({ children }: PropsWithChildren) {
    const [theme, setTheme] = useState<Theme>(getInitialTheme);
    const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(getInitialSidebarCollapsed);

    useEffect(() => {
        applyArchilboTheme();
    }, []);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        window.localStorage.setItem('archilbo-theme', theme);
    }, [theme]);

    useEffect(() => {
        window.localStorage.setItem('archi-sidebar-collapsed', String(sidebarCollapsed));
    }, [sidebarCollapsed]);

    const value = useMemo<ThemeContextValue>(
        () => ({
            theme,
            setTheme,
            toggleTheme: () => setTheme((current) => (current === 'dark' ? 'light' : 'dark')),
            sidebarCollapsed,
            setSidebarCollapsed,
            toggleSidebar: () => setSidebarCollapsed((current) => !current),
        }),
        [theme, sidebarCollapsed],
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error('useTheme must be used inside ThemeProvider');
    }

    return context;
}

```


## FILE: resources\js\layouts\AppShell.tsx
```
MISSING
```


## FILE: resources\js\components\layout\AppShell.tsx
```
import type { ReactNode } from 'react';
import { AppMobileNav } from '@/components/layout/AppMobileNav';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppTopbar } from '@/components/layout/AppTopbar';
import { AppPageHeader } from '@/components/ui/AppPageHeader';
import { useTranslation } from '@/lib/i18n';

type AppShellProps = {
    eyebrowKey?: string;
    titleKey?: string;
    subtitleKey?: string;
    action?: ReactNode;
    children: ReactNode;
    fullBleed?: boolean;
    hideMobileNav?: boolean;
};

export function AppShell({ eyebrowKey, titleKey, subtitleKey, action, children, fullBleed, hideMobileNav }: AppShellProps) {
    const { t } = useTranslation();
    const shellClass = hideMobileNav ? 'crm-shell no-bottom-nav' : 'crm-shell';

    function renderShell(inner: ReactNode) {
        return (
            <div className={shellClass}>
                <AppSidebar />

                <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                    <AppTopbar />

                    {inner}
                </div>

                {!hideMobileNav ? <AppMobileNav /> : null}
            </div>
        );
    }

    if (fullBleed) {
        return renderShell(
            <main className="flex-1 min-h-0 overflow-hidden">
                {children}
            </main>
        );
    }

    return renderShell(
        <main className="crm-page flex-1 min-h-0 pb-28 md:pb-[var(--crm-page-pad)]">
            <header className="crm-panel-flat px-5 py-4">
                <AppPageHeader
                    eyebrow={eyebrowKey ? t(eyebrowKey) : undefined}
                    title={t(titleKey ?? '')}
                    subtitle={subtitleKey ? t(subtitleKey) : undefined}
                    actions={action}
                />
            </header>

            {children}
        </main>
    );
}

```


## FILE: resources\js\components\layout\AppSidebar.tsx
```
import { router, usePage } from '@inertiajs/react';
import {
    Archive, Bell, Building2, CalendarDays, ChevronRight, FileCheck2, FilePlus2, FileText,
    LayoutDashboard, ListChecks, LogOut, MessageSquare, PanelLeftClose, PanelLeftOpen,
    Search, Settings, ShieldCheck, SlidersHorizontal, UserRound, Users, FolderKanban,
    BadgeDollarSign, Check,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import type { AppRoute } from '@/config/navigation';
import { appRoutes, isActivePath, isValidHref } from '@/config/navigation';
import { useTranslation } from '@/lib/i18n';
import { useTheme } from '@/providers/ThemeProvider';

type NavItem = AppRoute & { section?: string };

const navSections: { label: string; items: AppRoute[] }[] = [
    {
        label: 'nav.groups.principal',
        items: appRoutes.filter((r) => r.group === 'principal'),
    },
    {
        label: 'nav.groups.followUp',
        items: appRoutes.filter((r) => r.group === 'followUp'),
    },
    {
        label: 'nav.groups.management',
        items: appRoutes.filter((r) => r.group === 'management'),
    },
    {
        label: 'nav.groups.administration',
        items: appRoutes.filter((r) => r.group === 'administration'),
    },
];

const wsDots: { labelKey: string; label: string; color: string; href: string }[] = [
    { labelKey: 'ws-operations', label: 'Operations', color: 'var(--crm-gold)', href: '/dossiers' },
    { labelKey: 'ws-finance', label: 'Finance', color: '#34d399', href: '/finance' },
    { labelKey: 'ws-documents', label: 'Documents', color: '#60a5fa', href: '/documents' },
    { labelKey: 'ws-tasks', label: 'Tasks', color: '#a78bfa', href: '/tasks' },
];

export function AppSidebar() {
    const { t } = useTranslation();
    const { sidebarCollapsed, toggleSidebar } = useTheme();
    const page = usePage();
    const currentPath = page.url;
    const authUser = ((page.props as any).auth?.user || {}) as { id?: number; name?: string; email?: string };
    const unreadCount = ((page.props as any).auth?.user?.unread_messages as number) || 0;

    const [wsOpen, setWsOpen] = useState(false);
    const [userOpen, setUserOpen] = useState(false);
    const wsRef = useRef<HTMLDivElement>(null);
    const userRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function close(e: MouseEvent) {
            if (wsRef.current && !wsRef.current.contains(e.target as Node)) setWsOpen(false);
            if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
        }
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, []);

    useEffect(() => {
        function esc(e: KeyboardEvent) { if (e.key === 'Escape') { setWsOpen(false); setUserOpen(false); } }
        document.addEventListener('keydown', esc);
        return () => document.removeEventListener('keydown', esc);
    }, []);

    function goTo(href: string, enabled: boolean) {
        if (!enabled || !isValidHref(href)) {
            toast.info('This module is not ready yet.');
            return;
        }
        router.visit(href);
    }

    function isActive(item: AppRoute) {
        return item.enabled && isActivePath(currentPath, item.href);
    }

    /* ---------- Collapsed Rail ---------- */
    if (sidebarCollapsed) {
        const allItems = appRoutes.filter((r) => r.enabled && r.icon);
        return (
            <aside className="crm-sidebar crm-sidebar-rail hidden h-full shrink-0 flex-col overflow-hidden md:flex">
                <div className="flex shrink-0 flex-col items-center gap-2 border-b border-[var(--crm-border)] py-3">
                    <button type="button" onClick={() => goTo('/', true)}
                        className="flex size-8 items-center justify-center rounded-[9px] bg-[var(--crm-gold)] text-black"
                        aria-label="ARCHI LBO OS">
                        <Building2 size={15} />
                    </button>

                    <div className="group relative">
                        <button type="button" onClick={toggleSidebar}
                            className="flex size-8 items-center justify-center rounded-lg border border-[var(--crm-border)] text-[var(--crm-text-muted)] transition hover:border-[var(--crm-gold)] hover:text-[var(--crm-gold)]"
                            aria-label="Expand sidebar">
                            <PanelLeftOpen size={15} />
                        </button>
                        <div className="crm-sidebar-tooltip">Expand sidebar</div>
                    </div>
                </div>

                {/* Nav icons */}
                <nav className="flex-1 overflow-y-auto scrollbar-none py-3 space-y-1">
                    {allItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item);
                        const showDot = item.key === 'inbox' && unreadCount > 0;
                        return (
                            <div key={item.key} className="relative flex items-center justify-center group">
                                <button type="button" onClick={() => goTo(item.href, item.enabled)}
                                    className={`crm-nav-item-rail ${active ? 'crm-nav-item-rail-active' : ''}`}
                                    aria-label={t(item.labelKey)}>
                                    <Icon size={16} />
                                    {showDot ? (
                                        <span className="absolute right-[6px] top-[4px] size-2 rounded-full bg-red-500" />
                                    ) : null}
                                </button>
                                <div className="crm-sidebar-tooltip">{t(item.labelKey)}</div>
                            </div>
                        );
                    })}

                    {/* Workspace color dots */}
                    <div className="border-t border-[var(--crm-border)] my-2 mx-3" />
                    {wsDots.map((w) => (
                        <div key={w.labelKey} className="relative flex items-center justify-center group">
                            <button type="button"
                                onClick={() => goTo(w.href, true)}
                                className="flex h-8 w-8 items-center justify-center mx-auto rounded-lg hover:bg-[rgba(255,255,255,0.04)] transition"
                                aria-label={w.label}>
                                <span className="crm-ws-dot" style={{ background: w.color }} />
                            </button>
                            <div className="crm-sidebar-tooltip">{w.label}</div>
                        </div>
                    ))}
                </nav>

                {/* User avatar bottom */}
                <div className="shrink-0 border-t border-[var(--crm-border)] py-2">
                    <div className="flex flex-col items-center gap-2">
                        <div className="group relative">
                            <button type="button" onClick={() => setUserOpen((o) => !o)}
                                className="flex size-8 items-center justify-center rounded-full bg-[var(--crm-gold-soft)] text-[10px] font-bold text-[var(--crm-gold)]"
                                aria-label={authUser?.name || 'User'}>
                                {(authUser?.name || 'U').charAt(0).toUpperCase()}
                            </button>
                            <div className="crm-sidebar-tooltip">{authUser?.name || 'User'}</div>
                        </div>

                        <div className="group relative">
                            <button type="button" onClick={() => router.visit('/settings')}
                                className="flex size-8 items-center justify-center rounded-lg text-[var(--crm-text-muted)] hover:bg-[var(--crm-surface-2)] hover:text-[var(--crm-gold)]"
                                aria-label="Settings">
                                <Settings size={15} />
                            </button>
                            <div className="crm-sidebar-tooltip">Settings</div>
                        </div>

                        <div className="group relative">
                            <button type="button" onClick={() => router.post('/logout')}
                                className="flex size-8 items-center justify-center rounded-lg text-[var(--crm-text-muted)] hover:bg-[var(--crm-surface-2)] hover:text-[var(--crm-danger)]"
                                aria-label="Logout">
                                <LogOut size={15} />
                            </button>
                            <div className="crm-sidebar-tooltip">Logout</div>
                        </div>
                    </div>

                    <div className="relative flex items-center justify-center group">
                    <button type="button" onClick={() => setUserOpen((o) => !o)}
                        className="hidden"
                        aria-label={authUser?.name || 'User'}>
                        User
                    </button>

                    {/* User popover */}
                    {userOpen ? (
                        <div ref={userRef} className="absolute bottom-12 left-2 z-[60] crm-popover-card">
                            <div className="flex items-center gap-3 border-b border-[var(--crm-border)] px-3 py-3">
                                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--crm-gold-soft)] text-xs font-bold text-[var(--crm-gold)]">
                                    {(authUser?.name || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-[var(--crm-text)] truncate">{authUser?.name || 'User'}</p>
                                    <p className="text-[9px] text-[var(--crm-text-muted)] truncate">{authUser?.email || ''}</p>
                                </div>
                            </div>
                            <div className="p-1.5 space-y-0.5">
                                <button type="button" onClick={() => { router.visit('/settings'); setUserOpen(false); }}
                                    className="crm-popover-item">
                                    <Settings size={14} /> {t('nav.settings')}
                                </button>
                                <button type="button" onClick={() => { router.post('/logout'); setUserOpen(false); }}
                                    className="crm-popover-item">
                                    <LogOut size={14} /> {t('nav.logout')}
                                </button>
                            </div>
                        </div>
                    ) : null}
                    </div>
                </div>
            </aside>
        );
    }

    /* ---------- Expanded Sidebar ---------- */
    return (
        <aside className="crm-sidebar crm-sidebar-expanded hidden h-full shrink-0 flex-col overflow-hidden md:flex">
            {/* Brand top */}
            <div className="flex h-12 items-center justify-between border-b border-[var(--crm-border)] px-3">
                <div className="relative" ref={wsRef}>
                    <button type="button" onClick={() => setWsOpen((o) => !o)}
                        className="flex items-center gap-2.5 text-left group">
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-[8px] bg-[var(--crm-gold)] text-black">
                            <Building2 size={14} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] font-bold leading-tight text-[var(--crm-text)]">ARCHI LBO <span className="text-[var(--crm-gold)]">OS</span></p>
                            <p className="text-[9px] text-[var(--crm-text-muted)] leading-tight">{t('app.description')}</p>
                        </div>
                        <ChevronRight size={12} className="shrink-0 text-[var(--crm-text-soft)] ml-auto group-hover:text-[var(--crm-text)] transition" />
                    </button>

                    {wsOpen ? (
                        <div className="absolute left-0 top-full mt-1 z-[60] crm-popover-card">
                            <div className="p-1.5 space-y-0.5">
                                <div className="flex items-center gap-2.5 px-3 py-2">
                                    <div className="flex size-7 shrink-0 items-center justify-center rounded-[8px] bg-[var(--crm-gold)] text-black">
                                        <Building2 size={14} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-[var(--crm-text)]">ARCHI LBO OS</p>
                                        <p className="text-[9px] text-[var(--crm-text-muted)]">{t('app.description')}</p>
                                    </div>
                                    <Check size={14} className="shrink-0 text-[var(--crm-gold)]" />
                                </div>
                            </div>
                            <div className="crm-popover-divider" />
                            <div className="p-1.5 space-y-0.5">
                                {wsDots.map((w) => (
                                    <button key={w.labelKey} type="button" onClick={() => { goTo(w.href, true); setWsOpen(false); }}
                                        className="crm-popover-item">
                                        <span className="crm-ws-dot" style={{ background: w.color }} />
                                        {w.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : null}
                </div>

                <button type="button" onClick={toggleSidebar}
                    className="flex size-6 items-center justify-center rounded-md text-[var(--crm-text-soft)] hover:text-[var(--crm-text)] transition"
                    title="Collapse sidebar" aria-label="Collapse sidebar">
                    <PanelLeftClose size={14} />
                </button>
            </div>

            {/* Search */}
            <div className="px-3 py-2.5">
                <div className="relative">
                    <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--crm-text-soft)] pointer-events-none" />
                    <input type="text" placeholder={`${t('nav.search')}...`}
                        className="crm-sb-search pl-7 pr-2" />
                </div>
            </div>

            {/* Nav sections */}
            <nav className="flex-1 overflow-y-auto scrollbar-none px-2 pb-2">
                {navSections.map((section) => {
                    const items = section.items.filter((r) => r.enabled && r.icon);
                    if (items.length === 0) return null;
                    return (
                        <div key={section.label} className="mb-3">
                            <p className="crm-sidebar-section">{t(section.label)}</p>
                            <div className="space-y-0.5">
                                {items.map((item) => {
                                    const Icon = item.icon;
                                    const active = isActive(item);
                                    const showDot = item.key === 'inbox' && unreadCount > 0;
                                    return (
                                        <button key={item.key} type="button" onClick={() => goTo(item.href, item.enabled)}
                                            className={`crm-nav-item w-full ${active ? 'crm-nav-item-active' : ''} ${!item.enabled ? 'opacity-40 cursor-not-allowed' : ''}`}>
                                            <span className="relative">
                                                <Icon size={15} />
                                                {showDot ? (
                                                    <span className="absolute -right-1 -top-1 size-2 rounded-full bg-red-500" />
                                                ) : null}
                                            </span>
                                            <span className="min-w-0 flex-1 truncate text-left">{t(item.labelKey)}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}

{/* Quick Spaces */}
                <p className="crm-sidebar-section">Quick Spaces</p>
                <div className="space-y-0.5">
                    {wsDots.map((w) => (
                        <button key={w.labelKey} type="button" onClick={() => goTo(w.href, true)}
                            className="crm-nav-item w-full">
                        <span className="crm-ws-dot" style={{ background: w.color }} />
                        <span className="min-w-0 flex-1 truncate text-left">{w.label}</span>
                        </button>
                    ))}
                </div>
            </nav>

            {/* User footer */}
            <div className="relative shrink-0 border-t border-[var(--crm-border)] px-3 py-2.5" ref={userRef}>
                <button type="button" onClick={() => setUserOpen((o) => !o)}
                    className="flex w-full items-center gap-2.5 text-left group">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--crm-gold-soft)] text-[10px] font-bold text-[var(--crm-gold)]">
                        {(authUser?.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold text-[var(--crm-text)] leading-tight truncate">{authUser?.name || 'User'}</p>
                        <p className="text-[9px] text-[var(--crm-text-muted)] leading-tight truncate">{authUser?.email || ''}</p>
                    </div>
                    <ChevronRight size={12} className="shrink-0 text-[var(--crm-text-soft)] group-hover:text-[var(--crm-text)] transition" />
                </button>

                {userOpen ? (
                    <div className="absolute bottom-full left-2 mb-1 z-[60] crm-popover-card" style={{ minWidth: '190px' }}>
                        <div className="flex items-center gap-3 border-b border-[var(--crm-border)] px-3 py-3">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--crm-gold-soft)] text-xs font-bold text-[var(--crm-gold)]">
                                {(authUser?.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-bold text-[var(--crm-text)] truncate">{authUser?.name || 'User'}</p>
                                <p className="text-[9px] text-[var(--crm-text-muted)] truncate">{authUser?.email || ''}</p>
                            </div>
                        </div>
                        <div className="p-1.5 space-y-0.5">
                            <button type="button" onClick={() => { router.visit('/settings'); setUserOpen(false); }}
                                className="crm-popover-item">
                                <Settings size={14} /> {t('nav.settings')}
                            </button>
                            <button type="button" onClick={() => { router.post('/logout'); setUserOpen(false); }}
                                className="crm-popover-item">
                                <LogOut size={14} /> {t('nav.logout')}
                            </button>
                        </div>
                    </div>
                ) : null}
            </div>
        </aside>
    );
}

```


## FILE: resources\js\components\layout\AppTopbar.tsx
```
import { router } from '@inertiajs/react';
import { CalendarDays, LogOut, Plus } from 'lucide-react';
import { MessagePopover } from '@/features/inbox/components/MessagePopover';
import { NotificationPopover } from '@/features/notifications/components/NotificationPopover';
import { AppGlobalSearch } from '@/components/layout/AppGlobalSearch';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

export function AppTopbar() {
    function handleLogout() {
        router.post('/logout');
    }

    return (
        <header className="crm-topbar shrink-0">
            <div className="flex h-full items-center gap-1.5 px-3 lg:gap-3 lg:px-6">
                <div className="min-w-0 flex-1">
                    <div className="max-w-[340px] lg:max-w-[620px]">
                        <AppGlobalSearch />
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                    <button
                        type="button"
                        onClick={() => router.visit('/dossiers')}
                        className="crm-action-button-primary crm-action-button hidden sm:inline-flex h-8 lg:h-9"
                    >
                        <Plus size={14} />
                        <span className="hidden lg:inline">New</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => router.visit('/finance/documents?tab=monthly')}
                        className="crm-action-button hidden md:inline-flex h-8 w-8 px-0 lg:h-9 lg:w-auto lg:px-3"
                        title="Monthly summary"
                    >
                        <CalendarDays size={14} />
                        <span className="hidden lg:inline">Monthly</span>
                    </button>

                    <MessagePopover />

                    <NotificationPopover />

                    <ThemeToggle />

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="crm-action-button h-8 w-8 px-0 lg:h-9 lg:w-9"
                        aria-label="Logout"
                        title="Logout"
                    >
                        <LogOut size={14} />
                    </button>
                </div>
            </div>
        </header>
    );
}

```


## FILE: resources\js\components\layout\BottomNav.tsx
```
MISSING
```


## FILE: resources\js\components\layout\PageHeader.tsx
```
MISSING
```


## FILE: resources\js\components\layout\PageToolbar.tsx
```
MISSING
```


## FILE: resources\js\config\navigation.ts
```
export {
    appRoutes,
    isActivePath,
    isValidHref,
    type AppRoute,
    type AppRouteGroup,
    type AppRouteKey,
} from '@/lib/appRoutes';

```


## FILE: resources\js\config\theme.ts
```
MISSING
```


## FILE: resources\js\config\statuses.ts
```
import type { DossierRow } from '@/features/dossiers/types';

export type SelectOption = {
    id: string;
    label: string;
};

export type DossierReadinessItem = {
    key: string;
    label: string;
    done: boolean;
};

export const dossierStatusOptions: SelectOption[] = [
    { id: 'opened', label: 'Opened' },
    { id: 'active', label: 'Active' },
    { id: 'paused', label: 'Paused' },
    { id: 'closed', label: 'Closed' },
    { id: 'archived', label: 'Archived' },
];

export const dossierWorkflowOptions: SelectOption[] = [
    { id: 'client', label: 'Client' },
    { id: 'documents', label: 'Documents' },
    { id: 'contract', label: 'Contract' },
    { id: 'authorization', label: 'Authorization' },
    { id: 'finance', label: 'Finance' },
    { id: 'archive', label: 'Archive' },
];

const dossierStatusClasses: Record<string, string> = {
    active: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300',
    opened: 'border-sky-400/25 bg-sky-400/10 text-sky-300',
    closed: 'border-zinc-500/30 bg-zinc-500/10 text-zinc-300',
    archived: 'border-violet-400/25 bg-violet-400/10 text-violet-300',
    paused: 'border-amber-400/25 bg-amber-400/10 text-amber-300',
};

export function getDossierWorkflowLabel(value: string) {
    return dossierWorkflowOptions.find((option) => option.id === value)?.label ?? value;
}

export function getDossierStatusClass(status: string) {
    return dossierStatusClasses[status] ?? dossierStatusClasses.paused;
}

export function getDossierReadiness(dossier: DossierRow): DossierReadinessItem[] {
    return [
        { key: 'client', label: 'Client', done: true },
        { key: 'documents', label: 'Docs', done: dossier.documentsCount > 0 },
        { key: 'contract', label: 'Contract', done: dossier.hasContract },
        { key: 'authorization', label: 'Auth', done: dossier.hasAuthorization },
        { key: 'finance', label: 'Finance', done: dossier.financeRecordsCount > 0 },
        { key: 'archive', label: 'Archive', done: dossier.hasArchiveRecord },
    ];
}

```


## FILE: resources\js\lib\cn.ts
```
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

```


# SHARED UI COMPONENTS



## FILE: resources\js\components\ui\AppBadge.tsx
```
import { PropsWithChildren } from 'react';
import { cn } from '@/lib/cn';

type AppBadgeProps = PropsWithChildren<{
    className?: string;
    tone?: 'neutral' | 'blue' | 'green' | 'amber' | 'red' | 'violet';
}>;

const tones: Record<NonNullable<AppBadgeProps['tone']>, string> = {
    neutral: 'border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-muted)]',
    blue: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300',
    green: 'border-green-200 bg-green-50 text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300',
    amber: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
    red: 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300',
    violet: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300',
};

export function AppBadge({ children, className, tone = 'neutral' }: AppBadgeProps) {
    return (
        <span
            className={cn(
                'app-compact-badge inline-flex max-w-full items-center gap-1 rounded-full border font-medium',
                tones[tone],
                className,
            )}
        >
            {children}
        </span>
    );
}

```


## FILE: resources\js\components\ui\AppButton.tsx
```
import { Button, type ButtonProps } from 'react-aria-components';
import { cn } from '@/lib/cn';

type AppButtonProps = ButtonProps & {
    variant?: 'default' | 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md';
};

export function AppButton({
    className,
    variant = 'default',
    size = 'md',
    ...props
}: AppButtonProps) {
    return (
        <Button
            {...props}
            className={cn(
                'react-aria-Button',
                size === 'sm' && 'h-8 px-3 text-xs',
                variant === 'primary' &&
                    'border-transparent bg-[var(--accent)] text-[var(--accent-foreground)] data-[hovered]:bg-[var(--accent-hover)] data-[pressed]:bg-[var(--accent-pressed)]',
                variant === 'secondary' &&
                    'border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] data-[hovered]:bg-[var(--surface-2)]',
                variant === 'danger' &&
                    'border-transparent bg-[var(--danger)] text-white data-[hovered]:bg-[var(--danger-hover)]',
                variant === 'ghost' &&
                    'border-transparent bg-transparent data-[hovered]:bg-[var(--surface-2)]',
                className,
            )}
        />
    );
}

```


## FILE: resources\js\components\ui\AppCard.tsx
```
import { PropsWithChildren } from 'react';
import { cn } from '@/lib/cn';

type AppCardProps = PropsWithChildren<{
    className?: string;
}>;

export function AppCard({ children, className }: AppCardProps) {
    return (
        <section className={cn('app-surface', className)}>
            {children}
        </section>
    );
}

```


## FILE: resources\js\components\ui\AppCompactTabs.tsx
```
import {
    Tab,
    TabList,
    TabPanel,
    Tabs,
    type TabsProps,
} from 'react-aria-components';
import { cn } from '@/lib/cn';

type AppCompactTabsProps = Omit<TabsProps<object>, 'children'> & {
    tabs: { id: string; label: string }[];
    children: React.ReactNode;
};

export function AppCompactTabs({ tabs, children, className, ...props }: AppCompactTabsProps) {
    return (
        <Tabs {...props} className={cn('app-page', className)}>
            <TabList className="mb-3 flex flex-wrap items-center gap-1 border-b">
                {tabs.map((tab) => (
                    <Tab
                        key={tab.id}
                        id={tab.id}
                        className={cn(
                            'flex items-center justify-center rounded-t-lg border-b-2 border-transparent px-4 py-2 text-sm font-medium text-[var(--text-muted)] outline-none transition',
                            'data-[selected]:border-[var(--accent)] data-[selected]:text-[var(--accent)]',
                            'data-[hovered]:text-[var(--text)]',
                            'data-[focus-visible]:ring-2 data-[focus-visible]:ring-[var(--accent)] data-[focus-visible]:ring-offset-1'
                        )}
                    >
                        {tab.label}
                    </Tab>
                ))}
            </TabList>
            {children}
        </Tabs>
    );
}

```


## FILE: resources\js\components\ui\AppConfirmDialog.tsx
```
import { ReactNode } from 'react';
import { Dialog, Heading, Modal, ModalOverlay } from 'react-aria-components';
import { AlertTriangle } from 'lucide-react';
import { AppButton } from '@/components/ui/AppButton';

type AppConfirmDialogProps = {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    title: string;
    description: string;
    confirmLabel: string;
    cancelLabel: string;
    onConfirm: () => void;
    icon?: ReactNode;
};

export function AppConfirmDialog({
    isOpen,
    onOpenChange,
    title,
    description,
    confirmLabel,
    cancelLabel,
    onConfirm,
    icon,
}: AppConfirmDialogProps) {
    return (
        <ModalOverlay
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            className="app-modal-overlay app-dialog-overlay"
            isDismissable
        >
            <Modal className="app-dialog-panel">
                <Dialog className="outline-none">
                    {({ close }) => (
                        <div className="p-5">
                            <div className="flex gap-4">
                                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300">
                                    {icon ?? <AlertTriangle size={20} />}
                                </div>

                                <div className="min-w-0">
                                    <Heading slot="title" className="text-base font-semibold">
                                        {title}
                                    </Heading>

                                    <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">
                                        {description}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-2">
                                <AppButton
                                    variant="secondary"
                                    onPress={close}
                                >
                                    {cancelLabel}
                                </AppButton>

                                <AppButton
                                    variant="danger"
                                    onPress={() => {
                                        onConfirm();
                                        close();
                                    }}
                                >
                                    {confirmLabel}
                                </AppButton>
                            </div>
                        </div>
                    )}
                </Dialog>
            </Modal>
        </ModalOverlay>
    );
}

```


## FILE: resources\js\components\ui\AppDataTable.tsx
```
import { type ReactNode, useState } from 'react';
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnDef,
    type SortingState,
} from '@tanstack/react-table';
import { Button, Input, SearchField } from 'react-aria-components';
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronsUpDown,
    ChevronUp,
    RefreshCw,
    Search,
    SlidersHorizontal,
    X,
} from 'lucide-react';
import { AppEmptyState } from '@/components/ui/AppEmptyState';

type AppDataTableProps<TData extends object> = {
    data: TData[];
    columns: ColumnDef<TData, unknown>[];
    searchPlaceholder: string;
    emptyTitle: string;
    emptyDescription: string;
    pageSize?: number;
    toolbarActions?: ReactNode;
    filterControls?: ReactNode;
    onRefresh?: () => void;
    onRowClick?: (row: TData) => void;
};

export function AppDataTable<TData extends object>({
    data,
    columns,
    searchPlaceholder,
    emptyTitle,
    emptyDescription,
    pageSize = 10,
    toolbarActions,
    filterControls,
    onRefresh,
    onRowClick,
}: AppDataTableProps<TData>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            globalFilter,
        },
        initialState: {
            pagination: {
                pageSize,
            },
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    const filteredCount = table.getFilteredRowModel().rows.length;
    const pageIndex = table.getState().pagination.pageIndex;
    const pageCount = table.getPageCount();

    return (
        <div className="crm-reference-table-shell min-w-0">
            <div className="crm-reference-toolbar">
                <SearchField
                    aria-label="Search"
                    value={globalFilter}
                    onChange={setGlobalFilter}
                    className="crm-reference-search"
                >
                    <Search
                        size={14}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--crm-text-soft)]"
                    />
                    <Input
                        placeholder={searchPlaceholder}
                    />
                    {globalFilter ? (
                        <Button
                            className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-[var(--crm-text-soft)] hover:bg-[var(--crm-surface-2)]"
                            onPress={() => setGlobalFilter('')}
                        >
                            <X size={14} />
                        </Button>
                    ) : null}
                </SearchField>

                <div className="crm-reference-toolbar-actions">
                    {onRefresh ? (
                        <Button className="crm-reference-button" onPress={onRefresh}>
                            <RefreshCw size={13} />
                            Update
                        </Button>
                    ) : null}
                    {filterControls ? (
                        <Button className="crm-reference-button" onPress={() => setShowFilters((v) => !v)}>
                            <SlidersHorizontal size={13} />
                            Filter
                        </Button>
                    ) : null}
                    {toolbarActions}
                </div>

                <div className="hidden text-xs font-semibold text-[var(--crm-text-muted)] md:block">
                    {filteredCount} record(s)
                </div>
            </div>

            {filterControls && showFilters ? (
                <div className="border-b border-[var(--crm-border)] px-4 py-3">
                    {filterControls}
                </div>
            ) : null}

            <div className="crm-reference-table-card">
                <div className="crm-reference-table-scroll">
                <table className="crm-reference-table">
                    <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    const sorted = header.column.getIsSorted();

                                    return (
                                        <th key={header.id}>
                                            {header.isPlaceholder ? null : (
                                                <button
                                                    type="button"
                                                    className="crm-reference-header-cell"
                                                    onClick={header.column.getToggleSortingHandler()}
                                                >
                                                    {flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext(),
                                                    )}

                                                    {header.column.getCanSort() ? (
                                                        sorted === 'asc' ? (
                                                            <ChevronUp className="crm-reference-header-sort" size={11} />
                                                        ) : sorted === 'desc' ? (
                                                            <ChevronDown className="crm-reference-header-sort" size={11} />
                                                        ) : (
                                                            <ChevronsUpDown className="crm-reference-header-sort" size={11} />
                                                        )
                                                    ) : null}
                                                </button>
                                            )}
                                        </th>
                                    );
                                })}
                            </tr>
                        ))}
                    </thead>

                    <tbody>
                        {table.getRowModel().rows.length > 0 ? (
                            table.getRowModel().rows.map((row) => (
                                <tr
                                    key={row.id}
                                    className={onRowClick ? 'cursor-pointer' : ''}
                                    onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td className="p-8" colSpan={columns.length}>
                                    <AppEmptyState
                                        title={emptyTitle}
                                        description={emptyDescription}
                                    />
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                </div>

            <div className="crm-reference-footer">
                <p>
                    Page {pageIndex + 1} of {Math.max(pageCount, 1)}
                </p>

                <div className="flex items-center gap-2">
                    <Button
                        className="crm-reference-button h-8 px-3"
                        isDisabled={!table.getCanPreviousPage()}
                        onPress={() => table.previousPage()}
                    >
                        <ChevronLeft size={14} />
                        Previous
                    </Button>

                    <Button
                        className="crm-reference-button h-8 px-3"
                        isDisabled={!table.getCanNextPage()}
                        onPress={() => table.nextPage()}
                    >
                        Next
                        <ChevronRight size={14} />
                    </Button>
                </div>
            </div>
            </div>
        </div>
    );
}

```


## FILE: resources\js\components\ui\AppDatePicker.tsx
```
import {
    Input,
    Label,
    Text,
    TextField,
    type TextFieldProps,
} from 'react-aria-components';
import { cn } from '@/lib/cn';

type AppDatePickerProps = Omit<TextFieldProps, 'children'> & {
    label: string;
    description?: string;
    error?: string;
    placeholder?: string;
};

export function AppDatePicker({
    label,
    description,
    error,
    placeholder,
    className,
    ...props
}: AppDatePickerProps) {
    return (
        <TextField
            {...props}
            className={cn('group grid gap-1.5', className ?? '')}
            isInvalid={Boolean(error) || props.isInvalid}
        >
            <Label className="text-sm font-medium text-[var(--text)]">
                {label}
            </Label>

            <Input
                type="date"
                placeholder={placeholder}
                className={cn(
                    'h-10 w-full rounded-2xl border bg-[var(--surface)] px-3 text-sm outline-none transition',
                    'placeholder:text-[var(--text-muted)]',
                    'focus:border-[var(--accent)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--accent)_14%,transparent)]',
                    'group-data-[invalid]:border-[var(--danger)] group-data-[invalid]:ring-4 group-data-[invalid]:ring-[color-mix(in_srgb,var(--danger)_12%,transparent)]'
                )}
            />

            {description && !error ? (
                <Text slot="description" className="text-xs text-[var(--text-muted)]">
                    {description}
                </Text>
            ) : null}

            {error ? (
                <Text slot="errorMessage" className="text-xs font-medium text-[var(--danger)]">
                    {error}
                </Text>
            ) : null}
        </TextField>
    );
}

```


## FILE: resources\js\components\ui\AppDrawer.tsx
```
import { ReactNode } from 'react';
import { Button, Dialog, Heading, Modal, ModalOverlay } from 'react-aria-components';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

type AppDrawerProps = {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    title: string;
    description?: string;
    children: ReactNode;
    footer?: ReactNode;
    panelClassName?: string;
};

export function AppDrawer({
    isOpen,
    onOpenChange,
    title,
    description,
    children,
    footer,
    panelClassName,
}: AppDrawerProps) {
    return (
        <ModalOverlay
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            className="app-modal-overlay app-drawer-overlay"
            isDismissable
        >
            <Modal className={cn('app-drawer-panel', panelClassName)}>
                <Dialog className="flex h-full flex-col outline-none">
                    {({ close }) => (
                        <>
                            <header className="flex items-start justify-between gap-4 border-b px-5 py-4">
                                <div className="min-w-0">
                                    <Heading slot="title" className="text-base font-semibold">
                                        {title}
                                    </Heading>

                                    {description ? (
                                        <p className="mt-1 text-sm text-[var(--text-muted)]">
                                            {description}
                                        </p>
                                    ) : null}
                                </div>

                                <Button
                                    aria-label="Close"
                                    onPress={close}
                                    className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-700 outline-none transition hover:bg-red-100 data-[focus-visible]:ring-2 data-[focus-visible]:ring-red-400 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
                                >
                                    <X size={17} />
                                </Button>
                            </header>

                            <div className="app-scrollbar flex-1 overflow-y-auto px-5 py-5">
                                {children}
                            </div>

                            {footer ? (
                                <footer className="flex items-center justify-end gap-2 border-t px-5 py-4">
                                    {footer}
                                </footer>
                            ) : null}
                        </>
                    )}
                </Dialog>
            </Modal>
        </ModalOverlay>
    );
}

```


## FILE: resources\js\components\ui\AppDropdownMenu.tsx
```
import { Key, ReactNode } from 'react';
import {
    Button,
    Menu,
    MenuItem,
    MenuTrigger,
    Popover,
} from 'react-aria-components';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/cn';

export type AppDropdownMenuItem = {
    id: string;
    label: string;
    icon?: ReactNode;
    isDanger?: boolean;
    isDisabled?: boolean;
    onAction: () => void;
};

type AppDropdownMenuProps = {
    ariaLabel: string;
    items: AppDropdownMenuItem[];
};

export function AppDropdownMenu({ ariaLabel, items }: AppDropdownMenuProps) {
    function handleAction(key: Key) {
        const item = items.find((candidate) => candidate.id === String(key));

        if (!item || item.isDisabled) {
            return;
        }

        item.onAction();
    }

    return (
        <MenuTrigger>
            <Button aria-label={ariaLabel} className="react-aria-Button size-8 px-0">
                <MoreHorizontal size={16} />
            </Button>

            <Popover className="react-aria-Popover min-w-48">
                <Menu
                    aria-label={ariaLabel}
                    className="react-aria-Menu"
                    onAction={handleAction}
                >
                    {items.map((item) => (
                        <MenuItem
                            key={item.id}
                            id={item.id}
                            isDisabled={item.isDisabled}
                            className={cn(
                                'react-aria-MenuItem',
                                item.isDanger && 'text-[var(--danger)]',
                            )}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </MenuItem>
                    ))}
                </Menu>
            </Popover>
        </MenuTrigger>
    );
}

```


## FILE: resources\js\components\ui\AppEmptyState.tsx
```
import { ReactNode } from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '@/lib/cn';

type AppEmptyStateProps = {
    title: string;
    description?: string;
    icon?: ReactNode;
    action?: ReactNode;
    className?: string;
};

export function AppEmptyState({
    title,
    description,
    icon,
    action,
    className,
}: AppEmptyStateProps) {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center rounded-2xl border border-dashed bg-[var(--surface)] px-6 py-12 text-center',
                className,
            )}
        >
            <div className="flex size-11 items-center justify-center rounded-2xl bg-[var(--surface-2)] text-[var(--text-muted)]">
                {icon ?? <Inbox size={20} />}
            </div>

            <h3 className="mt-4 text-sm font-semibold">{title}</h3>

            {description ? (
                <p className="mt-1 max-w-md text-sm text-[var(--text-muted)]">
                    {description}
                </p>
            ) : null}

            {action ? <div className="mt-5">{action}</div> : null}
        </div>
    );
}

```


## FILE: resources\js\components\ui\AppFilterBar.tsx
```
import { X } from 'lucide-react';

export type AppFilterOption = {
    id: string;
    label: string;
    count?: number;
};

type AppFilterBarProps = {
    label?: string;
    value: string;
    options: AppFilterOption[];
    onChange: (value: string) => void;
};

export function AppFilterBar({
    label = 'Filter',
    value,
    options,
    onChange,
}: AppFilterBarProps) {
    return (
        <div className="rounded-3xl border bg-[var(--surface)] p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">{label}</p>

                {value !== 'all' ? (
                    <button
                        type="button"
                        onClick={() => onChange('all')}
                        className="inline-flex h-8 items-center gap-1 rounded-xl px-2 text-xs font-medium text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                    >
                        <X size={13} />
                        Clear
                    </button>
                ) : null}
            </div>

            <div className="flex flex-wrap gap-2">
                {options.map((option) => {
                    const isActive = option.id === value;

                    return (
                        <button
                            key={option.id}
                            type="button"
                            onClick={() => onChange(option.id)}
                            className={[
                                'inline-flex h-9 items-center gap-2 rounded-2xl border px-3 text-sm font-medium transition',
                                isActive
                                    ? 'border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent)]'
                                    : 'bg-[var(--surface)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--text)]',
                            ].join(' ')}
                        >
                            <span>{option.label}</span>

                            {typeof option.count === 'number' ? (
                                <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-xs">
                                    {option.count}
                                </span>
                            ) : null}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
```


## FILE: resources\js\components\ui\AppFormErrorSummary.tsx
```
import { TriangleAlert } from 'lucide-react';
import type { FormErrors } from '@/lib/formErrors';
import { hasErrors } from '@/lib/formErrors';

type AppFormErrorSummaryProps = {
    errors?: FormErrors;
};

export function AppFormErrorSummary({ errors }: AppFormErrorSummaryProps) {
    if (!hasErrors(errors)) {
        return null;
    }

    const entries = Object.entries(errors ?? {});

    return (
        <div className="rounded-2xl border border-[color-mix(in_srgb,var(--danger)_35%,transparent)] bg-[color-mix(in_srgb,var(--danger)_8%,transparent)] p-4">
            <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] text-[var(--danger)]">
                    <TriangleAlert size={16} />
                </div>

                <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--danger)]">
                        Please check the form
                    </p>

                    <ul className="mt-2 space-y-1 text-sm text-[var(--text-muted)]">
                        {entries.slice(0, 8).map(([field, message]) => (
                            <li key={field}>
                                <span className="font-medium">
                                    {field.replaceAll('_', ' ')}:
                                </span>{' '}
                                {message}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
```


## FILE: resources\js\components\ui\AppIconButton.tsx
```
import { Button, type ButtonProps } from 'react-aria-components';
import { cn } from '@/lib/cn';

type AppIconButtonProps = ButtonProps & {
    label: string;
};

export function AppIconButton({ label, className, children, ...props }: AppIconButtonProps) {
    return (
        <Button
            {...props}
            aria-label={label}
            className={cn('react-aria-Button size-8 px-0', className)}
        >
            {children}
        </Button>
    );
}

```


## FILE: resources\js\components\ui\AppMetricCard.tsx
```
import { type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type AppMetricCardProps = {
    icon?: ReactNode;
    label: string;
    value: number | string;
    detail?: string;
    trend?: string;
    trendUp?: boolean;
    className?: string;
};

export function AppMetricCard({ icon, label, value, detail, trend, trendUp, className }: AppMetricCardProps) {
    return (
        <div className={cn('app-surface p-4', className)}>
            <div className="flex items-start justify-between gap-3">
                {icon ? (
                    <div className="flex size-10 items-center justify-center rounded-2xl bg-[var(--surface-2)] text-[var(--text-muted)]">
                        {icon}
                    </div>
                ) : null}

                <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-[var(--text-muted)]">
                        {label}
                    </p>
                    <p className="mt-1 text-xl font-semibold text-[var(--text)]">
                        {value}
                    </p>
                </div>
            </div>

            {detail ? (
                <p className="mt-2 truncate text-xs text-[var(--text-muted)]">
                    {detail}
                </p>
            ) : null}

            {trend ? (
                <p className={cn('mt-2 text-xs font-medium', trendUp ? 'text-[var(--success)]' : 'text-[var(--danger)]')}>
                    {trend}
                </p>
            ) : null}
        </div>
    );
}

```


## FILE: resources\js\components\ui\AppMetricGrid.tsx
```
import { type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type AppMetricGridProps = {
    children: ReactNode;
    className?: string;
    columns?: 2 | 3 | 4 | 6;
};

export function AppMetricGrid({ children, className, columns = 4 }: AppMetricGridProps) {
    const gridClasses: Record<number, string> = {
        2: 'grid-cols-1 sm:grid-cols-2',
        3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
        6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
    };

    return (
        <div className={cn('grid gap-3', gridClasses[columns], className)}>
            {children}
        </div>
    );
}

```


## FILE: resources\js\components\ui\AppModal.tsx
```
import { Modal, ModalBody, ModalHeader, ModalHeading, ModalCloseTrigger } from '@heroui/react';
import { cn } from '@/lib/cn';

type AppModalProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg';
};

const sizeMap: Record<string, string> = {
    sm: 'sm',
    md: 'md',
    lg: 'lg',
};

export function AppModal({ isOpen, onOpenChange, title, children, size = 'md' }: AppModalProps) {
    return (
        <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange} isDismissable>
            <Modal.Container size={sizeMap[size] as any}>
                <Modal.Dialog>
                    <Modal.Header>
                        <Modal.Heading>{title}</Modal.Heading>
                        <ModalCloseTrigger />
                    </Modal.Header>
                    <Modal.Body>
                        {children}
                    </Modal.Body>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
}

```


## FILE: resources\js\components\ui\AppMoneyInput.tsx
```
import {
    Input,
    Label,
    Text,
    TextField,
    type TextFieldProps,
} from 'react-aria-components';
import { cn } from '@/lib/cn';

type AppMoneyInputProps = Omit<TextFieldProps, 'children'> & {
    label: string;
    description?: string;
    error?: string;
    currency?: string;
    placeholder?: string;
};

export function AppMoneyInput({
    label,
    description,
    error,
    currency = 'MAD',
    placeholder,
    className,
    ...props
}: AppMoneyInputProps) {
    return (
        <TextField
            {...props}
            className={cn('group grid gap-1.5', className ?? '')}
            isInvalid={Boolean(error) || props.isInvalid}
        >
            <Label className="text-sm font-medium text-[var(--text)]">
                {label}
            </Label>

            <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--text-muted)]">
                    {currency}
                </span>

                <Input
                    type="number"
                    step="0.01"
                    placeholder={placeholder}
                    className={cn(
                        'h-10 w-full rounded-2xl border bg-[var(--surface)] px-3 pl-14 text-sm outline-none transition',
                        'placeholder:text-[var(--text-muted)]',
                        'focus:border-[var(--accent)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--accent)_14%,transparent)]',
                        'group-data-[invalid]:border-[var(--danger)] group-data-[invalid]:ring-4 group-data-[invalid]:ring-[color-mix(in_srgb,var(--danger)_12%,transparent)]'
                    )}
                />
            </div>

            {description && !error ? (
                <Text slot="description" className="text-xs text-[var(--text-muted)]">
                    {description}
                </Text>
            ) : null}

            {error ? (
                <Text slot="errorMessage" className="text-xs font-medium text-[var(--danger)]">
                    {error}
                </Text>
            ) : null}
        </TextField>
    );
}

```


## FILE: resources\js\components\ui\AppPage.tsx
```
import { type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type AppPageProps = {
    children: ReactNode;
    className?: string;
};

export function AppPage({ children, className }: AppPageProps) {
    return (
        <div className={cn('flex w-full flex-col gap-4 px-3 py-3 sm:px-4 lg:px-5', className)}>
            {children}
        </div>
    );
}

```


## FILE: resources\js\components\ui\AppPageHeader.tsx
```
import { type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type AppPageHeaderProps = {
    eyebrow?: string;
    title: string;
    subtitle?: string;
    actions?: ReactNode;
    compact?: boolean;
    className?: string;
};

export function AppPageHeader({
    eyebrow,
    title,
    subtitle,
    actions,
    compact = false,
    className,
}: AppPageHeaderProps) {
    return (
        <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between', className)}>
            <div className="min-w-0 flex-1">
                {eyebrow ? (
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--crm-gold)]">
                        {eyebrow}
                    </p>
                ) : null}

                <h1 className={cn('truncate font-bold tracking-[-0.02em] text-[var(--crm-text)]', compact ? 'text-lg' : 'text-xl sm:text-2xl')}>
                    {title}
                </h1>

                {subtitle ? (
                    <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--crm-text-muted)]">
                        {subtitle}
                    </p>
                ) : null}
            </div>

            {actions ? (
                <div className="flex shrink-0 flex-wrap items-center justify-start gap-2 sm:justify-end">
                    {actions}
                </div>
            ) : null}
        </div>
    );
}

```


## FILE: resources\js\components\ui\AppPagination.tsx
```
import { ChevronLeft, ChevronRight } from 'lucide-react';

type AppPaginationProps = {
    page: number;
    pageSize: number;
    total: number;
    onChange: (page: number) => void;
    variant?: 'default' | 'reference';
};

export function AppPagination({ page, pageSize, total, onChange, variant = 'default' }: AppPaginationProps) {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    if (total <= pageSize) {
        return null;
    }

    const start = (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, total);

    if (variant === 'reference') {
        return (
            <div className="crm-reference-footer">
                <p>
                    Showing {start}-{end} of {total}
                </p>
                <div className="flex items-center justify-end gap-2">
                    <button
                        type="button"
                        className="crm-reference-button h-8 px-3"
                        disabled={page <= 1}
                        onClick={() => onChange(page - 1)}
                    >
                        <ChevronLeft size={13} />
                        Previous
                    </button>
                    <span className="rounded-md border border-[var(--crm-border)] bg-[var(--crm-surface-2)] px-2.5 py-1 text-[11px] font-semibold text-[var(--crm-text)]">
                        {page} / {totalPages}
                    </span>
                    <button
                        type="button"
                        className="crm-reference-button h-8 px-3"
                        disabled={page >= totalPages}
                        onClick={() => onChange(page + 1)}
                    >
                        Next
                        <ChevronRight size={13} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3 border-t border-[var(--crm-border)] p-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-[var(--crm-text-muted)]">
                Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    className="crm-action-button h-8 px-3 text-xs"
                    disabled={page <= 1}
                    onClick={() => onChange(page - 1)}
                >
                    <ChevronLeft size={14} />
                    Previous
                </button>
                <button
                    type="button"
                    className="crm-action-button h-8 px-3 text-xs"
                    disabled={page >= totalPages}
                    onClick={() => onChange(page + 1)}
                >
                    Next
                    <ChevronRight size={14} />
                </button>
            </div>
        </div>
    );
}

```


## FILE: resources\js\components\ui\AppSection.tsx
```
import { type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type AppSectionProps = {
    title?: string;
    description?: string;
    actions?: ReactNode;
    children: ReactNode;
    className?: string;
};

export function AppSection({
    title, description, actions, children, className }: AppSectionProps) {
        return (
            <section className={cn('app-surface p-4', className)}>
                {(title || actions) ? (
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    {title ? (
                        <div className="min-w-0 flex-1">
                            <h2 className="text-sm font-semibold text-[var(--text)]">
                                {title}
                            </h2>
                            {description ? (
                                <p className="mt-1 text-xs text-[var(--text-muted)]">
                                    {description}
                                </p>
                            ) : null}
                        </div>
                    ) : null}

                    {actions ? (
                        <div className="flex shrink-0 items-center gap-2">
                            {actions}
                        </div>
                    ) : null}
                </div>
            ) : null}

            {children}
        </section>
    );
}

```


## FILE: resources\js\components\ui\AppSelect.tsx
```
import type { Key } from 'react';
import { useMemo } from 'react';
import { ChevronDown } from 'lucide-react';

export type AppSelectOption = {
    id: Key;
    label: string;
    description?: string | null;
    isDisabled?: boolean;
};

type AppSelectProps = {
    label?: string;
    description?: string;
    error?: string;
    placeholder?: string;
    options: AppSelectOption[];
    selectedKey?: Key | null;
    defaultSelectedKey?: Key;
    onSelectionChange?: (key: Key | null) => void;
    isDisabled?: boolean;
    isRequired?: boolean;
    className?: string;
    buttonClassName?: string;
};

export function AppSelect({
    label,
    description,
    error,
    placeholder = 'Select...',
    options,
    selectedKey,
    defaultSelectedKey,
    onSelectionChange,
    isDisabled = false,
    isRequired = false,
    className = '',
    buttonClassName = '',
}: AppSelectProps) {
    const keyMap = useMemo(() => {
        return new Map(options.map((option) => [String(option.id), option.id]));
    }, [options]);

    const selectProps =
        selectedKey !== undefined
            ? {
                  value: selectedKey === null ? '' : String(selectedKey),
              }
            : {
                  defaultValue: defaultSelectedKey !== undefined ? String(defaultSelectedKey) : '',
              };

    function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
        const value = event.target.value;

        if (!value) {
            onSelectionChange?.(null);
            return;
        }

        onSelectionChange?.(keyMap.get(value) ?? value);
    }

    return (
        <div
            className={[
                'flex min-w-0 flex-col gap-1.5',
                isDisabled ? 'opacity-60' : '',
                className,
            ].join(' ')}
        >
            {label ? (
                <label className="text-xs font-semibold text-[var(--text)]">
                    {label}
                    {isRequired ? <span className="ml-1 text-red-500">*</span> : null}
                </label>
            ) : null}

            <div className="relative min-w-0">
                <select
                    {...selectProps}
                    disabled={isDisabled}
                    required={isRequired}
                    onChange={handleChange}
                    className={[
                        'h-10 w-full min-w-0 appearance-none rounded-2xl border bg-[var(--surface)] px-3 pr-10 text-sm text-[var(--text)] outline-none transition',
                        'border-[var(--border)] hover:border-[var(--accent)]',
                        'focus:border-[var(--accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent)_20%,transparent)]',
                        'disabled:cursor-not-allowed disabled:opacity-60',
                        error ? 'border-red-500/70' : '',
                        buttonClassName,
                    ].join(' ')}
                >
                    <option value="" disabled>
                        {placeholder}
                    </option>

                    {options.map((option) => (
                        <option
                            key={String(option.id)}
                            value={String(option.id)}
                            disabled={option.isDisabled}
                        >
                            {option.label}
                        </option>
                    ))}
                </select>

                <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                />
            </div>

            {description ? (
                <p className="text-xs text-[var(--text-muted)]">{description}</p>
            ) : null}

            {error ? <p className="text-xs font-medium text-red-500">{error}</p> : null}
        </div>
    );
}

export default AppSelect;
```


## FILE: resources\js\components\ui\AppStatusBadge.tsx
```
import { Circle, CheckCircle2, Clock3, AlertTriangle, Archive } from 'lucide-react';
import { AppBadge } from '@/components/ui/AppBadge';

type StatusTone = 'neutral' | 'blue' | 'green' | 'amber' | 'red' | 'violet';

type AppStatusBadgeProps = {
    label: string;
    tone?: StatusTone;
    icon?: 'dot' | 'check' | 'clock' | 'warning' | 'archive';
};

const icons = {
    dot: Circle,
    check: CheckCircle2,
    clock: Clock3,
    warning: AlertTriangle,
    archive: Archive,
};

export function AppStatusBadge({
    label,
    tone = 'neutral',
    icon = 'dot',
}: AppStatusBadgeProps) {
    const Icon = icons[icon];

    return (
        <AppBadge tone={tone} className="max-w-[150px]">
            <Icon
                size={10}
                className={icon === 'dot' ? 'shrink-0 fill-current' : 'shrink-0'}
            />
            <span className="truncate">{label}</span>
        </AppBadge>
    );
}

```


## FILE: resources\js\components\ui\AppTableActionButton.tsx
```
import { ReactNode } from 'react';
import { Button } from 'react-aria-components';
import { cn } from '@/lib/cn';
import { AppTooltip } from '@/components/ui/AppTooltip';

type AppTableActionTone = 'view' | 'edit' | 'documents' | 'create' | 'archive' | 'delete';

type AppTableActionButtonProps = {
    label: string;
    tone: AppTableActionTone;
    children: ReactNode;
    onPress: () => void;
    isDisabled?: boolean;
};

const toneClasses: Record<AppTableActionTone, string> = {
    view: 'border-blue-200 bg-blue-50 text-blue-700 data-[hovered]:bg-blue-100 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300 dark:data-[hovered]:bg-blue-500/20',
    edit: 'border-amber-200 bg-amber-50 text-amber-700 data-[hovered]:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300 dark:data-[hovered]:bg-amber-500/20',
    documents: 'border-violet-200 bg-violet-50 text-violet-700 data-[hovered]:bg-violet-100 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300 dark:data-[hovered]:bg-violet-500/20',
    create: 'border-green-200 bg-green-50 text-green-700 data-[hovered]:bg-green-100 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300 dark:data-[hovered]:bg-green-500/20',
    archive: 'border-slate-200 bg-slate-50 text-slate-700 data-[hovered]:bg-slate-100 dark:border-slate-500/30 dark:bg-slate-500/10 dark:text-slate-300 dark:data-[hovered]:bg-slate-500/20',
    delete: 'border-red-200 bg-red-50 text-red-700 data-[hovered]:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300 dark:data-[hovered]:bg-red-500/20',
};

export function AppTableActionButton({
    label,
    tone,
    children,
    onPress,
    isDisabled,
}: AppTableActionButtonProps) {
    return (
        <AppTooltip label={label}>
            <Button
                aria-label={label}
                isDisabled={isDisabled}
                onPress={onPress}
                className={cn(
                    'inline-flex size-8 shrink-0 items-center justify-center rounded-lg border outline-none transition',
                    'data-[focus-visible]:ring-2 data-[focus-visible]:ring-[var(--focus-ring)] data-[focus-visible]:ring-offset-2 data-[focus-visible]:ring-offset-[var(--surface)]',
                    'data-[pressed]:scale-95 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
                    toneClasses[tone],
                )}
            >
                {children}
            </Button>
        </AppTooltip>
    );
}

```


## FILE: resources\js\components\ui\AppTableActions.tsx
```
import { PropsWithChildren } from 'react';
import { cn } from '@/lib/cn';

type AppTableActionsProps = PropsWithChildren<{
    className?: string;
}>;

export function AppTableActions({ children, className }: AppTableActionsProps) {
    return (
        <div className={cn('flex items-center justify-end gap-1.5', className)}>
            {children}
        </div>
    );
}

```


## FILE: resources\js\components\ui\AppTextarea.tsx
```
import {
    Label,
    Text,
    TextArea,
    TextField,
    type TextFieldProps,
} from 'react-aria-components';

type AppTextareaProps = Omit<TextFieldProps, 'children'> & {
    label: string;
    description?: string;
    error?: string;
    placeholder?: string;
    rows?: number;
};

export function AppTextarea({
    label,
    description,
    error,
    placeholder,
    rows = 4,
    className,
    ...props
}: AppTextareaProps) {
    return (
        <TextField
            {...props}
            className={[
                'group grid gap-1.5',
                className ?? '',
            ].join(' ')}
            isInvalid={Boolean(error) || props.isInvalid}
        >
            <Label className="text-sm font-medium text-[var(--text)]">
                {label}
            </Label>

            <TextArea
                rows={rows}
                placeholder={placeholder}
                className={[
                    'min-h-28 w-full resize-y rounded-2xl border bg-[var(--surface)] px-3 py-2 text-sm outline-none transition',
                    'placeholder:text-[var(--text-muted)]',
                    'focus:border-[var(--accent)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--accent)_14%,transparent)]',
                    'group-data-[invalid]:border-[var(--danger)] group-data-[invalid]:ring-4 group-data-[invalid]:ring-[color-mix(in_srgb,var(--danger)_12%,transparent)]',
                ].join(' ')}
            />

            {description && !error ? (
                <Text slot="description" className="text-xs text-[var(--text-muted)]">
                    {description}
                </Text>
            ) : null}

            {error ? (
                <Text slot="errorMessage" className="text-xs font-medium text-[var(--danger)]">
                    {error}
                </Text>
            ) : null}
        </TextField>
    );
}
```


## FILE: resources\js\components\ui\AppTextField.tsx
```
import type { ReactNode } from 'react';
import {
    Input,
    Label,
    Text,
    TextField,
    type TextFieldProps,
} from 'react-aria-components';

type AppTextFieldProps = Omit<TextFieldProps, 'children'> & {
    label: string;
    description?: string;
    error?: string;
    icon?: ReactNode;
    placeholder?: string;
};

export function AppTextField({
    label,
    description,
    error,
    icon,
    placeholder,
    className,
    ...props
}: AppTextFieldProps) {
    return (
        <TextField
            {...props}
            className={[
                'group grid gap-1.5',
                className ?? '',
            ].join(' ')}
            isInvalid={Boolean(error) || props.isInvalid}
        >
            <Label className="text-sm font-medium text-[var(--text)]">
                {label}
            </Label>

            <div className="relative">
                {icon ? (
                    <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                        {icon}
                    </div>
                ) : null}

                <Input
                    placeholder={placeholder}
                    className={[
                        'h-10 w-full rounded-2xl border bg-[var(--surface)] px-3 text-sm outline-none transition',
                        'placeholder:text-[var(--text-muted)]',
                        'focus:border-[var(--accent)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--accent)_14%,transparent)]',
                        'group-data-[invalid]:border-[var(--danger)] group-data-[invalid]:ring-4 group-data-[invalid]:ring-[color-mix(in_srgb,var(--danger)_12%,transparent)]',
                        icon ? 'pl-9' : '',
                    ].join(' ')}
                />
            </div>

            {description && !error ? (
                <Text slot="description" className="text-xs text-[var(--text-muted)]">
                    {description}
                </Text>
            ) : null}

            {error ? (
                <Text slot="errorMessage" className="text-xs font-medium text-[var(--danger)]">
                    {error}
                </Text>
            ) : null}
        </TextField>
    );
}
```


## FILE: resources\js\components\ui\AppToolbar.tsx
```
import { type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type AppToolbarProps = {
    children: ReactNode;
    className?: string;
};

export function AppToolbar({ children, className }: AppToolbarProps) {
    return (
        <div className={cn('flex flex-wrap items-center justify-between gap-2', className)}>
            {children}
        </div>
    );
}

```


## FILE: resources\js\components\ui\AppTooltip.tsx
```
import type { ReactNode } from 'react';

type AppTooltipProps = {
    children: ReactNode;
    label: string;
    position?: 'top' | 'right' | 'bottom' | 'left';
};

export function AppTooltip({ children, label, position = 'top' }: AppTooltipProps) {
    const positionClasses = {
        top: 'bottom-full left-1/2 mb-1.5 -translate-x-1/2',
        right: 'left-full top-1/2 ml-1.5 -translate-y-1/2',
        bottom: 'top-full left-1/2 mt-1.5 -translate-x-1/2',
        left: 'right-full top-1/2 mr-1.5 -translate-y-1/2'
    };

    return (
        <div className="group/tooltip relative inline-flex">
            {children}
            <div className={[
                'pointer-events-none absolute z-50 opacity-0 transition-opacity group-hover/tooltip:opacity-100',
                positionClasses[position]
            ].join(' ')}>
                <div className="whitespace-nowrap rounded-md border bg-[var(--surface)] px-2.5 py-1.5 text-xs font-medium text-[var(--text)] shadow-lg border-[var(--border)]">
                    {label}
                </div>
            </div>
        </div>
    );
}
```


## FILE: resources\js\components\ui\AvatarPill.tsx
```
import { Avatar } from '@heroui/react';
import { cn } from '@/lib/cn';

type AvatarPillProps = {
    name: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
};

export function AvatarPill({ name, size = 'md', className }: AvatarPillProps) {
    const initial = (name || '?').charAt(0).toUpperCase();
    const heroSize = size === 'lg' ? 'lg' : size === 'sm' ? 'sm' : 'md';

    return (
        <Avatar
            fallback={initial}
            size={heroSize as any}
            className={cn('shrink-0', className)}
        />
    );
}

```


## DIR: resources\js\components\data
```
MISSING
```


## DIR: resources\js\components\forms
```
MISSING
```


## DIR: resources\js\components\crm
```
MISSING
```


# KEY PAGES



## FILE: resources\js\pages\Projects\Index.tsx
```
MISSING
```


## FILE: resources\js\pages\Tasks\Index.tsx
```
import { Head, router } from '@inertiajs/react';
import { CalendarDays, Columns3, LayoutDashboard, List, Plus, Table2, Timeline } from 'lucide-react';
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { AppButton } from '@/components/ui/AppButton';
import type { FormErrors } from '@/lib/formErrors';
import type { TaskRow, TaskStatus, UserOption, ViewMode } from '@/features/tasks/types';
import { COLUMNS } from '@/features/tasks/types';
import { TaskFilters } from '@/features/tasks/components/TaskFilters';
import { TaskBoard } from '@/features/tasks/components/TaskBoard';
import { TaskCalendar } from '@/features/tasks/components/TaskCalendar';
import { TaskListView } from '@/features/tasks/components/TaskListView';
import { TaskTable } from '@/features/tasks/components/TaskTable';
import { TaskTimeline } from '@/features/tasks/components/TaskTimeline';
import { TaskOverview } from '@/features/tasks/components/TaskOverview';
import { TaskCreateDrawer } from '@/features/tasks/components/TaskCreateDrawer';
import { TaskDetailDrawer } from '@/features/tasks/components/TaskDetailDrawer';
import { TaskRequestCreateDrawer, type TaskRequestOptions } from '@/features/tasks/components/TaskRequestCreateDrawer';

type PageProps = {
    tasks: TaskRow[];
    users: UserOption[];
    activeFilter: string;
    activeCategory: string;
    taskRequestTypes: string[];
    taskRequestTypeLabels: Record<string, string>;
    taskRequestOptions: TaskRequestOptions;
};

function isOpenTask(task: TaskRow) {
    return task.status !== 'completed' && task.status !== 'cancelled';
}

function isOverdue(task: TaskRow) {
    return Boolean(task.dueDate && new Date(task.dueDate) < new Date() && isOpenTask(task));
}

export default function TasksIndex({ tasks, users, activeFilter, activeCategory, taskRequestTypes, taskRequestTypeLabels, taskRequestOptions }: PageProps) {
    const [localTasks, setLocalTasks] = useState<TaskRow[]>(tasks);
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState(activeFilter);
    const [category, setCategory] = useState(activeCategory);
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [viewMode, setViewMode] = useState<ViewMode>(() => {
        if (typeof window !== 'undefined') {
            return (localStorage.getItem('tasks_view') as ViewMode) || 'overview';
        }
        return 'overview';
    });
    const [selectedTask, setSelectedTask] = useState<TaskRow | null>(null);
    const [createOpen, setCreateOpen] = useState(false);
    const [requestOpen, setRequestOpen] = useState(false);
    const [form, setForm] = useState({
        title: '', description: '', status: 'not_started' as string,
        priority: 'medium' as string, impact: 'normal' as string, type: 'general' as string,
        category: 'general_admin' as string,
        start_date: '', due_date: '', estimated_minutes: '', blocked_reason: '',
        assignee_ids: [] as number[], watcher_ids: [] as number[],
    });
    const [formErrors, setFormErrors] = useState<FormErrors>({});

    const filtered = useMemo(() => {
        let items = localTasks;
        if (query.trim()) {
            const q = query.toLowerCase();
            items = items.filter((t) =>
                t.title.toLowerCase().includes(q) ||
                t.taskNumber.toLowerCase().includes(q) ||
                (t.description && t.description.toLowerCase().includes(q)) ||
                (t.client && t.client.name.toLowerCase().includes(q)) ||
                (t.dossier && (t.dossier.number.toLowerCase().includes(q) || t.dossier.object.toLowerCase().includes(q))) ||
                t.category.toLowerCase().includes(q) ||
                t.status.toLowerCase().includes(q) ||
                t.priority.toLowerCase().includes(q)
            );
        }
        if (category !== 'all') {
            items = items.filter((t) => t.category === category);
        }
        if (priorityFilter !== 'all') {
            items = items.filter((t) => t.priority === priorityFilter);
        }
        if (filter === 'my') {
            /* client-side approximate */
        } else if (filter === 'overdue') {
            items = items.filter((t) => isOverdue(t));
        } else if (filter === 'due_today') {
            const today = new Date().toISOString().slice(0, 10);
            items = items.filter((t) => t.dueDate === today);
        } else if (filter === 'due_week') {
            const now = new Date(); const end = new Date(now); end.setDate(now.getDate() + (7 - now.getDay()));
            const endStr = end.toISOString().slice(0, 10);
            items = items.filter((t) => t.dueDate && t.dueDate <= endStr);
        } else if (filter === 'blocked') {
            items = items.filter((t) => t.status === 'blocked');
        } else if (filter === 'completed') {
            items = items.filter((t) => t.status === 'completed');
        } else if (filter === 'assigned_by_me') {
            /* server-side */
        } else if (filter === 'watching') {
            /* server-side */
        }
        return items;
    }, [localTasks, query, category, priorityFilter, filter]);

    const PAGE_SIZE = 50;
    const [page, setPage] = useState(1);

    useEffect(() => {
        setPage(1);
    }, [query, category, priorityFilter, filter]);

    const pageTasks = useMemo(() => {
        return filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    }, [filtered, page]);

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const showPagination = totalPages > 1 && (viewMode === 'table' || viewMode === 'list' || viewMode === 'timeline' || viewMode === 'calendar');

    const columns = useMemo(() => {
        const map: Record<string, TaskRow[]> = {};
        for (const col of COLUMNS) map[col] = [];
        for (const t of filtered) {
            if (map[t.status]) map[t.status].push(t);
        }
        return map;
    }, [filtered]);

    const pageColumns = useMemo(() => {
        const map: Record<string, TaskRow[]> = {};
        for (const col of COLUMNS) map[col] = [];
        for (const t of pageTasks) {
            if (map[t.status]) map[t.status].push(t);
        }
        return map;
    }, [pageTasks]);

    useEffect(() => {
        setFilter(activeFilter);
    }, [activeFilter]);

    useEffect(() => {
        setLocalTasks(tasks);
        setSelectedTask((current) => current ? tasks.find((task) => task.id === current.id) ?? current : null);
    }, [tasks]);

    useEffect(() => {
        localStorage.setItem('tasks_view', viewMode);
    }, [viewMode]);

    const handleCreate = useCallback((event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFormErrors({});
        const payload = { ...form, estimated_minutes: form.estimated_minutes ? parseInt(form.estimated_minutes, 10) : null };
        router.post('/tasks', payload, {
            preserveScroll: true,
            onSuccess: () => {
                setCreateOpen(false);
                setForm({ title: '', description: '', status: 'not_started', priority: 'medium', impact: 'normal', type: 'general', category: 'general_admin', start_date: '', due_date: '', estimated_minutes: '', blocked_reason: '', assignee_ids: [], watcher_ids: [] });
                toast.success('Task created.');
            },
            onError: (err) => {
                setFormErrors(err);
                toast.error('Please check form errors.');
            },
        });
    }, [form]);

    const handleCreateInStatus = useCallback((status: string) => {
        setForm((prev) => ({ ...prev, status }));
        setCreateOpen(true);
    }, []);

    const replaceTask = useCallback((taskId: number, updater: (task: TaskRow) => TaskRow) => {
        setLocalTasks((current) => current.map((task) => task.id === taskId ? updater(task) : task));
        setSelectedTask((current) => current && current.id === taskId ? updater(current) : current);
    }, []);

    const updateStatus = useCallback((task: TaskRow, status: string) => {
        const previous = task;
        const nextStatus = status as TaskStatus;

        replaceTask(task.id, (current) => ({
            ...current,
            status: nextStatus,
            completedAt: nextStatus === 'completed' ? new Date().toISOString() : current.completedAt,
            progress: nextStatus === 'completed' ? 100 : current.progress,
        }));

        router.put(`/tasks/${task.id}/status`, { status }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => toast.success('Status updated.'),
            onError: () => {
                replaceTask(task.id, () => previous);
                toast.error('Status update failed.');
            },
        });
    }, [replaceTask]);

    const toggleChecklistItem = useCallback((taskId: number, itemId: number) => {
        const previous = localTasks.find((task) => task.id === taskId) ?? null;

        replaceTask(taskId, (task) => {
            const checklistItems = Array.isArray(task.checklistItems) ? task.checklistItems : [];
            const nextItems = checklistItems.map((item) => item.id === itemId ? { ...item, isDone: !item.isDone } : item);
            const progress = nextItems.length > 0 ? Math.round((nextItems.filter((item) => item.isDone).length / nextItems.length) * 100) : 0;
            return { ...task, checklistItems: nextItems, progress };
        });

        router.put(`/tasks/${taskId}/checklist/${itemId}/toggle`, {}, {
            preserveScroll: true,
            preserveState: true,
            onError: () => { if (previous) replaceTask(taskId, () => previous); toast.error('Checklist update failed.'); },
        });
    }, [localTasks, replaceTask]);

    const addChecklistItem = useCallback((taskId: number, label: string) => {
        router.post(`/tasks/${taskId}/checklist`, { label }, { preserveScroll: true, onSuccess: () => toast.success('Checklist item added.'), onError: () => toast.error('Checklist item could not be added.') });
    }, []);

    const addComment = useCallback((taskId: number, body: string) => {
        router.post(`/tasks/${taskId}/comments`, { body, is_note: false }, { preserveScroll: true, onSuccess: () => toast.success('Comment added.'), onError: () => toast.error('Comment could not be added.') });
    }, []);

    const uploadAttachment = useCallback((taskId: number, file: File) => {
        router.post(`/tasks/${taskId}/attachments`, { file }, { forceFormData: true, preserveScroll: true, onSuccess: () => toast.success('Attachment uploaded.'), onError: () => toast.error('Attachment upload failed.') });
    }, []);

    const teamAvatars = useMemo(() => {
        const ids = new Set<number>();
        const avatars: { id: number; name: string }[] = [];
        for (const t of localTasks) {
            if (Array.isArray(t.assignees)) {
                for (const a of t.assignees) {
                    if (!ids.has(a.id)) { ids.add(a.id); avatars.push(a); if (avatars.length >= 6) break; }
                }
            }
            if (avatars.length >= 6) break;
        }
        return avatars;
    }, [localTasks]);

    const TABS: { id: ViewMode; label: string; icon: typeof LayoutDashboard }[] = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'board', label: 'Board', icon: Columns3 },
        { id: 'list', label: 'List', icon: List },
        { id: 'table', label: 'Table', icon: Table2 },
        { id: 'timeline', label: 'Timeline', icon: Timeline },
        { id: 'calendar', label: 'Calendar', icon: CalendarDays },
    ];

    return (
        <>
            <Head title="Tasks" />
            <AppShell eyebrowKey="nav.tasks" titleKey="nav.tasks" subtitleKey="Track and organize all office operations in one place."
                action={
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="hidden sm:flex -space-x-1.5 mr-1">
                            {teamAvatars.map((a) => (
                                <span key={a.id} className="flex size-7 items-center justify-center rounded-full border-2 border-[var(--crm-surface)] bg-[var(--crm-gold)] text-[9px] font-bold text-black" title={a.name}>
                                    {a.name.charAt(0)}
                                </span>
                            ))}
                        </div>
                        <AppButton variant="secondary" onPress={() => router.visit('/task-requests')}>Requests</AppButton>
                        <AppButton variant="secondary" onPress={() => setRequestOpen(true)}><Plus size={15} /> Request</AppButton>
                        <AppButton variant="secondary" onPress={() => router.visit('/workload')}>Workload</AppButton>
                        <AppButton variant="primary" onPress={() => { setFormErrors({}); setCreateOpen(true); }}><Plus size={15} /> Create</AppButton>
                    </div>
                }
            >
                <div className="crm-page">
                    {/* Tab bar */}
                    <div className="mb-4 flex gap-1 border-b border-[var(--crm-border)]">
                        {TABS.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button key={tab.id} type="button" onClick={() => setViewMode(tab.id)}
                                    className={`flex items-center gap-1.5 border-b-2 px-3 pb-2 pt-1 text-xs font-semibold transition ${viewMode === tab.id ? 'border-[var(--crm-gold)] text-[var(--crm-gold)]' : 'border-transparent text-[var(--crm-text-muted)] hover:text-[var(--crm-text)]'}`}>
                                    <Icon size={14} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    <TaskFilters
                        filter={filter}
                        category={category}
                        priorityFilter={priorityFilter}
                        query={query}
                        viewMode={viewMode}
                        onFilterChange={(f) => { setFilter(f); router.visit(`/tasks?filter=${f}&category=${category}`, { preserveState: true }); }}
                        onCategoryChange={(c) => { setCategory(c); router.visit(`/tasks?filter=${filter}&category=${c}`, { preserveState: true }); }}
                        onPriorityFilterChange={setPriorityFilter}
                        onQueryChange={setQuery}
                        onViewModeChange={setViewMode}
                    />

                    <div className="mt-4">
                        {viewMode === 'overview' ? (
                            <TaskOverview tasks={filtered} onTaskClick={setSelectedTask} userId={undefined} />
                        ) : viewMode === 'board' ? (
                            <TaskBoard columns={columns} onTaskClick={setSelectedTask} onCreateInStatus={handleCreateInStatus} onStatusChange={updateStatus} />
                        ) : viewMode === 'list' ? (
                            <TaskListView columns={pageColumns} onTaskClick={setSelectedTask} onStatusChange={updateStatus} />
                        ) : viewMode === 'table' ? (
                            <TaskTable tasks={pageTasks} onTaskClick={setSelectedTask} onStatusChange={updateStatus} />
                        ) : viewMode === 'timeline' ? (
                            <TaskTimeline tasks={pageTasks} onTaskClick={setSelectedTask} />
                        ) : (
                            <TaskCalendar tasks={pageTasks} onTaskClick={setSelectedTask} />
                        )}
                    </div>

                    {showPagination ? (
                        <div className="mt-4 flex items-center justify-between rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] px-4 py-3">
                            <span className="text-xs text-[var(--crm-text-muted)]">
                                Showing {(page - 1) * PAGE_SIZE + 1}&ndash;{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                            </span>
                            <div className="flex items-center gap-1">
                                <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                                    className="flex h-7 items-center rounded-lg border border-[var(--crm-border)] px-2.5 text-[10px] font-semibold text-[var(--crm-text-muted)] transition hover:border-[var(--crm-gold)] hover:text-[var(--crm-text)] disabled:opacity-40 disabled:pointer-events-none">
                                    Prev
                                </button>
                                {(() => {
                                    const pages: (number | string)[] = [];
                                    const start = Math.max(1, page - 2);
                                    const end = Math.min(totalPages, page + 2);
                                    if (start > 1) { pages.push(1); if (start > 2) pages.push('...'); }
                                    for (let i = start; i <= end; i++) pages.push(i);
                                    if (end < totalPages) { if (end < totalPages - 1) pages.push('...'); pages.push(totalPages); }
                                    return pages.map((p, i) =>
                                        typeof p === 'string' ? (
                                            <span key={`e${i}`} className="px-1 text-[10px] text-[var(--crm-text-muted)]">{p}</span>
                                        ) : (
                                            <button key={p} type="button" onClick={() => setPage(p)}
                                                className={`flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-semibold transition ${
                                                    p === page
                                                        ? 'bg-[var(--crm-gold)] text-black'
                                                        : 'text-[var(--crm-text-muted)] hover:text-[var(--crm-text)]'
                                                }`}>
                                                {p}
                                            </button>
                                        )
                                    );
                                })()}
                                <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                    className="flex h-7 items-center rounded-lg border border-[var(--crm-border)] px-2.5 text-[10px] font-semibold text-[var(--crm-text-muted)] transition hover:border-[var(--crm-gold)] hover:text-[var(--crm-text)] disabled:opacity-40 disabled:pointer-events-none">
                                    Next
                                </button>
                            </div>
                        </div>
                    ) : null}

                    <TaskCreateDrawer
                        isOpen={createOpen}
                        users={users}
                        form={form}
                        formErrors={formErrors}
                        onOpenChange={(o) => { setCreateOpen(o); if (!o) setFormErrors({}); }}
                        onFormChange={setForm}
                        onSubmit={handleCreate}
                    />

                    <TaskDetailDrawer
                        task={selectedTask}
                        onClose={() => setSelectedTask(null)}
                        onComplete={(t) => updateStatus(t, 'completed')}
                        onChecklistToggle={toggleChecklistItem}
                        onChecklistAdd={addChecklistItem}
                        onCommentAdd={addComment}
                        onAttachmentUpload={uploadAttachment}
                    />

                    <TaskRequestCreateDrawer
                        isOpen={requestOpen}
                        requestTypes={taskRequestTypes}
                        requestTypeLabels={taskRequestTypeLabels}
                        options={taskRequestOptions}
                        onOpenChange={setRequestOpen}
                    />
                </div>
            </AppShell>
        </>
    );
}

```


## FILE: resources\js\pages\Inbox\Index.tsx
```
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { echo } from '@laravel/echo-react';
import { AppShell } from '@/components/layout/AppShell';
import type { FormErrors } from '@/lib/formErrors';
import type { ChatUserOption, ConversationRow, MessageRow } from '@/features/chat/types';
import { conversationInitial, conversationName, messagePreview } from '@/features/chat/helpers';
import { ConversationList } from '@/features/inbox/components/ConversationList';
import { MessageThread } from '@/features/inbox/components/MessageThread';
import { NewConversationDrawer, type NewConvFormData } from '@/features/inbox/components/NewConversationDrawer';
import { ConversationInfoPanel } from '@/features/inbox/components/ConversationInfoPanel';

type PageProps = {
    conversations: ConversationRow[];
    users: ChatUserOption[];
    currentUserId?: number;
    unreadCount: number;
    archivedCount?: number;
};

function playMessageSound() {
    try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.value = 660;
        gain.gain.value = 0.1;
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.25);
    } catch { /* silent */ }
}

function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        conversation: params.get('conversation'),
        message: params.get('message'),
    };
}

function isTempMessage(message: MessageRow) {
    return Number(message.id) < 0;
}

function isLikelyOptimisticMatch(temp: MessageRow, real: MessageRow) {
    if (!isTempMessage(temp)) return false;
    if (temp.userId !== real.userId) return false;
    if ((temp.body || '') !== (real.body || '')) return false;

    const tempTime = new Date(temp.createdAt).getTime();
    const realTime = new Date(real.createdAt).getTime();

    return Math.abs(realTime - tempTime) < 15000;
}

function upsertMessage(prev: MessageRow[], incoming: MessageRow) {
    let replaced = false;

    const next = prev
        .filter((message) => String(message.id) !== String(incoming.id))
        .map((message) => {
            if (isLikelyOptimisticMatch(message, incoming)) {
                replaced = true;
                return incoming;
            }

            return message;
        });

    if (!replaced) {
        next.push(incoming);
    }

    const unique = new Map<string, MessageRow>();
    for (const message of next) {
        unique.set(String(message.id), message);
    }

    return Array.from(unique.values()).sort((a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
}

function upsertMessages(prev: MessageRow[], incoming: MessageRow[]) {
    return incoming.reduce((next, message) => upsertMessage(next, message), prev);
}

export default function InboxIndex({ conversations: _conversations, users, currentUserId: pageCurrentUserId, unreadCount: _unreadCount }: PageProps) {
    const authUser = (usePage().props.auth?.user as { id: number; name: string } | undefined) || { id: 0, name: '' };
    const currentUserId = pageCurrentUserId || authUser.id;

    const [conversations, setConversations] = useState<ConversationRow[]>(_conversations);
    const [archivedConversations, setArchivedConversations] = useState<ConversationRow[]>([]);
    const [selectedConv, setSelectedConv] = useState<ConversationRow | null>(null);
    const [messages, setMessages] = useState<MessageRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingOlder, setLoadingOlder] = useState(false);
    const [paginator, setPaginator] = useState<{ currentPage: number; lastPage: number; perPage: number; total: number } | null>(null);
    const [newConvOpen, setNewConvOpen] = useState(false);
    const [newConvForm, setNewConvForm] = useState<NewConvFormData>({ type: 'direct', user_ids: [], subject: '', category: 'general', custom_category: '' });
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [search, setSearch] = useState('');
    const [convTab, setConvTab] = useState<'active' | 'archived' | 'unread' | 'direct' | 'groups'>('active');
    const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
    const [highlightMsgId, setHighlightMsgId] = useState<number | null>(null);
    const [newMsgAvailable, setNewMsgAvailable] = useState(false);
    const [infoPanelCollapsed, setInfoPanelCollapsed] = useState(false);

    const prevLastMsgIds = useRef<Record<number, number | null>>({});
    const selectedConvRef = useRef<ConversationRow | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const nearBottomRef = useRef(true);
    const autoOpenDone = useRef(false);

    selectedConvRef.current = selectedConv;

    // Helper to check if user is near bottom
    const isNearBottom = useCallback(() => {
        return nearBottomRef.current;
    }, []);

    // Track scroll position for "new message" button
    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        const el = e.currentTarget;
        nearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
        if (nearBottomRef.current) setNewMsgAvailable(false);
    }, []);

    const filteredConvs = useMemo(() => {
        let items = convTab === 'archived' ? archivedConversations : conversations;
        if (search.trim()) {
            const q = search.toLowerCase();
            items = items.filter((c) =>
                conversationName(c, currentUserId).toLowerCase().includes(q) ||
                (c.subject || '').toLowerCase().includes(q) ||
                (c.lastMessage?.body || '').toLowerCase().includes(q) ||
                (Array.isArray(c.participants) ? c.participants : []).some((p) =>
                    p?.user?.name?.toLowerCase().includes(q) || p?.user?.email?.toLowerCase().includes(q)
                )
            );
        }
        if (convTab === 'unread') items = items.filter((c) => c.unreadCount > 0);
        if (convTab === 'direct') items = items.filter((c) => c.type === 'direct');
        if (convTab === 'groups') items = items.filter((c) => c.type === 'group');
        return items;
    }, [archivedConversations, conversations, convTab, currentUserId, search]);

    // Auto-open conversation from URL params on mount
    useEffect(() => {
        if (autoOpenDone.current || _conversations.length === 0) return;
        const { conversation } = getQueryParams();
        if (conversation) {
            const conv = _conversations.find((c) => String(c.id) === conversation);
            if (conv) {
                openConversation(conv);
                autoOpenDone.current = true;
            }
        }
    }, [_conversations]);

    // Scroll to and highlight message after messages load
    useEffect(() => {
        if (!highlightMsgId || messages.length === 0) return;
        const el = document.getElementById(`msg-${highlightMsgId}`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('ring-2', 'ring-[var(--crm-gold)]/50', 'rounded-lg');
            setTimeout(() => {
                el.classList.remove('ring-2', 'ring-[var(--crm-gold)]/50', 'rounded-lg');
                setHighlightMsgId(null);
            }, 2000);
        }
    }, [messages, highlightMsgId]);

    // Read query params for message highlight after opening
    useEffect(() => {
        if (!selectedConv) return;
        const { message } = getQueryParams();
        if (message && !autoOpenDone.current) {
            setHighlightMsgId(Number(message));
            autoOpenDone.current = true;
        }
    }, [selectedConv]);

    // Update URL when conversation changes
    useEffect(() => {
        if (selectedConv) {
            const params = new URLSearchParams();
            params.set('conversation', String(selectedConv.id));
            const msgId = highlightMsgId || selectedConv.lastMessage?.id;
            if (msgId) params.set('message', String(msgId));
            window.history.replaceState(null, '', `/inbox?${params.toString()}`);
        }
    }, [selectedConv?.id]);

    useEffect(() => {
        if (convTab !== 'archived') return;

        fetch('/inbox/archived')
            .then((response) => response.json())
            .then((data) => {
                const fetched = (data.conversations || []) as ConversationRow[];
                setArchivedConversations((prev) => {
                    const merged = new Map<number, ConversationRow>();
                    for (const item of prev) merged.set(item.id, item);
                    for (const item of fetched) merged.set(item.id, item);
                    return Array.from(merged.values())
                        .filter((item) => item.archivedAt)
                        .sort((a, b) => new Date(b.lastMessageAt || b.createdAt || 0).getTime() - new Date(a.lastMessageAt || a.createdAt || 0).getTime());
                });
            })
            .catch(() => toast.error('Failed to load archived conversations'));
    }, [convTab]);

    useEffect(() => {
        setConversations(_conversations);

        const currentIds: Record<number, number | null> = {};
        for (const c of _conversations) {
            currentIds[c.id] = c.lastMessage?.id ?? null;
        }

        if (Object.keys(prevLastMsgIds.current).length > 0) {
            for (const c of _conversations) {
                const prevId = prevLastMsgIds.current[c.id];
                const currId = c.lastMessage?.id ?? null;
                if (prevId !== undefined && prevId !== null && currId !== null && currId !== prevId) {
                    if (c.id !== selectedConvRef.current?.id) {
                        toast(conversationName(c, currentUserId), { description: messagePreview(c.lastMessage) || 'New message' });
                        playMessageSound();
                    }
                }
            }
        }

        prevLastMsgIds.current = currentIds;
    }, [_conversations, currentUserId]);

    useEffect(() => {
        if (selectedConv) {
            const updated = conversations.find((c) => c.id === selectedConv.id);
            if (updated) setSelectedConv(updated);
        }
    }, [conversations, selectedConv?.id]);

    // Subscribe to inbox updates via Echo
    useEffect(() => {
        const e = echo();
        const channel = e.private(`user.${currentUserId}.inbox`);

        const applyInboxUpdate = (payload: any) => {
            if (!payload.conversation) return;

            const conv = payload.conversation as ConversationRow;
            setConversations((prev) => {
                const exists = prev.some((c) => c.id === conv.id);
                const next = exists
                    ? prev.map((c) => c.id === conv.id ? { ...c, ...conv } : c)
                    : [conv, ...prev];
                return next.sort((a, b) => {
                    const ad = new Date(a.lastMessageAt || a.updatedAt || 0).getTime();
                    const bd = new Date(b.lastMessageAt || b.updatedAt || 0).getTime();
                    return bd - ad;
                });
            });
            if (selectedConvRef.current?.id === conv.id) {
                setSelectedConv((current) => current ? { ...current, ...conv, unreadCount: 0 } : current);
            }
        };

        channel.error((error: any) => console.error('[chat] inbox subscription error', currentUserId, error));
        channel.listen('.inbox.updated', applyInboxUpdate);
        channel.listenToAll((event: string, payload: any) => {
            if (event.replace(/^\./, '') === 'inbox.updated') applyInboxUpdate(payload);
        });

        return () => {
            channel.stopListening('.inbox.updated', applyInboxUpdate);
            echo().leave(`user.${currentUserId}.inbox`);
        };
    }, [currentUserId]);

    // Subscribe to active conversation via Echo
    useEffect(() => {
        if (!selectedConv) return;
        const channel = echo().private(`conversation.${selectedConv.id}`);

        const applyMessageCreated = (payload: any) => {
            const msg = payload.message as MessageRow | undefined;
            if (!msg) return;

            const incomingConversationId = Number(payload.conversationId || selectedConv.id);
            if (incomingConversationId !== selectedConvRef.current?.id) {
                return;
            }

            setMessages((prev) => upsertMessage(prev, msg));
            setConversations((prev) => prev.map((c) =>
                c.id === incomingConversationId
                    ? { ...c, lastMessage: msg, lastMessageAt: msg.createdAt }
                    : c,
            ));

            if (msg.userId !== currentUserId && !nearBottomRef.current) {
                setNewMsgAvailable(true);
            } else {
                setNewMsgAvailable(false);
                requestAnimationFrame(() => {
                    document.getElementById(`msg-${msg.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'end' });
                });
            }
        };

        const applyMessageUpdated = (payload: any) => {
            const msg = payload.message as MessageRow | undefined;
            if (!msg) return;
            setMessages((prev) => upsertMessage(prev, msg));
        };

        const applyMessageDeleted = (payload: any) => {
            const messageId = Number(payload.messageId);
            if (!messageId) return;
            setMessages((prev) => prev.filter((m) => m.id !== messageId));
        };

        const applyConversationEvent = (event: string, payload: any) => {
            const normalizedEvent = event.replace(/^\./, '');
            if (normalizedEvent === 'message.created') applyMessageCreated(payload);
            if (normalizedEvent === 'message.updated') applyMessageUpdated(payload);
            if (normalizedEvent === 'message.deleted') applyMessageDeleted(payload);
        };

        channel.error((error: any) => console.error('[chat] conversation subscription error', selectedConv.id, error));
        channel.listen('.message.created', applyMessageCreated);
        channel.listen('.message.updated', applyMessageUpdated);
        channel.listen('.message.deleted', applyMessageDeleted);
        channel.listenToAll(applyConversationEvent);

        return () => {
            channel.stopListening('.message.created', applyMessageCreated);
            channel.stopListening('.message.updated', applyMessageUpdated);
            channel.stopListening('.message.deleted', applyMessageDeleted);
            echo().leave(`conversation.${selectedConv.id}`);
        };
    }, [selectedConv?.id, currentUserId]);

    // Reset new message available when user scrolls to bottom
    useEffect(() => {
        if (nearBottomRef.current) setNewMsgAvailable(false);
    }, [messages]);

    function openConversation(conv: ConversationRow) {
        setSelectedConv(conv);
        setMobileView('chat');
        setLoading(true);
        setPaginator(null);
        setNewMsgAvailable(false);
        fetch(`/inbox/${conv.id}?page=1`)
            .then((r) => r.json())
            .then((data) => {
                setMessages(upsertMessages([], (data.messages || []).reverse()));
                setPaginator(data.paginator || null);
                setConversations((prev) => prev.map((c) =>
                    c.id === conv.id ? { ...c, unreadCount: 0 } : c
                ));
            })
            .catch(() => toast.error('Failed to load messages'))
            .finally(() => setLoading(false));
    }

    function loadOlderMessages() {
        if (!selectedConv || loadingOlder || (paginator && paginator.currentPage >= paginator.lastPage)) return;
        setLoadingOlder(true);
        const nextPage = (paginator?.currentPage || 1) + 1;
        fetch(`/inbox/${selectedConv.id}?page=${nextPage}`)
            .then((r) => r.json())
            .then((data) => {
                setMessages((prev) => upsertMessages(prev, (data.messages || []).reverse()));
                setPaginator(data.paginator || null);
            })
            .catch(() => toast.error('Failed to load older messages'))
            .finally(() => setLoadingOlder(false));
    }

    function goToConversationList() {
        setMobileView('list');
        setSelectedConv(null);
        setMessages([]);
        setPaginator(null);
        window.history.replaceState(null, '', '/inbox');
    }

    function toggleArchive(conv: ConversationRow) {
        const nextArchived = !conv.archivedAt;
        const url = `/inbox/${conv.id}/${nextArchived ? 'archive' : 'unarchive'}`;

        fetch(url, {
            method: 'POST',
            headers: { 'X-CSRF-TOKEN': (window as any).csrfToken || '' },
        })
            .then((response) => {
                if (!response.ok) throw new Error('Archive failed');
                return response.json();
            })
            .then((data) => {
                const updated = (data.conversation || { ...conv, archivedAt: nextArchived ? new Date().toISOString() : null }) as ConversationRow;

                if (nextArchived) {
                    setConversations((prev) => prev.filter((item) => item.id !== conv.id));
                    setArchivedConversations((prev) => [updated, ...prev.filter((item) => item.id !== conv.id)]);
                    if (selectedConv?.id === conv.id) {
                        setSelectedConv(null);
                        setMessages([]);
                        setMobileView('list');
                    }
                    toast.success('Conversation archived.');
                } else {
                    setArchivedConversations((prev) => prev.filter((item) => item.id !== conv.id));
                    setConversations((prev) => [updated, ...prev.filter((item) => item.id !== conv.id)]);
                    if (selectedConv?.id === conv.id) {
                        setSelectedConv(updated);
                        setConvTab('active');
                    }
                    toast.success('Conversation restored.');
                }
            })
            .catch(() => toast.error('Archive action failed.'));
    }

    let tempIdCounter = useRef(0);

    function sendMessage(body: string, images: File[], replyToId?: number) {
        if (!selectedConv || (!body.trim() && images.length === 0)) return;

        // Optimistic message
        const tempId = -(Date.now() + (tempIdCounter.current++));
        const optimisticMsg: MessageRow = {
            id: tempId,
            body: body.trim() || null,
            isEdited: false,
            isForwarded: false,
            forwardedFromMessageId: null,
            forwardedFrom: null,
            userId: currentUserId,
            userName: authUser.name,
            readBy: [],
            replyTo: null,
            attachments: [],
            attachmentsCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        setMessages((prev) => upsertMessage(prev, optimisticMsg));
        nearBottomRef.current = true;
        setNewMsgAvailable(false);

        // Scroll to bottom after optimistic add
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

        const hasImages = images.length > 0;
        let promise: Promise<Response>;

        if (hasImages) {
            const formData = new FormData();
            if (body.trim()) formData.append('body', body);
            for (const img of images) formData.append('images[]', img);
            if (replyToId) formData.append('reply_to_message_id', String(replyToId));

            promise = fetch(`/inbox/${selectedConv.id}/messages`, {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': (window as any).csrfToken || '' },
                body: formData,
            });
        } else {
            promise = fetch(`/inbox/${selectedConv.id}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': (window as any).csrfToken || '' },
                body: JSON.stringify({
                    body: body.trim(),
                    ...(replyToId ? { reply_to_message_id: replyToId } : {}),
                }),
            });
        }

        return promise
            .then((r) => r.json())
            .then((msg: MessageRow) => {
                setMessages((prev) => {
                    const withoutTempAndDuplicate = prev.filter((item) =>
                        String(item.id) !== String(tempId) && String(item.id) !== String(msg.id),
                    );
                    return upsertMessage(withoutTempAndDuplicate, msg);
                });
                setConversations((prev) => prev.map((c) =>
                    c.id === selectedConv!.id
                        ? { ...c, lastMessage: msg, lastMessageAt: msg.createdAt }
                        : c
                ));
                return msg;
            })
            .catch(() => {
                setMessages((prev) => prev.map((item) => item.id === tempId ? { ...item, isFailed: true as any } : item));
                toast.error('Failed to send message');
                throw new Error('Send failed');
            });
    }

    function handleNewConv(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setFormErrors({});
        const isGroup = newConvForm.type === 'group';
        router.post('/inbox', {
            user_ids: newConvForm.user_ids,
            type: newConvForm.type,
            subject: newConvForm.subject || null,
            ...(isGroup ? {
                category: newConvForm.category === 'custom' ? newConvForm.custom_category || 'custom' : newConvForm.category,
                ...(newConvForm.category === 'custom' ? { custom_category: newConvForm.custom_category } : {}),
            } : {}),
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setNewConvOpen(false);
                setNewConvForm({ type: 'direct', user_ids: [], subject: '', category: 'general', custom_category: '' });
                toast.success('Conversation created.');
            },
            onError: (err) => setFormErrors(err),
        });
    }

    function scrollToBottom() {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        setNewMsgAvailable(false);
    }

    return (
        <>
            <Head title="Messages" />
            <AppShell fullBleed hideMobileNav={selectedConv !== null}>
                <div className="flex h-full min-h-0 w-full overflow-hidden">
                    {/* Conversation sidebar â€” mobile: full width when list, hidden when chat; md+: fixed width */}
                    <div className={`${mobileView === 'chat' ? 'hidden' : 'flex'} h-full min-w-0 w-full flex-col border-r border-[var(--crm-border)] bg-[var(--crm-elevated)] lg:flex lg:w-[360px] xl:w-[380px] ${mobileView === 'list' ? 'app-safe-bottom lg:pb-0' : ''}`}>
                        <ConversationList
                            conversations={filteredConvs}
                            selectedConvId={selectedConv?.id ?? null}
                            search={search}
                            onSearchChange={setSearch}
                            onSelect={openConversation}
                            activeTab={convTab}
                            onTabChange={setConvTab}
                            onArchiveToggle={toggleArchive}
                            currentUserId={currentUserId}
                            onNewConversation={() => { setFormErrors({}); setNewConvOpen(true); }}
                        />
                    </div>

                    {/* Chat area â€” mobile: full width when chat, hidden when list; md+: flex */}
                    <div className={`${mobileView === 'list' ? 'hidden' : 'flex'} min-h-0 min-w-0 flex-1 flex-col overflow-hidden lg:flex`}>
                        {selectedConv ? (
                            <>
                                {/* Mobile back button + header */}
                                <div className="flex shrink-0 items-center gap-3 border-b border-[var(--crm-border)] bg-[var(--crm-surface)] px-4 py-3 lg:hidden">
                                    <button type="button" onClick={goToConversationList}
                                        className="flex size-8 items-center justify-center rounded-lg text-[var(--crm-text-muted)] hover:text-[var(--crm-text)]">
                                        <ArrowLeft size={18} />
                                    </button>
                                    <div className="flex size-8 items-center justify-center rounded-full bg-[var(--crm-gold-soft)] text-xs font-bold text-[var(--crm-gold)]">
                                        {conversationInitial(selectedConv, currentUserId)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-[var(--crm-text)]">{conversationName(selectedConv, currentUserId)}</p>
                                    </div>
                                </div>
                                <div className="relative flex-1 flex flex-col min-h-0 overflow-hidden">
                                    <MessageThread
                                        conversation={selectedConv}
                                        conversations={conversations}
                                        messages={messages}
                                        loading={loading}
                                        loadingOlder={loadingOlder}
                                        paginator={paginator}
                                        currentUserId={currentUserId}
                                        onSend={sendMessage}
                                        onLoadOlder={loadOlderMessages}
                                        onMessageUpdate={(message) => setMessages((prev) => upsertMessage(prev, message))}
                                        onMessageDelete={(messageId) => setMessages((prev) => prev.filter((item) => item.id !== messageId))}
                                        onScroll={handleScroll}
                                    />
                                    {/* New messages floating button */}
                                    {newMsgAvailable ? (
                                        <button type="button" onClick={scrollToBottom}
                                            className="absolute bottom-20 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-[var(--crm-border)] bg-[var(--crm-elevated)] px-4 py-2 text-[11px] font-semibold text-[var(--crm-gold)] shadow-xl transition hover:brightness-110 animate-in fade-in slide-in-from-bottom-2">
                                            <MessageSquare size={12} />
                                            New messages
                                            <ArrowLeft size={12} className="rotate-90" />
                                        </button>
                                    ) : null}
                                </div>
                            </>
                        ) : (
                            <div className="hidden flex-1 items-center justify-center lg:flex">
                                <div className="text-center">
                                    <MessageSquare size={40} className="mx-auto text-[var(--crm-muted)]" />
                                    <p className="mt-3 text-sm text-[var(--crm-text-muted)]">Select a conversation</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <ConversationInfoPanel
                        conversation={selectedConv}
                        messages={messages}
                        currentUserId={currentUserId}
                        onArchiveToggle={toggleArchive}
                        collapsed={infoPanelCollapsed}
                        onToggleCollapsed={() => setInfoPanelCollapsed((value) => !value)}
                    />
                </div>

                <div ref={messagesEndRef} />

                <NewConversationDrawer
                    isOpen={newConvOpen}
                    users={users}
                    formErrors={formErrors}
                    form={newConvForm}
                    onOpenChange={(o) => { setNewConvOpen(o); if (!o) setFormErrors({}); }}
                    onFormChange={setNewConvForm}
                    onSubmit={handleNewConv}
                />
            </AppShell>
        </>
    );
}

```


## FILE: resources\js\pages\Clients\Index.tsx
```
import { Head, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    Building2, CalendarDays, FileText, Mail, Pencil, Phone, Plus, Search, Trash2, UserRound, X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { AppButton } from '@/components/ui/AppButton';
import { AppDataTable } from '@/components/ui/AppDataTable';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppMetricCard } from '@/components/ui/AppMetricCard';
import { AppModal } from '@/components/ui/AppModal';
import { AppTableActionButton } from '@/components/ui/AppTableActionButton';
import { AppTableActions } from '@/components/ui/AppTableActions';
import { ClientDrawer } from '@/features/clients/drawers/ClientDrawer';
import type {
    ClientFormPayload, ClientRow, ClientStatus, IntermediaryOption,
} from '@/features/clients/types';
import type { FormErrors } from '@/lib/formErrors';

type PageProps = {
    clients: ClientRow[];
    intermediaries: IntermediaryOption[];
    metrics: { total: number; active: number; inactive: number; archived: number };
};

function toBackendPayload(payload: ClientFormPayload, status: ClientStatus = 'active') {
    return {
        intermediary_id: payload.intermediaryId || null,
        civility: 'Mr',
        first_name: payload.firstName || null,
        last_name: payload.lastName || null,
        cin: payload.cin || null,
        phone: payload.phone || null,
        email: payload.email || null,
        address: payload.address || null,
        father_name: payload.fatherName || null,
        mother_name: payload.motherName || null,
        cni_expiration_date: payload.cniExpirationDate || null,
        status,
        notes: payload.notes || null,
    };
}

function initials(client: ClientRow) {
    const first = client.firstName?.charAt(0) ?? '';
    const last = client.lastName?.charAt(0) ?? '';
    return (first + last).trim() || client.fullName.slice(0, 2).toUpperCase();
}

function formatContact(value: string | null | undefined) {
    return value && value.trim() !== '' ? value : '-';
}

export default function ClientsIndex({ clients, intermediaries, metrics }: PageProps) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
    const [selectedClient, setSelectedClient] = useState<ClientRow | null>(null);
    const [previewClient, setPreviewClient] = useState<ClientRow | null>(null);
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [statusFilter, setStatusFilter] = useState<'all' | ClientStatus>('all');
    const [query, setQuery] = useState('');
    const [deleteTarget, setDeleteTarget] = useState<ClientRow | null>(null);

    const filteredClients = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        return clients.filter((client) => {
            const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
            const searchable = [client.fullName, client.clientNumber, client.cin, client.phone,
                client.email, client.intermediaryName, client.address]
                .filter(Boolean).join(' ').toLowerCase();
            return matchesStatus && (normalizedQuery === '' || searchable.includes(normalizedQuery));
        });
    }, [clients, query, statusFilter]);

    const statusOptions = [
        { id: 'all' as const, label: 'All', count: clients.length },
        { id: 'active' as const, label: 'Active', count: metrics.active },
        { id: 'inactive' as const, label: 'Inactive', count: metrics.inactive },
        { id: 'archived' as const, label: 'Archived', count: metrics.archived },
    ];

    function openCreateDrawer() {
        setSelectedClient(null);
        setDrawerMode('create');
        setFormErrors({});
        setDrawerOpen(true);
    }

    function openEditDrawer(client: ClientRow) {
        setSelectedClient(client);
        setDrawerMode('edit');
        setFormErrors({});
        setDrawerOpen(true);
    }

    function handleSubmit(payload: ClientFormPayload) {
        if (drawerMode === 'edit' && selectedClient) {
            router.put(`/clients/${selectedClient.id}`, toBackendPayload(payload, selectedClient.status), {
                preserveScroll: true,
                onSuccess: () => { setDrawerOpen(false); setFormErrors({}); toast.success('Client updated successfully.'); },
                onError: (errors) => { setFormErrors(errors as FormErrors); toast.error('Please check client form errors.'); },
            });
            return;
        }
        router.post('/clients', toBackendPayload(payload), {
            preserveScroll: true,
            onSuccess: () => { setDrawerOpen(false); setFormErrors({}); toast.success('Client created successfully.'); },
            onError: (errors) => { setFormErrors(errors as FormErrors); toast.error('Please check client form errors.'); },
        });
    }

    function confirmDelete() {
        if (!deleteTarget) return;
        router.delete(`/clients/${deleteTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => { toast.success('Client deleted successfully.'); setDeleteTarget(null); },
            onError: () => toast.error('Client could not be deleted.'),
        });
    }

    const columns = useMemo<ColumnDef<ClientRow, unknown>[]>(() => [
        {
            accessorKey: 'fullName',
            header: 'Client',
            cell: ({ row }) => (
                <button type="button"
                    className="inline-flex max-w-[190px] items-center gap-2 text-left"
                    onClick={() => router.visit(`/clients/${row.original.id}`)}>
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--crm-gold-soft)] text-[10px] font-bold text-[var(--crm-gold)]">
                        {initials(row.original)}
                    </span>
                    <span className="truncate font-semibold text-[var(--crm-text)]">{row.original.fullName}</span>
                </button>
            ),
        },
        {
            accessorKey: 'cin',
            header: 'CIN',
            cell: ({ row }) => <span className="text-sm text-[var(--crm-text-muted)]">{row.original.cin || '-'}</span>,
        },
        {
            accessorKey: 'phone',
            header: 'Contact',
            cell: ({ row }) => (
                <div className="grid gap-0.5">
                    <span className="text-sm">{formatContact(row.original.phone)}</span>
                    <span className="truncate text-[10px] text-[var(--crm-text-soft)]">{formatContact(row.original.email)}</span>
                </div>
            ),
        },
        {
            accessorKey: 'intermediaryName',
            header: 'Intermediary',
            cell: ({ row }) => <span className="text-sm text-[var(--crm-text-muted)]">{row.original.intermediaryName || '-'}</span>,
        },
        {
            accessorKey: 'projectsCount',
            header: 'Projects',
            cell: ({ row }) => <span className="text-sm">{row.original.projectsCount} project(s)</span>,
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const variant = row.original.status === 'active' ? 'text-emerald-300 border-emerald-500/25 bg-emerald-500/10'
                    : row.original.status === 'inactive' ? 'text-amber-300 border-amber-500/25 bg-amber-500/10'
                    : 'text-[var(--crm-text-muted)] border-white/10 bg-white/5';
                return (
                    <span className={`inline-block rounded-full border px-2 py-0.5 text-[11px] font-semibold ${variant}`}>
                        {row.original.status}
                    </span>
                );
            },
        },
        {
            accessorKey: 'updatedAt',
            header: 'Updated',
            cell: ({ row }) => <span className="text-sm text-[var(--crm-text-muted)]">{row.original.updatedAt || '-'}</span>,
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <AppTableActions>
                    <AppTableActionButton label="View" onPress={() => setPreviewClient(row.original)}>
                        <UserRound size={14} />
                    </AppTableActionButton>
                    <AppTableActionButton label="Edit" tone="edit" onPress={() => openEditDrawer(row.original)}>
                        <Pencil size={14} />
                    </AppTableActionButton>
                    <AppTableActionButton label="Delete" tone="delete" onPress={() => setDeleteTarget(row.original)}>
                        <Trash2 size={14} />
                    </AppTableActionButton>
                </AppTableActions>
            ),
        },
    ], []);

    return (
        <>
            <Head title="Clients" />

            <AppShell
                eyebrowKey="clients.eyebrow"
                titleKey="clients.title"
                subtitleKey="clients.subtitle"
                action={
                    <AppButton variant="primary" onPress={openCreateDrawer}>
                        <Plus size={16} />
                        New client
                    </AppButton>
                }
            >
                <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <AppMetricCard label="Total clients" value={metrics.total} detail="Registered client records" />
                    <AppMetricCard label="Active" value={metrics.active} detail="Can start new projects" />
                    <AppMetricCard label="Inactive" value={metrics.inactive} detail="Needs review" />
                    <AppMetricCard label="Archived" value={metrics.archived} detail="Closed relationships" />
                </section>

                <AppDataTable
                    data={filteredClients}
                    columns={columns}
                    searchPlaceholder="Search by name, CIN, phone, email, or intermediary..."
                    emptyTitle="No clients found"
                    emptyDescription="Create your first client to start building project files."
                    pageSize={15}
                    onRowClick={(client) => setPreviewClient(client)}
                    toolbarActions={
                        <AppButton variant="primary" size="sm" onPress={openCreateDrawer}>
                            <Plus size={14} />
                            Add Client
                        </AppButton>
                    }
                    filterControls={
                        <div className="flex flex-wrap gap-2">
                            {statusOptions.map((option) => (
                                <button key={option.id} type="button" onClick={() => setStatusFilter(option.id)}
                                    className={`inline-flex h-8 items-center gap-2 rounded-lg border px-3 text-xs font-semibold transition ${
                                        statusFilter === option.id
                                            ? 'border-[var(--crm-gold)] bg-[var(--crm-gold-soft)] text-[var(--crm-gold)]'
                                            : 'border-[var(--crm-border)] bg-[var(--crm-surface)] text-[var(--crm-text-muted)] hover:text-[var(--crm-text)]'
                                    }`}>
                                    {option.label}
                                    <span className="rounded-full bg-black/20 px-2 py-0.5 text-[10px]">{option.count}</span>
                                </button>
                            ))}
                        </div>
                    }
                />

                <ClientDrawer
                    isOpen={drawerOpen}
                    mode={drawerMode}
                    client={drawerMode === 'edit' ? selectedClient : null}
                    intermediaries={intermediaries}
                    onOpenChange={setDrawerOpen}
                    onSubmit={handleSubmit}
                    errors={formErrors}
                />

                <AppDrawer
                    isOpen={!!previewClient}
                    onOpenChange={(open) => { if (!open) setPreviewClient(null); }}
                    title={previewClient?.fullName || ''}
                >
                    {previewClient ? (
                        <div className="space-y-5">
                            <div className="flex items-center gap-3">
                                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--crm-gold-soft)] text-sm font-bold text-[var(--crm-gold)]">
                                    {initials(previewClient)}
                                </span>
                                <div>
                                    <p className="font-semibold">{previewClient.fullName}</p>
                                    <p className="text-xs text-[var(--crm-text-muted)]">{previewClient.clientNumber}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface-2)] p-3">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">CIN</p>
                                    <p className="mt-1 text-sm font-semibold">{previewClient.cin || '-'}</p>
                                </div>
                                <div className="rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface-2)] p-3">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">Status</p>
                                    <p className="mt-1 text-sm font-semibold">{previewClient.status}</p>
                                </div>
                                <div className="rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface-2)] p-3">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">Phone</p>
                                    <p className="mt-1 text-sm font-semibold">{formatContact(previewClient.phone)}</p>
                                </div>
                                <div className="rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface-2)] p-3">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">Email</p>
                                    <p className="mt-1 truncate text-sm font-semibold">{formatContact(previewClient.email)}</p>
                                </div>
                            </div>

                            <div className="rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface-2)] p-3">
                                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">Intermediary</p>
                                <p className="mt-1 text-sm font-semibold">{previewClient.intermediaryName || '-'}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface-2)] p-3">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">Projects</p>
                                    <p className="mt-1 text-2xl font-semibold">{previewClient.projectsCount}</p>
                                </div>
                                <div className="rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface-2)] p-3">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">Address</p>
                                    <p className="mt-1 text-sm">{previewClient.address || '-'}</p>
                                </div>
                            </div>

                            <AppButton variant="primary" onPress={() => router.visit(`/clients/${previewClient.id}`)}>
                                <UserRound size={15} />
                                View full profile
                            </AppButton>

                            <div className="grid grid-cols-2 gap-2">
                                <AppButton variant="secondary" size="sm" onPress={() => { openEditDrawer(previewClient); setPreviewClient(null); }}>
                                    <Pencil size={14} /> Edit
                                </AppButton>
                                <AppButton variant="danger" size="sm" onPress={() => { setDeleteTarget(previewClient); setPreviewClient(null); }}>
                                    <Trash2 size={14} /> Delete
                                </AppButton>
                            </div>
                        </div>
                    ) : null}
                </AppDrawer>

                <AppModal
                    isOpen={!!deleteTarget}
                    onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
                    title="Delete client?"
                    size="sm"
                >
                    <p className="mb-5 text-sm text-[var(--text-muted)]">
                        Are you sure you want to delete <strong>{deleteTarget?.fullName}</strong>?
                        This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-2">
                        <AppButton variant="secondary" onPress={() => setDeleteTarget(null)}>Cancel</AppButton>
                        <AppButton variant="danger" onPress={confirmDelete}>Delete</AppButton>
                    </div>
                </AppModal>
            </AppShell>
        </>
    );
}

```


## FILE: resources\js\pages\Documents\Index.tsx
```
import { Head, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    CheckCircle2, Download, Eye, FileText, FolderKanban, Plus, Trash2, UploadCloud, XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { AppButton } from '@/components/ui/AppButton';
import { AppDataTable } from '@/components/ui/AppDataTable';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppMetricCard } from '@/components/ui/AppMetricCard';
import { AppModal } from '@/components/ui/AppModal';
import { AppTableActionButton } from '@/components/ui/AppTableActionButton';
import { AppTableActions } from '@/components/ui/AppTableActions';
import { DocumentUploadDrawer } from '@/features/documents/drawers/DocumentUploadDrawer';
import { DocumentGroupedExplorer } from '@/features/documents/components/DocumentGroupedExplorer';
import type {
    DocumentStatus, DocumentTemplateOption, DocumentUploadPayload,
    DocumentLocationGroup, DossierDocumentRow, DossierOption,
} from '@/features/documents/types';
import { countByValue, filterByValue } from '@/lib/filters';

type PageProps = {
    documents: DossierDocumentRow[];
    documentGroups: DocumentLocationGroup[];
    dossiers: DossierOption[];
    templates: DocumentTemplateOption[];
    metrics: { total: number; uploaded: number; verified: number; missing: number; templates: number };
};

type ViewMode = 'workspace' | 'grouped';

function statusClass(status: DocumentStatus) {
    if (status === 'verified') return 'text-emerald-300 border-emerald-400/25 bg-emerald-400/10';
    if (status === 'uploaded') return 'text-sky-300 border-sky-400/25 bg-sky-400/10';
    if (status === 'missing') return 'text-amber-300 border-amber-400/25 bg-amber-400/10';
    if (status === 'rejected') return 'text-red-300 border-red-400/25 bg-red-400/10';
    return 'text-zinc-300 border-zinc-500/30 bg-zinc-500/10';
}

function hasSearchMatch(document: DossierDocumentRow, query: string) {
    if (!query.trim()) return true;
    return [document.templateName, document.documentType, document.documentNumber,
        document.originalFilename, document.dossierNumber, document.projectObject,
        document.clientName, document.status, document.notes]
        .filter(Boolean).join(' ').toLowerCase().includes(query.trim().toLowerCase());
}

function downloadDocument(document: DossierDocumentRow) {
    if (!document.downloadUrl) { toast.error('No file to download.'); return; }
    window.location.href = document.downloadUrl;
}

export default function DocumentsIndex({ documents, documentGroups, dossiers, templates, metrics }: PageProps) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [viewMode, setViewMode] = useState<ViewMode>('workspace');
    const [query, setQuery] = useState('');
    const [previewDoc, setPreviewDoc] = useState<DossierDocumentRow | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<DossierDocumentRow | null>(null);

    const statusOptions = useMemo(() => [
        { id: 'all', label: 'All', count: documents.length },
        { id: 'uploaded', label: 'Uploaded', count: countByValue(documents, (d) => d.status, 'uploaded') },
        { id: 'verified', label: 'Verified', count: countByValue(documents, (d) => d.status, 'verified') },
        { id: 'missing', label: 'Missing', count: countByValue(documents, (d) => d.status, 'missing') },
        { id: 'rejected', label: 'Rejected', count: countByValue(documents, (d) => d.status, 'rejected') },
    ], [documents]);

    const filteredDocuments = useMemo(
        () => filterByValue(documents, statusFilter, (d) => d.status).filter((d) => hasSearchMatch(d, query)),
        [documents, query, statusFilter],
    );

    function handleSubmit(payload: DocumentUploadPayload) {
        const formData = new FormData();
        formData.append('dossier_id', payload.dossierId);
        formData.append('document_template_id', payload.documentTemplateId || '');
        formData.append('status', payload.status || 'uploaded');
        formData.append('notes', payload.notes || '');
        if (payload.file) formData.append('file', payload.file);
        router.post('/documents', formData, {
            forceFormData: true, preserveScroll: true,
            onSuccess: () => { setDrawerOpen(false); toast.success('Document saved successfully.'); },
            onError: () => toast.error('Please check document form errors.'),
        });
    }

    function updateStatus(document: DossierDocumentRow, status: string) {
        router.put(`/documents/${document.id}/status`, { status, notes: document.notes || '' }, {
            preserveScroll: true,
            onSuccess: () => toast.success('Document status updated.'),
            onError: () => toast.error('Document status could not be updated.'),
        });
    }

    function confirmDelete() {
        if (!deleteTarget) return;
        router.delete(`/documents/${deleteTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => { toast.success('Document deleted successfully.'); setDeleteTarget(null); },
            onError: () => toast.error('Document could not be deleted.'),
        });
    }

    const columns = useMemo<ColumnDef<DossierDocumentRow, unknown>[]>(() => [
        {
            accessorKey: 'templateName',
            header: 'Document',
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--crm-gold-soft)] text-[var(--crm-gold)]">
                        <FileText size={16} />
                    </span>
                    <div className="min-w-0">
                        <p className="max-w-[260px] truncate font-semibold text-[var(--crm-text)]">
                            {row.original.templateName || row.original.originalFilename || 'Document'}
                        </p>
                        <p className="text-xs text-[var(--crm-text-muted)]">
                            {row.original.documentNumber || row.original.documentType || 'No number'}
                        </p>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'dossierNumber',
            header: 'Project',
            cell: ({ row }) => (
                <div className="flex items-start gap-2">
                    <FolderKanban size={14} className="mt-0.5 shrink-0 text-[var(--crm-text-soft)]" />
                    <div className="min-w-0">
                        <p className="max-w-[190px] truncate font-medium text-[var(--crm-text)]">{row.original.dossierNumber || '-'}</p>
                        <p className="max-w-[190px] truncate text-xs text-[var(--crm-text-muted)]">{row.original.projectObject || '-'}</p>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'clientName',
            header: 'Client',
            cell: ({ row }) => <p className="max-w-[170px] truncate text-[var(--crm-text-muted)]">{row.original.clientName || '-'}</p>,
        },
        {
            accessorKey: 'originalFilename',
            header: 'File',
            cell: ({ row }) => (
                <div>
                    <p className="max-w-[190px] truncate text-[var(--crm-text)]">{row.original.originalFilename || '-'}</p>
                    <p className="text-xs text-[var(--crm-text-muted)]">{row.original.sizeLabel || '-'}</p>
                </div>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <span className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-semibold ${statusClass(row.original.status)}`}>
                    {row.original.status || 'unknown'}
                </span>
            ),
        },
        {
            accessorKey: 'uploadedAt',
            header: 'Uploaded',
            cell: ({ row }) => <span className="text-[var(--crm-text-muted)]">{row.original.uploadedAt || '-'}</span>,
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <AppTableActions>
                    <AppTableActionButton label="Verify" onPress={() => updateStatus(row.original, 'verified')}>
                        <CheckCircle2 size={14} />
                    </AppTableActionButton>
                    <AppTableActionButton label="Missing" onPress={() => updateStatus(row.original, 'missing')}>
                        <XCircle size={14} />
                    </AppTableActionButton>
                    <AppTableActionButton label="Download" onPress={() => downloadDocument(row.original)}>
                        <Download size={14} />
                    </AppTableActionButton>
                    <AppTableActionButton label="Delete" tone="delete" onPress={() => setDeleteTarget(row.original)}>
                        <Trash2 size={14} />
                    </AppTableActionButton>
                </AppTableActions>
            ),
        },
    ], []);

    return (
        <>
            <Head title="Documents" />

            <AppShell
                eyebrowKey="documents.eyebrow"
                titleKey="documents.title"
                subtitleKey="documents.subtitle"
                action={
                    <AppButton variant="primary" onPress={() => setDrawerOpen(true)}>
                        <UploadCloud size={16} />
                        Upload document
                    </AppButton>
                }
            >
                <section className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
                    <AppMetricCard label="Total documents" value={metrics.total} detail="All project document rows" />
                    <AppMetricCard label="Uploaded" value={metrics.uploaded} detail="Files present or verified" />
                    <AppMetricCard label="Verified" value={metrics.verified} detail="Ready for workflow" />
                    <AppMetricCard label="Missing" value={metrics.missing} detail="Blocking documents" />
                    <AppMetricCard label="Templates" value={metrics.templates} detail="Active required models" />
                </section>

                <section className="crm-panel p-4">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                        <div className="flex flex-wrap gap-2">
                            {statusOptions.map((option) => {
                                const active = option.id === statusFilter;
                                return (
                                    <button key={option.id} type="button" onClick={() => setStatusFilter(option.id)}
                                        className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-semibold transition ${
                                            active
                                                ? 'border-[var(--crm-gold)] bg-[var(--crm-gold-soft)] text-[var(--crm-gold)]'
                                                : 'border-[var(--crm-border)] bg-[var(--crm-surface)] text-[var(--crm-text-muted)] hover:text-[var(--crm-text)]'
                                        }`}>
                                        {option.label}
                                        <span className="rounded-full bg-black/20 px-2 py-0.5 text-xs">{option.count}</span>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="inline-flex rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface)] p-1">
                            <button type="button" onClick={() => setViewMode('workspace')}
                                className={`h-8 rounded-md px-3 text-xs font-semibold transition ${
                                    viewMode === 'workspace'
                                        ? 'bg-[var(--crm-gold)] text-black'
                                        : 'text-[var(--crm-text-muted)] hover:text-[var(--crm-text)]'
                                }`}>Workspace</button>
                            <button type="button" onClick={() => setViewMode('grouped')}
                                className={`h-8 rounded-md px-3 text-xs font-semibold transition ${
                                    viewMode === 'grouped'
                                        ? 'bg-[var(--crm-gold)] text-black'
                                        : 'text-[var(--crm-text-muted)] hover:text-[var(--crm-text)]'
                                }`}>Grouped</button>
                        </div>
                    </div>
                </section>

                {viewMode === 'grouped' ? (
                    <DocumentGroupedExplorer groups={documentGroups} />
                ) : (
                    <AppDataTable
                        data={filteredDocuments}
                        columns={columns}
                        searchPlaceholder="Search documents, projects, clients, files..."
                        emptyTitle="No documents found"
                        emptyDescription="Change filters or upload a project document."
                        pageSize={15}
                        onRowClick={(doc) => setPreviewDoc(doc)}
                        toolbarActions={
                            <AppButton variant="secondary" size="sm" onPress={() => setStatusFilter('all')}>
                                Reset
                            </AppButton>
                        }
                    />
                )}

                <DocumentUploadDrawer
                    isOpen={drawerOpen}
                    dossiers={dossiers}
                    templates={templates}
                    onOpenChange={setDrawerOpen}
                    onSubmit={handleSubmit}
                />

                <AppDrawer
                    isOpen={!!previewDoc}
                    onOpenChange={(open) => { if (!open) setPreviewDoc(null); }}
                    title={previewDoc?.templateName || previewDoc?.originalFilename || 'Document'}
                >
                    {previewDoc ? (
                        <div className="space-y-5">
                            <div className="flex items-center gap-3">
                                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--crm-gold-soft)] text-[var(--crm-gold)]">
                                    <FileText size={18} />
                                </span>
                                <div>
                                    <p className="font-semibold">{previewDoc.templateName || previewDoc.originalFilename}</p>
                                    <p className="text-xs text-[var(--crm-text-muted)]">{previewDoc.documentNumber || previewDoc.documentType}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface-2)] p-3">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">Project</p>
                                    <p className="mt-1 truncate text-sm font-semibold">{previewDoc.dossierNumber || '-'}</p>
                                    <p className="truncate text-xs text-[var(--crm-text-muted)]">{previewDoc.projectObject || '-'}</p>
                                </div>
                                <div className="rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface-2)] p-3">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">Client</p>
                                    <p className="mt-1 truncate text-sm font-semibold">{previewDoc.clientName || '-'}</p>
                                    <p className="truncate text-xs text-[var(--crm-text-muted)]">Owner</p>
                                </div>
                                <div className="rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface-2)] p-3">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">File</p>
                                    <p className="mt-1 truncate text-sm font-semibold">{previewDoc.originalFilename || 'No file'}</p>
                                    <p className="truncate text-xs text-[var(--crm-text-muted)]">{previewDoc.sizeLabel || '-'}</p>
                                </div>
                                <div className="rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface-2)] p-3">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">Uploaded</p>
                                    <p className="mt-1 truncate text-sm font-semibold">{previewDoc.uploadedAt || '-'}</p>
                                    <p className="truncate text-xs text-[var(--crm-text-muted)]">{previewDoc.documentType || 'manual'}</p>
                                </div>
                            </div>

                            {previewDoc.notes ? (
                                <div className="rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface-2)] p-3">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">Notes</p>
                                    <p className="mt-2 text-sm text-[var(--crm-text-muted)]">{previewDoc.notes}</p>
                                </div>
                            ) : null}

                            <AppButton variant="primary" onPress={() => updateStatus(previewDoc, 'verified')}>
                                <CheckCircle2 size={15} />
                                Mark verified
                            </AppButton>

                            <AppButton variant="secondary" onPress={() => downloadDocument(previewDoc)}>
                                <Download size={15} />
                                Download file
                            </AppButton>

                            <div className="grid grid-cols-3 gap-2">
                                <AppButton variant="secondary" size="sm" onPress={() => router.visit(`/dossiers/${previewDoc.dossierId}`)}>
                                    <Eye size={14} /> Project
                                </AppButton>
                                <AppButton variant="secondary" size="sm" onPress={() => { updateStatus(previewDoc, 'missing'); setPreviewDoc(null); }}>
                                    <XCircle size={14} /> Missing
                                </AppButton>
                                <AppButton variant="danger" size="sm" onPress={() => { setDeleteTarget(previewDoc); setPreviewDoc(null); }}>
                                    <Trash2 size={14} /> Delete
                                </AppButton>
                            </div>
                        </div>
                    ) : null}
                </AppDrawer>

                <AppModal
                    isOpen={!!deleteTarget}
                    onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
                    title="Delete document?"
                    size="sm"
                >
                    <p className="mb-5 text-sm text-[var(--text-muted)]">
                        Are you sure you want to delete <strong>{deleteTarget?.templateName || deleteTarget?.originalFilename || 'this document'}</strong>?
                        This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-2">
                        <AppButton variant="secondary" onPress={() => setDeleteTarget(null)}>Cancel</AppButton>
                        <AppButton variant="danger" onPress={confirmDelete}>Delete</AppButton>
                    </div>
                </AppModal>
            </AppShell>
        </>
    );
}

```


## FILE: resources\js\pages\Contracts\Index.tsx
```
import { Head, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { Download, Eye, FileText, FolderKanban, Pencil, Plus, ScrollText, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { FormErrors } from '@/lib/formErrors';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { AppButton } from '@/components/ui/AppButton';
import { AppDataTable } from '@/components/ui/AppDataTable';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppMetricCard } from '@/components/ui/AppMetricCard';
import { AppModal } from '@/components/ui/AppModal';
import { AppTableActionButton } from '@/components/ui/AppTableActionButton';
import { AppTableActions } from '@/components/ui/AppTableActions';
import { ContractDrawer } from '@/features/contracts/drawers/ContractDrawer';
import type { ContractDossierOption, ContractFormPayload, ContractRow, ContractStatus } from '@/features/contracts/types';
import { countByValue, filterByValue } from '@/lib/filters';
import { useTranslation } from '@/lib/i18n';

type PageProps = {
    contracts: ContractRow[];
    dossiers: ContractDossierOption[];
    metrics: { total: number; draft: number; generated: number; signed: number; totalTtc: number };
};

function formatMoney(value: number) {
    return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(value || 0);
}

function statusClass(status: ContractStatus) {
    if (status === 'signed') return 'text-emerald-300 border-emerald-400/25 bg-emerald-400/10';
    if (status === 'generated') return 'text-violet-300 border-violet-400/25 bg-violet-400/10';
    if (status === 'draft') return 'text-amber-300 border-amber-400/25 bg-amber-400/10';
    if (status === 'completed') return 'text-sky-300 border-sky-400/25 bg-sky-400/10';
    return 'text-zinc-300 border-zinc-500/30 bg-zinc-500/10';
}

function hasSearchMatch(contract: ContractRow, query: string) {
    if (!query.trim()) return true;
    return [contract.contractNumber, contract.clientName, contract.clientNumber,
        contract.dossierNumber, contract.projectObject, contract.status]
        .filter(Boolean).join(' ').toLowerCase().includes(query.trim().toLowerCase());
}

export default function ContractsIndex({ contracts, dossiers, metrics }: PageProps) {
    const { t } = useTranslation();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
    const [selectedContract, setSelectedContract] = useState<ContractRow | null>(null);
    const [previewContract, setPreviewContract] = useState<ContractRow | null>(null);
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [statusFilter, setStatusFilter] = useState('all');
    const [query, setQuery] = useState('');
    const [deleteTarget, setDeleteTarget] = useState<ContractRow | null>(null);

    const statusOptions = useMemo(() => [
        { id: 'all', label: 'All', count: contracts.length },
        { id: 'draft', label: 'Draft', count: countByValue(contracts, (c) => c.status, 'draft') },
        { id: 'generated', label: 'Generated', count: countByValue(contracts, (c) => c.status, 'generated') },
        { id: 'signed', label: 'Signed', count: countByValue(contracts, (c) => c.status, 'signed') },
        { id: 'completed', label: 'Completed', count: countByValue(contracts, (c) => c.status, 'completed') },
    ], [contracts]);

    const filteredContracts = useMemo(
        () => filterByValue(contracts, statusFilter, (c) => c.status).filter((c) => hasSearchMatch(c, query)),
        [contracts, query, statusFilter],
    );

    function openCreateDrawer() {
        setSelectedContract(null); setDrawerMode('create'); setFormErrors({}); setDrawerOpen(true);
    }

    function openEditDrawer(contract: ContractRow) {
        setSelectedContract(contract); setDrawerMode('edit'); setFormErrors({}); setDrawerOpen(true);
    }

    function handleSubmit(payload: ContractFormPayload) {
        if (drawerMode === 'edit' && selectedContract) {
            router.put(`/contracts/${selectedContract.id}`, payload, {
                preserveScroll: true,
                onSuccess: () => { setDrawerOpen(false); setFormErrors({}); toast.success('Contract updated successfully.'); },
                onError: (errors) => { setFormErrors(errors as FormErrors); toast.error('Please check contract form errors.'); },
            });
            return;
        }
        router.post('/contracts', payload, {
            preserveScroll: true,
            onSuccess: () => { setDrawerOpen(false); setFormErrors({}); toast.success('Contract created successfully.'); },
            onError: (errors) => { setFormErrors(errors as FormErrors); toast.error('Please check contract form errors.'); },
        });
    }

    function confirmDelete() {
        if (!deleteTarget) return;
        router.delete(`/contracts/${deleteTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => { toast.success('Contract deleted successfully.'); setDeleteTarget(null); },
            onError: () => toast.error('Contract could not be deleted.'),
        });
    }

    const columns = useMemo<ColumnDef<ContractRow, unknown>[]>(() => [
        {
            accessorKey: 'contractNumber',
            header: 'Contract',
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--crm-gold-soft)] text-[var(--crm-gold)]">
                        <ScrollText size={16} />
                    </span>
                    <div className="min-w-0">
                        <p className="max-w-[200px] truncate font-semibold text-[var(--crm-text)]">{row.original.contractNumber}</p>
                        <p className="max-w-[200px] truncate text-xs text-[var(--crm-text-muted)]">{row.original.projectObject || '-'}</p>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'dossierNumber',
            header: 'Project',
            cell: ({ row }) => (
                <div className="flex items-start gap-2">
                    <FolderKanban size={14} className="mt-0.5 shrink-0 text-[var(--crm-text-soft)]" />
                    <div className="min-w-0">
                        <p className="max-w-[170px] truncate font-medium">{row.original.dossierNumber || '-'}</p>
                        <p className="max-w-[170px] truncate text-xs text-[var(--crm-text-muted)]">{row.original.clientName || '-'}</p>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'clientName',
            header: 'Client',
            cell: ({ row }) => <p className="max-w-[170px] truncate text-[var(--crm-text-muted)]">{row.original.clientName || '-'}</p>,
        },
        {
            accessorKey: 'ttc',
            header: 'Amount',
            cell: ({ row }) => <span className="font-semibold">{formatMoney(row.original.ttc)}</span>,
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <span className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-semibold ${statusClass(row.original.status)}`}>
                    {row.original.status}
                </span>
            ),
        },
        {
            accessorKey: 'updatedAt',
            header: 'Updated',
            cell: ({ row }) => <span className="text-sm text-[var(--crm-text-muted)]">{row.original.updatedAt || '-'}</span>,
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <AppTableActions>
                    <AppTableActionButton label="View" onPress={() => setPreviewContract(row.original)}>
                        <Eye size={14} />
                    </AppTableActionButton>
                    <AppTableActionButton label="Edit" tone="edit" onPress={() => openEditDrawer(row.original)}>
                        <Pencil size={14} />
                    </AppTableActionButton>
                    <AppTableActionButton label="Download" onPress={() => toast.info('Download simulated.')}>
                        <Download size={14} />
                    </AppTableActionButton>
                    <AppTableActionButton label="Delete" tone="delete" onPress={() => setDeleteTarget(row.original)}>
                        <Trash2 size={14} />
                    </AppTableActionButton>
                </AppTableActions>
            ),
        },
    ], []);

    return (
        <>
            <Head title="Contracts" />

            <AppShell
                eyebrowKey="contractsWorkspace.eyebrow"
                titleKey="contractsWorkspace.title"
                subtitleKey="contractsWorkspace.subtitle"
                action={
                    <AppButton variant="primary" onPress={openCreateDrawer}>
                        <Plus size={16} />
                        New contract
                    </AppButton>
                }
            >
                <section className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
                    <AppMetricCard label="Total contracts" value={metrics.total} detail="All contract records" />
                    <AppMetricCard label="Draft" value={metrics.draft} detail="Not yet generated" />
                    <AppMetricCard label="Generated" value={metrics.generated} detail="DOCX/PDF created" />
                    <AppMetricCard label="Signed" value={metrics.signed} detail="Client signature done" />
                    <AppMetricCard label="Total TTC" value={formatMoney(metrics.totalTtc)} detail="Sum of all contracts" />
                </section>

                <AppDataTable
                    data={filteredContracts}
                    columns={columns}
                    searchPlaceholder="Search by contract, client, project, or status..."
                    emptyTitle="No contracts found"
                    emptyDescription="Create a new contract to start tracking."
                    pageSize={15}
                    onRowClick={(contract) => setPreviewContract(contract)}
                    filterControls={
                        <div className="flex flex-wrap gap-2">
                            {statusOptions.map((option) => (
                                <button key={option.id} type="button" onClick={() => setStatusFilter(option.id)}
                                    className={`inline-flex h-8 items-center gap-2 rounded-lg border px-3 text-xs font-semibold transition ${
                                        statusFilter === option.id
                                            ? 'border-[var(--crm-gold)] bg-[var(--crm-gold-soft)] text-[var(--crm-gold)]'
                                            : 'border-[var(--crm-border)] bg-[var(--crm-surface)] text-[var(--crm-text-muted)] hover:text-[var(--crm-text)]'
                                    }`}>
                                    {option.label}
                                    <span className="rounded-full bg-black/20 px-2 py-0.5 text-[10px]">{option.count}</span>
                                </button>
                            ))}
                        </div>
                    }
                />

                <ContractDrawer
                    isOpen={drawerOpen}
                    mode={drawerMode}
                    contract={drawerMode === 'edit' ? selectedContract : null}
                    dossiers={dossiers}
                    onOpenChange={setDrawerOpen}
                    onSubmit={handleSubmit}
                    errors={formErrors}
                />

                <AppDrawer
                    isOpen={!!previewContract}
                    onOpenChange={(open) => { if (!open) setPreviewContract(null); }}
                    title={previewContract?.contractNumber || ''}
                >
                    {previewContract ? (
                        <div className="space-y-5">
                            <div className="flex items-center gap-3">
                                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--crm-gold-soft)] text-[var(--crm-gold)]">
                                    <ScrollText size={18} />
                                </span>
                                <div>
                                    <p className="font-semibold">{previewContract.contractNumber}</p>
                                    <p className="text-xs text-[var(--crm-text-muted)]">{previewContract.projectObject || '-'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface-2)] p-3">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">Client</p>
                                    <p className="mt-1 truncate text-sm font-semibold">{previewContract.clientName || '-'}</p>
                                    <p className="truncate text-xs text-[var(--crm-text-muted)]">{previewContract.clientNumber || '-'}</p>
                                </div>
                                <div className="rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface-2)] p-3">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">Amount</p>
                                    <p className="mt-1 text-lg font-bold text-[var(--crm-gold)]">{formatMoney(previewContract.ttc)}</p>
                                </div>
                                <div className="rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface-2)] p-3">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">Project</p>
                                    <p className="mt-1 truncate text-sm font-semibold">{previewContract.dossierNumber || '-'}</p>
                                </div>
                                <div className="rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface-2)] p-3">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">Status</p>
                                    <p className="mt-1 text-sm font-semibold">{previewContract.status}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <AppButton variant="secondary" size="sm" onPress={() => { openEditDrawer(previewContract); setPreviewContract(null); }}>
                                    <Pencil size={14} /> Edit
                                </AppButton>
                                <AppButton variant="danger" size="sm" onPress={() => { setDeleteTarget(previewContract); setPreviewContract(null); }}>
                                    <Trash2 size={14} /> Delete
                                </AppButton>
                            </div>
                        </div>
                    ) : null}
                </AppDrawer>

                <AppModal
                    isOpen={!!deleteTarget}
                    onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
                    title="Delete contract?"
                    size="sm"
                >
                    <p className="mb-5 text-sm text-[var(--text-muted)]">
                        Are you sure you want to delete <strong>{deleteTarget?.contractNumber}</strong>?
                        This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-2">
                        <AppButton variant="secondary" onPress={() => setDeleteTarget(null)}>Cancel</AppButton>
                        <AppButton variant="danger" onPress={confirmDelete}>Delete</AppButton>
                    </div>
                </AppModal>
            </AppShell>
        </>
    );
}

```


## FILE: resources\js\pages\Finance\Index.tsx
```
import { Head, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    BadgeDollarSign,
    CheckCircle2,
    Download,
    Eye,
    FileSpreadsheet,
    FileText,
    Pencil,
    Plus,
    Trash2,
    WandSparkles,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type { FormErrors } from '@/lib/formErrors';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppDataTable } from '@/components/ui/AppDataTable';
import { AppFilterBar } from '@/components/ui/AppFilterBar';
import { AppModal } from '@/components/ui/AppModal';
import { AppStatusBadge } from '@/components/ui/AppStatusBadge';
import { AppTableActionButton } from '@/components/ui/AppTableActionButton';
import { AppTableActions } from '@/components/ui/AppTableActions';
import { FinanceDrawer } from '@/features/finance/drawers/FinanceDrawer';
import { countByValue, filterByValue } from '@/lib/filters';
import type {
    FinanceDossierOption,
    FinanceFormPayload,
    FinanceRecordRow,
    FinanceRecordStatus,
    FinanceRecordType,
} from '@/features/finance/types';

type PageProps = {
    financeRecords: FinanceRecordRow[];
    dossiers: FinanceDossierOption[];
    metrics: {
        totalRecords: number;
        totalTtc: number;
        paid: number;
        remaining: number;
        overdue: number;
        draft: number;
        sent: number;
        paidCount: number;
        partiallyPaid: number;
        overdueCount: number;
    };
};

type BadgeTone = 'neutral' | 'blue' | 'green' | 'amber' | 'red' | 'violet';

function formatMoney(value: number) {
    return new Intl.NumberFormat('en-MA', {
        style: 'currency',
        currency: 'MAD',
        maximumFractionDigits: 0,
    }).format(value);
}

function getStatusTone(status: FinanceRecordStatus): BadgeTone {
    switch (status) {
        case 'paid':
            return 'green';
        case 'sent':
            return 'blue';
        case 'partially_paid':
            return 'amber';
        case 'overdue':
            return 'red';
        case 'cancelled':
            return 'neutral';
        default:
            return 'violet';
    }
}

function getStatusIcon(status: FinanceRecordStatus): 'dot' | 'check' | 'clock' | 'warning' {
    switch (status) {
        case 'paid':
            return 'check';
        case 'overdue':
            return 'warning';
        case 'sent':
        case 'partially_paid':
            return 'clock';
        default:
            return 'dot';
    }
}

function getTypeTone(type: FinanceRecordType): BadgeTone {
    switch (type) {
        case 'invoice':
            return 'blue';
        case 'payment':
            return 'green';
        default:
            return 'violet';
    }
}

function toBackendPayload(payload: FinanceFormPayload) {
    return {
        dossier_id: payload.dossierId,
        type: payload.type || 'devis',
        status: payload.status || 'draft',
        ht: payload.ht || null,
        tva: payload.tva || null,
        total_ttc: payload.totalTtc || 0,
        paid: payload.paid || 0,
        issued_at: payload.issuedAt || null,
        due_date: payload.dueDate || null,
        paid_at: payload.paidAt || null,
        notes: payload.notes || null,
    };
}

function MiniBar({ value }: { value: number }) {
    return (
        <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-2)]">
            <div
                className="h-full rounded-full bg-[var(--accent)]"
                style={{ width: `${Math.max(0, Math.min(value, 100))}%` }}
            />
        </div>
    );
}

export default function FinanceIndex({
    financeRecords,
    dossiers,
    metrics,
}: PageProps) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
    const [selectedRecord, setSelectedRecord] = useState<FinanceRecordRow | null>(
        financeRecords[0] ?? null,
    );
    const [deleteTarget, setDeleteTarget] = useState<FinanceRecordRow | null>(null);
    const [formErrors, setFormErrors] = useState<FormErrors>({});

    const filteredFinanceRecords = useMemo(() => {
        const byType = filterByValue(financeRecords, typeFilter, (record) => record.type);
        return filterByValue(byType, statusFilter, (record) => record.status);
    }, [financeRecords, typeFilter, statusFilter]);

    const typeOptions = useMemo(
        () => [
            { id: 'all', label: 'All', count: financeRecords.length },
            { id: 'devis', label: 'Devis', count: countByValue(financeRecords, (record) => record.type, 'devis') },
            { id: 'invoice', label: 'Invoice', count: countByValue(financeRecords, (record) => record.type, 'invoice') },
            { id: 'payment', label: 'Payment', count: countByValue(financeRecords, (record) => record.type, 'payment') },
        ],
        [financeRecords],
    );

    const statusOptions = useMemo(
        () => [
            { id: 'all', label: 'All', count: financeRecords.length },
            { id: 'draft', label: 'Draft', count: countByValue(financeRecords, (record) => record.status, 'draft') },
            { id: 'sent', label: 'Sent', count: countByValue(financeRecords, (record) => record.status, 'sent') },
            { id: 'paid', label: 'Paid', count: countByValue(financeRecords, (record) => record.status, 'paid') },
            { id: 'partially_paid', label: 'Partial', count: countByValue(financeRecords, (record) => record.status, 'partially_paid') },
            { id: 'overdue', label: 'Overdue', count: countByValue(financeRecords, (record) => record.status, 'overdue') },
        ],
        [financeRecords],
    );

    function openCreateDrawer() {
        setSelectedRecord(null);
        setDrawerMode('create');
        setFormErrors({});
        setDrawerOpen(true);
    }

    function openEditDrawer(record: FinanceRecordRow) {
        setSelectedRecord(record);
        setDrawerMode('edit');
        setFormErrors({});
        setDrawerOpen(true);
    }

    function handleSubmit(payload: FinanceFormPayload) {
        const backendPayload = toBackendPayload(payload);

        if (drawerMode === 'edit' && selectedRecord) {
            router.put(`/finance/${selectedRecord.id}`, backendPayload, {
                preserveScroll: true,
                onSuccess: () => {
                    setDrawerOpen(false);
                    toast.success('Finance record updated successfully.');
                },
                onError: (errors) => {
                    setFormErrors(errors as FormErrors);
                    toast.error('Please check finance form errors.');
                },
            });

            return;
        }

        router.post('/finance', backendPayload, {
            preserveScroll: true,
            onSuccess: () => {
                setDrawerOpen(false);
                toast.success('Finance record created successfully.');
            },
            onError: (errors) => {
                setFormErrors(errors as FormErrors);
                toast.error('Please check finance form errors.');
            },
        });
    }

    function markPaid(record: FinanceRecordRow) {
        router.put(`/finance/${record.id}/paid`, {}, {
            preserveScroll: true,
            onSuccess: () => toast.success('Finance record marked as paid.'),
            onError: () => toast.error('Finance record could not be marked as paid.'),
        });
    }

    function confirmDelete() {
        if (!deleteTarget) return;
        router.delete(`/finance/${deleteTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => { toast.success('Finance record deleted successfully.'); setDeleteTarget(null); },
            onError: () => toast.error('Finance record could not be deleted.'),
        });
    }

    function generateRecord(record: FinanceRecordRow) {
        router.put(`/finance/${record.id}/generate`, {}, {
            preserveScroll: true,
            onSuccess: () => toast.success('Excel document generated successfully.'),
            onError: () => toast.error('Generation failed.'),
        });
    }

    function downloadRecord(record: FinanceRecordRow) {
        if (!record.hasGeneratedFile) {
            toast.error('No generated document found. Please generate first.');
            return;
        }
        window.location.href = record.downloadUrl;
    }

    function exportPdf(record: FinanceRecordRow) {
        router.put(`/finance/${record.id}/export-pdf`, {}, {
            preserveScroll: true,
            onSuccess: () => toast.success('PDF exported successfully.'),
            onError: () => toast.error('PDF export failed.'),
        });
    }

    function downloadPdf(record: FinanceRecordRow) {
        if (!record.hasPdf) {
            toast.error('No PDF found. Please export PDF first.');
            return;
        }
        window.location.href = record.pdfDownloadUrl;
    }

    const columns = useMemo<ColumnDef<FinanceRecordRow, unknown>[]>(
        () => [
            {
                accessorKey: 'recordNumber',
                header: 'Record',
                cell: ({ row }) => (
                    <div className="app-table-primary-cell">
                        <div className="flex items-center gap-2">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent)]">
                                <BadgeDollarSign size={15} />
                            </div>

                            <div className="min-w-0">
                                <p className="max-w-[220px] truncate text-sm font-semibold">
                                    {row.original.recordNumber}
                                </p>
                                <p className="text-xs text-[var(--text-muted)]">
                                    {row.original.dossierNumber}
                                </p>
                            </div>
                        </div>
                    </div>
                ),
            },
            {
                accessorKey: 'projectObject',
                header: 'Project',
                cell: ({ row }) => (
                    <div>
                        <p className="max-w-[240px] truncate text-sm font-medium">
                            {row.original.projectObject}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                            {row.original.clientName}
                        </p>
                    </div>
                ),
            },
            {
                accessorKey: 'type',
                header: 'Type',
                cell: ({ row }) => (
                    <AppBadge tone={getTypeTone(row.original.type)}>
                        {row.original.type}
                    </AppBadge>
                ),
            },
            {
                accessorKey: 'totalTtc',
                header: 'Total TTC',
                cell: ({ row }) => (
                    <span className="text-sm font-semibold">
                        {formatMoney(row.original.totalTtc)}
                    </span>
                ),
            },
            {
                accessorKey: 'remaining',
                header: 'Remaining',
                cell: ({ row }) => (
                    <span className="text-sm font-semibold">
                        {formatMoney(row.original.remaining)}
                    </span>
                ),
            },
            {
                accessorKey: 'status',
                header: 'Status',
                cell: ({ row }) => (
                    <AppStatusBadge
                        label={row.original.status}
                        tone={getStatusTone(row.original.status)}
                        icon={getStatusIcon(row.original.status)}
                    />
                ),
            },
            {
                accessorKey: 'dueDate',
                header: 'Due date',
                cell: ({ row }) => (
                    <span className="text-sm text-[var(--text-muted)]">
                        {row.original.dueDate || '-'}
                    </span>
                ),
            },
            {
                id: 'actions',
                header: 'Actions',
                cell: ({ row }) => (
                    <AppTableActions>
                        <AppTableActionButton
                            label="Preview"
                            tone="view"
                            onPress={() => setSelectedRecord(row.original)}
                        >
                            <Eye size={15} />
                        </AppTableActionButton>

                        <AppTableActionButton
                            label="Edit"
                            tone="edit"
                            onPress={() => openEditDrawer(row.original)}
                        >
                            <Pencil size={15} />
                        </AppTableActionButton>

                        <AppTableActionButton
                            label="Generate"
                            tone="documents"
                            onPress={() => generateRecord(row.original)}
                        >
                            <WandSparkles size={15} />
                        </AppTableActionButton>

                        <AppTableActionButton
                            label="Download Excel"
                            tone="documents"
                            onPress={() => downloadRecord(row.original)}
                        >
                            <FileSpreadsheet size={15} />
                        </AppTableActionButton>

                        <AppTableActionButton
                            label="Export PDF"
                            tone="documents"
                            onPress={() => exportPdf(row.original)}
                        >
                            <FileText size={15} />
                        </AppTableActionButton>

                        <AppTableActionButton
                            label="Download PDF"
                            tone="documents"
                            onPress={() => downloadPdf(row.original)}
                        >
                            <Download size={15} />
                        </AppTableActionButton>

                        <AppTableActionButton
                            label="Mark paid"
                            tone="create"
                            onPress={() => markPaid(row.original)}
                        >
                            <CheckCircle2 size={15} />
                        </AppTableActionButton>

                        <AppTableActionButton
                            label="Delete"
                            tone="delete"
                            onPress={() => setDeleteTarget(row.original)}
                        >
                            <Trash2 size={15} />
                        </AppTableActionButton>
                    </AppTableActions>
                ),
            },
        ],
        [],
    );

    const collectionRate = metrics.totalTtc > 0
        ? Math.round((metrics.paid / metrics.totalTtc) * 100)
        : 0;

    const metricCards = [
        {
            label: 'Total TTC',
            value: formatMoney(metrics.totalTtc),
        },
        {
            label: 'Paid',
            value: formatMoney(metrics.paid),
        },
        {
            label: 'Remaining',
            value: formatMoney(metrics.remaining),
        },
        {
            label: 'Overdue',
            value: formatMoney(metrics.overdue),
        },
    ];

    return (
        <>
            <Head title="Finance" />

            <AppShell
                eyebrowKey="finance.eyebrow"
                titleKey="finance.title"
                subtitleKey="finance.subtitle"
                action={
                    <AppButton variant="primary" onPress={openCreateDrawer}>
                        <Plus size={16} />
                        New finance record
                    </AppButton>
                }
            >
                <section className="grid gap-5 xl:grid-cols-2">
                    <AppFilterBar
                        label="Finance type"
                        value={typeFilter}
                        options={typeOptions}
                        onChange={setTypeFilter}
                    />

                    <AppFilterBar
                        label="Payment status"
                        value={statusFilter}
                        options={statusOptions}
                        onChange={setStatusFilter}
                    />
                </section>
                <section className="grid min-w-0 gap-5 md:grid-cols-2 xl:grid-cols-4">
                    {metricCards.map((metric) => (
                        <AppCard key={metric.label} className="p-4">
                            <p className="text-sm text-[var(--text-muted)]">{metric.label}</p>
                            <p className="mt-3 truncate text-2xl font-semibold">{metric.value}</p>
                        </AppCard>
                    ))}
                </section>

                <AppCard className="p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-sm font-semibold">Collection rate</p>
                            <p className="mt-1 text-sm text-[var(--text-muted)]">
                                Paid amount compared to total TTC.
                            </p>
                        </div>

                        <div className="w-full md:max-w-sm">
                            <div className="mb-2 flex items-center justify-between text-sm">
                                <span>{collectionRate}% collected</span>
                                <span className="text-[var(--text-muted)]">
                                    {metrics.totalRecords} records
                                </span>
                            </div>
                            <MiniBar value={collectionRate} />
                        </div>
                    </div>
                </AppCard>

                <section className="grid min-w-0 gap-5 2xl:grid-cols-[minmax(0,1fr)_340px]">
                    <div className="min-w-0">
                        <AppDataTable
                            data={filteredFinanceRecords}
                            columns={columns}
                            searchPlaceholder="Search by record, project, client, type, status, or amount..."
                            emptyTitle="No finance records found"
                            emptyDescription="Create the first devis, invoice, or payment."
                            pageSize={8}
                        />
                    </div>

                    <aside className="min-w-0 space-y-5 2xl:sticky 2xl:top-24 2xl:self-start">
                        <AppCard className="p-5">
                            <div className="mb-4 flex items-start gap-3">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)]">
                                    <BadgeDollarSign size={18} />
                                </div>

                                <div className="min-w-0">
                                    <h2 className="text-sm font-semibold">Finance preview</h2>
                                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                                        Selected finance record information.
                                    </p>
                                </div>
                            </div>

                            {selectedRecord ? (
                                <div className="space-y-3">
                                    <div className="rounded-2xl border bg-[var(--surface)] p-4">
                                        <p className="text-xs text-[var(--text-muted)]">Record</p>
                                        <p className="mt-1 text-sm font-semibold">
                                            {selectedRecord.recordNumber}
                                        </p>
                                        <p className="mt-1 text-xs text-[var(--text-muted)]">
                                            {selectedRecord.dossierNumber} Â· {selectedRecord.clientName}
                                        </p>
                                    </div>

                                    <div className="grid gap-2">
                                        <div className="rounded-2xl border bg-[var(--surface)] p-4">
                                            <p className="text-xs text-[var(--text-muted)]">Total TTC</p>
                                            <p className="mt-1 text-sm font-semibold">
                                                {formatMoney(selectedRecord.totalTtc)}
                                            </p>
                                        </div>

                                        <div className="rounded-2xl border bg-[var(--surface)] p-4">
                                            <p className="text-xs text-[var(--text-muted)]">Paid</p>
                                            <p className="mt-1 text-sm font-semibold">
                                                {formatMoney(selectedRecord.paid)}
                                            </p>
                                        </div>

                                        <div className="rounded-2xl border bg-[var(--surface)] p-4">
                                            <p className="text-xs text-[var(--text-muted)]">Remaining</p>
                                            <p className="mt-1 text-sm font-semibold">
                                                {formatMoney(selectedRecord.remaining)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <AppStatusBadge
                                            label={selectedRecord.status}
                                            tone={getStatusTone(selectedRecord.status)}
                                            icon={getStatusIcon(selectedRecord.status)}
                                        />
                                        <AppBadge tone={getTypeTone(selectedRecord.type)}>
                                            {selectedRecord.type}
                                        </AppBadge>
                                    </div>

                                    <div className="space-y-2">
                                        <AppButton
                                            variant="primary"
                                            onPress={() => generateRecord(selectedRecord)}
                                        >
                                            <WandSparkles size={16} />
                                            Generate
                                        </AppButton>

                                        <div className="grid grid-cols-2 gap-2">
                                            <AppButton
                                                variant="secondary"
                                                onPress={() => downloadRecord(selectedRecord)}
                                            >
                                                <FileSpreadsheet size={16} />
                                                Excel
                                            </AppButton>

                                            <AppButton
                                                variant="secondary"
                                                onPress={() => exportPdf(selectedRecord)}
                                            >
                                                <FileText size={16} />
                                                PDF
                                            </AppButton>
                                        </div>

                                        {selectedRecord.hasPdf && (
                                            <AppButton
                                                variant="secondary"
                                                onPress={() => downloadPdf(selectedRecord)}
                                            >
                                                <Download size={16} />
                                                Download PDF
                                            </AppButton>
                                        )}

                                        <AppButton
                                            variant="secondary"
                                            onPress={() => markPaid(selectedRecord)}
                                        >
                                            <CheckCircle2 size={16} />
                                            Mark paid
                                        </AppButton>
                                    </div>

                                    <div className="rounded-2xl border bg-[var(--surface)] p-4">
                                        <p className="text-xs text-[var(--text-muted)]">Notes</p>
                                        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[var(--text-muted)]">
                                            {selectedRecord.notes || 'No notes.'}
                                        </p>
                                    </div>

                                    {selectedRecord.generatedAt && (
                                        <div className="rounded-2xl border bg-[var(--surface)] p-4">
                                            <p className="text-xs text-[var(--text-muted)]">Generated at</p>
                                            <p className="mt-1 text-sm">
                                                {selectedRecord.generatedAt}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-[var(--text-muted)]">
                                    Select a finance record from the table.
                                </p>
                            )}
                        </AppCard>
                    </aside>
                </section>

                <FinanceDrawer
                    isOpen={drawerOpen}
                    mode={drawerMode}
                    record={selectedRecord}
                    dossiers={dossiers}
                    onOpenChange={setDrawerOpen}
                    onSubmit={handleSubmit}
                    errors={formErrors}
                />

                <AppModal
                    isOpen={!!deleteTarget}
                    onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
                    title="Delete record?"
                    size="sm"
                >
                    <p className="mb-5 text-sm text-[var(--text-muted)]">
                        Are you sure you want to delete <strong>{deleteTarget?.recordNumber}</strong>?
                        This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-2">
                        <AppButton variant="secondary" onPress={() => setDeleteTarget(null)}>Cancel</AppButton>
                        <AppButton variant="danger" onPress={confirmDelete}>Delete</AppButton>
                    </div>
                </AppModal>
            </AppShell>
        </>
    );
}

```


## FILE: resources\js\pages\Users\Index.tsx
```
MISSING
```


# FEATURE COMPONENTS



## DIR: resources\js\features\projects
```
MISSING
```


## FILE: resources\js\features\tasks\components\TaskBoard.tsx
```
import { Plus } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import type { TaskRow, TaskStatus } from '@/features/tasks/types';
import { BOARD_COLUMNS, STATUS_DOT_COLORS, STATUS_LABELS } from '@/features/tasks/types';
import { TaskCard } from '@/features/tasks/components/TaskCard';

type Props = {
    columns: Record<string, TaskRow[]>;
    onTaskClick: (task: TaskRow) => void;
    onCreateInStatus?: (status: string) => void;
    onStatusChange?: (task: TaskRow, status: string) => void;
};

export function TaskBoard({ columns, onTaskClick, onCreateInStatus, onStatusChange }: Props) {
    const [dragOverCol, setDragOverCol] = useState<string | null>(null);
    const [dragTaskId, setDragTaskId] = useState<number | null>(null);
    const dragTimeout = useRef<ReturnType<typeof setTimeout>>();

    const handleDragStart = useCallback((e: React.DragEvent, task: TaskRow) => {
        e.dataTransfer.setData('text/plain', JSON.stringify({ id: task.id, fromStatus: task.status }));
        e.dataTransfer.effectAllowed = 'move';
        setDragTaskId(task.id);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent, status: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (dragTimeout.current) clearTimeout(dragTimeout.current);
        setDragOverCol(status);
    }, []);

    const handleDragLeave = useCallback(() => {
        dragTimeout.current = setTimeout(() => setDragOverCol(null), 100);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent, targetStatus: string) => {
        e.preventDefault();
        setDragOverCol(null);
        setDragTaskId(null);
        try {
            const data = JSON.parse(e.dataTransfer.getData('text/plain'));
            if (data.fromStatus !== targetStatus && onStatusChange) {
                const task = columns[data.fromStatus]?.find((t: TaskRow) => t.id === data.id);
                if (task) onStatusChange(task, targetStatus);
            }
        } catch { /* ignore parse errors */ }
    }, [columns, onStatusChange]);

    return (
        <section className="overflow-x-auto pb-2">
            <div className="flex gap-4" style={{ minWidth: BOARD_COLUMNS.length * 280 }}>
                {BOARD_COLUMNS.map((status) => {
                    const tasks = columns[status] || [];
                    const isOver = dragOverCol === status;
                    return (
                        <div key={status}
                            onDragOver={(e) => handleDragOver(e, status)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, status)}
                            className={`flex w-[280px] shrink-0 flex-col rounded-xl border-2 transition-colors ${
                                isOver ? 'border-[var(--crm-gold)]/50 bg-[var(--crm-gold)]/5' : 'border-transparent'
                            }`}>
                            <div className="sticky top-0 z-10 mb-2 flex items-center justify-between rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] px-3 py-2.5 shadow-sm">
                                <div className="flex items-center gap-2">
                                    <span className={`size-2.5 rounded-full ${STATUS_DOT_COLORS[status]}`} />
                                    <span className="text-xs font-semibold text-[var(--crm-text)]">{STATUS_LABELS[status]}</span>
                                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-md bg-[var(--crm-surface-3)] px-1.5 text-[10px] font-bold text-[var(--crm-text-muted)]">{tasks.length}</span>
                                </div>
                                {onCreateInStatus ? (
                                    <button type="button" onClick={() => onCreateInStatus(status)}
                                        className="flex size-6 items-center justify-center rounded-md text-[var(--crm-text-muted)] transition hover:bg-[var(--crm-surface)] hover:text-[var(--crm-gold)]">
                                        <Plus size={14} />
                                    </button>
                                ) : null}
                            </div>
                            <div className="flex flex-col gap-2 overflow-y-auto px-0.5" style={{ maxHeight: 'calc(100vh - 280px)' }}>
                                {tasks.map((task) => (
                                    <div key={task.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, task)}
                                        className={`rounded-xl transition-opacity ${dragTaskId === task.id ? 'opacity-40' : ''}`}>
                                        <TaskCard task={task} onClick={() => onTaskClick(task)} />
                                    </div>
                                ))}
                                {tasks.length === 0 && (
                                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--crm-border)] bg-[var(--crm-surface)]/30 px-4 py-8 text-center">
                                        <span className="text-[11px] text-[var(--crm-text-muted)]">No tasks</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

```


## FILE: resources\js\features\tasks\components\TaskCalendar.tsx
```
import type { TaskRow } from '@/features/tasks/types';
import { PRIORITY_COLORS, PRIORITY_LABELS, STATUS_DOT_COLORS, STATUS_LABELS } from '@/features/tasks/types';

type Props = {
    tasks: TaskRow[];
    onTaskClick: (task: TaskRow) => void;
};

export function TaskCalendar({ tasks, onTaskClick }: Props) {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const weekEnd = new Date(now); weekEnd.setDate(now.getDate() + (7 - now.getDay()));
    const weekEndStr = weekEnd.toISOString().slice(0, 10);

    const groups: { label: string; tasks: TaskRow[]; accent: string }[] = [
        { label: 'Overdue', tasks: [], accent: 'text-red-400' },
        { label: 'Today', tasks: [], accent: 'text-[var(--crm-gold)]' },
        { label: 'This week', tasks: [], accent: 'text-blue-400' },
        { label: 'Upcoming', tasks: [], accent: 'text-emerald-400' },
        { label: 'No date', tasks: [], accent: 'text-zinc-400' },
    ];

    for (const t of tasks) {
        if (!t.dueDate) { groups[4].tasks.push(t); continue; }
        if (t.dueDate < today && t.status !== 'completed' && t.status !== 'cancelled') { groups[0].tasks.push(t); continue; }
        if (t.dueDate === today) { groups[1].tasks.push(t); continue; }
        if (t.dueDate <= weekEndStr) { groups[2].tasks.push(t); continue; }
        groups[3].tasks.push(t);
    }

    const nonEmpty = groups.filter((g) => g.tasks.length > 0);

    if (nonEmpty.length === 0) {
        return (
            <div className="flex items-center justify-center rounded-xl border border-dashed border-[var(--crm-border)] bg-[var(--crm-elevated)] py-16">
                <p className="text-sm text-[var(--crm-text-muted)]">No tasks to show.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {nonEmpty.map((group) => (
                <div key={group.label} className="rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] p-3">
                    <div className="mb-2 flex items-center gap-2">
                        <span className={`text-xs font-bold uppercase tracking-[0.1em] ${group.accent}`}>{group.label}</span>
                        <span className="text-[10px] text-[var(--crm-text-muted)]">({group.tasks.length})</span>
                    </div>
                    <div className="space-y-1">
                        {group.tasks.map((t) => (
                            <button key={t.id} type="button" onClick={() => onTaskClick(t)}
                                className="flex w-full items-center gap-2 rounded-lg border border-transparent px-2.5 py-2 text-left transition hover:border-[var(--crm-border)] hover:bg-[var(--crm-surface)]">
                                <span className={`size-2 shrink-0 rounded-full ${STATUS_DOT_COLORS[t.status]}`} />
                                <span className="min-w-0 flex-1 truncate text-xs font-semibold text-[var(--crm-text)]">{t.title}</span>
                                <span className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[9px] font-semibold ${PRIORITY_COLORS[t.priority]}`}>{PRIORITY_LABELS[t.priority]}</span>
                                {t.dueDate ? <span className={`whitespace-nowrap text-[10px] ${group.label === 'Overdue' ? 'font-semibold text-red-400' : 'text-[var(--crm-text-muted)]'}`}>{t.dueDate}</span> : null}
                                {Array.isArray(t.assignees) && t.assignees.length > 0 ? (
                                    <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-[var(--crm-gold)] text-[7px] font-bold text-black">{t.assignees[0].name.charAt(0)}</span>
                                ) : null}
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

```


## FILE: resources\js\features\tasks\components\TaskCard.tsx
```
import { AlertTriangle, CalendarDays, CheckCircle2, CheckSquare, Link2, MessageSquare, MoreHorizontal, Paperclip } from 'lucide-react';
import { useState } from 'react';
import type { TaskRow, TaskStatus } from '@/features/tasks/types';
import {
    CATEGORY_COLORS, CATEGORY_LABELS, COLUMNS, IMPACT_COLORS, IMPACT_LABELS, PRIORITY_COLORS, PRIORITY_LABELS, STATUS_COLORS, STATUS_DOT_COLORS, STATUS_LABELS, TYPE_LABELS,
} from '@/features/tasks/types';
import { router } from '@inertiajs/react';

export function TaskCard({ task, onClick }: { task: TaskRow; onClick: () => void }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const isCompleted = task.status === 'completed';
    const isCancelled = task.status === 'cancelled';
    const isSoft = isCompleted || isCancelled;
    const overdue = task.dueDate && new Date(task.dueDate) < new Date() && !isCompleted && !isCancelled;
    const categoryClass = CATEGORY_COLORS[task.category] || CATEGORY_COLORS.general_admin;
    const checklistItems = Array.isArray(task.checklistItems) ? task.checklistItems : [];
    const checklistTotal = checklistItems.length;
    const checklistDone = checklistItems.filter((item) => item.isDone).length;
    const linkedRecord = task.dossier?.object || task.client?.name || null;

    return (
        <div className={`group relative rounded-xl border ${isSoft ? 'border-[var(--crm-border)] bg-[var(--crm-surface)]/50 opacity-60' : 'border-[var(--crm-border)] bg-[var(--crm-surface)] hover:border-[var(--crm-gold)]/40 hover:bg-[var(--crm-elevated)]'} transition-all`}>
            <button type="button" onClick={onClick} className="w-full p-3 text-left">
                <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${STATUS_COLORS[task.status]}`}>
                            <span className={`size-1.5 rounded-full ${STATUS_DOT_COLORS[task.status]}`} />
                            {STATUS_LABELS[task.status]}
                        </span>
                        <span className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[9px] font-semibold ${PRIORITY_COLORS[task.priority] || ''}`}>
                            {PRIORITY_LABELS[task.priority] || task.priority}
                        </span>
                    </div>
                    <div className="relative shrink-0">
                        <button type="button" onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
                            className="flex size-6 items-center justify-center rounded-md text-[var(--crm-text-muted)] opacity-0 transition group-hover:opacity-100 hover:bg-[var(--crm-surface-3)]">
                            <MoreHorizontal size={14} />
                        </button>
                        {menuOpen ? (
                            <div className="absolute right-0 top-7 z-50 w-44 overflow-hidden rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] p-1 shadow-2xl shadow-black/40"
                                onMouseLeave={() => setMenuOpen(false)}>
                                {COLUMNS.filter((s) => s !== task.status).map((status) => (
                                    <button key={status} type="button"
                                        onClick={(e) => { e.stopPropagation(); setMenuOpen(false); router.put(`/tasks/${task.id}/status`, { status }, { preserveScroll: true, preserveState: true }); }}
                                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-[var(--crm-text)] transition hover:bg-[var(--crm-surface)]">
                                        <span className={`size-2 rounded-full ${STATUS_DOT_COLORS[status]}`} />
                                        {STATUS_LABELS[status as TaskStatus]}
                                    </button>
                                ))}
                            </div>
                        ) : null}
                    </div>
                </div>

                <p className={`line-clamp-2 text-[13px] font-semibold leading-5 ${isSoft ? 'text-[var(--crm-text-muted)]' : 'text-[var(--crm-text)]'}`}>{task.title}</p>

                {task.description ? (
                    <p className="mt-1 line-clamp-1 text-[11px] text-[var(--crm-text-muted)]">{task.description}</p>
                ) : null}

                {linkedRecord ? (
                    <div className="mt-1.5 inline-flex items-center gap-1 rounded bg-black/10 px-1.5 py-0.5 text-[10px] text-[var(--crm-muted)]">
                        <Link2 size={10} />
                        <span className="truncate max-w-[140px]">{linkedRecord}</span>
                    </div>
                ) : null}

                <div className="mt-2 flex items-center justify-between gap-2">
                    <div className="flex -space-x-1">
                        {Array.isArray(task.assignees) ? task.assignees.slice(0, 3).map((a) => (
                            <div key={a.id} className="flex size-5 items-center justify-center rounded-full border-2 border-[var(--crm-surface)] bg-[var(--crm-gold)] text-[7px] font-bold text-black" title={a.name}>
                                {a.name.charAt(0).toUpperCase()}
                            </div>
                        )) : null}
                        {Array.isArray(task.assignees) && task.assignees.length > 3 ? (
                            <div className="flex size-5 items-center justify-center rounded-full border-2 border-[var(--crm-surface)] bg-[var(--crm-surface-2)] text-[7px] text-[var(--crm-text-muted-dark)]">
                                +{task.assignees.length - 3}
                            </div>
                        ) : null}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-[var(--crm-text-muted)]">
                        {task.dueDate ? (
                            <span className={`inline-flex items-center gap-1 ${overdue ? 'font-semibold text-red-400' : ''}`}>
                                <CalendarDays size={11} />
                                {task.dueDate}
                            </span>
                        ) : null}
                        {checklistTotal > 0 ? <span className="inline-flex items-center gap-1"><CheckSquare size={11} />{checklistDone}/{checklistTotal}</span> : null}
                        {task.commentsCount > 0 ? <span className="inline-flex items-center gap-1"><MessageSquare size={11} />{task.commentsCount}</span> : null}
                        {task.attachmentsCount > 0 ? <span className="inline-flex items-center gap-1"><Paperclip size={11} />{task.attachmentsCount}</span> : null}
                    </div>
                </div>

                {task.status === 'blocked' && task.blockedReason ? (
                    <div className="mt-2 flex gap-1.5 rounded-lg border border-red-400/15 bg-red-400/5 p-2 text-[10px] leading-4 text-red-200">
                        <AlertTriangle size={11} className="mt-0.5 shrink-0" />
                        <span className="line-clamp-1">{task.blockedReason}</span>
                    </div>
                ) : null}

                {isCompleted ? (
                    <div className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                        <CheckCircle2 size={11} /> Completed
                    </div>
                ) : null}
            </button>

            {(checklistTotal > 0 || task.progress > 0) && !isCompleted ? (
                <div className="h-1 bg-[var(--crm-surface-3)]">
                    <div className={`h-full ${isCancelled ? 'bg-zinc-500' : 'bg-[var(--crm-gold)]'}`} style={{ width: `${task.progress}%`, transition: 'width 0.2s' }} />
                </div>
            ) : null}
        </div>
    );
}

```


## FILE: resources\js\features\tasks\components\TaskCreateDrawer.tsx
```
import { X } from 'lucide-react';
import { FormEvent } from 'react';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppButton } from '@/components/ui/AppButton';
import { AppFormErrorSummary } from '@/components/ui/AppFormErrorSummary';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppTextField } from '@/components/ui/AppTextField';
import { AppTextarea } from '@/components/ui/AppTextarea';
import type { FormErrors } from '@/lib/formErrors';
import { firstError } from '@/lib/formErrors';
import type { TaskCategory, TaskImpact, TaskPriority, TaskType, UserOption } from '@/features/tasks/types';
import { CATEGORY_LABELS, IMPACT_LABELS, PRIORITY_LABELS, STATUS_LABELS, TYPE_LABELS } from '@/features/tasks/types';

type TaskForm = {
    title: string; description: string; status: string;
    priority: string; impact: string; type: string; category: string;
    start_date: string; due_date: string; estimated_minutes: string; blocked_reason: string;
    assignee_ids: number[]; watcher_ids: number[];
};

type Props = {
    isOpen: boolean;
    users: UserOption[];
    form: TaskForm;
    formErrors: FormErrors;
    onOpenChange: (o: boolean) => void;
    onFormChange: (f: TaskForm) => void;
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
};

export function TaskCreateDrawer({ isOpen, users, form, formErrors, onOpenChange, onFormChange, onSubmit }: Props) {
    return (
        <AppDrawer isOpen={isOpen} onOpenChange={onOpenChange}
            title="Create task" description="Fill in the details below to create a new task."
            footer={<><AppButton variant="secondary" onPress={() => onOpenChange(false)}>Cancel</AppButton><AppButton variant="primary" type="submit" form="create-task-form">Create task</AppButton></>}>
            <form id="create-task-form" className="space-y-5" onSubmit={onSubmit}>
                <AppFormErrorSummary errors={formErrors} />

                {/* Main */}
                <div>
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--crm-muted)]">Main</p>
                    <div className="space-y-4">
                        <AppTextField label="Title" placeholder="Enter task title" value={form.title} onChange={(v) => onFormChange({ ...form, title: v })} error={firstError(formErrors, 'title')} />
                        <AppTextarea label="Description" placeholder="Describe the task..." value={form.description} onChange={(v) => onFormChange({ ...form, description: v })} />
                        <div className="grid grid-cols-2 gap-4">
                            <AppSelect label="Type" placeholder="Select" selectedKey={form.type} onSelectionChange={(v) => onFormChange({ ...form, type: v ? String(v) : 'general' })}
                                options={(['general', 'missing_document', 'client_follow_up', 'contract', 'authorization', 'finance', 'archive', 'review', 'internal_admin'] as TaskType[]).map((k) => ({ id: k, label: TYPE_LABELS[k] }))} />
                            <AppSelect label="Category" placeholder="Select" selectedKey={form.category} onSelectionChange={(v) => onFormChange({ ...form, category: v ? String(v) : 'general_admin' })}
                                options={(['documents', 'client_follow_up', 'contract', 'authorization', 'finance', 'archive', 'general_admin'] as TaskCategory[]).map((k) => ({ id: k, label: CATEGORY_LABELS[k] }))} />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <AppSelect label="Status" placeholder="Select" selectedKey={form.status} onSelectionChange={(v) => onFormChange({ ...form, status: v ? String(v) : 'not_started' })}
                                options={['not_started', 'in_progress', 'waiting_client', 'waiting_admin', 'blocked', 'in_review'].map((k) => ({ id: k, label: STATUS_LABELS[k as keyof typeof STATUS_LABELS] }))} />
                            <AppSelect label="Priority" placeholder="Select" selectedKey={form.priority} onSelectionChange={(v) => onFormChange({ ...form, priority: v ? String(v) : 'medium' })}
                                options={(['low', 'medium', 'high', 'urgent'] as TaskPriority[]).map((k) => ({ id: k, label: PRIORITY_LABELS[k] }))} />
                            <AppSelect label="Impact" placeholder="Select" selectedKey={form.impact} onSelectionChange={(v) => onFormChange({ ...form, impact: v ? String(v) : 'normal' })}
                                options={(['low', 'normal', 'high', 'critical'] as TaskImpact[]).map((k) => ({ id: k, label: IMPACT_LABELS[k] }))} />
                        </div>
                    </div>
                </div>

                {/* People */}
                <div>
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--crm-muted)]">People</p>
                    <div className="space-y-3">
                        <div>
                            <AppSelect label="Assignees" placeholder="Add assignee..." selectedKey={null} onSelectionChange={(v) => {
                                if (v && !form.assignee_ids.includes(Number(v))) onFormChange({ ...form, assignee_ids: [...form.assignee_ids, Number(v)] });
                            }} options={users.map((u) => ({ id: String(u.id), label: u.name }))} />
                            {form.assignee_ids.length > 0 ? (
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                    {form.assignee_ids.map((id) => {
                                        const u = users.find((x) => x.id === id);
                                        return u ? (
                                            <span key={id} className="inline-flex items-center gap-1 rounded-full border border-[var(--crm-border)] bg-[var(--crm-elevated)] px-2 py-0.5 text-xs">
                                                <span className="flex size-4 items-center justify-center rounded-full bg-[var(--crm-gold)] text-[7px] font-bold text-black">{u.name.charAt(0)}</span>
                                                {u.name}
                                                <button type="button" onClick={() => onFormChange({ ...form, assignee_ids: form.assignee_ids.filter((x) => x !== id) })} className="text-[var(--crm-muted)] hover:text-red-400"><X size={12} /></button>
                                            </span>
                                        ) : null;
                                    })}
                                </div>
                            ) : null}
                        </div>
                        <div>
                            <AppSelect label="Watchers" placeholder="Add watcher..." selectedKey={null} onSelectionChange={(v) => {
                                if (v && !form.watcher_ids.includes(Number(v))) onFormChange({ ...form, watcher_ids: [...form.watcher_ids, Number(v)] });
                            }} options={users.filter((u) => !form.assignee_ids.includes(u.id)).map((u) => ({ id: String(u.id), label: u.name }))} />
                            {form.watcher_ids.length > 0 ? (
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                    {form.watcher_ids.map((id) => {
                                        const u = users.find((x) => x.id === id);
                                        return u ? (
                                            <span key={id} className="inline-flex items-center gap-1 rounded-full border border-[var(--crm-border)] bg-[var(--crm-elevated)] px-2 py-0.5 text-xs text-[var(--crm-text-muted)]">
                                                {u.name}
                                                <button type="button" onClick={() => onFormChange({ ...form, watcher_ids: form.watcher_ids.filter((x) => x !== id) })} className="text-[var(--crm-muted)] hover:text-red-400"><X size={12} /></button>
                                            </span>
                                        ) : null;
                                    })}
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>

                {/* Dates */}
                <div>
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--crm-muted)]">Dates</p>
                    <div className="grid grid-cols-2 gap-4">
                        <AppTextField label="Start date" type="date" value={form.start_date} onChange={(v) => onFormChange({ ...form, start_date: v })} />
                        <AppTextField label="Due date" type="date" value={form.due_date} onChange={(v) => onFormChange({ ...form, due_date: v })} />
                    </div>
                </div>

                {/* More */}
                <div>
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--crm-muted)]">More</p>
                    <div className="space-y-4">
                        <AppTextField label="Estimated minutes" type="number" value={form.estimated_minutes} onChange={(v) => onFormChange({ ...form, estimated_minutes: v })} placeholder="e.g. 120" />
                        {form.status === 'blocked' ? (
                            <AppTextarea label="Blocked reason" placeholder="Why is this task blocked?" value={form.blocked_reason} onChange={(v) => onFormChange({ ...form, blocked_reason: v })} />
                        ) : null}
                    </div>
                </div>
            </form>
        </AppDrawer>
    );
}

```


## FILE: resources\js\features\tasks\components\TaskDetailDrawer.tsx
```
import { CalendarDays, CheckCircle2, CheckSquare, Clock3, ExternalLink, FileText, MessageSquare, Notebook, Paperclip, Plus, StickyNote, X, User, ArrowRight, Circle, Edit3, ListChecks, MessageCircle, Paperclip as PaperclipIcon } from 'lucide-react';
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppButton } from '@/components/ui/AppButton';
import type { TaskActivityLogRow, TaskRow } from '@/features/tasks/types';
import {
    CATEGORY_COLORS, CATEGORY_LABELS, IMPACT_COLORS, IMPACT_LABELS, PRIORITY_COLORS, PRIORITY_LABELS,
    STATUS_COLORS, STATUS_DOT_COLORS, STATUS_LABELS, TYPE_LABELS,
} from '@/features/tasks/types';

type Props = {
    task: TaskRow | null;
    onClose: () => void;
    onComplete: (task: TaskRow) => void;
    onChecklistToggle: (taskId: number, itemId: number) => void;
    onChecklistAdd: (taskId: number, label: string) => void;
    onCommentAdd: (taskId: number, body: string) => void;
    onAttachmentUpload: (taskId: number, file: File) => void;
};

type TabId = 'overview' | 'checklist' | 'comments' | 'files' | 'activity';

const TABS: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'checklist', label: 'Checklist' },
    { id: 'comments', label: 'Comments' },
    { id: 'files', label: 'Files' },
    { id: 'activity', label: 'Activity' },
];

function Badge({ children, className }: { children: React.ReactNode; className: string }) {
    return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${className}`}>{children}</span>;
}

export function TaskDetailDrawer({ task, onClose, onComplete, onChecklistToggle, onChecklistAdd, onCommentAdd, onAttachmentUpload }: Props) {
    const [tab, setTab] = useState<TabId>('overview');
    const [checklistLabel, setChecklistLabel] = useState('');
    const [commentBody, setCommentBody] = useState('');
    const [noteBody, setNoteBody] = useState('');
    const [attachment, setAttachment] = useState<File | null>(null);
    const [showNote, setShowNote] = useState(false);
    const [fetchedTask, setFetchedTask] = useState<TaskRow | null>(null);

    useEffect(() => {
        if (!task) { setFetchedTask(null); return; }
        fetch(`/tasks/${task.id}/detail`, {
            headers: { Accept: 'application/json' },
        })
            .then((r) => r.json())
            .then((data) => setFetchedTask(data))
            .catch(() => setFetchedTask(task));
    }, [task]);

    useEffect(() => {
        setTab('overview');
        setChecklistLabel('');
        setCommentBody('');
        setNoteBody('');
        setAttachment(null);
        setShowNote(false);
    }, [task?.id]);

    const links = useMemo(() => {
        if (!task) return [];
        return [
            task.client ? { label: `Client: ${task.client.name}`, href: `/clients/${task.client.id}` } : null,
            task.dossier ? { label: `Dossier: ${task.dossier.number}`, href: `/dossiers/${task.dossier.id}` } : null,
            task.conversationId ? { label: 'Conversation', href: '/inbox' } : null,
        ].filter(Boolean) as { label: string; href: string }[];
    }, [task]);

    const checklistItems = Array.isArray(task?.checklistItems) ? task.checklistItems : [];
    const doneCount = checklistItems.filter((i) => i.isDone).length;
    const isComplete = task?.status === 'completed' || task?.status === 'cancelled';

    if (!task) return null;

    const submitChecklist = (e: FormEvent) => { e.preventDefault(); if (!checklistLabel.trim()) return; onChecklistAdd(task.id, checklistLabel.trim()); setChecklistLabel(''); };
    const submitComment = (e: FormEvent) => { e.preventDefault(); if (!commentBody.trim()) return; onCommentAdd(task.id, commentBody.trim()); setCommentBody(''); };
    const submitNote = (e: FormEvent) => { e.preventDefault(); if (!noteBody.trim()) return; onCommentAdd(task.id, noteBody.trim()); setNoteBody(''); };
    const submitAttachment = (e: FormEvent) => { e.preventDefault(); if (!attachment) return; onAttachmentUpload(task.id, attachment); setAttachment(null); };

    return (
        <AppDrawer isOpen={!!task} onOpenChange={(o) => { if (!o) onClose(); }} size="lg"
            title={
                <div className="flex items-center gap-3 min-w-0">
                    <div>
                        <p className="text-sm font-bold text-[var(--crm-text)]">{task.title}</p>
                        <p className="text-[10px] text-[var(--crm-muted)]">{task.taskNumber}</p>
                    </div>
                </div>
            }
            footer={
                <div className="flex items-center gap-2">
                    <AppButton variant="secondary" onPress={onClose}>Close</AppButton>
                    {!isComplete ? (
                        <AppButton variant="primary" onPress={() => onComplete(task)}>
                            <CheckCircle2 size={14} /> Mark complete
                        </AppButton>
                    ) : null}
                </div>
            }>
            {/* Mini header */}
            <div className="mb-4 flex flex-wrap items-center gap-1.5">
                <Badge className={STATUS_COLORS[task.status]}>{STATUS_LABELS[task.status]}</Badge>
                <Badge className={PRIORITY_COLORS[task.priority]}>{PRIORITY_LABELS[task.priority]}</Badge>
                <Badge className={CATEGORY_COLORS[task.category]}>{CATEGORY_LABELS[task.category]}</Badge>
            </div>

            {/* Tabs */}
            <div className="mb-4 flex gap-1 border-b border-[var(--crm-border)]">
                {TABS.map((t) => (
                    <button key={t.id} type="button" onClick={() => setTab(t.id)}
                        className={`border-b-2 px-3 py-2 text-xs font-semibold transition ${tab === t.id ? 'border-[var(--crm-gold)] text-[var(--crm-gold)]' : 'border-transparent text-[var(--crm-text-muted)] hover:text-[var(--crm-text)]'}`}>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            {tab === 'overview' ? <OverviewTab task={task} links={links} /> : null}
            {tab === 'checklist' ? (
                <ChecklistTab task={task} checklistItems={checklistItems} doneCount={doneCount} isComplete={isComplete}
                    onToggle={(id) => onChecklistToggle(task.id, id)} onAdd={submitChecklist}
                    label={checklistLabel} onLabelChange={setChecklistLabel} />
            ) : null}
            {tab === 'comments' ? (
                <CommentsTab task={fetchedTask || task} commentBody={commentBody} noteBody={noteBody} showNote={showNote}
                    onCommentChange={setCommentBody} onNoteChange={setNoteBody}
                    onSubmitComment={submitComment} onSubmitNote={submitNote}
                    onToggleNote={() => setShowNote(!showNote)} />
            ) : null}
            {tab === 'files' ? (
                <FilesTab task={fetchedTask || task} attachment={attachment} onAttachmentChange={setAttachment} onSubmit={submitAttachment} />
            ) : null}
            {tab === 'activity' ? <ActivityTab task={fetchedTask || task} /> : null}
        </AppDrawer>
    );
}

function OverviewTab({ task, links }: { task: TaskRow; links: { label: string; href: string }[] }) {
    const row = (label: string, val: string | number | null) => val ? (
        <div className="rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface)] px-3 py-2">
            <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--crm-muted)]">{label}</p>
            <p className="mt-0.5 text-sm font-semibold text-[var(--crm-text)]">{val}</p>
        </div>
    ) : null;

    return (
        <div className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-2">
                {row('Type', TYPE_LABELS[task.type])}
                {row('Impact', IMPACT_LABELS[task.impact])}
                {row('Status', STATUS_LABELS[task.status])}
                {row('Progress', `${task.progress}%`)}
                {row('Start date', task.startDate)}
                {row('Due date', task.dueDate + (task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed' && task.status !== 'cancelled' ? ' (Overdue)' : ''))}
                {row('Estimated', task.estimatedMinutes ? `${task.estimatedMinutes} min` : null)}
                {row('Actual', task.actualMinutes ? `${task.actualMinutes} min` : null)}
            </div>

            {task.description ? (
                <div className="rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface)] px-3 py-2">
                    <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--crm-muted)]">Description</p>
                    <p className="mt-0.5 text-sm text-[var(--crm-text)]">{task.description}</p>
                </div>
            ) : null}

            {/* People */}
            <div className="rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] p-3">
                <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--crm-muted)]">People</p>
                <div className="flex flex-wrap gap-2">
                    {Array.isArray(task.assignees) && task.assignees.map((a) => (
                        <span key={a.id} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--crm-border)] bg-[var(--crm-surface)] px-2.5 py-1 text-xs font-semibold">
                            <span className="flex size-5 items-center justify-center rounded-full bg-[var(--crm-gold)] text-[8px] font-bold text-black">{a.name.charAt(0)}</span>
                            {a.name}
                        </span>
                    ))}
                    {Array.isArray(task.watchers) && task.watchers.map((w) => (
                        <span key={w.id} className="inline-flex items-center gap-1 rounded-full border border-[var(--crm-border)] px-2.5 py-1 text-[10px] text-[var(--crm-text-muted)]">Watching: {w.name}</span>
                    ))}
                    {(!Array.isArray(task.assignees) || task.assignees.length === 0) && (!Array.isArray(task.watchers) || task.watchers.length === 0) ? (
                        <span className="text-xs text-[var(--crm-text-muted)]">No people assigned.</span>
                    ) : null}
                </div>
            </div>

            {/* Linked records */}
            {links.length > 0 ? (
                <div className="rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] p-3">
                    <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--crm-muted)]">Linked records</p>
                    <div className="flex flex-wrap gap-1.5">
                        {links.map((link) => (
                            <button key={link.href} type="button" onClick={() => router.visit(link.href)}
                                className="inline-flex items-center gap-1 rounded-lg border border-[var(--crm-border)] px-2.5 py-1.5 text-xs font-semibold text-[var(--crm-text)] transition hover:border-[var(--crm-gold)] hover:text-[var(--crm-gold)]">
                                <ExternalLink size={12} /> {link.label}
                            </button>
                        ))}
                    </div>
                </div>
            ) : null}

            {/* Quick actions */}
            {task.status !== 'completed' && task.status !== 'cancelled' ? (
                <div className="flex flex-wrap gap-1.5">
                    {[
                        { s: 'in_progress', l: 'Start' },
                        { s: 'waiting_client', l: 'Waiting client' },
                        { s: 'blocked', l: 'Blocked' },
                        { s: 'in_review', l: 'In review' },
                    ].filter((a) => a.s !== task.status).map((action) => (
                        <button key={action.s} type="button" onClick={() => router.put(`/tasks/${task.id}/status`, { status: action.s }, { preserveScroll: true, preserveState: true })}
                            className="inline-flex items-center gap-1 rounded-lg border border-[var(--crm-border)] px-2.5 py-1.5 text-[10px] font-semibold text-[var(--crm-text-muted)] transition hover:border-[var(--crm-gold)] hover:text-[var(--crm-gold)]">
                            {action.l}
                        </button>
                    ))}
                </div>
            ) : null}

            {task.blockedReason ? (
                <div className="rounded-lg border border-red-400/15 bg-red-400/5 px-3 py-2 text-xs text-red-200">
                    <p className="font-semibold">Blocked reason:</p>
                    <p>{task.blockedReason}</p>
                </div>
            ) : null}
        </div>
    );
}

function ChecklistTab({ task, checklistItems, doneCount, isComplete, onToggle, onAdd, label, onLabelChange }: {
    task: TaskRow;
    checklistItems: TaskRow['checklistItems'];
    doneCount: number;
    isComplete: boolean;
    onToggle: (id: number) => void;
    onAdd: (e: FormEvent) => void;
    label: string;
    onLabelChange: (v: string) => void;
}) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-[var(--crm-muted)]">Checklist {doneCount}/{checklistItems.length}</p>
                <span className="text-xs font-semibold text-[var(--crm-text-muted)]">{task.progress}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-[var(--crm-surface-3)]">
                <div className="h-full rounded-full bg-[var(--crm-gold)]" style={{ width: `${task.progress}%` }} />
            </div>
            {checklistItems.length > 0 ? (
                <div className="space-y-1">
                    {checklistItems.map((item) => (
                        <label key={item.id} className="flex items-center gap-2 rounded-lg border border-[var(--crm-border)] px-3 py-2 text-sm transition hover:bg-[var(--crm-surface)]">
                            <input type="checkbox" checked={item.isDone} onChange={() => onToggle(item.id)} className="accent-[var(--crm-gold)]" />
                            <span className={item.isDone ? 'text-[var(--crm-text-muted)] line-through' : 'text-[var(--crm-text)]'}>{item.label}</span>
                        </label>
                    ))}
                </div>
            ) : (
                <p className="rounded-lg border border-dashed border-[var(--crm-border)] px-3 py-3 text-sm text-[var(--crm-text-muted)]">No checklist items yet.</p>
            )}
            {!isComplete ? (
                <form onSubmit={onAdd} className="flex gap-2">
                    <input value={label} onChange={(e) => onLabelChange(e.target.value)} placeholder="Add checklist item"
                        className="min-w-0 flex-1 rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface)] px-3 py-2 text-sm text-[var(--crm-text)] outline-none placeholder:text-[var(--crm-muted)] focus:border-[var(--crm-gold)]" />
                    <AppButton variant="secondary" type="submit"><Plus size={14} /> Add</AppButton>
                </form>
            ) : null}
        </div>
    );
}

function CommentsTab({ task, commentBody, noteBody, showNote, onCommentChange, onNoteChange, onSubmitComment, onSubmitNote, onToggleNote }: {
    task: TaskRow;
    commentBody: string;
    noteBody: string;
    showNote: boolean;
    onCommentChange: (v: string) => void;
    onNoteChange: (v: string) => void;
    onSubmitComment: (e: FormEvent) => void;
    onSubmitNote: (e: FormEvent) => void;
    onToggleNote: () => void;
}) {
    const comments = Array.isArray(task.comments) ? task.comments : [];
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-[var(--crm-muted)]">Comments ({comments.length})</p>
                <button type="button" onClick={onToggleNote}
                    className="inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--crm-muted)] hover:text-[var(--crm-gold)]">
                    <StickyNote size={12} /> {showNote ? 'Write comment' : 'Internal note'}
                </button>
            </div>
            {comments.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {comments.map((c) => (
                        <div key={c.id} className={`rounded-lg border px-3 py-2 ${c.isNote ? 'border-amber-400/15 bg-amber-400/5' : 'border-[var(--crm-border)] bg-[var(--crm-surface)]'}`}>
                            <div className="flex items-center gap-1.5 mb-1">
                                <span className="flex size-5 items-center justify-center rounded-full bg-[var(--crm-gold-soft)] text-[7px] font-bold text-[var(--crm-gold)]">
                                    {c.user?.name?.charAt(0) || '?'}
                                </span>
                                <span className="text-[10px] font-semibold text-[var(--crm-text)]">{c.user?.name || 'Unknown'}</span>
                                {c.isNote ? <span className="rounded bg-amber-400/15 px-1 py-0.5 text-[8px] font-bold text-amber-300">NOTE</span> : null}
                                <span className="ml-auto text-[9px] text-[var(--crm-text-muted)]">{c.createdAt?.slice(0, 10)}</span>
                            </div>
                            <p className="text-xs text-[var(--crm-text)] whitespace-pre-wrap">{c.body}</p>
                        </div>
                    ))}
                </div>
            ) : null}
            {!showNote ? (
                <form onSubmit={onSubmitComment} className="space-y-2">
                    <textarea value={commentBody} onChange={(e) => onCommentChange(e.target.value)} placeholder="Write a comment or @mention someone..." rows={3}
                        className="w-full rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface)] px-3 py-2 text-sm text-[var(--crm-text)] outline-none placeholder:text-[var(--crm-muted)] focus:border-[var(--crm-gold)]" />
                    <AppButton variant="secondary" type="submit"><MessageSquare size={14} /> Add comment</AppButton>
                </form>
            ) : (
                <form onSubmit={onSubmitNote} className="space-y-2">
                    <textarea value={noteBody} onChange={(e) => onNoteChange(e.target.value)} placeholder="Internal note (team only)..." rows={3}
                        className="w-full rounded-lg border border-amber-400/20 bg-[var(--crm-surface)] px-3 py-2 text-sm text-[var(--crm-text)] outline-none placeholder:text-[var(--crm-muted)] focus:border-[var(--crm-gold)]" />
                    <AppButton variant="secondary" type="submit"><Notebook size={14} /> Add note</AppButton>
                </form>
            )}
        </div>
    );
}

function FilesTab({ task, attachment, onAttachmentChange, onSubmit }: {
    task: TaskRow;
    attachment: File | null;
    onAttachmentChange: (f: File | null) => void;
    onSubmit: (e: FormEvent) => void;
}) {
    const attachments = Array.isArray(task.attachments) ? task.attachments : [];
    return (
        <div className="space-y-3">
            <p className="text-xs font-bold text-[var(--crm-muted)]">Attachments ({attachments.length})</p>
            <form onSubmit={onSubmit} className="flex flex-wrap items-center gap-2">
                <input type="file" onChange={(e) => onAttachmentChange(e.target.files?.[0] ?? null)}
                    className="min-w-0 flex-1 rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface)] px-3 py-2 text-xs text-[var(--crm-text)] file:mr-2 file:rounded file:border-0 file:bg-[var(--crm-gold)] file:px-2 file:py-0.5 file:text-[10px] file:font-bold file:text-black" />
                <AppButton variant="secondary" type="submit"><Paperclip size={14} /> Upload</AppButton>
            </form>
            {attachments.length > 0 ? (
                <div className="space-y-1.5 max-h-60 overflow-y-auto">
                    {attachments.map((a) => (
                        <div key={a.id} className="flex items-center gap-2 rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface)] px-3 py-2">
                            <FileText size={16} className="shrink-0 text-[var(--crm-muted)]" />
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-semibold text-[var(--crm-text)]">{a.originalFilename}</p>
                                <p className="text-[9px] text-[var(--crm-text-muted)]">{a.sizeLabel || `${a.size} B`}{a.user ? ` by ${a.user.name}` : ''}</p>
                            </div>
                            {a.downloadUrl ? (
                                <a href={a.downloadUrl} download target="_blank" rel="noopener noreferrer"
                                    className="shrink-0 rounded-lg border border-[var(--crm-border)] px-2 py-1 text-[9px] font-semibold text-[var(--crm-text-muted)] transition hover:border-[var(--crm-gold)] hover:text-[var(--crm-gold)]">
                                    Download
                                </a>
                            ) : null}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="rounded-lg border border-dashed border-[var(--crm-border)] px-4 py-6 text-center text-xs text-[var(--crm-text-muted)]">
                    <FileText size={20} className="mx-auto mb-1 text-[var(--crm-muted)]" />
                    No files uploaded yet.
                </div>
            )}
        </div>
    );
}

const ACTIVITY_ICONS: Record<string, { icon: typeof Circle; color: string; label: string }> = {
    created: { icon: Plus, color: 'text-blue-400', label: 'Task created' },
    updated: { icon: Edit3, color: 'text-amber-400', label: 'Task updated' },
    status_changed: { icon: ArrowRight, color: 'text-violet-400', label: 'Status changed' },
    checklist_added: { icon: ListChecks, color: 'text-cyan-400', label: 'Checklist item added' },
    checklist_toggled: { icon: CheckSquare, color: 'text-emerald-400', label: 'Checklist toggled' },
    comment_added: { icon: MessageCircle, color: 'text-blue-400', label: 'Comment added' },
    note_added: { icon: Notebook, color: 'text-amber-400', label: 'Note added' },
    attachment_added: { icon: PaperclipIcon, color: 'text-rose-400', label: 'Attachment added' },
    attachment_removed: { icon: PaperclipIcon, color: 'text-red-400', label: 'Attachment removed' },
};

function ActivityIcon({ entry }: { entry: TaskActivityLogRow }) {
    const cfg = ACTIVITY_ICONS[entry.action] || { icon: Circle, color: 'text-zinc-400', label: entry.action };
    const Icon = cfg.icon;
    return (
        <div className="flex items-start gap-3 group">
            <div className="flex flex-col items-center">
                <span className={`flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--crm-surface-3)] ${cfg.color}`}>
                    <Icon size={12} />
                </span>
                <div className="mt-0.5 w-px flex-1 bg-[var(--crm-border)] group-last:hidden" />
            </div>
            <div className="pb-4">
                <p className="text-xs font-semibold text-[var(--crm-text)]">
                    {cfg.label}
                    {entry.action === 'status_changed' && entry.description ? (
                        <span className="ml-1 text-[var(--crm-text-muted)] font-normal">{entry.description}</span>
                    ) : null}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                    {entry.user ? (
                        <span className="flex items-center gap-1 text-[9px] text-[var(--crm-text-muted)]">
                            <User size={9} /> {entry.user.name}
                        </span>
                    ) : null}
                    <span className="text-[9px] text-[var(--crm-text-muted)]">{entry.createdAt?.slice(0, 16).replace('T', ' ')}</span>
                </div>
            </div>
        </div>
    );
}

function ActivityTab({ task }: { task: TaskRow }) {
    const logs = Array.isArray(task.activityLogs) ? task.activityLogs : [];
    return (
        <div className="space-y-1">
            <p className="text-xs font-bold text-[var(--crm-muted)] mb-3">Activity log</p>
            {logs.length > 0 ? (
                <div className="-ml-1">
                    {logs.map((entry) => (
                        <ActivityIcon key={entry.id} entry={entry} />
                    ))}
                </div>
            ) : (
                <div className="rounded-lg border border-dashed border-[var(--crm-border)] px-4 py-4 text-center text-xs text-[var(--crm-text-muted)]">
                    <Clock3 size={16} className="mx-auto mb-1 text-[var(--crm-muted)]" />
                    No activity recorded yet.
                </div>
            )}
        </div>
    );
}

```


## FILE: resources\js\features\tasks\components\TaskFilters.tsx
```
import { CalendarDays, ChevronDown, Columns3, LayoutDashboard, List, Search, Table2, Timeline, X } from 'lucide-react';
import { useRef, useState } from 'react';
import type { ViewMode } from '@/features/tasks/types';

const FILTERS = [
    { id: 'all', label: 'All' },
    { id: 'my', label: 'My tasks' },
    { id: 'assigned_by_me', label: 'Assigned by me' },
    { id: 'watching', label: 'Watching' },
    { id: 'overdue', label: 'Overdue' },
    { id: 'due_today', label: 'Due today' },
    { id: 'due_week', label: 'Due this week' },
    { id: 'blocked', label: 'Blocked' },
    { id: 'completed', label: 'Completed' },
];

const CATEGORIES = [
    { id: 'all', label: 'All projects' },
    { id: 'documents', label: 'Documents' },
    { id: 'client_follow_up', label: 'Client' },
    { id: 'contract', label: 'Contracts' },
    { id: 'authorization', label: 'Authorizations' },
    { id: 'finance', label: 'Finance' },
    { id: 'archive', label: 'Archive' },
    { id: 'general_admin', label: 'General' },
];

const PRIORITY_OPTIONS = [
    { id: 'all', label: 'All priorities' },
    { id: 'urgent', label: 'Urgent' },
    { id: 'high', label: 'High' },
    { id: 'medium', label: 'Medium' },
    { id: 'low', label: 'Low' },
];

const VIEW_TABS: { id: ViewMode; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'board', label: 'Board', icon: Columns3 },
    { id: 'list', label: 'List', icon: List },
    { id: 'table', label: 'Table', icon: Table2 },
    { id: 'timeline', label: 'Timeline', icon: Timeline },
    { id: 'calendar', label: 'Calendar', icon: CalendarDays },
];

type Props = {
    filter: string;
    category: string;
    priorityFilter: string;
    query: string;
    viewMode: ViewMode;
    onFilterChange: (f: string) => void;
    onCategoryChange: (c: string) => void;
    onPriorityFilterChange: (p: string) => void;
    onQueryChange: (q: string) => void;
    onViewModeChange: (v: ViewMode) => void;
};

export function TaskFilters({ filter, category, priorityFilter, query, viewMode, onFilterChange, onCategoryChange, onPriorityFilterChange, onQueryChange, onViewModeChange }: Props) {
    const [scopeOpen, setScopeOpen] = useState(false);
    const [moduleOpen, setModuleOpen] = useState(false);
    const [priorityOpen, setPriorityOpen] = useState(false);
    const scopeRef = useRef<HTMLDivElement>(null);
    const moduleRef = useRef<HTMLDivElement>(null);
    const priorityRef = useRef<HTMLDivElement>(null);

    const activeFilter = FILTERS.find((item) => item.id === filter) ?? FILTERS[0];
    const activeCategory = CATEGORIES.find((item) => item.id === category) ?? CATEGORIES[0];
    const activePriority = PRIORITY_OPTIONS.find((item) => item.id === priorityFilter) ?? PRIORITY_OPTIONS[0];

    const hasActive = filter !== 'all' || category !== 'all' || priorityFilter !== 'all' || !!query;

    const dropClass = (active: boolean) =>
        `flex w-full items-center justify-between rounded-lg border px-2.5 py-2 text-xs font-semibold transition ${active ? 'border-[var(--crm-gold)] bg-[var(--crm-gold)] text-black' : 'border-transparent text-[var(--crm-text)] hover:bg-[var(--crm-surface)]'}`;

    return (
        <section className="overflow-visible rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)]">
            <div className="flex flex-wrap items-center gap-2 p-2.5">
                <div className="relative min-w-[200px] flex-1">
                    <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--crm-muted)]" />
                    <input value={query} onChange={(e) => onQueryChange(e.target.value)} placeholder="Search tasks, clients, projects..."
                        className="h-9 w-full rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface)] pl-8 pr-8 text-xs text-[var(--crm-text)] outline-none placeholder:text-[var(--crm-muted)] focus:border-[var(--crm-gold)]" />
                    {query ? <button type="button" onClick={() => onQueryChange('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--crm-muted)] hover:text-[var(--crm-gold)]"><X size={14} /></button> : null}
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                    <DropdownSelect ref={scopeRef} isOpen={scopeOpen} onToggle={() => { setScopeOpen(!scopeOpen); setModuleOpen(false); setPriorityOpen(false); }}
                        onClose={() => setScopeOpen(false)} label={activeFilter.label} width="140px">
                        {FILTERS.map((item) => (
                            <button key={item.id} type="button" onClick={() => { onFilterChange(item.id); setScopeOpen(false); }} className={dropClass(filter === item.id)}>{item.label}</button>
                        ))}
                    </DropdownSelect>

                    <DropdownSelect ref={moduleRef} isOpen={moduleOpen} onToggle={() => { setModuleOpen(!moduleOpen); setScopeOpen(false); setPriorityOpen(false); }}
                        onClose={() => setModuleOpen(false)} label={activeCategory.label} width="140px">
                        {CATEGORIES.map((item) => (
                            <button key={item.id} type="button" onClick={() => { onCategoryChange(item.id); setModuleOpen(false); }} className={dropClass(category === item.id)}>{item.label}</button>
                        ))}
                    </DropdownSelect>

                    <DropdownSelect ref={priorityRef} isOpen={priorityOpen} onToggle={() => { setPriorityOpen(!priorityOpen); setScopeOpen(false); setModuleOpen(false); }}
                        onClose={() => setPriorityOpen(false)} label={activePriority.label} width="130px">
                        {PRIORITY_OPTIONS.map((item) => (
                            <button key={item.id} type="button" onClick={() => { onPriorityFilterChange(item.id); setPriorityOpen(false); }} className={dropClass(priorityFilter === item.id)}>{item.label}</button>
                        ))}
                    </DropdownSelect>
                </div>

                <div className="flex shrink-0 items-center gap-0.5 rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface)] p-0.5">
                    {VIEW_TABS.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button key={tab.id} type="button" onClick={() => onViewModeChange(tab.id)}
                                className={`inline-flex h-7 items-center gap-1 rounded-md px-2 text-[10px] font-semibold transition ${viewMode === tab.id ? 'bg-[var(--crm-gold)] text-black' : 'text-[var(--crm-text-muted)] hover:text-[var(--crm-text)]'}`}
                                title={tab.label}>
                                <Icon size={12} />
                                <span className="hidden md:inline">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                <button type="button" onClick={() => { onFilterChange('all'); onCategoryChange('all'); onPriorityFilterChange('all'); onQueryChange(''); }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--crm-border)] text-[var(--crm-muted)] transition hover:border-[var(--crm-gold)] hover:text-[var(--crm-text)]">
                    <X size={13} />
                </button>
            </div>

            {hasActive ? (
                <div className="flex flex-wrap items-center gap-1.5 border-t border-[var(--crm-border)] px-3 py-1.5">
                    {filter !== 'all' ? <Chip label={activeFilter.label} onRemove={() => onFilterChange('all')} /> : null}
                    {category !== 'all' ? <Chip label={activeCategory.label} onRemove={() => onCategoryChange('all')} /> : null}
                    {priorityFilter !== 'all' ? <Chip label={activePriority.label} onRemove={() => onPriorityFilterChange('all')} /> : null}
                    {query ? <Chip label={`"${query}"`} onRemove={() => onQueryChange('')} /> : null}
                </div>
            ) : null}
        </section>
    );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
    return (
        <span className="inline-flex items-center gap-1 rounded-full border border-[var(--crm-border)] bg-[var(--crm-surface)] px-2 py-0.5 text-[10px] font-semibold text-[var(--crm-text)]">
            {label}
            <button type="button" onClick={onRemove} className="text-[var(--crm-muted)] hover:text-red-400"><X size={10} /></button>
        </span>
    );
}

const DropdownSelect = ({ ref, isOpen, onToggle, onClose, label, width, children }: {
    ref: React.RefObject<HTMLDivElement | null>;
    isOpen: boolean;
    onToggle: () => void;
    onClose: () => void;
    label: string;
    width: string;
    children: React.ReactNode;
}) => (
    <div ref={ref} className="relative" onBlur={(e) => { if (!ref.current?.contains(e.relatedTarget)) onClose(); }}>
        <button type="button" onClick={onToggle}
            className="inline-flex h-8 items-center justify-between gap-2 rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface)] px-2.5 text-xs font-semibold text-[var(--crm-text)] transition hover:border-[var(--crm-gold)]"
            style={{ width }}>
            <span className="truncate">{label}</span>
            <ChevronDown size={12} className={`shrink-0 transition ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        {isOpen ? (
            <div className="absolute left-0 top-9 z-50 min-w-[180px] rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] p-1 shadow-2xl shadow-black/40">
                {children}
            </div>
        ) : null}
    </div>
);

```


## FILE: resources\js\features\tasks\components\TaskListView.tsx
```
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import type { TaskRow, TaskStatus } from '@/features/tasks/types';
import { COLUMNS, PRIORITY_COLORS, PRIORITY_LABELS, STATUS_COLORS, STATUS_DOT_COLORS, STATUS_LABELS } from '@/features/tasks/types';

type Props = {
    columns: Record<string, TaskRow[]>;
    onTaskClick: (task: TaskRow) => void;
    onStatusChange: (task: TaskRow, status: string) => void;
};

export function TaskListView({ columns, onTaskClick, onStatusChange }: Props) {
    const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

    const toggle = (status: string) => {
        setCollapsed((prev) => {
            const next = new Set(prev);
            if (next.has(status)) next.delete(status); else next.add(status);
            return next;
        });
    };

    return (
        <div className="space-y-3">
            {COLUMNS.map((status) => {
                const tasks = columns[status] || [];
                const isCollapsed = collapsed.has(status);
                return (
                    <div key={status} className="rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] overflow-hidden">
                        <button type="button" onClick={() => toggle(status)} className="flex w-full items-center gap-2 px-4 py-3 text-left transition hover:bg-[var(--crm-surface)]">
                            {isCollapsed ? <ChevronRight size={14} className="text-[var(--crm-muted)]" /> : <ChevronDown size={14} className="text-[var(--crm-muted)]" />}
                            <span className={`size-2 rounded-full ${STATUS_DOT_COLORS[status]}`} />
                            <span className="text-sm font-semibold text-[var(--crm-text)]">{STATUS_LABELS[status]}</span>
                            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-md bg-[var(--crm-surface-3)] px-1.5 text-[10px] font-bold text-[var(--crm-text-muted)]">{tasks.length}</span>
                        </button>
                        {!isCollapsed ? (
                            tasks.length === 0 ? (
                                <div className="px-4 py-3 text-xs text-[var(--crm-text-muted)]">No tasks</div>
                            ) : (
                                <div className="divide-y divide-[var(--crm-border)] border-t border-[var(--crm-border)]">
                                    {tasks.map((task) => (
                                        <div key={task.id} className="flex items-center gap-3 px-4 py-2.5 transition hover:bg-[var(--crm-surface)]">
                                            <button type="button" onClick={() => onTaskClick(task)} className="flex flex-1 items-center gap-3 min-w-0 text-left">
                                                <span className={`size-2 shrink-0 rounded-full ${STATUS_DOT_COLORS[task.status]}`} />
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-semibold text-[var(--crm-text)]">{task.title}</p>
                                                    <p className="truncate text-[10px] text-[var(--crm-text-muted)]">{task.taskNumber}{task.dossier?.object ? ` \u00B7 ${task.dossier.object}` : ''}</p>
                                                </div>
                                            </button>
                                            <div className="flex shrink-0 items-center gap-3">
                                                {Array.isArray(task.assignees) && task.assignees.length > 0 ? (
                                                    <div className="flex -space-x-1">
                                                        {task.assignees.slice(0, 2).map((a) => (
                                                            <span key={a.id} className="flex size-6 items-center justify-center rounded-full border-2 border-[var(--crm-elevated)] bg-[var(--crm-gold)] text-[8px] font-bold text-black" title={a.name}>
                                                                {a.name.charAt(0)}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : null}
                                                <span className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[9px] font-semibold ${PRIORITY_COLORS[task.priority]}`}>{PRIORITY_LABELS[task.priority]}</span>
                                                <span className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[9px] font-semibold ${STATUS_COLORS[task.status]}`}>{STATUS_LABELS[task.status]}</span>
                                                {task.dueDate ? <span className="whitespace-nowrap text-[10px] text-[var(--crm-text-muted)]">{task.dueDate}</span> : null}
                                                <QuickStatus task={task} onStatusChange={onStatusChange} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        ) : null}
                    </div>
                );
            })}
        </div>
    );
}

function QuickStatus({ task, onStatusChange }: { task: TaskRow; onStatusChange: (task: TaskRow, status: string) => void }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setOpen(!open)}
                className="flex h-7 items-center gap-1 rounded-lg border border-[var(--crm-border)] px-2 text-[10px] font-semibold text-[var(--crm-text-muted)] transition hover:border-[var(--crm-gold)] hover:text-[var(--crm-text)]">
                <ChevronDown size={11} /> Move
            </button>
            {open ? (
                <div className="absolute right-0 top-8 z-50 w-40 overflow-hidden rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] p-1 shadow-2xl shadow-black/40">
                    {COLUMNS.filter((s) => s !== task.status).map((status) => (
                        <button key={status} type="button" onClick={() => { setOpen(false); onStatusChange(task, status); }}
                            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-[var(--crm-text)] transition hover:bg-[var(--crm-surface)]">
                            <span className={`size-2 rounded-full ${STATUS_DOT_COLORS[status]}`} />
                            {STATUS_LABELS[status as TaskStatus]}
                        </button>
                    ))}
                </div>
            ) : null}
        </div>
    );
}

```


## FILE: resources\js\features\tasks\components\TaskOverview.tsx
```
import { AlertTriangle, CalendarDays, CheckCircle2, Clock3, Flame, ListTodo, ShieldAlert } from 'lucide-react';
import { useMemo } from 'react';
import type { TaskRow, TaskStatus } from '@/features/tasks/types';
import { PRIORITY_COLORS, PRIORITY_LABELS, STATUS_COLORS, STATUS_DOT_COLORS, STATUS_LABELS } from '@/features/tasks/types';

type Props = { tasks: TaskRow[]; onTaskClick: (t: TaskRow) => void; userId?: number | null };

function isOpen(t: TaskRow) { return t.status !== 'completed' && t.status !== 'cancelled'; }
function isOverdue(t: TaskRow) { return Boolean(t.dueDate && new Date(t.dueDate) < new Date() && isOpen(t)); }

function KpiCard({ icon: Icon, label, value, sub, accent }: { icon: typeof Flame; label: string; value: string | number; sub: string; accent: string }) {
    const colors: Record<string, string> = {
        gold: 'text-[var(--crm-gold)] bg-[var(--crm-gold-soft)]',
        red: 'text-red-300 bg-red-500/10',
        green: 'text-emerald-300 bg-emerald-500/10',
        blue: 'text-blue-300 bg-blue-500/10',
        amber: 'text-amber-300 bg-amber-500/10',
        violet: 'text-violet-300 bg-violet-500/10',
    };
    return (
        <div className="rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] p-3.5 transition hover:border-[var(--crm-gold)]/30">
            <div className="flex items-start justify-between">
                <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--crm-muted)]">{label}</p>
                    <p className="mt-1 text-2xl font-bold leading-none text-[var(--crm-text)]">{value}</p>
                    <p className="mt-1 truncate text-[11px] text-[var(--crm-muted)]">{sub}</p>
                </div>
                <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${colors[accent]}`}>
                    <Icon size={17} />
                </span>
            </div>
        </div>
    );
}

export function TaskOverview({ tasks, onTaskClick, userId }: Props) {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const weekEnd = new Date(today); weekEnd.setDate(today.getDate() + 7);
    const weekEndStr = weekEnd.toISOString().slice(0, 10);

    const metrics = useMemo(() => {
        const open = tasks.filter(isOpen);
        const overdueT = tasks.filter(isOverdue);
        const urgent = open.filter((t) => t.priority === 'urgent' || t.impact === 'critical');
        const blocked = open.filter((t) => t.status === 'blocked');
        const review = open.filter((t) => t.status === 'in_review');
        const completed = tasks.filter((t) => t.status === 'completed');
        const cancelled = tasks.filter((t) => t.status === 'cancelled');
        const pending = tasks.filter((t) => t.status === 'not_started');
        const dueThisWeek = tasks.filter((t) => t.dueDate && t.dueDate >= todayStr && t.dueDate <= weekEndStr && isOpen(t));
        return { open, overdueT, urgent, blocked, review, completed, cancelled, pending, dueThisWeek };
    }, [tasks]);

    const statusCounts = useMemo(() => {
        const map: Record<string, { count: number; label: string }> = {};
        for (const s of ['not_started', 'in_progress', 'waiting_client', 'waiting_admin', 'blocked', 'in_review', 'completed', 'cancelled'] as TaskStatus[]) {
            map[s] = { count: tasks.filter((t) => t.status === s).length, label: STATUS_LABELS[s] };
        }
        return map;
    }, [tasks]);

    const weekDays = useMemo(() => {
        const days: { date: string; label: string; tasks: TaskRow[] }[] = [];
        const now = new Date();
        for (let i = 0; i < 7; i++) {
            const d = new Date(now); d.setDate(now.getDate() + i);
            const ds = d.toISOString().slice(0, 10);
            days.push({ date: ds, label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en', { weekday: 'short' }), tasks: tasks.filter((t) => t.dueDate === ds && isOpen(t)) });
        }
        return days;
    }, [tasks]);

    const sortedStatuses: TaskStatus[] = ['not_started', 'in_progress', 'waiting_client', 'waiting_admin', 'blocked', 'in_review', 'completed'];
    const totalOpen = sortedStatuses.filter((s) => s !== 'completed' && s !== 'cancelled').reduce((a, s) => a + (statusCounts[s]?.count || 0), 0);

    const focusTasks = useMemo(() => {
        if (userId) {
            const mine = tasks.filter((t) => t.assignees?.some((a) => a.id === userId) && isOpen(t));
            return mine.slice(0, 5);
        }
        return tasks.filter((t) => (t.priority === 'urgent' || isOverdue(t)) && isOpen(t)).slice(0, 5);
    }, [tasks, userId]);

    const attentionTasks = useMemo(() => {
        return tasks.filter((t) => (t.status === 'blocked' || isOverdue(t) || t.priority === 'urgent') && isOpen(t)).slice(0, 5);
    }, [tasks]);

    return (
        <div className="space-y-4">
            {/* KPI Row */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                <KpiCard icon={ListTodo} label="Open" value={metrics.open.length} sub="Active operational work" accent="blue" />
                <KpiCard icon={CheckCircle2} label="Completed" value={metrics.completed.length} sub="Finished tasks" accent="green" />
                <KpiCard icon={Clock3} label="Pending" value={metrics.pending.length} sub="Not yet started" accent="gold" />
                <KpiCard icon={CalendarDays} label="Upcoming" value={metrics.dueThisWeek.length} sub="Due within 7 days" accent="amber" />
                <KpiCard icon={AlertTriangle} label="Overdue" value={metrics.overdueT.length} sub={metrics.overdueT.length ? 'Past due date' : 'All on track'} accent={metrics.overdueT.length ? 'red' : 'green'} />
            </div>

            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {/* Status Overview */}
                <div className="rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] p-4">
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.1em] text-[var(--crm-muted)]">Status overview</p>
                    <div className="space-y-2">
                        {sortedStatuses.map((s) => {
                            const c = statusCounts[s]?.count || 0;
                            const pct = totalOpen > 0 && s !== 'completed' && s !== 'cancelled' ? Math.round((c / totalOpen) * 100) : 0;
                            return (
                                <div key={s} className="flex items-center gap-3">
                                    <span className={`size-2 rounded-full ${STATUS_DOT_COLORS[s]}`} />
                                    <span className="w-24 text-[11px] font-medium text-[var(--crm-text)]">{STATUS_LABELS[s]}</span>
                                    <div className="flex-1">
                                        <div className="h-2 rounded-full bg-[var(--crm-surface-3)]">
                                            <div className={`h-full rounded-full ${STATUS_COLORS[s].split(' ')[0].replace('bg-', 'bg-')}`} style={{ width: `${Math.max(pct, c > 0 ? 4 : 0)}%` }} />
                                        </div>
                                    </div>
                                    <span className="w-8 text-right text-[11px] font-semibold text-[var(--crm-text-muted)]">{c}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Mini Timeline - 7 Day */}
                <div className="rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] p-4">
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.1em] text-[var(--crm-muted)]">7-day view</p>
                    <div className="flex gap-1">
                        {weekDays.map((day) => (
                            <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
                                <span className="text-[9px] font-semibold text-[var(--crm-muted)]">{day.label}</span>
                                <div className={`flex h-16 w-full flex-col items-center justify-end rounded-lg border ${day.date === today ? 'border-[var(--crm-gold)] bg-[var(--crm-gold)]/5' : 'border-[var(--crm-border)]'}`}>
                                    {day.tasks.slice(0, 3).map((t) => (
                                        <button key={t.id} type="button" onClick={() => onTaskClick(t)}
                                            className="mb-[1px] h-2 w-[80%] rounded-sm bg-[var(--crm-gold)] opacity-70 hover:opacity-100" title={t.title} />
                                    ))}
                                    {day.tasks.length > 3 ? <span className="text-[8px] text-[var(--crm-muted)]">+{day.tasks.length - 3}</span> : null}
                                </div>
                                <span className="text-[9px] text-[var(--crm-text-muted)]">{day.tasks.length}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* My Focus */}
                <div className="rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] p-4">
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.1em] text-[var(--crm-muted)]">{userId ? 'My focus' : 'Urgent focus'}</p>
                    {focusTasks.length === 0 ? <p className="text-xs text-[var(--crm-text-muted)]">Nothing urgent.</p> : (
                        <div className="space-y-1.5">
                            {focusTasks.map((t) => {
                                const overdue = isOverdue(t);
                                return (
                                    <button key={t.id} type="button" onClick={() => onTaskClick(t)}
                                        className="flex w-full items-center gap-2 rounded-lg border border-[var(--crm-border)] px-2.5 py-2 text-left transition hover:bg-[var(--crm-surface)]">
                                        <span className={`size-2 shrink-0 rounded-full ${STATUS_DOT_COLORS[t.status]}`} />
                                        <span className="min-w-0 flex-1 truncate text-xs font-semibold text-[var(--crm-text)]">{t.title}</span>
                                        {t.dueDate ? <span className={`whitespace-nowrap text-[10px] ${overdue ? 'font-semibold text-red-400' : 'text-[var(--crm-text-muted)]'}`}>{t.dueDate}</span> : null}
                                        <span className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[9px] font-semibold ${PRIORITY_COLORS[t.priority]}`}>{PRIORITY_LABELS[t.priority]}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Attention panel */}
            {attentionTasks.length > 0 ? (
                <div className="rounded-xl border border-red-400/15 bg-red-400/3 p-4">
                    <div className="mb-3 flex items-center gap-2">
                        <ShieldAlert size={14} className="text-red-400" />
                        <p className="text-xs font-bold uppercase tracking-[0.1em] text-red-300">Needs attention</p>
                        <span className="text-[10px] text-[var(--crm-muted)]">({attentionTasks.length})</span>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                        {attentionTasks.map((t) => (
                            <button key={t.id} type="button" onClick={() => onTaskClick(t)}
                                className="flex items-center gap-2 rounded-lg border border-red-400/10 bg-[var(--crm-surface)] px-3 py-2 text-left transition hover:border-red-400/30">
                                <span className={`size-2 shrink-0 rounded-full ${STATUS_DOT_COLORS[t.status]}`} />
                                <span className="min-w-0 flex-1 truncate text-xs font-semibold text-[var(--crm-text)]">{t.title}</span>
                                <span className="whitespace-nowrap text-[10px] text-[var(--crm-text-muted)]">{t.dueDate || 'No date'}</span>
                            </button>
                        ))}
                    </div>
                </div>
            ) : null}
        </div>
    );
}

```


## FILE: resources\js\features\tasks\components\TaskRequestCreateDrawer.tsx
```
import { router } from '@inertiajs/react';
import { FormEvent, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AppButton } from '@/components/ui/AppButton';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppFormErrorSummary } from '@/components/ui/AppFormErrorSummary';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppTextarea } from '@/components/ui/AppTextarea';
import { AppTextField } from '@/components/ui/AppTextField';
import type { FormErrors } from '@/lib/formErrors';
import { firstError } from '@/lib/formErrors';

export type TaskRequestOption = {
    id: number;
    label: string;
    description?: string | null;
    clientId?: number | null;
};

export type TaskRequestOptions = {
    users: TaskRequestOption[];
    clients: TaskRequestOption[];
    dossiers: TaskRequestOption[];
};

type TaskRequestForm = {
    request_type: string;
    title: string;
    description: string;
    target_user_id: number | null;
    client_id: number | null;
    dossier_id: number | null;
};

type Props = {
    isOpen: boolean;
    requestTypes: string[];
    requestTypeLabels: Record<string, string>;
    options: TaskRequestOptions;
    onOpenChange: (open: boolean) => void;
};

const emptyForm: TaskRequestForm = {
    request_type: 'admin_help',
    title: '',
    description: '',
    target_user_id: null,
    client_id: null,
    dossier_id: null,
};

export function TaskRequestCreateDrawer({ isOpen, requestTypes, requestTypeLabels, options, onOpenChange }: Props) {
    const [form, setForm] = useState<TaskRequestForm>(emptyForm);
    const [errors, setErrors] = useState<FormErrors>({});

    const dossierOptions = useMemo(() => {
        if (!form.client_id) return options.dossiers;

        return options.dossiers.filter((dossier) => dossier.clientId === form.client_id);
    }, [form.client_id, options.dossiers]);

    const close = () => {
        setErrors({});
        onOpenChange(false);
    };

    const updateDossier = (id: number | null) => {
        const dossier = options.dossiers.find((item) => item.id === id);
        setForm({
            ...form,
            dossier_id: id,
            client_id: dossier?.clientId ?? form.client_id,
        });
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrors({});

        router.post('/task-requests', form, {
            preserveScroll: true,
            onSuccess: () => {
                setForm(emptyForm);
                close();
                toast.success('Task request submitted.');
            },
            onError: (validationErrors) => {
                setErrors(validationErrors);
                toast.error('Please check the task request form.');
            },
        });
    };

    return (
        <AppDrawer
            isOpen={isOpen}
            onOpenChange={(open) => (open ? onOpenChange(true) : close())}
            title="New task request"
            description="Create an operations request and link it to real CRM context."
            footer={
                <>
                    <AppButton variant="secondary" onPress={close}>Cancel</AppButton>
                    <AppButton variant="primary" type="submit" form="task-request-create-form">Submit request</AppButton>
                </>
            }
        >
            <form id="task-request-create-form" className="space-y-5" onSubmit={submit}>
                <AppFormErrorSummary errors={errors} />
                <AppSelect
                    label="Request type"
                    selectedKey={form.request_type}
                    onSelectionChange={(key) => setForm({ ...form, request_type: key ? String(key) : 'admin_help' })}
                    options={requestTypes.map((type) => ({ id: type, label: requestTypeLabels[type] ?? type }))}
                    error={firstError(errors, 'request_type')}
                    isRequired
                />
                <AppTextField
                    label="Title"
                    value={form.title}
                    onChange={(value) => setForm({ ...form, title: value })}
                    error={firstError(errors, 'title')}
                    placeholder="What needs to be done?"
                    isRequired
                />
                <AppTextarea
                    label="Description"
                    value={form.description}
                    onChange={(value) => setForm({ ...form, description: value })}
                    placeholder="Add useful details for the person who will handle it."
                />
                <AppSelect
                    label="Target user"
                    placeholder="Optional"
                    selectedKey={form.target_user_id ? String(form.target_user_id) : null}
                    onSelectionChange={(key) => setForm({ ...form, target_user_id: key ? Number(key) : null })}
                    options={options.users.map((user) => ({ id: String(user.id), label: user.label }))}
                />
                <div className="grid gap-4 md:grid-cols-2">
                    <AppSelect
                        label="Client"
                        placeholder="Optional"
                        selectedKey={form.client_id ? String(form.client_id) : null}
                        onSelectionChange={(key) => setForm({ ...form, client_id: key ? Number(key) : null, dossier_id: null })}
                        options={options.clients.map((client) => ({ id: String(client.id), label: client.label }))}
                    />
                    <AppSelect
                        label="Dossier"
                        placeholder="Optional"
                        selectedKey={form.dossier_id ? String(form.dossier_id) : null}
                        onSelectionChange={(key) => updateDossier(key ? Number(key) : null)}
                        options={dossierOptions.map((dossier) => ({ id: String(dossier.id), label: dossier.label }))}
                    />
                </div>
            </form>
        </AppDrawer>
    );
}

```


## FILE: resources\js\features\tasks\components\TaskTable.tsx
```
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { TaskRow, TaskStatus } from '@/features/tasks/types';
import { COLUMNS, IMPACT_COLORS, IMPACT_LABELS, PRIORITY_COLORS, PRIORITY_LABELS, STATUS_COLORS, STATUS_DOT_COLORS, STATUS_LABELS, TYPE_LABELS } from '@/features/tasks/types';

type Props = {
    tasks: TaskRow[];
    onTaskClick: (task: TaskRow) => void;
    onStatusChange: (task: TaskRow, status: string) => void;
};

const PRIORITY_ORDER: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };

export function TaskTable({ tasks, onTaskClick, onStatusChange }: Props) {
    const [sortField, setSortField] = useState<string>('');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

    const sorted = useMemo(() => {
        if (!sortField) return tasks;
        return [...tasks].sort((a, b) => {
            const aVal = a[sortField as keyof TaskRow];
            const bVal = b[sortField as keyof TaskRow];
            if (sortField === 'priority') {
                const ao = PRIORITY_ORDER[a.priority] ?? 99;
                const bo = PRIORITY_ORDER[b.priority] ?? 99;
                return sortDir === 'asc' ? ao - bo : bo - ao;
            }
            const aStr = aVal == null ? '' : String(aVal);
            const bStr = bVal == null ? '' : String(bVal);
            const cmp = aStr.localeCompare(bStr);
            return sortDir === 'asc' ? cmp : -cmp;
        });
    }, [tasks, sortField, sortDir]);

    function toggleSort(field: string) {
        if (sortField === field) {
            setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortField(field);
            setSortDir('asc');
        }
    }

    function SortHeader({ field, label, className }: { field: string; label: string; className?: string }) {
        const active = sortField === field;
        return (
            <th className={className}>
                <button type="button" onClick={() => toggleSort(field)}
                    className="inline-flex items-center gap-1 transition hover:text-[var(--crm-text)]">
                    {label}
                    {active ? (
                        sortDir === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />
                    ) : (
                        <ChevronsUpDown size={10} className="opacity-30" />
                    )}
                </button>
            </th>
        );
    }

    if (tasks.length === 0) {
        return (
            <div className="flex items-center justify-center rounded-xl border border-dashed border-[var(--crm-border)] bg-[var(--crm-elevated)] py-16">
                <p className="text-sm text-[var(--crm-text-muted)]">No tasks match the current filters.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-xl border border-[var(--crm-border)]">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-[var(--crm-border)] bg-[var(--crm-surface)]">
                        <SortHeader field="title" label="Task" className="sticky top-0 z-10 whitespace-nowrap px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--crm-muted)]" />
                        <th className="sticky top-0 z-10 hidden whitespace-nowrap px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--crm-muted)] md:table-cell">Assigned</th>
                        <th className="sticky top-0 z-10 hidden whitespace-nowrap px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--crm-muted)] lg:table-cell">Project</th>
                        <SortHeader field="category" label="Category" className="sticky top-0 z-10 hidden whitespace-nowrap px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--crm-muted)] xl:table-cell" />
                        <SortHeader field="priority" label="Priority" className="sticky top-0 z-10 whitespace-nowrap px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--crm-muted)]" />
                        <SortHeader field="progress" label="Progress" className="sticky top-0 z-10 hidden whitespace-nowrap px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--crm-muted)] lg:table-cell" />
                        <SortHeader field="status" label="Status" className="sticky top-0 z-10 whitespace-nowrap px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--crm-muted)]" />
                        <SortHeader field="dueDate" label="Due date" className="sticky top-0 z-10 whitespace-nowrap px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--crm-muted)]" />
                        <th className="sticky top-0 z-10 whitespace-nowrap px-4 py-3 text-right text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--crm-muted)]">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[var(--crm-border)]">
                    {sorted.map((task) => (
                        <tr key={task.id} onClick={() => onTaskClick(task)} className="cursor-pointer bg-[var(--crm-elevated)] transition hover:bg-[var(--crm-surface)]">
                            <td className="px-4 py-3">
                                <p className="max-w-[220px] truncate text-sm font-semibold text-[var(--crm-text)]">{task.title}</p>
                                <p className="text-[10px] text-[var(--crm-text-muted)]">{task.taskNumber}</p>
                            </td>
                            <td className="hidden px-4 py-3 md:table-cell">
                                {Array.isArray(task.assignees) && task.assignees.length > 0 ? (
                                    <div className="flex -space-x-1">
                                        {task.assignees.slice(0, 3).map((a) => (
                                            <span key={a.id} className="flex size-6 items-center justify-center rounded-full border-2 border-[var(--crm-elevated)] bg-[var(--crm-gold)] text-[8px] font-bold text-black" title={a.name}>
                                                {a.name.charAt(0)}
                                            </span>
                                        ))}
                                    </div>
                                ) : <span className="text-xs text-[var(--crm-text-muted)]">-</span>}
                            </td>
                            <td className="hidden px-4 py-3 lg:table-cell">
                                <span className="text-xs text-[var(--crm-text-muted)]">{task.dossier?.object || task.client?.name || '-'}</span>
                            </td>
                            <td className="hidden px-4 py-3 xl:table-cell">
                                <span className="text-[10px] text-[var(--crm-text-muted)]">{TYPE_LABELS[task.type]}</span>
                            </td>
                            <td className="px-4 py-3">
                                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${PRIORITY_COLORS[task.priority]}`}>{PRIORITY_LABELS[task.priority]}</span>
                            </td>
                            <td className="hidden px-4 py-3 lg:table-cell">
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-16 rounded-full bg-[var(--crm-surface-3)]">
                                        <div className="h-full rounded-full bg-[var(--crm-gold)]" style={{ width: `${task.progress}%` }} />
                                    </div>
                                    <span className="text-[10px] text-[var(--crm-text-muted)]">{task.progress}%</span>
                                </div>
                            </td>
                            <td className="px-4 py-3">
                                <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${STATUS_COLORS[task.status]}`}>
                                    <span className={`size-1.5 rounded-full ${STATUS_DOT_COLORS[task.status]}`} />
                                    {STATUS_LABELS[task.status]}
                                </span>
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-xs text-[var(--crm-text-muted)]">{task.dueDate || '-'}</td>
                            <td className="px-4 py-3 text-right">
                                <StatusMenu task={task} onStatusChange={onStatusChange} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function StatusMenu({ task, onStatusChange }: { task: TaskRow; onStatusChange: (task: TaskRow, status: string) => void }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="relative inline-flex" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setOpen(!open)}
                className="flex h-7 items-center gap-1 rounded-lg border border-[var(--crm-border)] px-2 text-[10px] font-semibold text-[var(--crm-text-muted)] transition hover:border-[var(--crm-gold)] hover:text-[var(--crm-text)]">
                <ChevronDown size={11} /> Move
            </button>
            {open ? (
                <div className="absolute right-0 top-8 z-50 w-40 overflow-hidden rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] p-1 shadow-2xl shadow-black/40">
                    {COLUMNS.filter((s) => s !== task.status).map((status) => (
                        <button key={status} type="button" onClick={() => { setOpen(false); onStatusChange(task, status); }}
                            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-[var(--crm-text)] transition hover:bg-[var(--crm-surface)]">
                            <span className={`size-2 rounded-full ${STATUS_DOT_COLORS[status]}`} />
                            {STATUS_LABELS[status as TaskStatus]}
                        </button>
                    ))}
                </div>
            ) : null}
        </div>
    );
}

```


## FILE: resources\js\features\tasks\components\TaskTimeline.tsx
```
import type { TaskRow } from '@/features/tasks/types';
import { PRIORITY_COLORS, PRIORITY_LABELS, STATUS_DOT_COLORS, STATUS_LABELS } from '@/features/tasks/types';

type Props = {
    tasks: TaskRow[];
    onTaskClick: (task: TaskRow) => void;
};

export function TaskTimeline({ tasks, onTaskClick }: Props) {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().slice(0, 10);
    const weekEnd = new Date(now); weekEnd.setDate(now.getDate() + 7);
    const weekEndStr = weekEnd.toISOString().slice(0, 10);

    const groups: { label: string; tasks: TaskRow[] }[] = [
        { label: 'Today', tasks: [] },
        { label: 'Tomorrow', tasks: [] },
        { label: 'This week', tasks: [] },
        { label: 'Later', tasks: [] },
        { label: 'No date', tasks: [] },
    ];

    for (const t of tasks) {
        if (!t.dueDate) { groups[4].tasks.push(t); continue; }
        if (t.dueDate === today) { groups[0].tasks.push(t); continue; }
        if (t.dueDate === tomorrowStr) { groups[1].tasks.push(t); continue; }
        if (t.dueDate <= weekEndStr) { groups[2].tasks.push(t); continue; }
        groups[3].tasks.push(t);
    }

    const nonEmpty = groups.filter((g) => g.tasks.length > 0);

    if (nonEmpty.length === 0) {
        return (
            <div className="flex items-center justify-center rounded-xl border border-dashed border-[var(--crm-border)] bg-[var(--crm-elevated)] py-16">
                <p className="text-sm text-[var(--crm-text-muted)]">No upcoming tasks.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {nonEmpty.map((group) => (
                <div key={group.label} className="rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] p-4">
                    <div className="mb-3 flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--crm-muted)]">{group.label}</span>
                        <span className="text-[10px] text-[var(--crm-text-muted)]">({group.tasks.length})</span>
                    </div>
                    <div className="space-y-1">
                        {group.tasks.map((task, idx) => (
                            <div key={task.id} className="relative flex gap-3 pl-5">
                                {idx < group.tasks.length - 1 ? (
                                    <div className="absolute left-[7px] top-3 bottom-0 w-px bg-[var(--crm-border)]" />
                                ) : null}
                                <div className="absolute left-0 top-[6px]">
                                    <span className={`block size-3 rounded-full border-2 border-[var(--crm-elevated)] ${STATUS_DOT_COLORS[task.status]}`} />
                                </div>
                                <button type="button" onClick={() => onTaskClick(task)}
                                    className="flex w-full items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-left transition hover:border-[var(--crm-border)] hover:bg-[var(--crm-surface)]">
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-[var(--crm-text)]">{task.title}</p>
                                        <p className="truncate text-[10px] text-[var(--crm-text-muted)]">{task.taskNumber}{task.dossier?.object ? ` \u00B7 ${task.dossier.object}` : ''}</p>
                                    </div>
                                    <span className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[9px] font-semibold ${PRIORITY_COLORS[task.priority]}`}>{PRIORITY_LABELS[task.priority]}</span>
                                    {task.dueDate ? <span className="whitespace-nowrap text-[10px] text-[var(--crm-text-muted)]">{task.dueDate}</span> : null}
                                    {Array.isArray(task.assignees) && task.assignees.length > 0 ? (
                                        <div className="flex -space-x-1">
                                            {task.assignees.slice(0, 2).map((a) => (
                                                <span key={a.id} className="flex size-5 items-center justify-center rounded-full border-2 border-[var(--crm-elevated)] bg-[var(--crm-gold)] text-[7px] font-bold text-black" title={a.name}>
                                                    {a.name.charAt(0)}
                                                </span>
                                            ))}
                                        </div>
                                    ) : null}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

```


## FILE: resources\js\features\tasks\types.ts
```
export type TaskStatus = 'backlog' | 'not_started' | 'in_progress' | 'waiting_client' | 'waiting_admin' | 'blocked' | 'in_review' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskImpact = 'low' | 'normal' | 'high' | 'critical';
export type TaskType = 'general' | 'missing_document' | 'client_follow_up' | 'contract' | 'authorization' | 'finance' | 'archive' | 'review' | 'internal_admin';
export type TaskCategory = 'documents' | 'client_follow_up' | 'contract' | 'authorization' | 'finance' | 'archive' | 'general_admin';

export type TaskRow = {
    id: number;
    taskNumber: string;
    title: string;
    description: string | null;
    type: TaskType;
    status: TaskStatus;
    priority: TaskPriority;
    impact: TaskImpact;
    progress: number;
    category: TaskCategory;
    startDate: string | null;
    dueDate: string | null;
    completedAt: string | null;
    reviewedAt: string | null;
    blockedReason: string | null;
    estimatedMinutes: number | null;
    actualMinutes: number | null;
    recurrenceRule: string | null;
    createdBy: { id: number; name: string } | null;
    assignees: { id: number; name: string }[];
    watchers: { id: number; name: string }[];
    checklistItems: { id: number; label: string; isDone: boolean; position: number }[];
    commentsCount: number;
    attachmentsCount: number;
    dossierId: number | null;
    clientId: number | null;
    conversationId: number | null;
    dossier: { id: number; number: string; object: string } | null;
    client: { id: number; name: string } | null;
    createdAt: string;
    updatedAt: string;
    comments?: TaskCommentRow[];
    attachments?: TaskAttachmentRow[];
    activityLogs?: TaskActivityLogRow[];
};

export type UserOption = {
    id: number;
    name: string;
    email: string;
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
    backlog: 'Backlog',
    not_started: 'Not started',
    in_progress: 'In progress',
    waiting_client: 'Waiting client',
    waiting_admin: 'Waiting admin',
    in_review: 'In review',
    completed: 'Completed',
    blocked: 'Blocked',
    cancelled: 'Cancelled',
};

export const IMPACT_LABELS: Record<TaskImpact, string> = {
    low: 'Low',
    normal: 'Normal',
    high: 'High',
    critical: 'Critical',
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    urgent: 'Urgent',
};

export const CATEGORY_LABELS: Record<TaskCategory, string> = {
    documents: 'Documents',
    client_follow_up: 'Client follow-up',
    contract: 'Contract',
    authorization: 'Authorization',
    finance: 'Finance',
    archive: 'Archive',
    general_admin: 'General',
};

export const CATEGORY_COLORS: Record<TaskCategory, string> = {
    documents: 'text-blue-400 border-blue-400/20 bg-blue-400/10',
    client_follow_up: 'text-emerald-400 border-emerald-400/20 bg-emerald-400/10',
    contract: 'text-violet-400 border-violet-400/20 bg-violet-400/10',
    authorization: 'text-amber-400 border-amber-400/20 bg-amber-400/10',
    finance: 'text-rose-400 border-rose-400/20 bg-rose-400/10',
    archive: 'text-cyan-400 border-cyan-400/20 bg-cyan-400/10',
    general_admin: 'text-zinc-400 border-zinc-400/20 bg-zinc-400/10',
};

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
    low: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/25',
    medium: 'bg-blue-500/20 text-blue-300 border-blue-500/25',
    high: 'bg-amber-500/20 text-amber-300 border-amber-500/25',
    urgent: 'bg-red-500/20 text-red-300 border-red-500/25',
};

export const IMPACT_COLORS: Record<TaskImpact, string> = {
    low: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/20',
    normal: 'bg-blue-500/15 text-blue-300 border-blue-500/20',
    high: 'bg-amber-500/15 text-amber-300 border-amber-500/20',
    critical: 'bg-red-500/15 text-red-300 border-red-500/20',
};

export const TYPE_LABELS: Record<TaskType, string> = {
    general: 'General',
    missing_document: 'Missing document',
    client_follow_up: 'Client follow-up',
    contract: 'Contract',
    authorization: 'Authorization',
    finance: 'Finance',
    archive: 'Archive',
    review: 'Review',
    internal_admin: 'Internal admin',
};

export const COLUMNS: TaskStatus[] = ['not_started', 'in_progress', 'waiting_client', 'waiting_admin', 'blocked', 'in_review', 'completed'];
export const BOARD_COLUMNS: TaskStatus[] = ['not_started', 'in_progress', 'waiting_client', 'waiting_admin', 'blocked', 'in_review', 'completed'];

export type ViewMode = 'overview' | 'board' | 'list' | 'table' | 'timeline' | 'calendar';

export const VIEW_OPTIONS: { id: ViewMode; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: 'LayoutDashboard' },
    { id: 'board', label: 'Board', icon: 'Columns3' },
    { id: 'list', label: 'List', icon: 'List' },
    { id: 'table', label: 'Table', icon: 'Table' },
    { id: 'timeline', label: 'Timeline', icon: 'CalendarDays' },
    { id: 'calendar', label: 'Calendar', icon: 'Calendar' },
];

export type TaskCommentRow = {
    id: number;
    body: string;
    isNote: boolean;
    user: { id: number; name: string } | null;
    createdAt: string;
    updatedAt: string;
};

export type TaskActivityLogRow = {
    id: number;
    action: string;
    description: string | null;
    user: { id: number; name: string } | null;
    createdAt: string;
};

export type TaskAttachmentRow = {
    id: number;
    originalFilename: string;
    filename: string;
    mimeType: string;
    size: number;
    sizeLabel: string | null;
    user: { id: number; name: string } | null;
    createdAt: string;
    downloadUrl: string | null;
};

export const STATUS_COLORS: Record<TaskStatus, string> = {
    backlog: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/20',
    not_started: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/20',
    in_progress: 'bg-blue-500/15 text-blue-300 border-blue-500/20',
    waiting_client: 'bg-violet-500/15 text-violet-300 border-violet-500/20',
    waiting_admin: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/20',
    in_review: 'bg-amber-500/15 text-amber-300 border-amber-500/20',
    completed: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
    blocked: 'bg-red-500/15 text-red-300 border-red-500/20',
    cancelled: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/15',
};

export const STATUS_DOT_COLORS: Record<TaskStatus, string> = {
    backlog: 'bg-zinc-400',
    not_started: 'bg-zinc-400',
    in_progress: 'bg-blue-400',
    waiting_client: 'bg-violet-400',
    waiting_admin: 'bg-cyan-400',
    in_review: 'bg-amber-400',
    completed: 'bg-emerald-400',
    blocked: 'bg-red-400',
    cancelled: 'bg-zinc-500',
};

export const STATUS_BG_COLORS: Record<TaskStatus, string> = {
    backlog: 'bg-zinc-500/5',
    not_started: 'bg-zinc-500/5',
    in_progress: 'bg-blue-500/5',
    waiting_client: 'bg-violet-500/5',
    waiting_admin: 'bg-cyan-500/5',
    in_review: 'bg-amber-500/5',
    completed: 'bg-emerald-500/5',
    blocked: 'bg-red-500/5',
    cancelled: 'bg-zinc-500/3',
};

```


## FILE: resources\js\features\inbox\components\ConversationInfoPanel.tsx
```
import { Archive, ArchiveRestore, ImageIcon, Info, PanelRightClose, PanelRightOpen, Users } from 'lucide-react';
import type { ConversationRow, MessageRow } from '@/features/chat/types';
import { conversationInitial, conversationName, conversationStatus } from '@/features/chat/helpers';

type Props = {
    conversation: ConversationRow | null;
    messages: MessageRow[];
    currentUserId: number;
    onArchiveToggle: (conversation: ConversationRow) => void;
    collapsed: boolean;
    onToggleCollapsed: () => void;
};

export function ConversationInfoPanel({ conversation, messages, currentUserId, onArchiveToggle, collapsed, onToggleCollapsed }: Props) {
    if (collapsed) {
        return (
            <aside className="hidden w-12 shrink-0 border-l border-[var(--crm-border)] bg-[var(--crm-elevated)] xl:flex xl:flex-col xl:items-center">
                <button type="button" onClick={onToggleCollapsed}
                    className="mt-3 flex size-8 items-center justify-center rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface)] text-[var(--crm-text-muted)] transition hover:border-[var(--crm-gold)] hover:text-[var(--crm-gold)]"
                    title="Show details">
                    <PanelRightOpen size={15} />
                </button>
                {conversation ? (
                    <div className="mt-4 flex size-8 items-center justify-center rounded-full bg-[var(--crm-gold-soft)] text-[10px] font-black text-[var(--crm-gold)]">
                        {conversationInitial(conversation, currentUserId)}
                    </div>
                ) : null}
            </aside>
        );
    }

    if (!conversation) {
        return (
            <aside className="hidden w-[300px] shrink-0 border-l border-[var(--crm-border)] bg-[var(--crm-elevated)] xl:block">
                <div className="flex justify-end p-3">
                    <button type="button" onClick={onToggleCollapsed}
                        className="flex size-8 items-center justify-center rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface)] text-[var(--crm-text-muted)] transition hover:border-[var(--crm-gold)] hover:text-[var(--crm-gold)]"
                        title="Hide details">
                        <PanelRightClose size={15} />
                    </button>
                </div>
                <div className="flex h-full items-center justify-center p-6 pt-0 text-center text-xs text-[var(--crm-muted)]">
                    Select a conversation to see details.
                </div>
            </aside>
        );
    }

    const participants = Array.isArray(conversation.participants) ? conversation.participants : [];
    const images = messages.flatMap((message) => message.attachments || []).filter((attachment) => attachment.url).slice(0, 9);
    const isOnline = (lastSeenAt?: string | null, explicit?: boolean) => {
        if (explicit) return true;
        return !!lastSeenAt && Date.now() - new Date(lastSeenAt).getTime() < 300000;
    };
    const onlineCount = participants.filter((participant) => isOnline(participant.user?.lastSeenAt, participant.user?.isOnline)).length;
    const status = conversationStatus(conversation, currentUserId) || 'Conversation details';

    return (
        <aside className="hidden w-[300px] shrink-0 border-l border-[var(--crm-border)] bg-[var(--crm-elevated)] xl:flex xl:flex-col">
            <div className="border-b border-[var(--crm-border)] p-4">
                <div className="mb-2 flex justify-end">
                    <button type="button" onClick={onToggleCollapsed}
                        className="flex size-8 items-center justify-center rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface)] text-[var(--crm-text-muted)] transition hover:border-[var(--crm-gold)] hover:text-[var(--crm-gold)]"
                        title="Hide details">
                        <PanelRightClose size={15} />
                    </button>
                </div>
                <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-[var(--crm-gold-soft)] text-xl font-black text-[var(--crm-gold)]">
                    {conversationInitial(conversation, currentUserId)}
                </div>
                <h3 className="mt-3 truncate text-center text-base font-black text-[var(--crm-text)]">
                    {conversationName(conversation, currentUserId)}
                </h3>
                <p className="mt-1 text-center text-xs text-[var(--crm-muted)]">
                    {conversation.type === 'group' ? `${participants.length} members` : 'Direct conversation'}
                </p>
                <div className="mt-3 flex justify-center">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                        onlineCount > 0
                            ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
                            : 'border-[var(--crm-border)] bg-[var(--crm-surface)] text-[var(--crm-text-muted)]'
                    }`}>
                        <span className={`size-1.5 rounded-full ${onlineCount > 0 ? 'bg-emerald-400' : 'bg-[var(--crm-muted)]'}`} />
                        {conversation.type === 'group' ? `${onlineCount} online` : status}
                    </span>
                </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4 scrollbar-none">
                <section>
                    <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-[var(--crm-muted)]">
                        <Users size={14} /> Members
                    </div>
                    <div className="space-y-2">
                        {participants.map((participant) => {
                            const user = participant.user ?? participant;
                            const name = user?.name || 'Unknown user';
                            const email = user?.email || 'No email';
                            const initial = name?.charAt(0)?.toUpperCase() || '?';
                            const online = isOnline(user?.lastSeenAt, user?.isOnline);
                            return (
                                <div key={participant.id} className="flex items-center gap-2 rounded-xl border border-[var(--crm-border)] bg-[var(--crm-surface)] p-2">
                                    <div className="relative flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--crm-gold-soft)] text-[10px] font-black text-[var(--crm-gold)]">
                                        {initial}
                                        {online ? <span className="absolute bottom-0 right-0 size-2 rounded-full border border-[var(--crm-surface)] bg-emerald-400" /> : null}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate text-xs font-bold text-[var(--crm-text)]">{name}</p>
                                        <p className="truncate text-[10px] text-[var(--crm-text-muted)]">{online ? 'Online now' : email}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                <section className="mt-5">
                    <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-[var(--crm-muted)]">
                        <ImageIcon size={14} /> Shared images
                    </div>
                    {images.length > 0 ? (
                        <div className="grid grid-cols-3 gap-1.5">
                            {images.map((image) => (
                                <img key={image.id} src={image.url || ''} alt={image.originalFilename}
                                    className="aspect-square rounded-lg object-cover" />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-xl border border-dashed border-[var(--crm-border)] p-4 text-center text-xs text-[var(--crm-muted)]">
                            No shared images yet.
                        </div>
                    )}
                </section>
            </div>

            <div className="border-t border-[var(--crm-border)] p-4">
                <button type="button" onClick={() => onArchiveToggle(conversation)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--crm-border)] bg-[var(--crm-surface)] px-3 py-2 text-xs font-black text-[var(--crm-text)] transition hover:border-[var(--crm-gold)] hover:text-[var(--crm-gold)]">
                    {conversation.archivedAt ? <ArchiveRestore size={14} /> : <Archive size={14} />}
                    {conversation.archivedAt ? 'Unarchive conversation' : 'Archive conversation'}
                </button>
                <p className="mt-2 flex items-center justify-center gap-1 text-[10px] text-[var(--crm-muted)]">
                    <Info size={11} /> Archive is private to your inbox.
                </p>
            </div>
        </aside>
    );
}

```


## FILE: resources\js\features\inbox\components\ConversationList.tsx
```
import { Archive, ArchiveRestore, Hash, MessageSquare, Plus, Search, Users, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ConversationRow } from '@/features/chat/types';
import { CATEGORY_OPTIONS, getAvatarTone, getCategoryMeta, getConversationDisplayName, getConversationInitials, getLastMessagePreview, formatConversationTime } from '@/features/inbox/utils';

type Props = {
    conversations: ConversationRow[];
    selectedConvId: number | null;
    search: string;
    onSearchChange: (q: string) => void;
    onSelect: (conv: ConversationRow) => void;
    onArchiveToggle?: (conv: ConversationRow) => void;
    activeTab: string;
    onTabChange: (tab: string) => void;
    currentUserId: number;
    onNewConversation?: () => void;
};

const MAIN_TABS = [
    { id: 'active', label: 'Active' },
    { id: 'archived', label: 'Archived' },
    { id: 'unread', label: 'Unread' },
    { id: 'direct', label: 'Direct' },
    { id: 'groups', label: 'Groups' },
];

export function ConversationList({ conversations, selectedConvId, search, onSearchChange, onSelect, onArchiveToggle, activeTab, onTabChange, currentUserId, onNewConversation }: Props) {
    const [catFilter, setCatFilter] = useState('');

    const displayedConvs = useMemo(() => {
        if (!catFilter || activeTab !== 'groups') return conversations;
        return conversations.filter((c) => c.category === catFilter);
    }, [conversations, catFilter, activeTab]);
    const [rowHoverId, setRowHoverId] = useState<number | null>(null);

    const onlineUsers = useMemo(() => {
        const seen = new Set<number>();
        const users: { id: number; name: string }[] = [];
        for (const conv of conversations) {
            if (!Array.isArray(conv.participants)) continue;
            for (const p of conv.participants) {
                if (p?.user?.id && p.user.id !== currentUserId && !seen.has(p.user.id)) {
                    const ls = p.user.lastSeenAt;
                    if (ls && Date.now() - new Date(ls).getTime() < 300000) {
                        seen.add(p.user.id);
                        users.push({ id: p.user.id, name: p.user.name });
                    }
                }
            }
        }
        return users;
    }, [conversations, currentUserId]);

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[var(--crm-border)] px-4 py-3">
                <div>
                    <h2 className="text-sm font-bold text-[var(--crm-text)]">Messages</h2>
                    <p className="mt-0.5 text-[10px] text-[var(--crm-text-muted)]">Team conversations and project updates</p>
                </div>
                <button type="button" onClick={onNewConversation}
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface)] text-[var(--crm-text-muted)] hover:border-[var(--crm-gold)] hover:text-[var(--crm-gold)] transition"
                    title="New conversation">
                    <Plus size={16} />
                </button>
            </div>

            {/* Search */}
            <div className="border-b border-[var(--crm-border)] px-3 py-2.5">
                <div className="relative">
                    <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--crm-muted)]" />
                    <input value={search} onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search conversations..."
                        className="h-8 w-full rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface)] pl-8 pr-3 text-xs text-[var(--crm-text)] outline-none placeholder:text-[var(--crm-muted)] focus:border-[var(--crm-gold)]" />
                </div>
            </div>

            {/* Online now */}
            {onlineUsers.length > 0 ? (
                <div className="border-b border-[var(--crm-border)] px-3 py-2">
                    <p className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--crm-muted)]">Online now</p>
                    <div className="flex flex-wrap gap-1.5">
                        {onlineUsers.map((u) => (
                            <span key={u.id}
                                className="inline-flex items-center gap-1 rounded-full border border-[var(--crm-border)] bg-[var(--crm-surface)] px-2 py-0.5 text-[10px] font-semibold text-[var(--crm-text)]">
                                <span className="size-1.5 rounded-full bg-emerald-400" />
                                {u.name}
                            </span>
                        ))}
                    </div>
                </div>
            ) : null}

            {/* Tabs */}
            <div className="flex flex-wrap gap-1 border-b border-[var(--crm-border)] px-3 py-2">
                {MAIN_TABS.map((tab) => (
                    <button key={tab.id} type="button" onClick={() => onTabChange(tab.id)}
                        className={`rounded-lg px-2.5 py-1 text-[10px] font-semibold transition ${
                            activeTab === tab.id
                                ? 'bg-[var(--crm-gold)] text-black'
                                : 'text-[var(--crm-text-muted)] hover:text-[var(--crm-text)]'
                        }`}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Category filter (groups tab only) */}
            {activeTab === 'groups' && (
                <div className="flex items-center gap-2 border-b border-[var(--crm-border)] px-3 py-2">
                    <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}
                        className="h-7 rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface)] px-2 text-[10px] text-[var(--crm-text)] outline-none focus:border-[var(--crm-gold)]">
                        <option value="">All categories</option>
                        {CATEGORY_OPTIONS.filter((c) => c.id !== 'custom').map((c) => (
                            <option key={c.id} value={c.id}>{c.label}</option>
                        ))}
                    </select>
                    {catFilter && (
                        <button type="button" onClick={() => setCatFilter('')}
                            className="flex size-5 items-center justify-center rounded text-[var(--crm-text-muted)] hover:text-[var(--crm-gold)]">
                            <X size={12} />
                        </button>
                    )}
                </div>
            )}

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto scrollbar-none">
                {displayedConvs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4">
                        <div className="flex size-12 items-center justify-center rounded-full bg-[var(--crm-surface-3)] mb-3">
                            <Search size={18} className="text-[var(--crm-muted)]" />
                        </div>
                        <p className="text-xs text-[var(--crm-text-muted)] text-center">No conversations found</p>
                        <p className="mt-1 text-[10px] text-[var(--crm-muted)] text-center">Start a new conversation to begin chatting</p>
                    </div>
                ) : (
                    displayedConvs.map((conv) => {
                        const name = getConversationDisplayName(conv, currentUserId);
                        const initials = getConversationInitials(conv, currentUserId);
                        const isSelected = selectedConvId === conv.id;
                        const isGroup = conv.type === 'group';
                        const catMeta = getCategoryMeta(isGroup ? conv.category : null);
                        const avatarTone = getAvatarTone(isGroup ? conv.id : name);
                        const preview = getLastMessagePreview(conv, currentUserId);

                        return (
                            <button key={conv.id} type="button" onClick={() => onSelect(conv)}
                                onMouseEnter={() => setRowHoverId(conv.id)}
                                onMouseLeave={() => setRowHoverId(null)}
                                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition ${
                                    isSelected
                                        ? 'bg-[color-mix(in_srgb,var(--crm-gold)_10%,transparent)]'
                                        : 'hover:bg-[var(--crm-surface)]'
                                } ${conv.unreadCount > 0 && !isSelected ? 'border-l-2 border-[var(--crm-gold)]' : ''}`}>
                                <div className="relative shrink-0">
                                    {isGroup ? (
                                        <div className={`flex size-10 items-center justify-center rounded-xl ${avatarTone.bg} ${avatarTone.text}`}>
                                            <Users size={16} />
                                        </div>
                                    ) : (
                                        <div className={`flex size-10 items-center justify-center rounded-full ${avatarTone.bg} ${avatarTone.text} text-sm font-bold`}>
                                            {initials}
                                        </div>
                                    )}
                                    {!isGroup && conv.participants?.length === 2 ? (() => {
                                        const parts = Array.isArray(conv.participants) ? conv.participants : [];
                                        const other = parts.find((p) => p?.user?.id !== currentUserId);
                                        const ls = other?.user?.lastSeenAt;
                                        if (ls && Date.now() - new Date(ls).getTime() < 300000) {
                                            return <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-[var(--crm-elevated)] bg-emerald-400" />;
                                        }
                                        return null;
                                    })() : null}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                            <p className={`truncate text-sm ${
                                                conv.unreadCount > 0 ? 'font-bold text-[var(--crm-text)]' : 'font-semibold text-[var(--crm-text)]'
                                            }`}>
                                                {name}
                                            </p>
                                            {isGroup && conv.category ? (
                                                <span className={`shrink-0 rounded px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide ${catMeta.tone.bg} ${catMeta.tone.text}`}>
                                                    {catMeta.label}
                                                </span>
                                            ) : null}
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            {conv.lastMessageAt ? (
                                                <span className="text-[9px] text-[var(--crm-text-muted)]">{formatConversationTime(conv.lastMessageAt)}</span>
                                            ) : null}
                                        </div>
                                    </div>
                                    <div className="mt-0.5 flex items-center gap-1.5">
                                        {preview ? (
                                            <p className="truncate text-[11px] text-[var(--crm-text-muted)]">{preview}</p>
                                        ) : null}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    {rowHoverId === conv.id ? (
                                        <button type="button" onClick={(e) => { e.stopPropagation(); onArchiveToggle?.(conv); }}
                                            className="flex size-6 items-center justify-center rounded-md text-[var(--crm-text-muted)] hover:text-[var(--crm-gold)] transition"
                                            title={conv.archivedAt ? 'Unarchive' : 'Archive'}>
                                            {conv.archivedAt ? <ArchiveRestore size={12} /> : <Archive size={12} />}
                                        </button>
                                    ) : null}
                                    {conv.unreadCount > 0 ? (
                                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                                            {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                                        </span>
                                    ) : null}
                                </div>
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
}

```


## FILE: resources\js\features\inbox\components\MessagePopover.tsx
```
import { router, usePage } from '@inertiajs/react';
import { echo } from '@laravel/echo-react';
import { ExternalLink, MessageSquare, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button, Dialog, DialogTrigger, Popover } from 'react-aria-components';
import type { ConversationRow } from '@/features/chat/types';
import { getAvatarTone, getCategoryMeta, getConversationDisplayName, getConversationInitials, getLastMessagePreview, formatConversationTime } from '@/features/inbox/utils';

type ConvData = { recent_conversations?: ConversationRow[] };

const TABS = [
    { id: 'recent', label: 'Recent' },
    { id: 'unread', label: 'Unread' },
    { id: 'direct', label: 'Direct' },
    { id: 'groups', label: 'Groups' },
] as const;

function ConvRow({ conv, currentUserId, onClose }: { conv: ConversationRow; currentUserId: number; onClose: () => void }) {
    const name = getConversationDisplayName(conv, currentUserId);
    const initials = getConversationInitials(conv, currentUserId);
    const isGroup = conv.type === 'group';
    const catMeta = getCategoryMeta(isGroup ? conv.category : null);
    const avatarTone = getAvatarTone(isGroup ? conv.id : name);
    const preview = getLastMessagePreview(conv, currentUserId);
    const messageId = conv.lastMessage?.id;

    function handleClick() {
        const params = new URLSearchParams({ conversation: String(conv.id) });
        if (messageId) params.set('message', String(messageId));
        router.visit(`/inbox?${params.toString()}`);
        onClose();
    }

    return (
        <button type="button" onClick={handleClick}
            className={`group flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-[var(--crm-surface)] ${conv.unreadCount > 0 ? 'bg-[var(--crm-gold)]/[0.03]' : ''}`}>
            <div className="relative shrink-0">
                {isGroup ? (
                    <div className={`flex size-10 items-center justify-center rounded-xl ${avatarTone.bg} ${avatarTone.text}`}>
                        <Users size={16} />
                    </div>
                ) : (
                    <div className={`flex size-10 items-center justify-center rounded-full ${avatarTone.bg} ${avatarTone.text} text-sm font-bold`}>
                        {initials}
                    </div>
                )}
                {!isGroup && conv.participants?.length === 2 ? (() => {
                    const other = (conv.participants || []).find((p) => p?.user?.id !== currentUserId);
                    const ls = other?.user?.lastSeenAt;
                    if (ls && Date.now() - new Date(ls).getTime() < 300000) {
                        return <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-[var(--crm-elevated)] bg-emerald-400" />;
                    }
                    return null;
                })() : null}
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                        <p className={`truncate text-xs ${conv.unreadCount > 0 ? 'font-bold text-[var(--crm-text)]' : 'font-semibold text-[var(--crm-text-muted)]'}`}>
                            {name}
                        </p>
                        {isGroup && conv.category ? (
                            <span className={`shrink-0 rounded px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide ${catMeta.tone.bg} ${catMeta.tone.text}`}>
                                {catMeta.label}
                            </span>
                        ) : null}
                    </div>
                    <span className="shrink-0 text-[9px] text-[var(--crm-text-muted)]">{formatConversationTime(conv.lastMessageAt)}</span>
                </div>
                <div className="mt-0.5 flex items-center gap-2">
                    <p className={`truncate text-[11px] ${conv.unreadCount > 0 ? 'font-medium text-[var(--crm-text)]' : 'text-[var(--crm-text-muted)]'}`}>
                        {preview}
                    </p>
                </div>
            </div>
            {conv.unreadCount > 0 ? (
                <div className="shrink-0">
                    <span className="flex size-5 items-center justify-center rounded-full bg-[var(--crm-gold)] text-[9px] font-bold text-black">
                        {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                    </span>
                </div>
            ) : null}
            {conv.unreadCount > 0 ? (
                <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-r-full bg-[var(--crm-gold)]" />
            ) : null}
        </button>
    );
}

export function MessagePopover() {
    const [activeTab, setActiveTab] = useState<'recent' | 'unread' | 'direct' | 'groups'>('recent');

    const { auth } = usePage().props as { auth: { user?: { recent_conversations?: ConversationRow[]; unread_messages?: number; id?: number } } };
    const [convs, setConvs] = useState<ConversationRow[]>(auth?.user?.recent_conversations ?? []);
    const [unreadCount, setUnreadCount] = useState(auth?.user?.unread_messages ?? 0);
    const currentUserId = auth?.user?.id ?? 0;

    useEffect(() => {
        setConvs(auth?.user?.recent_conversations ?? []);
        setUnreadCount(auth?.user?.unread_messages ?? 0);
    }, [auth?.user?.recent_conversations, auth?.user?.unread_messages]);

    useEffect(() => {
        if (!currentUserId) return;
        const e = echo();
        const channel = e.private(`user.${currentUserId}.inbox`);
        channel.listen('.inbox.updated', () => {
            router.reload({ only: ['conversations', 'unreadCount'], preserveState: true, preserveScroll: true });
        });
        return () => {
            e.leaveChannel(`private-user.${currentUserId}.inbox`);
        };
    }, [currentUserId]);

    const filtered = useMemo(() => {
        if (activeTab === 'recent') return convs;
        if (activeTab === 'unread') return convs.filter((c) => c.unreadCount > 0);
        if (activeTab === 'direct') return convs.filter((c) => c.type === 'direct');
        if (activeTab === 'groups') return convs.filter((c) => c.type === 'group');
        return convs;
    }, [convs, activeTab]);

    const tabCounts = useMemo(() => {
        return {
            recent: convs.length,
            unread: convs.filter((c) => c.unreadCount > 0).length,
            direct: convs.filter((c) => c.type === 'direct').length,
            groups: convs.filter((c) => c.type === 'group').length,
        };
    }, [convs]);

    return (
        <DialogTrigger>
            <Button className="crm-action-button relative h-9 w-9 px-0 sm:inline-flex" aria-label="Messages">
                <MessageSquare size={15} />
                {unreadCount > 0 ? (
                    <span className="absolute -right-1 -top-1 flex min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold leading-none text-white">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                ) : null}
            </Button>
            <Popover placement="bottom end" className="react-aria-Popover" style={{ maxWidth: '480px', minWidth: '420px' }}>
                <Dialog className="outline-none" aria-label="Messages">
                    {({ close }) => (
                        <div className="flex max-h-[70vh] flex-col rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] shadow-2xl shadow-black/50">
                            <div className="flex items-center justify-between border-b border-[var(--crm-border)] px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-[var(--crm-text)]">Messages</span>
                                    {unreadCount > 0 ? (
                                        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-md bg-[var(--crm-gold)] px-1.5 text-[10px] font-bold text-black">{unreadCount}</span>
                                    ) : null}
                                </div>
                                <button type="button" onClick={() => { router.visit('/inbox'); close(); }}
                                    className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--crm-text-muted)] transition hover:bg-[var(--crm-surface)] hover:text-[var(--crm-gold)]">
                                    <ExternalLink size={13} />
                                </button>
                            </div>

                            <div className="flex gap-1 border-b border-[var(--crm-border)] px-3 py-2">
                                {TABS.map((tab) => {
                                    const count = tabCounts[tab.id];
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                                            className={`inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[10px] font-semibold transition ${isActive ? 'bg-[var(--crm-gold)] text-black' : 'text-[var(--crm-text-muted)] hover:bg-[var(--crm-surface)] hover:text-[var(--crm-text)]'}`}>
                                            {tab.label}
                                            {count > 0 ? (
                                                <span className={`flex h-4 min-w-[16px] items-center justify-center rounded px-1 text-[9px] font-bold ${isActive ? 'bg-black/20 text-black' : 'bg-[var(--crm-surface-2)] text-[var(--crm-text-muted)]'}`}>
                                                    {count}
                                                </span>
                                            ) : null}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="flex-1 overflow-y-auto scrollbar-none">
                                {filtered.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                                        <MessageSquare size={24} className="text-[var(--crm-text-muted)]/40" />
                                        <p className="mt-2 text-xs font-semibold text-[var(--crm-text-muted)]">No messages yet</p>
                                        <p className="mt-1 text-[10px] text-[var(--crm-text-muted)]/60">Team conversations will appear here.</p>
                                    </div>
                                ) : (
                                    filtered.map((conv) => (
                                        <ConvRow key={conv.id} conv={conv} currentUserId={currentUserId} onClose={close} />
                                    ))
                                )}
                            </div>

                            <div className="border-t border-[var(--crm-border)] px-3 py-2">
                                <button type="button" onClick={() => { router.visit('/inbox'); close(); }}
                                    className="flex h-7 w-full items-center justify-center gap-1.5 rounded-md px-2.5 text-[10px] font-semibold text-[var(--crm-text-muted)] transition hover:bg-[var(--crm-surface)] hover:text-[var(--crm-gold)]">
                                    <ExternalLink size={12} />
                                    Open inbox
                                </button>
                            </div>
                        </div>
                    )}
                </Dialog>
            </Popover>
        </DialogTrigger>
    );
}

```


## FILE: resources\js\features\inbox\components\MessageThread.tsx
```
import { usePage } from '@inertiajs/react';
import { useTyping } from '@/features/inbox/components/useTyping';
import { toast } from 'sonner';
import { Check, CheckCheck, ChevronLeft, ChevronDown, ChevronUp, Copy, Forward, ImageIcon, MessageSquare, Pencil, Reply, Search, Send, Settings, Trash2, Users, X, UserMinus, UserPlus, Info } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ConversationRow, MessageAttachmentRow, MessageRow } from '@/features/chat/types';
import { getAvatarTone, getCategoryMeta, getConversationDisplayName, getConversationInitials, highlightSearchMatch, formatConversationTime } from '@/features/inbox/utils';

function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function dateSeparator(dateStr: string): string {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function shouldGroup(prev: MessageRow | undefined, curr: MessageRow): boolean {
    if (!prev) return false;
    if (prev.userId !== curr.userId) return false;
    const diff = new Date(curr.createdAt).getTime() - new Date(prev.createdAt).getTime();
    return diff < 300000;
}

function ImageGrid({ attachments, onImageClick }: { attachments: MessageAttachmentRow[]; onImageClick?: (index: number) => void }) {
    const count = attachments.length;
    if (count === 0) return null;
    const urls = attachments.map((a) => a.url || '').filter(Boolean);
    function img(url: string, i: number, cls: string) {
        return <img key={i} src={url} alt="" loading="lazy" className={`${cls} cursor-pointer hover:brightness-90 transition`} onClick={() => onImageClick?.(i)} />;
    }
    if (count === 1) return img(urls[0], 0, 'max-h-64 w-full rounded-lg object-cover');
    if (count === 2) return <div className="flex gap-1 rounded-lg overflow-hidden">{urls.map((url, i) => img(url, i, 'w-1/2 h-40 object-cover'))}</div>;
    if (count === 3) return <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden">{img(urls[0], 0, 'row-span-2 h-48 w-full object-cover')}{img(urls[1], 1, 'h-[94px] w-full object-cover')}{img(urls[2], 2, 'h-[94px] w-full object-cover')}</div>;
    return (
        <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden relative">
            {urls.slice(0, 4).map((url, i) => (
                <div key={i} className="relative">
                    {img(url, i, 'h-32 w-full object-cover')}
                    {i === 3 && count > 4 ? <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-bold text-white pointer-events-none">+{count - 4}</div> : null}
                </div>
            ))}
        </div>
    );
}

function Lightbox({ images, initialIndex, onClose }: { images: { url: string; originalFilename: string }[]; initialIndex: number; onClose: () => void }) {
    const [index, setIndex] = useState(initialIndex);
    const current = images[index];
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') setIndex((i) => Math.max(0, i - 1));
            if (e.key === 'ArrowRight') setIndex((i) => Math.min(images.length - 1, i + 1));
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [images.length, onClose]);
    if (!current) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80" onClick={onClose}>
            <button type="button" onClick={onClose} className="absolute right-4 top-4 z-10 flex size-10 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"><X size={20} /></button>
            {images.length > 1 && index > 0 ? <button type="button" onClick={(e) => { e.stopPropagation(); setIndex((i) => i - 1); }} className="absolute left-4 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"><ChevronLeft size={20} /></button> : null}
            {images.length > 1 && index < images.length - 1 ? <button type="button" onClick={(e) => { e.stopPropagation(); setIndex((i) => i + 1); }} className="absolute right-4 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"><ChevronLeft size={20} className="rotate-180" /></button> : null}
            <div onClick={(e) => e.stopPropagation()} className="flex flex-col items-center max-w-[90vw] max-h-[90vh]">
                <img src={current.url} alt={current.originalFilename} className="max-h-[80vh] max-w-[90vw] rounded-lg object-contain" />
                <p className="mt-2 text-xs text-white/60">{current.originalFilename}</p>
            </div>
        </div>
    );
}

function ForwardModal({ conversations, currentUserId, onClose, onForward }: {
    conversations: ConversationRow[]; currentUserId: number; onClose: () => void; onForward: (convIds: number[]) => void;
}) {
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const convs = useMemo(() => conversations
        .filter((c) => c.id)
        .map((c) => {
            const others = (c.participants || []).filter((p) => p?.user?.id !== currentUserId);
            return { id: c.id, name: others.map((p) => p?.user?.name).filter(Boolean).join(', ') || c.subject || `Conversation #${c.id}` };
        }), [conversations, currentUserId]);
    const filtered = convs.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
    const toggle = (id: number) => setSelected((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 px-4" onClick={onClose}>
            <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] shadow-2xl">
                <div className="flex items-center justify-between border-b border-[var(--crm-border)] px-4 py-3">
                    <p className="text-sm font-bold text-[var(--crm-text)]">Forward message</p>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[var(--crm-text-muted)]">{selected.size > 0 ? `${selected.size} selected` : ''}</span>
                        <button type="button" onClick={onClose} className="text-[var(--crm-muted)] hover:text-[var(--crm-text)]"><X size={16} /></button>
                    </div>
                </div>
                <div className="px-4 py-3">
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search conversations..." className="h-8 w-full rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface)] px-3 text-xs text-[var(--crm-text)] outline-none placeholder:text-[var(--crm-muted)] focus:border-[var(--crm-gold)]" />
                </div>
                <div className="max-h-60 overflow-y-auto px-2 pb-2">
                    {filtered.length === 0 ? <p className="py-6 text-center text-xs text-[var(--crm-text-muted)]">No conversations found</p> : filtered.map((c) => (
                        <button key={c.id} type="button" onClick={() => toggle(c.id)} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold transition ${selected.has(c.id) ? 'bg-[var(--crm-gold)]/10 text-[var(--crm-gold)]' : 'text-[var(--crm-text)] hover:bg-[var(--crm-surface)]'}`}>
                            <div className={`flex size-4 shrink-0 items-center justify-center rounded border ${selected.has(c.id) ? 'border-[var(--crm-gold)] bg-[var(--crm-gold)] text-black' : 'border-[var(--crm-border)]'}`}>{selected.has(c.id) ? <Check size={10} /> : null}</div>
                            <Forward size={14} className="text-[var(--crm-muted)]" />
                            {c.name}
                        </button>
                    ))}
                </div>
                {selected.size > 0 ? (
                    <div className="border-t border-[var(--crm-border)] px-4 py-3">
                        <button type="button" onClick={() => { onForward(Array.from(selected)); setSelected(new Set()); }}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--crm-gold)] px-4 py-2 text-xs font-bold text-black hover:brightness-110 transition">
                            <Forward size={14} /> Forward to {selected.size} conversation{selected.size > 1 ? 's' : ''}
                        </button>
                    </div>
                ) : null}
            </div>
        </div>
    );
}

function MessageBubble({ msg, isMine, grouped, isGroup, currentUserId, onReply, onForward: onForwardMsg, onImageClick, onEdit, onDelete, searchQuery }: {
    msg: MessageRow; isMine: boolean; grouped: boolean; isGroup: boolean; currentUserId: number;
    onReply: (msg: MessageRow) => void; onForward: (msg: MessageRow) => void;
    onImageClick: (attachments: MessageAttachmentRow[], index: number) => void;
    onEdit?: (msg: MessageRow) => void; onDelete?: (msg: MessageRow) => void; searchQuery?: string;
}) {
    const [hovered, setHovered] = useState(false);
    const avatarTone = getAvatarTone(msg.userId);
    const highlight = (text: string) => {
        if (!searchQuery || !text) return text;
        const match = highlightSearchMatch(text, searchQuery);
        if (!match) return text;
        return <>{match.before}<mark className="bg-[var(--crm-gold)]/30 text-inherit rounded px-0.5">{match.match}</mark>{match.after}</>;
    };
    return (
        <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-0.5`}>
            <div className={`max-w-[75%] min-w-0 ${grouped ? '' : 'mt-2'}`}>
                {isGroup && !isMine && !grouped ? (
                    <p className={`text-[10px] font-semibold mb-1 ${avatarTone.text}`}>{msg.user?.name || msg.userName || 'Unknown'}</p>
                ) : null}
                {msg.isForwarded ? <p className={`text-[9px] text-[var(--crm-muted)] mb-0.5 ${isMine ? 'text-right' : 'text-left'}`}>Forwarded</p> : null}
                {msg.replyTo ? (
                    <div className={`mb-1 rounded-lg border-l-2 px-2.5 py-1.5 ${isMine ? 'border-[var(--crm-gold)]/50 bg-black/20' : 'border-[var(--crm-border)] bg-[var(--crm-surface-3)]'}`}>
                        <p className="text-[9px] font-semibold text-[var(--crm-text-muted)]">Replied to {msg.replyTo.userName || 'a message'}</p>
                        <p className="text-[10px] text-[var(--crm-text-muted)] truncate">{msg.replyTo.body || (msg.replyTo.attachmentsCount > 0 ? 'Photo' : '')}</p>
                    </div>
                ) : null}
                <div className={`rounded-xl overflow-hidden ${isMine ? 'bg-[var(--crm-gold)] text-black' : 'border border-[var(--crm-border)] bg-[var(--crm-surface-2)]'}`}>
                    {msg.attachments && msg.attachments.length > 0 ? (
                        <div className={`${msg.body ? 'rounded-t-xl' : 'rounded-xl'} overflow-hidden`}>
                            <ImageGrid attachments={msg.attachments} onImageClick={(i) => onImageClick(msg.attachments!, i)} />
                        </div>
                    ) : null}
                    {msg.body ? (
                        <div className={`px-3 py-2 text-xs whitespace-pre-wrap break-words ${msg.attachments && msg.attachments.length > 0 ? 'border-t border-black/10' : ''}`}>
                            {highlight(msg.body)}
                        </div>
                    ) : null}
                </div>
                <div className={`mt-0.5 flex items-center gap-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
                    {msg.isEdited ? <span className="text-[9px] text-[var(--crm-text-muted)]">edited</span> : null}
                    <span className="text-[9px] text-[var(--crm-text-muted)]">{formatTime(msg.createdAt)}</span>
                    {isMine ? (
                        msg.readBy && msg.readBy.length > 0 ? <CheckCheck size={11} className="text-emerald-400" /> : <Check size={11} className="text-[var(--crm-text-muted)]" />
                    ) : null}
                </div>
                {hovered ? (
                    <div className={`flex gap-1 mt-0.5 ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <button type="button" onClick={() => onReply(msg)} className="flex size-6 items-center justify-center rounded-md bg-[var(--crm-surface-3)] text-[var(--crm-text-muted)] hover:text-[var(--crm-text)] transition"><Reply size={11} /></button>
                        <button type="button" onClick={() => onForward(msg)} className="flex size-6 items-center justify-center rounded-md bg-[var(--crm-surface-3)] text-[var(--crm-text-muted)] hover:text-[var(--crm-text)] transition"><Forward size={11} /></button>
                        {isMine && msg.body ? <button type="button" onClick={() => onEdit?.(msg)} className="flex size-6 items-center justify-center rounded-md bg-[var(--crm-surface-3)] text-[var(--crm-text-muted)] hover:text-[var(--crm-gold)] transition"><Pencil size={11} /></button> : msg.body ? <button type="button" onClick={() => { navigator.clipboard.writeText(msg.body || ''); }} className="flex size-6 items-center justify-center rounded-md bg-[var(--crm-surface-3)] text-[var(--crm-text-muted)] hover:text-[var(--crm-text)] transition"><Copy size={11} /></button> : null}
                        {isMine ? <button type="button" onClick={() => onDelete?.(msg)} className="flex size-6 items-center justify-center rounded-md bg-[var(--crm-surface-3)] text-[var(--crm-text-muted)] hover:text-red-400 transition"><Trash2 size={11} /></button> : null}
                    </div>
                ) : null}
            </div>
        </div>
    );
}

type Props = {
    conversation: ConversationRow;
    conversations: ConversationRow[];
    messages: MessageRow[];
    loading: boolean;
    loadingOlder: boolean;
    paginator: { currentPage: number; lastPage: number; perPage: number; total: number } | null;
    currentUserId: number;
    onSend: (body: string, images: File[], replyToId?: number) => Promise<MessageRow> | undefined;
    onLoadOlder: () => void;
    onMessageUpdate?: (message: MessageRow) => void;
    onMessageDelete?: (messageId: number) => void;
    onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
};

export function MessageThread({ conversation, conversations, messages, loading, loadingOlder, paginator, currentUserId, onSend, onLoadOlder, onMessageUpdate, onMessageDelete, onScroll }: Props) {
    const pageUsers = ((usePage().props as any)?.users || []) as { id: number; name: string }[];
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const prevLastId = useRef<number | null>(null);
    const [text, setText] = useState('');
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [replyTo, setReplyTo] = useState<MessageRow | null>(null);
    const [lightboxOpen, setLightboxOpen] = useState<{ images: { url: string; originalFilename: string }[]; index: number } | null>(null);
    const [forwardMsg, setForwardMsg] = useState<MessageRow | null>(null);
    const [editingMsg, setEditingMsg] = useState<MessageRow | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
    const [sending, setSending] = useState(false);
    const [groupSettingsOpen, setGroupSettingsOpen] = useState(false);
    const [groupSubject, setGroupSubject] = useState(conversation.subject || '');
    const [addUserId, setAddUserId] = useState('');
    const [availableUsers, setAvailableUsers] = useState<{ id: number; name: string }[]>([]);
    const [infoPanelOpen, setInfoPanelOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<number[]>([]);
    const [searchIndex, setSearchIndex] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const authUser = (usePage().props.auth?.user as { id: number; name: string } | undefined) || { id: 0, name: '' };
    const { typingUsers, sendTyping } = useTyping(
        conversation?.id ?? null,
        currentUserId,
        authUser?.name || 'User',
    );

    useEffect(() => {
        if (messages.length > 0) {
            const lastId = messages[messages.length - 1].id;
            if (lastId !== prevLastId.current) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            prevLastId.current = lastId;
        }
    }, [messages]);

    useEffect(() => {
        if (!searchQuery) { setSearchResults([]); setSearchIndex(0); return; }
        const q = searchQuery.toLowerCase();
        const ids = messages.filter((m) => (m.body || '').toLowerCase().includes(q) || (m.userName || '').toLowerCase().includes(q) || (m.replyTo?.body || '').toLowerCase().includes(q)).map((m) => m.id);
        setSearchResults(ids);
        setSearchIndex(0);
    }, [searchQuery, messages]);

    useEffect(() => {
        if (searchResults.length > 0 && searchIndex < searchResults.length) {
            const el = document.getElementById(`msg-${searchResults[searchIndex]}`);
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [searchResults, searchIndex]);

    const parts = Array.isArray(conversation.participants) ? conversation.participants : [];
    const others = parts.filter((p) => p?.user?.id !== currentUserId);
    const otherName = getConversationDisplayName(conversation, currentUserId);
    const isGroup = conversation.type === 'group';
    const catMeta = getCategoryMeta(isGroup ? conversation.category : null);

    const statusLine = useMemo(() => {
        if (isGroup) {
            const pc = conversation.participantsCount ?? parts.length;
            const oc = conversation.onlineCount ?? parts.filter((p) => p?.user?.lastSeenAt && Date.now() - new Date(p.user.lastSeenAt).getTime() < 300000).length;
            return `${pc} member${pc !== 1 ? 's' : ''}${oc > 0 ? ` Â· ${oc} online` : ''}`;
        }
        const other = others[0];
        if (!other) return '';
        const ls = other.user?.lastSeenAt;
        if (!ls) return '';
        const diff = Date.now() - new Date(ls).getTime();
        if (diff < 300000) return 'Online';
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `Last seen ${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `Last seen ${hours}h ago`;
        return `Last seen ${new Date(ls).toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
    }, [conversation, others, parts, isGroup]);

    const handleSend = useCallback(async () => {
        const body = text.trim();
        if (!body && selectedImages.length === 0) return;
        if (sending) return;
        setSending(true);
        try {
            await onSend(body, selectedImages, replyTo?.id);
            setText(''); setSelectedImages([]); setReplyTo(null);
            if (textareaRef.current) textareaRef.current.style.height = 'auto';
        } catch { /* handled */ } finally { setSending(false); }
    }, [text, selectedImages, replyTo, sending, onSend]);

    const handleUpdate = useCallback(async () => {
        const body = text.trim();
        if (!body || !editingMsg || sending) return;
        setSending(true);
        try {
            const res = await fetch(`/inbox/${conversation.id}/messages/${editingMsg.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': (window as any).csrfToken || '' }, body: JSON.stringify({ body }) });
            if (!res.ok) { toast.error('Failed to update message'); return; }
            const updated: MessageRow = await res.json();
            onMessageUpdate?.(updated);
            setEditingMsg(null); setText('');
            if (textareaRef.current) textareaRef.current.style.height = 'auto';
        } catch { toast.error('Failed to update message'); } finally { setSending(false); }
    }, [text, editingMsg, sending, conversation.id, onMessageUpdate]);

    const handleEdit = useCallback((msg: MessageRow) => {
        setEditingMsg(msg); setText(msg.body || ''); setReplyTo(null); setSelectedImages([]);
        setTimeout(() => { if (textareaRef.current) { textareaRef.current.focus(); textareaRef.current.style.height = 'auto'; textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'; } }, 0);
    }, []);

    const handleDelete = useCallback((msg: MessageRow) => {
        if (deleteConfirmId === msg.id) {
            fetch(`/inbox/${conversation.id}/messages/${msg.id}`, { method: 'DELETE', headers: { 'X-CSRF-TOKEN': (window as any).csrfToken || '' } }).then((res) => { if (res.ok) onMessageDelete?.(msg.id); }).catch(() => {});
            setDeleteConfirmId(null);
        } else { setDeleteConfirmId(msg.id); setTimeout(() => setDeleteConfirmId(null), 3000); }
    }, [deleteConfirmId, conversation.id, onMessageDelete]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (editingMsg) handleUpdate(); else handleSend(); }
        if (e.key === 'Escape' && editingMsg) { setEditingMsg(null); setText(''); if (textareaRef.current) textareaRef.current.style.height = 'auto'; }
    }, [handleSend, handleUpdate, editingMsg]);

    const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setSelectedImages((prev) => [...prev, ...files].slice(0, 10));
        if (fileInputRef.current) fileInputRef.current.value = '';
    }, []);

    const removeImage = useCallback((i: number) => setSelectedImages((prev) => prev.filter((_, idx) => idx !== i)), []);
    const handleImageClick = useCallback((attachments: MessageAttachmentRow[], index: number) => {
        const images = attachments.filter((a) => a.url).map((a) => ({ url: a.url!, originalFilename: a.originalFilename }));
        if (images.length > 0) setLightboxOpen({ images, index });
    }, []);

    const handleForward = useCallback(async (convIds: number[]) => {
        if (!forwardMsg) return;
        try {
            const res = await fetch(`/inbox/${conversation.id}/messages/${forwardMsg.id}/forward`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': (window as any).csrfToken || '' },
                body: JSON.stringify({ conversation_ids: convIds }),
            });
            if (res.ok) {
                const data = await res.json();
                if (data.forwarded) {
                    toast.success(`Forwarded to ${convIds.length} conversation${convIds.length > 1 ? 's' : ''}`);
                }
            } else {
                toast.error('Failed to forward message');
            }
            setForwardMsg(null);
        } catch { toast.error('Failed to forward message'); }
    }, [forwardMsg, conversation.id]);

    const handleRenameGroup = useCallback(async () => {
        if (!groupSubject.trim() || !isGroup) return;
        try {
            const res = await fetch(`/inbox/${conversation.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': (window as any).csrfToken || '' }, body: JSON.stringify({ subject: groupSubject.trim() }) });
            if (res.ok) { toast.success('Group renamed'); setGroupSettingsOpen(false); }
        } catch { toast.error('Failed to rename group'); }
    }, [conversation.id, isGroup, groupSubject]);

    const handleAddParticipant = useCallback(async () => {
        if (!addUserId) return;
        try {
            const res = await fetch(`/inbox/${conversation.id}/participants`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': (window as any).csrfToken || '' }, body: JSON.stringify({ user_id: Number(addUserId) }) });
            if (res.ok) { toast.success('Participant added'); setAddUserId(''); setAvailableUsers([]); }
        } catch { toast.error('Failed to add participant'); }
    }, [conversation.id, addUserId]);

    const handleRemoveParticipant = useCallback(async (userId: number) => {
        try {
            const res = await fetch(`/inbox/${conversation.id}/participants/${userId}`, { method: 'DELETE', headers: { 'X-CSRF-TOKEN': (window as any).csrfToken || '' } });
            if (res.ok) toast.success('Participant removed');
        } catch { toast.error('Failed to remove participant'); }
    }, [conversation.id]);

    const openGroupSettings = useCallback(() => {
        setGroupSubject(conversation.subject || '');
        setAvailableUsers(pageUsers.filter((u) => !parts.some((p) => p?.user?.id === u.id)));
        setGroupSettingsOpen(true);
    }, [conversation.subject, parts, pageUsers]);

    const groupedDates = useMemo(() => {
        const dates: { label: string; messageIds: number[] }[] = [];
        let lastLabel = '';
        for (const msg of messages) {
            const label = dateSeparator(msg.createdAt);
            if (label !== lastLabel) { dates.push({ label, messageIds: [msg.id] }); lastLabel = label; }
            else { dates[dates.length - 1].messageIds.push(msg.id); }
        }
        return dates;
    }, [messages]);

    const canSend = editingMsg ? text.trim().length > 0 : text.trim().length > 0 || selectedImages.length > 0;
    const avatarTone = getAvatarTone(isGroup ? conversation.id : otherName + currentUserId);

    return (
        <div className="flex flex-1 flex-col min-h-0">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-[var(--crm-border)] bg-[var(--crm-surface)] px-4 py-3 shrink-0">
                <div className="relative shrink-0">
                    {isGroup ? (
                        <div className={`flex size-9 items-center justify-center rounded-xl ${avatarTone.bg} ${avatarTone.text}`}><Users size={16} /></div>
                    ) : (
                        <div className={`flex size-9 items-center justify-center rounded-full ${avatarTone.bg} ${avatarTone.text} text-sm font-bold`}>{getConversationInitials(conversation, currentUserId)}</div>
                    )}
                    {!isGroup && others.length === 1 && statusLine === 'Online' ? (
                        <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-[var(--crm-surface)] bg-emerald-400" />
                    ) : null}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-[var(--crm-text)]">{otherName}</p>
                        {isGroup && conversation.category ? (
                            <span className={`shrink-0 rounded px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide ${catMeta.tone.bg} ${catMeta.tone.text}`}>{catMeta.label}</span>
                        ) : null}
                    </div>
                    {statusLine ? <p className="text-[10px] text-[var(--crm-text-muted)]">{statusLine}</p> : null}
                </div>
                {searchOpen ? (
                    <div className="flex items-center gap-1">
                        <input ref={searchInputRef} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search messages..." autoFocus
                            className="h-7 w-40 rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface)] px-2 text-[10px] text-[var(--crm-text)] outline-none placeholder:text-[var(--crm-muted)] focus:border-[var(--crm-gold)]" />
                        {searchResults.length > 0 ? <span className="text-[9px] text-[var(--crm-text-muted)] shrink-0">{searchIndex + 1}/{searchResults.length}</span> : null}
                        <button type="button" onClick={() => { setSearchIndex((i) => Math.min(i + 1, searchResults.length - 1)); }} disabled={searchResults.length === 0} className="flex size-6 items-center justify-center rounded text-[var(--crm-text-muted)] hover:text-[var(--crm-text)] disabled:opacity-30"><ChevronUp size={12} /></button>
                        <button type="button" onClick={() => { setSearchIndex((i) => Math.max(i - 1, 0)); }} disabled={searchResults.length === 0} className="flex size-6 items-center justify-center rounded text-[var(--crm-text-muted)] hover:text-[var(--crm-text)] disabled:opacity-30"><ChevronDown size={12} /></button>
                        <button type="button" onClick={() => { setSearchOpen(false); setSearchQuery(''); setSearchResults([]); }} className="flex size-6 items-center justify-center rounded text-[var(--crm-text-muted)] hover:text-[var(--crm-text)]"><X size={12} /></button>
                    </div>
                ) : (
                    <div className="flex items-center gap-1">
                        <button type="button" onClick={() => { setSearchOpen(true); setTimeout(() => searchInputRef.current?.focus(), 50); }} className="flex size-8 items-center justify-center rounded-lg text-[var(--crm-text-muted)] hover:text-[var(--crm-gold)] transition"><Search size={14} /></button>
                        <button type="button" onClick={() => setInfoPanelOpen(!infoPanelOpen)} className="flex size-8 items-center justify-center rounded-lg text-[var(--crm-text-muted)] hover:text-[var(--crm-gold)] transition xl:hidden"><Info size={14} /></button>
                        {isGroup ? <button type="button" onClick={openGroupSettings} className="flex size-8 items-center justify-center rounded-lg text-[var(--crm-text-muted)] hover:text-[var(--crm-gold)] transition"><Settings size={14} /></button> : null}
                    </div>
                )}
            </div>

            <div className="flex flex-1 min-h-0">
                {/* Messages area */}
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex-1 overflow-y-auto px-4 py-3 scrollbar-none" onScroll={onScroll}>
                        {loading ? (
                            <div className="flex items-center justify-center py-8"><div className="size-5 animate-spin rounded-full border-2 border-[var(--crm-gold)] border-t-transparent" /></div>
                        ) : messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <MessageSquare size={32} className="text-[var(--crm-muted)]" />
                                <p className="mt-2 text-xs text-[var(--crm-text-muted)]">No messages yet</p>
                                <p className="mt-0.5 text-[10px] text-[var(--crm-muted)]">Send a message to start the conversation</p>
                            </div>
                        ) : (
                            <>
                                {paginator && paginator.currentPage < paginator.lastPage ? (
                                    <div className="flex justify-center py-3">
                                        <button type="button" onClick={onLoadOlder} disabled={loadingOlder}
                                            className="flex items-center gap-1.5 rounded-full border border-[var(--crm-border)] bg-[var(--crm-surface)] px-3 py-1 text-[9px] font-semibold text-[var(--crm-text-muted)] hover:text-[var(--crm-text)] transition disabled:opacity-50">
                                            {loadingOlder ? <div className="size-3 animate-spin rounded-full border-2 border-[var(--crm-gold)] border-t-transparent" /> : null}
                                            {loadingOlder ? 'Loading...' : `Load older messages (${paginator.total - (paginator.currentPage * paginator.perPage) > 0 ? paginator.total - (paginator.currentPage * paginator.perPage) : 0} more)`}
                                        </button>
                                    </div>
                                ) : null}
                                {groupedDates.map((group) => (
                                    <div key={group.label}>
                                        <div className="flex items-center justify-center py-3">
                                            <span className="rounded-full border border-[var(--crm-border)] bg-[var(--crm-surface)] px-3 py-0.5 text-[9px] font-semibold text-[var(--crm-text-muted)]">{group.label}</span>
                                        </div>
                                        {group.messageIds.map((msgId, idx) => {
                                            const msg = messages.find((m) => m.id === msgId)!;
                                            const prev = idx > 0 ? messages.find((m) => m.id === group.messageIds[idx - 1]) : undefined;
                                            const isSearchResult = searchResults.includes(msg.id);
                                            return (
                                                <div key={msg.id} id={`msg-${msg.id}`} className={`msg-slide-in ${isSearchResult ? (searchResults[searchIndex] === msg.id ? 'ring-2 ring-[var(--crm-gold)]/50 rounded-lg' : 'ring-1 ring-[var(--crm-gold)]/20 rounded-lg') : ''}`}>
                                                    <MessageBubble msg={msg} isMine={msg.userId === currentUserId} grouped={shouldGroup(prev, msg)} isGroup={isGroup}
                                                        currentUserId={currentUserId} onReply={setReplyTo} onForward={setForwardMsg} onImageClick={handleImageClick}
                                                        onEdit={handleEdit} onDelete={handleDelete} searchQuery={searchQuery} />
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </>
                        )}
                    </div>

                    {/* Reply preview in composer */}
                    {replyTo && !editingMsg ? (
                        <div className="flex items-center gap-2 border-t border-[var(--crm-border)] bg-[var(--crm-surface)] px-4 py-2 shrink-0">
                            <div className="h-8 w-0.5 rounded-full bg-[var(--crm-gold)]" />
                            <div className="min-w-0 flex-1">
                                <p className="text-[10px] font-semibold text-[var(--crm-gold)]">Replying to {replyTo.userName || 'a message'}</p>
                                <p className="truncate text-[10px] text-[var(--crm-text-muted)]">{replyTo.body || (replyTo.attachments && replyTo.attachments.length > 0 ? 'Photo' : '')}</p>
                            </div>
                            <button type="button" onClick={() => setReplyTo(null)} className="flex size-6 items-center justify-center rounded-md text-[var(--crm-text-muted)] hover:text-[var(--crm-text)]"><X size={14} /></button>
                        </div>
                    ) : null}

                    {/* Editing bar */}
                    {editingMsg ? (
                        <div className="flex items-center gap-2 border-t border-[var(--crm-border)] bg-[var(--crm-surface)] px-4 py-2 shrink-0">
                            <div className="h-8 w-0.5 rounded-full bg-emerald-400" />
                            <div className="min-w-0 flex-1">
                                <p className="text-[10px] font-semibold text-emerald-400">Editing message</p>
                                <p className="truncate text-[10px] text-[var(--crm-text-muted)]">{editingMsg.body || ''}</p>
                            </div>
                            <button type="button" onClick={() => { setEditingMsg(null); setText(''); if (textareaRef.current) textareaRef.current.style.height = 'auto'; }} className="flex size-6 items-center justify-center rounded-md text-[var(--crm-text-muted)] hover:text-[var(--crm-text)]"><X size={14} /></button>
                        </div>
                    ) : null}

                    {/* Image previews */}
                    {selectedImages.length > 0 ? (
                        <div className="flex items-center gap-2 border-t border-[var(--crm-border)] bg-[var(--crm-surface)] px-4 py-2 overflow-x-auto shrink-0">
                            {selectedImages.map((file, i) => (
                                <div key={i} className="relative shrink-0">
                                    <img src={URL.createObjectURL(file)} alt="" className="size-14 rounded-lg object-cover border border-[var(--crm-border)]" />
                                    <button type="button" onClick={() => removeImage(i)} className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-white"><X size={8} /></button>
                                </div>
                            ))}
                        </div>
                    ) : null}

                    {/* Typing indicator */}
                    {typingUsers.length > 0 && !editingMsg ? (
                        <div className="border-t border-[var(--crm-border)] bg-gradient-to-r from-[color-mix(in_srgb,var(--crm-gold)_6%,transparent)] via-[var(--crm-surface)] to-[var(--crm-surface)] px-4 py-2 shrink-0">
                            <div className="typing-indicator inline-flex max-w-full items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--crm-gold)_28%,var(--crm-border))] bg-[color-mix(in_srgb,var(--crm-surface-2)_82%,black)] px-2.5 py-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
                                <div className="flex -space-x-1.5">
                                {typingUsers.slice(0, 2).map((u) => (
                                    <span key={u.id} className="typing-avatar flex size-6 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--crm-gold)_36%,var(--crm-border))] bg-[var(--crm-gold-soft)] text-[8px] font-black text-[var(--crm-gold)]">
                                        {u.name.charAt(0).toUpperCase()}
                                    </span>
                                ))}
                                </div>
                                <p className="min-w-0 truncate text-[11px] font-semibold text-[var(--crm-text-muted)]">
                                    <span className="text-[var(--crm-text)]">
                                        {typingUsers.length === 1 ? typingUsers[0].name :
                                            typingUsers.length === 2 ? `${typingUsers[0].name} + ${typingUsers[1].name}` :
                                            `${typingUsers[0].name} + ${typingUsers.length - 1}`}
                                    </span>
                                    <span className="ml-1">is typing</span>
                                </p>
                                <span className="typing-dots ml-0.5 inline-flex items-end gap-1 rounded-full bg-black/20 px-1.5 py-1" aria-hidden="true">
                                    <span className="typing-dot" />
                                    <span className="typing-dot" />
                                    <span className="typing-dot" />
                                </span>
                            </div>
                        </div>
                    ) : null}

                    {/* Composer */}
                    <div className="flex items-end gap-2 border-t border-[var(--crm-border)] bg-[var(--crm-surface)] px-4 py-3 shrink-0">
                        {!editingMsg ? <button type="button" onClick={() => fileInputRef.current?.click()} className="flex size-9 shrink-0 items-center justify-center rounded-lg text-[var(--crm-text-muted)] hover:text-[var(--crm-gold)] transition"><ImageIcon size={18} /></button> : <div className="size-9 shrink-0" />}
                        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={handleImageSelect} />
                        <div className="relative flex-1">
                            <textarea ref={textareaRef} value={text} onChange={(e) => { setText(e.target.value); sendTyping(); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }} onKeyDown={handleKeyDown}
                                placeholder="Type a message..." rows={1}
                                className="min-h-[36px] w-full resize-none rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface-2)] px-3 py-2 text-xs text-[var(--crm-text)] outline-none placeholder:text-[var(--crm-muted)] focus:border-[var(--crm-gold)]" style={{ lineHeight: '1.4' }} />
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                            <button type="button" onClick={editingMsg ? handleUpdate : handleSend} disabled={!canSend || sending}
                                className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--crm-gold)] text-black disabled:opacity-40 transition hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0">
                                {sending ? <div className="size-4 animate-spin rounded-full border-2 border-black border-t-transparent" /> : editingMsg ? <Check size={16} /> : <Send size={16} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Info panel */}
                {infoPanelOpen ? (
                    <div className="w-72 shrink-0 border-l border-[var(--crm-border)] bg-[var(--crm-surface)] overflow-y-auto scrollbar-none xl:hidden">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--crm-border)]">
                            <p className="text-xs font-bold text-[var(--crm-text)]">Info</p>
                            <button type="button" onClick={() => setInfoPanelOpen(false)} className="text-[var(--crm-muted)] hover:text-[var(--crm-text)]"><X size={14} /></button>
                        </div>
                        {isGroup ? (
                            <div className="p-4 space-y-4">
                                <div className="flex flex-col items-center gap-2">
                                    <div className={`flex size-14 items-center justify-center rounded-xl ${avatarTone.bg} ${avatarTone.text}`}><Users size={24} /></div>
                                    <p className="text-sm font-bold text-[var(--crm-text)]">{otherName}</p>
                                    {conversation.category ? <span className={`rounded px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${catMeta.tone.bg} ${catMeta.tone.text}`}>{catMeta.label}</span> : null}
                                    <p className="text-[10px] text-[var(--crm-text-muted)]">{statusLine}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold text-[var(--crm-text-muted)] mb-2 uppercase tracking-wide">Participants</p>
                                    <div className="space-y-1.5">
                                        {parts.filter((p) => p?.user?.id !== currentUserId).map((p) => {
                                            const ls = p?.user?.lastSeenAt;
                                            const isOnline = ls && Date.now() - new Date(ls).getTime() < 300000;
                                            return (
                                                <div key={p.id} className="flex items-center gap-2">
                                                    <span className={`size-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-[var(--crm-muted)]'}`} />
                                                    <span className="text-xs text-[var(--crm-text)]">{p.user?.name}</span>
                                                    {!isOnline && ls ? <span className="text-[9px] text-[var(--crm-text-muted)]">{formatConversationTime(ls)}</span> : null}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold text-[var(--crm-text-muted)] mb-2 uppercase tracking-wide flex items-center gap-1"><ImageIcon size={12} /> Shared images</p>
                                    {(() => {
                                        const images = messages.flatMap((m) => m.attachments || []).filter((a) => a.url).slice(0, 9);
                                        if (images.length === 0) return <p className="text-[10px] text-[var(--crm-text-muted)]">No shared images yet.</p>;
                                        return <div className="grid grid-cols-3 gap-1">{images.map((img) => <img key={img.id} src={img.url!} alt="" className="aspect-square rounded-lg object-cover" />)}</div>;
                                    })()}
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 space-y-4">
                                <div className="flex flex-col items-center gap-2">
                                    <div className={`flex size-14 items-center justify-center rounded-full ${avatarTone.bg} ${avatarTone.text} text-lg font-bold`}>{getConversationInitials(conversation, currentUserId)}</div>
                                    <p className="text-sm font-bold text-[var(--crm-text)]">{otherName}</p>
                                    <p className="text-[10px] text-[var(--crm-text-muted)]">{statusLine}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold text-[var(--crm-text-muted)] mb-2 uppercase tracking-wide flex items-center gap-1"><ImageIcon size={12} /> Shared images</p>
                                    {(() => {
                                        const images = messages.flatMap((m) => m.attachments || []).filter((a) => a.url).slice(0, 9);
                                        if (images.length === 0) return <p className="text-[10px] text-[var(--crm-text-muted)]">No shared images yet.</p>;
                                        return <div className="grid grid-cols-3 gap-1">{images.map((img) => <img key={img.id} src={img.url!} alt="" className="aspect-square rounded-lg object-cover" />)}</div>;
                                    })()}
                                </div>
                            </div>
                        )}
                    </div>
                ) : null}
            </div>

            {lightboxOpen ? <Lightbox images={lightboxOpen.images} initialIndex={lightboxOpen.index} onClose={() => setLightboxOpen(null)} /> : null}
            {forwardMsg ? <ForwardModal conversations={conversations} currentUserId={currentUserId} onClose={() => setForwardMsg(null)} onForward={handleForward} /> : null}
            {groupSettingsOpen ? (
                <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 px-4" onClick={() => setGroupSettingsOpen(false)}>
                    <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] shadow-2xl">
                        <div className="flex items-center justify-between border-b border-[var(--crm-border)] px-4 py-3">
                            <p className="text-sm font-bold text-[var(--crm-text)]">Group settings</p>
                            <button type="button" onClick={() => setGroupSettingsOpen(false)} className="text-[var(--crm-muted)] hover:text-[var(--crm-text)]"><X size={16} /></button>
                        </div>
                        <div className="px-4 py-3 space-y-4">
                            <div>
                                <p className="text-[10px] font-semibold text-[var(--crm-text-muted)] mb-1">Group name</p>
                                <div className="flex gap-2">
                                    <input value={groupSubject} onChange={(e) => setGroupSubject(e.target.value)} className="h-8 flex-1 rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface)] px-3 text-xs text-[var(--crm-text)] outline-none placeholder:text-[var(--crm-muted)] focus:border-[var(--crm-gold)]" />
                                    <button type="button" onClick={handleRenameGroup} className="h-8 rounded-lg bg-[var(--crm-gold)] px-3 text-[10px] font-bold text-black hover:brightness-110 transition">Save</button>
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold text-[var(--crm-text-muted)] mb-1">Participants</p>
                                <div className="space-y-1 max-h-40 overflow-y-auto">
                                    {parts.filter((p) => p?.user?.id !== currentUserId).map((p) => (
                                        <div key={p.id} className="flex items-center justify-between rounded-lg bg-[var(--crm-surface)] px-3 py-2">
                                            <span className="text-xs font-semibold text-[var(--crm-text)]">{p.user?.name}</span>
                                            <button type="button" onClick={() => handleRemoveParticipant(p.user!.id)} className="text-[var(--crm-text-muted)] hover:text-red-400 transition"><UserMinus size={13} /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold text-[var(--crm-text-muted)] mb-1">Add participant</p>
                                <div className="flex gap-2">
                                    <select value={addUserId} onChange={(e) => setAddUserId(e.target.value)} className="h-8 flex-1 rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface)] px-3 text-xs text-[var(--crm-text)] outline-none focus:border-[var(--crm-gold)]">
                                        <option value="">Select a user...</option>
                                        {availableUsers.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </select>
                                    <button type="button" onClick={handleAddParticipant} disabled={!addUserId} className="flex h-8 items-center gap-1 rounded-lg bg-[var(--crm-gold)] px-3 text-[10px] font-bold text-black disabled:opacity-40 hover:brightness-110 transition"><UserPlus size={13} /> Add</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}

```


## FILE: resources\js\features\inbox\components\NewConversationDrawer.tsx
```
import { FormEvent, useState } from 'react';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppButton } from '@/components/ui/AppButton';
import { AppFormErrorSummary } from '@/components/ui/AppFormErrorSummary';
import { AppSelect } from '@/components/ui/AppSelect';
import type { FormErrors } from '@/lib/formErrors';
import { firstError } from '@/lib/formErrors';
import type { ChatUserOption } from '@/features/chat/types';
import { CATEGORY_OPTIONS } from '@/features/inbox/utils';
import { Search, Check, Users, MessageCircle } from 'lucide-react';

export type NewConvFormData = {
    type: 'direct' | 'group';
    user_ids: number[];
    subject: string;
    category: string;
    custom_category: string;
};

type Props = {
    isOpen: boolean;
    users: ChatUserOption[];
    formErrors: FormErrors;
    form: NewConvFormData;
    onOpenChange: (o: boolean) => void;
    onFormChange: (f: NewConvFormData) => void;
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
};

export function NewConversationDrawer({ isOpen, users, formErrors, form, onOpenChange, onFormChange, onSubmit }: Props) {
    const [userSearch, setUserSearch] = useState('');

    const filteredUsers = userSearch.trim()
        ? users.filter((u) => u.name.toLowerCase().includes(userSearch.toLowerCase()))
        : users;

    const toggleUser = (id: number) => {
        const next = form.user_ids.includes(id)
            ? form.user_ids.filter((uid) => uid !== id)
            : [...form.user_ids, id];
        onFormChange({ ...form, user_ids: next });
    };

    const isDirect = form.type === 'direct';

    const showCustomCategory = form.category === 'custom' && !isDirect;

    return (
        <AppDrawer isOpen={isOpen} onOpenChange={(o) => { onOpenChange(o); if (!o) onOpenChange(false); }}
            title={isDirect ? "New conversation" : "New group"}
            description={isDirect ? "Start a direct conversation with another user." : "Create a group conversation with multiple users."}
            footer={<><AppButton variant="secondary" onPress={() => onOpenChange(false)}>Cancel</AppButton><AppButton variant="primary" type="submit" form="new-conv-form">Create</AppButton></>}>
            <form id="new-conv-form" className="space-y-5" onSubmit={onSubmit}>
                <AppFormErrorSummary errors={formErrors} />

                <div>
                    <label className="mb-1.5 block text-xs font-semibold text-[var(--text)]">Type</label>
                    <div className="flex gap-2">
                        <button type="button" onClick={() => onFormChange({ ...form, type: 'direct' })}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                                isDirect ? 'border-[var(--crm-gold)] bg-[color-mix(in_srgb,var(--crm-gold)_15%,transparent)] text-[var(--crm-gold)]' : 'border-[var(--crm-border)] text-[var(--crm-text-muted)] hover:border-[var(--crm-muted)]'
                            }`}>
                            <MessageCircle size={16} /> Direct
                        </button>
                        <button type="button" onClick={() => onFormChange({ ...form, type: 'group' })}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                                !isDirect ? 'border-[var(--crm-gold)] bg-[color-mix(in_srgb,var(--crm-gold)_15%,transparent)] text-[var(--crm-gold)]' : 'border-[var(--crm-border)] text-[var(--crm-text-muted)] hover:border-[var(--crm-muted)]'
                            }`}>
                            <Users size={16} /> Group
                        </button>
                    </div>
                </div>

                <div>
                    <label className="mb-1.5 block text-xs font-semibold text-[var(--text)]">Subject (optional)</label>
                    <input value={form.subject} onChange={(e) => onFormChange({ ...form, subject: e.target.value })}
                        placeholder={isDirect ? "e.g. Re: Task 42" : "e.g. Project Alpha discussion"}
                        className="h-10 w-full rounded-xl border border-[var(--crm-border)] bg-[var(--crm-surface)] px-3 text-sm text-[var(--crm-text)] outline-none placeholder:text-[var(--crm-muted)] focus:border-[var(--crm-gold)]" />
                </div>

                {!isDirect && (
                    <>
                        <AppSelect label="Category" placeholder="Select category" selectedKey={form.category} onSelectionChange={(v) => onFormChange({ ...form, category: v ? String(v) : 'general' })}
                            options={CATEGORY_OPTIONS.map((c) => ({ id: c.id, label: c.label }))} />
                        {showCustomCategory && (
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-[var(--text)]">Custom category name</label>
                                <input value={form.custom_category} onChange={(e) => onFormChange({ ...form, custom_category: e.target.value })}
                                    placeholder="e.g. Suppliers"
                                    className="h-10 w-full rounded-xl border border-[var(--crm-border)] bg-[var(--crm-surface)] px-3 text-sm text-[var(--crm-text)] outline-none placeholder:text-[var(--crm-muted)] focus:border-[var(--crm-gold)]" />
                                {formErrors.custom_category && <p className="mt-1 text-xs font-medium text-red-500">{firstError(formErrors, 'custom_category')}</p>}
                            </div>
                        )}
                    </>
                )}

                <div>
                    <label className="mb-1.5 block text-xs font-semibold text-[var(--text)]">
                        {isDirect ? 'User' : 'Participants'} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mb-2">
                        <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--crm-muted)]" />
                        <input value={userSearch} onChange={(e) => setUserSearch(e.target.value)}
                            placeholder="Search users..."
                            className="h-9 w-full rounded-xl border border-[var(--crm-border)] bg-[var(--crm-surface)] pl-8 pr-3 text-sm text-[var(--crm-text)] outline-none placeholder:text-[var(--crm-muted)] focus:border-[var(--crm-gold)]" />
                    </div>
                    <div className="max-h-48 space-y-1 overflow-y-auto rounded-xl border border-[var(--crm-border)] p-1.5">
                        {filteredUsers.length === 0 ? (
                            <p className="py-4 text-center text-xs text-[var(--crm-text-muted)]">No users found</p>
                        ) : filteredUsers.map((u) => {
                            const selected = form.user_ids.includes(u.id);
                            return (
                                <button key={u.id} type="button"
                                    onClick={() => {
                                        if (isDirect) {
                                            onFormChange({ ...form, user_ids: selected ? [] : [u.id] });
                                        } else {
                                            toggleUser(u.id);
                                        }
                                    }}
                                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition ${
                                        selected ? 'bg-[color-mix(in_srgb,var(--crm-gold)_10%,transparent)] text-[var(--crm-gold)]' : 'text-[var(--crm-text)] hover:bg-[var(--crm-surface)]'
                                    }`}>
                                    <div className={`flex size-5 shrink-0 items-center justify-center rounded border ${
                                        selected ? 'border-[var(--crm-gold)] bg-[var(--crm-gold)] text-black' : 'border-[var(--crm-border)]'
                                    }`}>
                                        {selected && <Check size={12} />}
                                    </div>
                                    <span className="truncate">{u.name}</span>
                                    <span className="ml-auto text-[10px] text-[var(--crm-text-muted)]">{u.email}</span>
                                </button>
                            );
                        })}
                    </div>
                    {!isDirect && form.user_ids.length > 0 && (
                        <p className="mt-1 text-[10px] text-[var(--crm-text-muted)]">{form.user_ids.length} participant(s) selected (you will be added automatically)</p>
                    )}
                </div>
            </form>
        </AppDrawer>
    );
}

```


## FILE: resources\js\features\inbox\components\useTyping.ts
```
import { echo } from '@laravel/echo-react';
import { useCallback, useEffect, useRef, useState } from 'react';

type TypingUser = { id: number; name: string };

export function useTyping(conversationId: number | null, currentUserId: number, currentUserName: string) {
    const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
    const timersRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({});
    const lastSentRef = useRef(0);

    useEffect(() => {
        if (!conversationId) {
            setTypingUsers([]);
            return;
        }

        const channel = echo().private(`conversation.${conversationId}`);

        const handler = (payload: any) => {

            const userId = Number(payload?.user?.id);
            if (!userId || userId === currentUserId) return;

            const user = {
                id: userId,
                name: payload?.user?.name || 'User',
            };

            setTypingUsers((prev) => {
                const without = prev.filter((item) => item.id !== user.id);
                return [...without, user];
            });

            if (timersRef.current[user.id]) {
                clearTimeout(timersRef.current[user.id]);
            }

            timersRef.current[user.id] = setTimeout(() => {
                setTypingUsers((prev) => prev.filter((item) => item.id !== user.id));
                delete timersRef.current[user.id];
            }, 2200);
        };

        const allEventsHandler = (event: string, payload: any) => {
            const normalizedEvent = event.replace(/^\./, '');
            if (normalizedEvent === 'client-typing') handler(payload);
        };

        channel.error((error: any) => console.error('[chat] typing subscription error', conversationId, error));
        channel.listenForWhisper('typing', handler);
        channel.listenToAll(allEventsHandler);

        return () => {
            channel.stopListeningForWhisper('typing', handler);
            channel.stopListeningToAll(allEventsHandler);
            Object.values(timersRef.current).forEach(clearTimeout);
            timersRef.current = {};
            setTypingUsers([]);
        };
    }, [conversationId, currentUserId]);

    const sendTyping = useCallback(() => {
        if (!conversationId || !currentUserId) return;

        const now = Date.now();
        if (now - lastSentRef.current < 700) return;
        lastSentRef.current = now;


        echo().private(`conversation.${conversationId}`).whisper('typing', {
            user: {
                id: currentUserId,
                name: currentUserName || 'User',
            },
        });
    }, [conversationId, currentUserId, currentUserName]);

    return { typingUsers, sendTyping };
}

```


## FILE: resources\js\features\inbox\utils.ts
```
import type { ConversationRow, MessageRow } from '@/features/chat/types';

const AVATAR_TONES = [
  { bg: 'bg-amber-900/40', text: 'text-amber-300', ring: 'ring-amber-700/30' },
  { bg: 'bg-emerald-900/40', text: 'text-emerald-300', ring: 'ring-emerald-700/30' },
  { bg: 'bg-blue-900/40', text: 'text-blue-300', ring: 'ring-blue-700/30' },
  { bg: 'bg-violet-900/40', text: 'text-violet-300', ring: 'ring-violet-700/30' },
  { bg: 'bg-rose-900/40', text: 'text-rose-300', ring: 'ring-rose-700/30' },
  { bg: 'bg-cyan-900/40', text: 'text-cyan-300', ring: 'ring-cyan-700/30' },
  { bg: 'bg-slate-700/50', text: 'text-slate-200', ring: 'ring-slate-600/30' },
  { bg: 'bg-orange-900/40', text: 'text-orange-300', ring: 'ring-orange-700/30' },
  { bg: 'bg-pink-900/40', text: 'text-pink-300', ring: 'ring-pink-700/30' },
  { bg: 'bg-teal-900/40', text: 'text-teal-300', ring: 'ring-teal-700/30' },
];

export function getAvatarTone(seed: string | number): { bg: string; text: string; ring: string } {
  const num = typeof seed === 'string' ? seed.split('').reduce((a, c) => a + c.charCodeAt(0), 0) : seed;
  return AVATAR_TONES[num % AVATAR_TONES.length];
}

const CATEGORY_META: Record<string, { label: string; icon: string; tone: { bg: string; text: string } }> = {
  developers:    { label: 'Developers',  icon: 'Code2',          tone: { bg: 'bg-blue-900/30',  text: 'text-blue-300' } },
  finance:       { label: 'Finance',     icon: 'BadgeDollarSign', tone: { bg: 'bg-emerald-900/30', text: 'text-emerald-300' } },
  architects:    { label: 'Architects',  icon: 'Building2',       tone: { bg: 'bg-violet-900/30', text: 'text-violet-300' } },
  managers:      { label: 'Managers',    icon: 'Shield',          tone: { bg: 'bg-amber-900/30',  text: 'text-amber-300' } },
  'site team':   { label: 'Site team',   icon: 'HardHat',         tone: { bg: 'bg-orange-900/30', text: 'text-orange-300' } },
  documents:     { label: 'Documents',   icon: 'FileText',        tone: { bg: 'bg-cyan-900/30',   text: 'text-cyan-300' } },
  contracts:     { label: 'Contracts',   icon: 'ScrollText',      tone: { bg: 'bg-rose-900/30',   text: 'text-rose-300' } },
  clients:       { label: 'Clients',     icon: 'UserRound',       tone: { bg: 'bg-teal-900/30',   text: 'text-teal-300' } },
  general:       { label: 'General',     icon: 'MessageCircle',   tone: { bg: 'bg-slate-700/40',  text: 'text-slate-200' } },
};

export function getCategoryMeta(category: string | null | undefined): { label: string; icon: string; tone: { bg: string; text: string } } {
  if (!category) return CATEGORY_META.general;
  const key = category.toLowerCase();
  return CATEGORY_META[key] || { label: category, icon: 'Hash', tone: { bg: 'bg-slate-700/40', text: 'text-slate-200' } };
}

function safeParticipants(conv: ConversationRow): ConversationRow['participants'] {
  return Array.isArray(conv.participants) ? conv.participants : [];
}

export function getConversationDisplayName(conv: ConversationRow, currentUserId: number): string {
  if (conv.type === 'group') return conv.displayName || conv.subject || 'Group';
  const others = safeParticipants(conv).filter((p) => p?.user?.id !== currentUserId);
  return others.map((p) => p?.user?.name).filter(Boolean).join(', ') || conv.displayName || 'Conversation';
}

export function getConversationInitials(conv: ConversationRow, currentUserId: number): string {
  if (conv.type === 'group') {
    const name = conv.displayName || conv.subject || 'G';
    return name.split(' ').filter(Boolean).slice(0, 2).map((s: string) => s[0]?.toUpperCase()).join('') || 'G';
  }
  const others = safeParticipants(conv).filter((p) => p?.user?.id !== currentUserId);
  const name = others.map((p) => p?.user?.name).filter(Boolean).join(' ') || '?';
  return name.split(' ').filter(Boolean).slice(0, 2).map((s: string) => s[0]?.toUpperCase()).join('') || '?';
}

export function getLastMessagePreview(conv: ConversationRow, currentUserId: number): string {
  const lm = conv.lastMessage;
  if (!lm) return 'No messages yet';
  const ac = lm.attachmentsCount ?? 0;
  let preview = '';
  if (ac > 1) preview = `${ac} photos`;
  else if (ac === 1 && !lm.body) preview = 'Photo';
  else if (ac === 1 && lm.body) preview = lm.body;
  else preview = lm.body || '';
  if (lm.isForwarded) preview = `Forwarded: ${preview}`;
  if (lm.userId === currentUserId) preview = `You: ${preview}`;
  else if (conv.type === 'group' && lm.userName) preview = `${lm.userName}: ${preview}`;
  return preview;
}

export function formatConversationTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function highlightSearchMatch(text: string, query: string): { before: string; match: string; after: string } | null {
  if (!query || !text) return null;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return null;
  return {
    before: text.slice(0, idx),
    match: text.slice(idx, idx + query.length),
    after: text.slice(idx + query.length),
  };
}

export function groupMessagesByDateAndSender(messages: MessageRow[]): { label: string; messageIds: number[] }[] {
  const dates: { label: string; messageIds: number[] }[] = [];
  let lastLabel = '';
  for (const msg of messages) {
    const label = dateSeparator(msg.createdAt);
    if (label !== lastLabel) {
      dates.push({ label, messageIds: [msg.id] });
      lastLabel = label;
    } else {
      dates[dates.length - 1].messageIds.push(msg.id);
    }
  }
  return dates;
}

function dateSeparator(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

export function isGroupConversation(conv: ConversationRow): boolean {
  return conv.type === 'group';
}

export const CATEGORY_OPTIONS = [
  { id: 'general', label: 'General' },
  { id: 'developers', label: 'Developers' },
  { id: 'finance', label: 'Finance' },
  { id: 'architects', label: 'Architects' },
  { id: 'managers', label: 'Managers' },
  { id: 'site team', label: 'Site team' },
  { id: 'documents', label: 'Documents' },
  { id: 'contracts', label: 'Contracts' },
  { id: 'clients', label: 'Clients' },
  { id: 'custom', label: 'Custom category' },
];

```


## FILE: resources\js\features\finance\components\FinanceBreakdownPanel.tsx
```
import { AppCard } from '@/components/ui/AppCard';
import { FinanceRecordRow, formatMoney } from '@/features/finance/data/mockFinance';
import { useTranslation } from '@/lib/i18n';

type FinanceBreakdownPanelProps = {
    record: FinanceRecordRow | null;
};

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-3 rounded-xl border bg-[var(--surface)] p-3">
            <span className="text-sm text-[var(--text-muted)]">{label}</span>
            <span className="font-semibold">{value}</span>
        </div>
    );
}

export function FinanceBreakdownPanel({ record }: FinanceBreakdownPanelProps) {
    const { t } = useTranslation();

    return (
        <AppCard className="min-w-0 p-4">
            <div className="mb-4">
                <h2 className="text-sm font-semibold">{t('financeWorkspace.breakdown.title')}</h2>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                    {t('financeWorkspace.breakdown.description')}
                </p>
            </div>

            {record ? (
                <div className="grid gap-2">
                    <Row label={t('financeWorkspace.breakdown.ht')} value={formatMoney(record.ht)} />
                    <Row label={t('financeWorkspace.breakdown.tva')} value={formatMoney(record.tva)} />
                    <Row label={t('financeWorkspace.breakdown.ttc')} value={formatMoney(record.totalTtc)} />
                    <Row label={t('financeWorkspace.breakdown.paid')} value={formatMoney(record.paid)} />
                    <Row label={t('financeWorkspace.breakdown.remaining')} value={formatMoney(record.remaining)} />
                </div>
            ) : null}
        </AppCard>
    );
}

```


## FILE: resources\js\features\finance\components\FinanceClientDossierFields.tsx
```
import { useEffect, useMemo } from 'react';
import { AppCard } from '@/components/ui/AppCard';
import { AppSelect } from '@/components/ui/AppSelect';
import type { ClientOption, DossierOption } from '@/features/finance/types';

type FinanceClientDossierFieldsProps = {
    clientId: string;
    dossierId: string;
    clients: ClientOption[];
    dossiers: DossierOption[];
    onClientChange: (clientId: string) => void;
    onDossierChange: (dossierId: string) => void;
};

export function FinanceClientDossierFields({
    clientId,
    dossierId,
    clients,
    dossiers,
    onClientChange,
    onDossierChange,
}: FinanceClientDossierFieldsProps) {
    const selectedDossier = useMemo(
        () => dossiers.find((dossier) => dossier.id === dossierId) || null,
        [dossiers, dossierId],
    );

    useEffect(() => {
        if (selectedDossier?.clientId && selectedDossier.clientId !== clientId) {
            onClientChange(selectedDossier.clientId);
        }
    }, [clientId, onClientChange, selectedDossier]);

    return (
        <div className="grid gap-3 lg:grid-cols-2">
            <AppSelect
                label="Client"
                placeholder="Selectionner un client"
                options={clients}
                selectedKey={clientId || null}
                onSelectionChange={(key) => onClientChange(key ? String(key) : '')}
            />
            <AppSelect
                label="Dossier"
                placeholder="Selectionner un dossier"
                options={dossiers}
                selectedKey={dossierId || null}
                onSelectionChange={(key) => onDossierChange(key ? String(key) : '')}
            />
            {selectedDossier ? (
                <AppCard className="p-3 lg:col-span-2">
                    <div className="grid gap-2 text-xs text-[var(--text-muted)] sm:grid-cols-3">
                        <p><span className="font-semibold text-[var(--text)]">Projet:</span> {selectedDossier.projectObject || '-'}</p>
                        <p><span className="font-semibold text-[var(--text)]">Adresse:</span> {selectedDossier.address || '-'}</p>
                        <p><span className="font-semibold text-[var(--text)]">Surface:</span> {selectedDossier.floorArea || selectedDossier.landSurface || '-'} m2</p>
                    </div>
                </AppCard>
            ) : null}
        </div>
    );
}

```


## FILE: resources\js\features\finance\components\FinanceDateFields.tsx
```
import { AppDatePicker } from '@/components/ui/AppDatePicker';
import type { FinanceDocumentType } from '@/features/finance/types';

type FinanceDateFieldsProps = {
    type: FinanceDocumentType;
    issueDate: string;
    dueDate: string;
    validUntil: string;
    onChange: (field: 'issueDate' | 'dueDate' | 'validUntil', value: string) => void;
    isIssueDateDisabled?: boolean;
    issueDateDescription?: string;
};

export function FinanceDateFields({ type, issueDate, dueDate, validUntil, onChange, isIssueDateDisabled = false, issueDateDescription }: FinanceDateFieldsProps) {
    return (
        <div className="grid gap-3 sm:grid-cols-3">
            <AppDatePicker
                label="Date emission"
                value={issueDate}
                isDisabled={isIssueDateDisabled}
                description={issueDateDescription}
                onChange={(value) => onChange('issueDate', value)}
            />
            {type === 'invoice' ? (
                <AppDatePicker
                    label="Date echeance"
                    value={dueDate}
                    onChange={(value) => onChange('dueDate', value)}
                />
            ) : null}
            {type === 'quote' ? (
                <AppDatePicker
                    label="Validite devis"
                    value={validUntil}
                    onChange={(value) => onChange('validUntil', value)}
                />
            ) : null}
        </div>
    );
}
```


## FILE: resources\js\features\finance\components\FinanceDocumentActions.tsx
```
import { router } from '@inertiajs/react';
import { CheckCircle2, CreditCard, Eye, FileDown, FileSpreadsheet, FileText, FolderOpen, Pencil, RefreshCw, Trash2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { AppTableActionButton } from '@/components/ui/AppTableActionButton';
import { AppTableActions } from '@/components/ui/AppTableActions';
import type { FinanceDocument } from '@/features/finance/types';

type FinanceDocumentActionsProps = {
    document: FinanceDocument;
    onEdit: (document: FinanceDocument) => void;
    onAccept: (document: FinanceDocument) => void;
    onReject: (document: FinanceDocument) => void;
    onConvert: (document: FinanceDocument) => void;
    onPayment: (document: FinanceDocument) => void;
    onDelete: (document: FinanceDocument) => void;
};

function generateFile(url: string | null | undefined, label: string) {
    if (!url) {
        toast.error('Action indisponible.');
        return;
    }

    router.put(url, {}, {
        preserveScroll: true,
        onStart: () => toast.loading(`${label} en cours...`, { id: label }),
        onSuccess: () => toast.success(`${label} termine.`, { id: label }),
        onError: () => toast.error(`${label} impossible.`, { id: label }),
    });
}

function revealFiles(url: string | null | undefined) {
    if (!url) {
        toast.error('Aucun emplacement disponible.');
        return;
    }

    router.post(url, {}, {
        preserveScroll: true,
        onSuccess: () => toast.success('Emplacement ouvert dans Explorer.'),
        onError: () => toast.error('Impossible d ouvrir Explorer.'),
    });
}
function downloadFile(url: string | null | undefined) {
    if (!url) {
        toast.error('Fichier indisponible.');
        return;
    }

    window.open(url, '_blank');
}

export function FinanceDocumentActions({
    document,
    onEdit,
    onAccept,
    onReject,
    onConvert,
    onPayment,
    onDelete,
}: FinanceDocumentActionsProps) {
    return (
        <AppTableActions>
            <AppTableActionButton label="Voir" tone="view" onPress={() => window.open(document.showUrl || `/finance/documents/${document.id}`, '_self')}>
                <Eye size={15} />
            </AppTableActionButton>
            <AppTableActionButton label="Modifier" tone="edit" onPress={() => onEdit(document)}>
                <Pencil size={15} />
            </AppTableActionButton>
            {document.pdfDownloadUrl ? (
                <AppTableActionButton label="Telecharger PDF" tone="documents" onPress={() => downloadFile(document.pdfDownloadUrl)}>
                    <FileDown size={15} />
                </AppTableActionButton>
            ) : null}
            <AppTableActionButton label={document.hasPdf ? 'Regenerer PDF' : 'Generer PDF'} tone="documents" onPress={() => generateFile(document.generatePdfUrl, 'Generation PDF')}>
                <FileText size={15} />
            </AppTableActionButton>
            {document.excelDownloadUrl || document.downloadUrl ? (
                <AppTableActionButton label="Telecharger Excel" tone="archive" onPress={() => downloadFile(document.excelDownloadUrl || document.downloadUrl)}>
                    <FileSpreadsheet size={15} />
                </AppTableActionButton>
            ) : null}
            <AppTableActionButton label={document.hasExcel ? 'Regenerer Excel' : 'Generer Excel'} tone="archive" onPress={() => generateFile(document.generateExcelUrl, 'Generation Excel')}>
                <FileSpreadsheet size={15} />
            </AppTableActionButton>
            {document.revealFilesUrl ? (
                <AppTableActionButton label="Afficher dans Explorer" tone="view" onPress={() => revealFiles(document.revealFilesUrl)}>
                    <FolderOpen size={15} />
                </AppTableActionButton>
            ) : null}
            {document.type === 'quote' ? (
                <>
                    <AppTableActionButton label="Accepter" tone="create" onPress={() => onAccept(document)}>
                        <CheckCircle2 size={15} />
                    </AppTableActionButton>
                    <AppTableActionButton label="Refuser" tone="delete" onPress={() => onReject(document)}>
                        <XCircle size={15} />
                    </AppTableActionButton>
                    <AppTableActionButton label="Convertir en facture" tone="documents" onPress={() => onConvert(document)}>
                        <RefreshCw size={15} />
                    </AppTableActionButton>
                </>
            ) : null}
            {document.type === 'invoice' ? (
                <AppTableActionButton label="Paiement" tone="create" onPress={() => onPayment(document)}>
                    <CreditCard size={15} />
                </AppTableActionButton>
            ) : null}
            <AppTableActionButton label="Supprimer" tone="delete" onPress={() => onDelete(document)}>
                <Trash2 size={15} />
            </AppTableActionButton>
        </AppTableActions>
    );
}

```


## FILE: resources\js\features\finance\components\FinanceDocumentLockNotice.tsx
```
import type { ReactNode } from 'react';
import type { FinanceDocument } from '../types';

export type FinanceDocumentLockStateLike = {
    isLocked?: boolean;
    lockedAt?: string | null;
    lockedAtFormatted?: string | null;
    message?: string;
    blockedFields?: string[];
    canEditNumberFields?: boolean;
    canRegenerateExports?: boolean;
    canGeneratePdf?: boolean;
    canGenerateExcel?: boolean;
};

export type LockableFinanceDocument = Partial<FinanceDocument> & {
    numberLocked?: boolean;
    numberLockedAt?: string | null;
    lock?: FinanceDocumentLockStateLike | null;
};

type NoticeProps = {
    document?: LockableFinanceDocument | null;
    isLocked?: boolean;
    lockedAt?: string | null;
    lockedAtFormatted?: string | null;
    message?: ReactNode;
    compact?: boolean;
    className?: string;
};

export function isFinanceDocumentLocked(document?: LockableFinanceDocument | null): boolean {
    return Boolean(document?.lock?.isLocked ?? document?.numberLocked);
}

export function canEditFinanceDocumentNumberFields(document?: LockableFinanceDocument | null): boolean {
    return document?.lock?.canEditNumberFields ?? !isFinanceDocumentLocked(document);
}

export function getFinanceDocumentLockedAt(document?: LockableFinanceDocument | null): string | null {
    return document?.lock?.lockedAtFormatted ?? document?.numberLockedAt ?? document?.lock?.lockedAt ?? null;
}

export function getFinanceDocumentLockMessage(document?: LockableFinanceDocument | null): string {
    return document?.lock?.message ?? 'Document locked after export. Number, type, and issue date cannot be changed.';
}

export function FinanceDocumentLockBadge({ document }: { document?: LockableFinanceDocument | null }) {
    if (!isFinanceDocumentLocked(document)) {
        return null;
    }

    const lockedAt = getFinanceDocumentLockedAt(document);

    return (
        <span
            className="inline-flex items-center rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-300"
            title={lockedAt ? `Locked at ${lockedAt}` : 'Locked after export'}
        >
            Locked
        </span>
    );
}

export function FinanceDocumentLockNotice({
    document,
    isLocked,
    lockedAt,
    lockedAtFormatted,
    message,
    compact = false,
    className = '',
}: NoticeProps) {
    const locked = isLocked ?? isFinanceDocumentLocked(document);

    if (!locked) {
        return null;
    }

    const displayLockedAt = lockedAtFormatted ?? lockedAt ?? getFinanceDocumentLockedAt(document);
    const displayMessage = message ?? getFinanceDocumentLockMessage(document);

    if (compact) {
        return (
            <span className={`inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-200 ${className}`}>
                Locked
                {displayLockedAt ? <span className="font-normal text-amber-100/60">{displayLockedAt}</span> : null}
            </span>
        );
    }

    return (
        <div className={`rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100 ${className}`}>
            <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-300">
                    Locked
                </span>
                {displayLockedAt ? <span className="text-xs text-amber-100/60">Locked at {displayLockedAt}</span> : null}
            </div>
            <p className="mt-2 text-amber-100/80">{displayMessage}</p>
        </div>
    );
}

export default FinanceDocumentLockNotice;
```


## FILE: resources\js\features\finance\components\FinanceDocumentPreview.tsx
```
import type { FinanceDocumentItem, FinanceDocumentType } from '@/features/finance/types';
import { formatMoney } from '@/features/finance/utils/calculations';

type UiLockAwareFinanceDocument = {
    numberLocked?: boolean;
    numberLockedAt?: string | null;
    lock?: {
        isLocked?: boolean;
        lockedAtFormatted?: string | null;
        message?: string;
        canEditNumberFields?: boolean;
        canRegenerateExports?: boolean;
        canGeneratePdf?: boolean;
        canGenerateExcel?: boolean;
    } | null;
};

function isFinanceDocumentLocked(document: UiLockAwareFinanceDocument | null | undefined) {
    return Boolean(document?.lock?.isLocked ?? document?.numberLocked);
}

function canEditFinanceDocumentNumberFields(document: UiLockAwareFinanceDocument | null | undefined) {
    return document?.lock?.canEditNumberFields ?? !isFinanceDocumentLocked(document);
}

function FinanceDocumentLockedInlineBadge({ document }: { document: UiLockAwareFinanceDocument | null | undefined }) {
    if (!isFinanceDocumentLocked(document)) {
        return null;
    }

    const lockedAt = document?.lock?.lockedAtFormatted ?? document?.numberLockedAt ?? null;

    return (
        <span
            className="ml-2 inline-flex items-center rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-300"
            title={lockedAt ? `Locked at ${lockedAt}` : 'Locked after export'}
        >
            Locked
        </span>
    );
}

function FinanceDocumentLockInlineNotice({ document }: { document: UiLockAwareFinanceDocument | null | undefined }) {
    if (!isFinanceDocumentLocked(document)) {
        return null;
    }

    const lockedAt = document?.lock?.lockedAtFormatted ?? document?.numberLockedAt ?? null;
    const message = document?.lock?.message ?? 'Document locked after export. Number, type, and issue date cannot be changed.';

    return (
        <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
            <div className="font-semibold text-amber-200">Locked document</div>
            <div className="mt-1 text-amber-100/80">{message}</div>
            {lockedAt ? <div className="mt-1 text-xs text-amber-100/60">Locked at {lockedAt}</div> : null}
        </div>
    );
}


const typeLabels: Record<FinanceDocumentType, string> = {
    quote: 'DEVIS',
    invoice: 'FACTURE',
    receipt: 'RECU',
};

type FinanceDocumentPreviewProps = {
    type: FinanceDocumentType;
    number?: string;
    clientLabel?: string;
    dossierLabel?: string;
    issueDate: string;
    dueDate?: string;
    validUntil?: string;
    currency: string;
    items: FinanceDocumentItem[];
    subtotalHt: number;
    discountTotal: number;
    taxTotal: number;
    totalTtc: number;
    notes?: string;
    terms?: string;
};

export function FinanceDocumentPreview({
    type,
    number,
    clientLabel,
    dossierLabel,
    issueDate,
    dueDate,
    validUntil,
    currency,
    items,
    subtotalHt,
    discountTotal,
    taxTotal,
    totalTtc,
    notes,
    terms,
}: FinanceDocumentPreviewProps) {
    return (
        <div className="finance-builder-preview rounded-2xl border bg-[var(--surface-2)] p-3">
            <div className="mx-auto min-h-[520px] max-w-[440px] rounded-xl bg-white p-5 text-slate-950 shadow-xl sm:min-h-[640px] sm:p-7">
                <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-5">
                    <div>
                        <p className="text-xs font-semibold tracking-[0.22em] text-slate-500">ARCHI LBO</p>
                        <h3 className="mt-2 text-2xl font-bold">{typeLabels[type]}</h3>
                        <p className="mt-1 text-xs text-slate-500">{number || 'Nouveau document'}</p>
                    </div>
                    <div className="text-right text-xs text-slate-500">
                        <p>Date: {issueDate || '-'}</p>
                        {type === 'invoice' ? <p>Echeance: {dueDate || '-'}</p> : null}
                        {type === 'quote' ? <p>Validite: {validUntil || '-'}</p> : null}
                    </div>
                </div>

                <div className="grid gap-3 border-b border-slate-200 py-5 text-sm">
                    <div>
                        <p className="text-xs uppercase text-slate-500">Client</p>
                        <p className="font-semibold">{clientLabel || 'Client non selectionne'}</p>
                    </div>
                    <div>
                        <p className="text-xs uppercase text-slate-500">Dossier</p>
                        <p>{dossierLabel || 'Dossier non selectionne'}</p>
                    </div>
                </div>

                <table className="mt-5 w-full text-xs">
                    <thead>
                        <tr className="border-b border-slate-200 text-left text-slate-500">
                            <th className="py-2">Designation</th>
                            <th className="py-2 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={`${item.title}-${index}`} className="border-b border-slate-100">
                                <td className="py-2 pr-3">
                                    <p className="font-medium">{item.title || `Ligne ${index + 1}`}</p>
                                    <p className="text-slate-500">{item.quantity} {item.unit || ''} x {formatMoney(item.unitPrice, currency)}</p>
                                </td>
                                <td className="py-2 text-right font-semibold">{formatMoney(item.totalTtc, currency)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="ml-auto mt-5 w-56 space-y-1 text-xs">
                    <PreviewRow label="HT" value={formatMoney(subtotalHt, currency)} />
                    <PreviewRow label="Remise" value={`-${formatMoney(discountTotal, currency)}`} />
                    <PreviewRow label="TVA" value={formatMoney(taxTotal, currency)} />
                    <div className="border-t border-slate-200 pt-2">
                        <PreviewRow label="Total TTC" value={formatMoney(totalTtc, currency)} strong />
                    </div>
                </div>

                {notes ? <p className="mt-6 whitespace-pre-line text-xs text-slate-600">{notes}</p> : null}
                {terms ? <p className="mt-3 whitespace-pre-line text-xs text-slate-500">{terms}</p> : null}
            </div>
        </div>
    );
}

function PreviewRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
    return (
        <div className={`flex justify-between gap-3 ${strong ? 'text-sm font-bold' : ''}`}>
            <span>{label}</span>
            <span>{value}</span>
        </div>
    );
}


```


## FILE: resources\js\features\finance\components\FinanceFocusPanel.tsx
```
import { BadgeDollarSign, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppStatusBadge } from '@/components/ui/AppStatusBadge';
import {
    FinanceRecordRow,
    FinanceRecordStatus,
    formatMoney,
} from '@/features/finance/data/mockFinance';
import { useTranslation } from '@/lib/i18n';

type FinanceFocusPanelProps = {
    record: FinanceRecordRow | null;
};

type BadgeTone = 'neutral' | 'blue' | 'green' | 'amber' | 'red' | 'violet';

function getStatusTone(status: FinanceRecordStatus): BadgeTone {
    switch (status) {
        case 'draft':
            return 'neutral';
        case 'sent':
            return 'blue';
        case 'partiallyPaid':
            return 'amber';
        case 'paid':
            return 'green';
        case 'overdue':
        case 'cancelled':
            return 'red';
        default:
            return 'neutral';
    }
}

function ProgressBar({ paid, total }: { paid: number; total: number }) {
    const value = total > 0 ? Math.round((paid / total) * 100) : 0;

    return (
        <div className="flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--surface-2)]">
                <div
                    className="h-full rounded-full bg-[var(--accent)]"
                    style={{ width: `${value}%` }}
                />
            </div>
            <span className="w-9 text-right text-[11px] font-medium text-[var(--text-muted)]">
                {value}%
            </span>
        </div>
    );
}

function DetailItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border bg-[var(--surface-2)] p-3">
            <p className="text-[11px] font-medium text-[var(--text-muted)]">{label}</p>
            <p className="mt-1 truncate text-sm font-semibold">{value}</p>
        </div>
    );
}

export function FinanceFocusPanel({ record }: FinanceFocusPanelProps) {
    const { t } = useTranslation();

    return (
        <AppCard className="min-w-0 p-4">
            <div className="mb-4">
                <h2 className="text-sm font-semibold">{t('financeWorkspace.focus.title')}</h2>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                    {t('financeWorkspace.focus.description')}
                </p>
            </div>

            {record ? (
                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)]">
                            <BadgeDollarSign size={18} />
                        </div>

                        <div className="min-w-0">
                            <p className="text-sm font-semibold">{record.recordNumber}</p>
                            <p className="mt-1 truncate text-xs text-[var(--text-muted)]">
                                {record.dossierNumber} Â· {record.client}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <AppStatusBadge
                            label={t(`financeWorkspace.status.${record.status}`)}
                            tone={getStatusTone(record.status)}
                            icon={
                                record.status === 'paid'
                                    ? 'check'
                                    : record.status === 'overdue'
                                      ? 'warning'
                                      : 'clock'
                            }
                        />

                        <AppBadge tone="blue">{t(`financeWorkspace.type.${record.type}`)}</AppBadge>
                    </div>

                    <ProgressBar paid={record.paid} total={record.totalTtc} />

                    <div className="grid gap-2">
                        <DetailItem label={t('financeWorkspace.focus.totalTtc')} value={formatMoney(record.totalTtc)} />
                        <DetailItem label={t('financeWorkspace.focus.paid')} value={formatMoney(record.paid)} />
                        <DetailItem label={t('financeWorkspace.focus.remaining')} value={formatMoney(record.remaining)} />
                        <DetailItem label={t('financeWorkspace.focus.dueDate')} value={record.dueDate} />
                    </div>

                    <div className="rounded-2xl border bg-[color-mix(in_srgb,var(--accent)_8%,var(--surface))] p-4">
                        <p className="text-xs font-medium text-[var(--accent)]">
                            {t('financeWorkspace.focus.nextAction')}
                        </p>
                        <p className="mt-1 text-sm text-[var(--text-muted)]">
                            {record.nextAction}
                        </p>
                    </div>

                    <div className="grid gap-2">
                        <AppButton
                            variant="primary"
                            onPress={() => toast.success(t('financeWorkspace.toast.addPayment'))}
                        >
                            <BadgeDollarSign size={16} />
                            {t('financeWorkspace.addPayment')}
                        </AppButton>

                        <AppButton
                            variant="secondary"
                            onPress={() => toast.success(t('financeWorkspace.toast.markPaid'))}
                        >
                            <CheckCircle2 size={16} />
                            {t('financeWorkspace.status.paid')}
                        </AppButton>
                    </div>
                </div>
            ) : (
                <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed bg-[var(--surface-2)]">
                    <div className="px-6 text-center">
                        <BadgeDollarSign className="mx-auto text-[var(--text-muted)]" size={34} />
                        <p className="mt-3 text-sm font-semibold">{t('financeWorkspace.focus.noRecord')}</p>
                        <p className="mt-1 max-w-sm text-sm text-[var(--text-muted)]">
                            {t('financeWorkspace.focus.selectRecord')}
                        </p>
                    </div>
                </div>
            )}
        </AppCard>
    );
}

```


## FILE: resources\js\features\finance\components\FinanceItemsTable.tsx
```
import { Copy, Plus, Trash2 } from 'lucide-react';
import { AppButton } from '@/components/ui/AppButton';
import type { FinanceDocumentItem } from '@/features/finance/types';
import { calculateItem, formatMoney, normalizeNumber } from '@/features/finance/utils/calculations';

type FinanceItemsTableProps = {
    items: FinanceDocumentItem[];
    defaultTvaRate: number;
    currency: string;
    onChange: (items: FinanceDocumentItem[]) => void;
};

export function FinanceItemsTable({ items, defaultTvaRate, currency, onChange }: FinanceItemsTableProps) {
    function updateItem(index: number, field: keyof FinanceDocumentItem, value: string) {
        const next = items.map((item, itemIndex) => {
            if (itemIndex !== index) {
                return item;
            }

            const nextValue = ['quantity', 'unitPrice', 'discountRate', 'tvaRate'].includes(field)
                ? normalizeNumber(value)
                : value;

            return calculateItem({ ...item, [field]: nextValue }, defaultTvaRate);
        });

        onChange(next.map((item, position) => ({ ...item, position: position + 1 })));
    }

    function addItem() {
        onChange([
            ...items,
            calculateItem({ position: items.length + 1, quantity: 1, unitPrice: 0, discountRate: 0, tvaRate: defaultTvaRate }, defaultTvaRate),
        ]);
    }

    function duplicateItem(index: number) {
        const item = items[index];
        const next = [...items];
        next.splice(index + 1, 0, calculateItem({ ...item, id: undefined, position: index + 2 }, defaultTvaRate));
        onChange(next.map((row, position) => ({ ...row, position: position + 1 })));
    }

    function deleteItem(index: number) {
        if (items.length === 1) {
            return;
        }

        onChange(items.filter((_, itemIndex) => itemIndex !== index).map((item, position) => ({ ...item, position: position + 1 })));
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h3 className="text-sm font-semibold text-[var(--text)]">Lignes du document</h3>
                    <p className="text-xs text-[var(--text-muted)]">Les totaux sont recalcules en direct.</p>
                </div>
                <AppButton variant="secondary" size="sm" onPress={addItem}>
                    <Plus size={14} />
                    Ajouter
                </AppButton>
            </div>

            <div className="app-scrollbar overflow-x-auto rounded-2xl border">
                <table className="min-w-[980px] w-full text-left text-sm">
                    <thead className="bg-[var(--surface-2)] text-xs text-[var(--text-muted)]">
                        <tr>
                            <th className="px-3 py-2">Titre</th>
                            <th className="px-3 py-2">Description</th>
                            <th className="px-3 py-2">Qt</th>
                            <th className="px-3 py-2">Unite</th>
                            <th className="px-3 py-2">Prix HT</th>
                            <th className="px-3 py-2">Remise %</th>
                            <th className="px-3 py-2">TVA %</th>
                            <th className="px-3 py-2 text-right">Total TTC</th>
                            <th className="px-3 py-2 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={`${item.id || 'new'}-${index}`} className="border-t align-top">
                                <td className="px-3 py-2">
                                    <input className="react-aria-Input h-9 min-w-36" value={item.title} onChange={(event) => updateItem(index, 'title', event.target.value)} placeholder="Etude architecture" />
                                </td>
                                <td className="px-3 py-2">
                                    <input className="react-aria-Input h-9 min-w-56" value={item.description || ''} onChange={(event) => updateItem(index, 'description', event.target.value)} placeholder="Description" />
                                </td>
                                <td className="px-3 py-2">
                                    <input className="react-aria-Input h-9 w-20" type="number" min="0" step="0.001" value={item.quantity} onChange={(event) => updateItem(index, 'quantity', event.target.value)} />
                                </td>
                                <td className="px-3 py-2">
                                    <input className="react-aria-Input h-9 w-20" value={item.unit || ''} onChange={(event) => updateItem(index, 'unit', event.target.value)} placeholder="m2" />
                                </td>
                                <td className="px-3 py-2">
                                    <input className="react-aria-Input h-9 w-28" type="number" min="0" step="0.01" value={item.unitPrice} onChange={(event) => updateItem(index, 'unitPrice', event.target.value)} />
                                </td>
                                <td className="px-3 py-2">
                                    <input className="react-aria-Input h-9 w-24" type="number" min="0" max="100" step="0.01" value={item.discountRate} onChange={(event) => updateItem(index, 'discountRate', event.target.value)} />
                                </td>
                                <td className="px-3 py-2">
                                    <input className="react-aria-Input h-9 w-20" type="number" min="0" max="100" step="0.01" value={item.tvaRate} onChange={(event) => updateItem(index, 'tvaRate', event.target.value)} />
                                </td>
                                <td className="px-3 py-2 text-right font-mono text-xs font-semibold">
                                    {formatMoney(item.totalTtc, currency)}
                                </td>
                                <td className="px-3 py-2">
                                    <div className="flex justify-end gap-1">
                                        <AppButton variant="ghost" size="sm" onPress={() => duplicateItem(index)} aria-label="Dupliquer">
                                            <Copy size={13} />
                                        </AppButton>
                                        <AppButton variant="ghost" size="sm" onPress={() => deleteItem(index)} isDisabled={items.length === 1} aria-label="Supprimer">
                                            <Trash2 size={13} />
                                        </AppButton>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

```


## FILE: resources\js\features\finance\components\FinanceMetricCards.tsx
```
import { BadgeDollarSign, FileText, ReceiptText, WalletCards } from 'lucide-react';
import { AppMetricCard } from '@/components/ui/AppMetricCard';
import { formatMoney } from '@/features/finance/utils/calculations';

export type FinanceMetrics = {
    totalQuotes: number;
    totalInvoices: number;
    paidTotal: number;
    remainingTotal: number;
    overdueTotal: number;
    draftCount: number;
    currency: string;
};

type FinanceMetricCardsProps = {
    metrics: FinanceMetrics;
};

export function FinanceMetricCards({ metrics }: FinanceMetricCardsProps) {
    const cards = [
        { label: 'Total Devis', value: formatMoney(metrics.totalQuotes, metrics.currency), icon: <FileText size={18} /> },
        { label: 'Total Factures', value: formatMoney(metrics.totalInvoices, metrics.currency), icon: <ReceiptText size={18} /> },
        { label: 'Encaisse', value: formatMoney(metrics.paidTotal, metrics.currency), icon: <WalletCards size={18} /> },
        { label: 'Restant', value: formatMoney(metrics.remainingTotal, metrics.currency), icon: <BadgeDollarSign size={18} /> },
        { label: 'En retard', value: formatMoney(metrics.overdueTotal, metrics.currency), icon: <BadgeDollarSign size={18} /> },
        { label: 'Brouillons', value: metrics.draftCount, icon: <FileText size={18} /> },
    ];

    return (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
            {cards.map((card) => (
                <AppMetricCard key={card.label} {...card} />
            ))}
        </div>
    );
}

```


## FILE: resources\js\features\finance\components\FinanceMoneyCell.tsx
```
import { formatMoney } from '@/features/finance/utils/calculations';

export function FinanceMoneyCell({ value, currency = 'MAD', tone = 'default' }: { value: number; currency?: string; tone?: 'default' | 'success' | 'danger' }) {
    const toneClass = tone === 'success'
        ? 'text-[var(--success)]'
        : tone === 'danger'
            ? 'text-[var(--danger)]'
            : 'text-[var(--text)]';

    return (
        <span className={`whitespace-nowrap font-mono text-sm font-semibold tabular-nums ${toneClass}`}>
            {formatMoney(value, currency)}
        </span>
    );
}

```


## FILE: resources\js\features\finance\components\FinanceMonthlySummary.tsx
```
import { router } from '@inertiajs/react';
import { CalendarDays, Eye, FileText, ReceiptText, WalletCards } from 'lucide-react';
import { useMemo, useState } from 'react';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { FinanceStatusBadge } from '@/features/finance/components/FinanceStatusBadge';
import type { FinanceMonthDocumentRow, FinanceMonthPaymentRow, FinanceMonthSummary as FinanceMonthSummaryType } from '@/features/finance/types';

type Props = {
    months: FinanceMonthSummaryType[];
    currency: string;
};

function money(value: number, currency: string) {
    return new Intl.NumberFormat('fr-MA', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
    }).format(value || 0);
}

function typeLabel(type: string) {
    if (type === 'quote') return 'Devis';
    if (type === 'invoice') return 'Facture';
    if (type === 'receipt') return 'Recu';

    return type;
}

function SummaryStat({ label, value, tone = 'default' }: { label: string; value: string | number; tone?: 'default' | 'success' | 'danger' | 'warning' }) {
    const toneClass = {
        default: '',
        success: 'text-emerald-300',
        danger: 'text-red-300',
        warning: 'text-amber-300',
    }[tone];

    return (
        <AppCard className="p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">{label}</p>
            <p className={`mt-1 truncate text-sm font-semibold ${toneClass}`}>{value}</p>
        </AppCard>
    );
}

function DocumentList({ title, icon, documents, currency }: { title: string; icon: React.ReactNode; documents: FinanceMonthDocumentRow[]; currency: string }) {
    return (
        <AppCard className="p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <span className="text-[var(--accent)]">{icon}</span>
                    <h3 className="text-sm font-semibold">{title}</h3>
                </div>
                <AppBadge tone="blue">{documents.length}</AppBadge>
            </div>

            <div className="space-y-2">
                {documents.length ? documents.map((document) => (
                    <div key={document.id} className="grid gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 lg:grid-cols-[minmax(0,1fr)_160px_auto]">
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">{document.number}</p>
                            <p className="truncate text-xs text-[var(--text-muted)]">{document.clientName || '-'} Â· {document.dossierNumber || '-'}</p>
                            <p className="truncate text-xs text-[var(--text-muted)]">{document.commune || '-'} {document.province ? `Â· ${document.province}` : ''}</p>
                        </div>

                        <div>
                            <FinanceStatusBadge status={document.status as never} />
                            <p className="mt-2 text-xs text-[var(--text-muted)]">{document.issueDate || '-'}</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                            <div className="text-right">
                                <p className="text-sm font-semibold">{money(document.totalTtc, currency)}</p>
                                <p className="text-xs text-[var(--text-muted)]">Rest: {money(document.remainingTotal, currency)}</p>
                            </div>
                            <AppButton variant="secondary" onPress={() => router.visit(`/finance/documents/${document.id}`)}>
                                <Eye size={15} />
                                Open
                            </AppButton>
                        </div>
                    </div>
                )) : (
                    <p className="text-sm text-[var(--text-muted)]">Aucun document.</p>
                )}
            </div>
        </AppCard>
    );
}

function PaymentList({ payments, currency }: { payments: FinanceMonthPaymentRow[]; currency: string }) {
    return (
        <AppCard className="p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <WalletCards size={17} className="text-[var(--accent)]" />
                    <h3 className="text-sm font-semibold">Paiements</h3>
                </div>
                <AppBadge tone="green">{payments.length}</AppBadge>
            </div>

            <div className="space-y-2">
                {payments.length ? payments.map((payment) => (
                    <div key={payment.id} className="grid gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 md:grid-cols-[minmax(0,1fr)_160px]">
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">{payment.paymentNumber}</p>
                            <p className="truncate text-xs text-[var(--text-muted)]">{payment.clientName || '-'} Â· {payment.documentNumber || '-'}</p>
                            <p className="truncate text-xs text-[var(--text-muted)]">{payment.dossierNumber || '-'} Â· {payment.method || '-'}</p>
                        </div>
                        <div className="text-left md:text-right">
                            <p className="text-sm font-semibold text-emerald-300">{money(payment.amount, currency)}</p>
                            <p className="text-xs text-[var(--text-muted)]">{payment.paidAt || '-'}</p>
                        </div>
                    </div>
                )) : (
                    <p className="text-sm text-[var(--text-muted)]">Aucun paiement.</p>
                )}
            </div>
        </AppCard>
    );
}

export function FinanceMonthlySummary({ months, currency }: Props) {
    const [selectedKey, setSelectedKey] = useState(months[0]?.key ?? '');
    const selected = useMemo(
        () => months.find((month) => month.key === selectedKey) ?? months[0] ?? null,
        [months, selectedKey],
    );

    if (!months.length || !selected) {
        return (
            <AppEmptyState
                title="Aucune synthese mensuelle"
                description="Les devis, factures, recus et paiements apparaitront ici par mois."
            />
        );
    }

    const selectedQuotes = selected.documents.filter((document) => document.type === 'quote');
    const selectedInvoices = selected.documents.filter((document) => document.type === 'invoice');
    const selectedReceipts = selected.documents.filter((document) => document.type === 'receipt');

    return (
        <section className="space-y-5">
            <div className="grid gap-3 lg:grid-cols-3">
                {months.map((month) => {
                    const active = month.key === selected.key;

                    return (
                        <button
                            key={month.key}
                            type="button"
                            onClick={() => setSelectedKey(month.key)}
                            className={[
                                'rounded-2xl border p-4 text-left transition',
                                active
                                    ? 'border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_12%,transparent)]'
                                    : 'border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)]',
                            ].join(' ')}
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <CalendarDays size={17} className="text-[var(--accent)]" />
                                    <span className="font-semibold">{month.label}</span>
                                </div>
                                <AppBadge tone={active ? 'amber' : 'neutral'}>{month.documents.length} docs</AppBadge>
                            </div>
                            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-[var(--text-muted)]">
                                <span>Devis: {money(month.quotesTotalTtc, month.currency || currency)}</span>
                                <span>Factures: {money(month.invoicesTotalTtc, month.currency || currency)}</span>
                                <span>PayÃ©: {money(month.paidTotal, month.currency || currency)}</span>
                                <span>Reste: {money(month.remainingTotal, month.currency || currency)}</span>
                            </div>
                        </button>
                    );
                })}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryStat label="Devis" value={`${selected.quotesCount} Â· ${money(selected.quotesTotalTtc, selected.currency || currency)}`} />
                <SummaryStat label="Factures" value={`${selected.invoicesCount} Â· ${money(selected.invoicesTotalTtc, selected.currency || currency)}`} />
                <SummaryStat label="Recus" value={`${selected.receiptsCount} Â· ${money(selected.receiptsTotalTtc, selected.currency || currency)}`} />
                <SummaryStat label="Paiements" value={`${selected.paymentsCount} Â· ${money(selected.paidTotal, selected.currency || currency)}`} tone="success" />
                <SummaryStat label="Restant" value={money(selected.remainingTotal, selected.currency || currency)} tone="warning" />
                <SummaryStat label="En retard" value={money(selected.overdueTotal, selected.currency || currency)} tone="danger" />
                <SummaryStat label="HT" value={money(selected.subtotalHt, selected.currency || currency)} />
                <SummaryStat label="TVA" value={money(selected.taxTotal, selected.currency || currency)} />
            </div>

            <div className="grid gap-5 xl:grid-cols-2">
                <DocumentList title="Devis du mois" icon={<FileText size={17} />} documents={selectedQuotes} currency={selected.currency || currency} />
                <DocumentList title="Factures du mois" icon={<ReceiptText size={17} />} documents={selectedInvoices} currency={selected.currency || currency} />
                <DocumentList title="Recus du mois" icon={<ReceiptText size={17} />} documents={selectedReceipts} currency={selected.currency || currency} />
                <PaymentList payments={selected.payments} currency={selected.currency || currency} />
            </div>
        </section>
    );
}
```


## FILE: resources\js\features\finance\components\FinanceStatusBadge.tsx
```
import { AppStatusBadge } from '@/components/ui/AppStatusBadge';
import type { FinanceDocumentStatus } from '@/features/finance/types';

type StatusTone = 'neutral' | 'blue' | 'green' | 'amber' | 'red' | 'violet';

const statusLabels: Record<FinanceDocumentStatus, string> = {
    draft: 'Brouillon',
    sent: 'Envoye',
    accepted: 'Accepte',
    rejected: 'Refuse',
    converted: 'Converti',
    issued: 'Emis',
    partially_paid: 'Partiellement paye',
    paid: 'Paye',
    overdue: 'En retard',
    cancelled: 'Annule',
};

const statusTones: Record<FinanceDocumentStatus, StatusTone> = {
    draft: 'neutral',
    sent: 'blue',
    accepted: 'green',
    rejected: 'red',
    converted: 'violet',
    issued: 'blue',
    partially_paid: 'amber',
    paid: 'green',
    overdue: 'red',
    cancelled: 'neutral',
};

export function financeStatusLabel(status: string): string {
    return statusLabels[status as FinanceDocumentStatus] ?? status;
}

export function FinanceStatusBadge({ status }: { status: FinanceDocumentStatus | string }) {
    const typedStatus = status as FinanceDocumentStatus;
    const icon = typedStatus === 'paid' || typedStatus === 'accepted'
        ? 'check'
        : typedStatus === 'overdue' || typedStatus === 'rejected'
            ? 'warning'
            : typedStatus === 'sent' || typedStatus === 'partially_paid'
                ? 'clock'
                : 'dot';

    return (
        <AppStatusBadge
            label={financeStatusLabel(status)}
            tone={statusTones[typedStatus] ?? 'neutral'}
            icon={icon}
        />
    );
}

```


## FILE: resources\js\features\finance\components\FinanceTabs.tsx
```
import type { ReactNode } from 'react';
import { AppCompactTabs } from '@/components/ui/AppCompactTabs';

export const financeTabs = [
    { id: 'overview', label: 'Vue generale' },
    { id: 'quotes', label: 'Devis' },
    { id: 'invoices', label: 'Factures' },
    { id: 'payments', label: 'Paiements' },
    { id: 'monthly', label: 'Mensuel' },
    { id: 'templates', label: 'Templates' },
    { id: 'settings', label: 'Parametres' },
];

type FinanceTabsProps = {
    selectedKey: string;
    onSelectionChange: (key: string) => void;
    children: ReactNode;
};

export function FinanceTabs({ selectedKey, onSelectionChange, children }: FinanceTabsProps) {
    return (
        <AppCompactTabs
            tabs={financeTabs}
            selectedKey={selectedKey}
            onSelectionChange={(key) => onSelectionChange(String(key))}
        >
            {children}
        </AppCompactTabs>
    );
}


```


## FILE: resources\js\features\finance\components\FinanceTimeline.tsx
```
import { CheckCircle2, Circle, Clock3 } from 'lucide-react';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppCard } from '@/components/ui/AppCard';
import { useTranslation } from '@/lib/i18n';

const steps = [
    { key: 'devisCreated', done: true },
    { key: 'invoiceGenerated', done: true },
    { key: 'paymentReceived', active: true },
    { key: 'remainingFollowUp', done: false },
    { key: 'closed', done: false },
];

export function FinanceTimeline() {
    const { t } = useTranslation();

    return (
        <AppCard className="min-w-0 p-4">
            <div className="mb-4">
                <h2 className="text-sm font-semibold">{t('financeWorkspace.timeline.title')}</h2>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                    {t('financeWorkspace.timeline.description')}
                </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                {steps.map((step) => (
                    <div key={step.key} className="rounded-2xl border bg-[var(--surface)] p-3">
                        <div className="mb-3 flex items-center justify-between gap-3">
                            <div className="flex size-8 items-center justify-center rounded-full bg-[var(--surface-2)]">
                                {step.done ? (
                                    <CheckCircle2 size={16} className="text-[var(--success)]" />
                                ) : step.active ? (
                                    <Clock3 size={16} className="text-[var(--warning)]" />
                                ) : (
                                    <Circle size={16} className="text-[var(--text-muted)]" />
                                )}
                            </div>

                            <AppBadge tone={step.done ? 'green' : step.active ? 'amber' : 'neutral'}>
                                {step.done
                                    ? t('common.completed')
                                    : step.active
                                      ? t('common.pending')
                                      : t('common.ready')}
                            </AppBadge>
                        </div>

                        <p className="text-sm font-medium">
                            {t(`financeWorkspace.timeline.${step.key}`)}
                        </p>
                    </div>
                ))}
            </div>
        </AppCard>
    );
}

```


## FILE: resources\js\features\finance\components\FinanceTotalsBox.tsx
```
import { AppCard } from '@/components/ui/AppCard';
import { formatMoney } from '@/features/finance/utils/calculations';

type FinanceTotalsBoxProps = {
    subtotalHt: number;
    discountTotal: number;
    taxTotal: number;
    totalTtc: number;
    paidTotal?: number;
    remainingTotal?: number;
    currency: string;
};

export function FinanceTotalsBox({ subtotalHt, discountTotal, taxTotal, totalTtc, paidTotal = 0, remainingTotal, currency }: FinanceTotalsBoxProps) {
    const remaining = remainingTotal ?? Math.max(0, totalTtc - paidTotal);

    return (
        <AppCard className="p-4">
            <div className="space-y-2 text-sm">
                <Row label="Sous-total HT" value={formatMoney(subtotalHt, currency)} />
                <Row label="Remise document" value={`-${formatMoney(discountTotal, currency)}`} muted />
                <Row label="TVA" value={formatMoney(taxTotal, currency)} />
                <div className="my-2 border-t" />
                <Row label="Total TTC" value={formatMoney(totalTtc, currency)} strong />
                <Row label="Paye" value={formatMoney(paidTotal, currency)} />
                <Row label="Restant" value={formatMoney(remaining, currency)} strong danger={remaining > 0} />
            </div>
        </AppCard>
    );
}

function Row({ label, value, strong = false, muted = false, danger = false }: { label: string; value: string; strong?: boolean; muted?: boolean; danger?: boolean }) {
    return (
        <div className="flex items-center justify-between gap-4">
            <span className={muted ? 'text-[var(--text-muted)]' : 'text-[var(--text)]'}>{label}</span>
            <span className={`font-mono tabular-nums ${strong ? 'text-base font-bold' : 'font-medium'} ${danger ? 'text-[var(--danger)]' : ''}`}>{value}</span>
        </div>
    );
}

```


## FILE: resources\js\features\finance\data\mockFinance.ts
```
export type FinanceRecordType = 'devis' | 'invoice' | 'payment' | 'creditNote';
export type FinanceRecordStatus = 'draft' | 'sent' | 'partiallyPaid' | 'paid' | 'overdue' | 'cancelled';

export type FinanceRecordRow = {
    id: number;
    recordNumber: string;
    type: FinanceRecordType;
    status: FinanceRecordStatus;
    dossierNumber: string;
    projectObject: string;
    client: string;
    cin: string;
    ht: number;
    tva: number;
    totalTtc: number;
    paid: number;
    remaining: number;
    dueDate: string;
    updatedAt: string;
    nextAction: string;
};

export const financeRows: FinanceRecordRow[] = [
    {
        id: 1,
        recordNumber: 'DEV-2026-0001',
        type: 'devis',
        status: 'sent',
        dossierNumber: 'DOS-2026-0001',
        projectObject: 'Villa construction study',
        client: 'Mohamed Ouknin',
        cin: 'EE123456',
        ht: 28000,
        tva: 5600,
        totalTtc: 33600,
        paid: 0,
        remaining: 33600,
        dueDate: 'This week',
        updatedAt: 'Today',
        nextAction: 'Convert devis to invoice after client validation.',
    },
    {
        id: 2,
        recordNumber: 'INV-2026-0002',
        type: 'invoice',
        status: 'partiallyPaid',
        dossierNumber: 'DOS-2026-0002',
        projectObject: 'Apartment renovation',
        client: 'Salma El Mansouri',
        cin: 'BK884210',
        ht: 14000,
        tva: 2800,
        totalTtc: 16800,
        paid: 8000,
        remaining: 8800,
        dueDate: 'Next week',
        updatedAt: 'Yesterday',
        nextAction: 'Follow remaining balance before final file closure.',
    },
    {
        id: 3,
        recordNumber: 'INV-2026-0003',
        type: 'invoice',
        status: 'overdue',
        dossierNumber: 'DOS-2026-0005',
        projectObject: 'Office extension',
        client: 'Youssef Ait Lahcen',
        cin: 'JB120045',
        ht: 22000,
        tva: 4400,
        totalTtc: 26400,
        paid: 10000,
        remaining: 16400,
        dueDate: 'Yesterday',
        updatedAt: 'Today',
        nextAction: 'Call client and schedule payment follow-up.',
    },
    {
        id: 4,
        recordNumber: 'INV-2026-0004',
        type: 'invoice',
        status: 'paid',
        dossierNumber: 'DOS-2026-0006',
        projectObject: 'Housing permit file',
        client: 'Khadija Bennani',
        cin: 'QW992341',
        ht: 18000,
        tva: 3600,
        totalTtc: 21600,
        paid: 21600,
        remaining: 0,
        dueDate: 'Closed',
        updatedAt: '2 days ago',
        nextAction: 'Ready for archive.',
    },
];

export function getFinanceMetrics() {
    return {
        totalTtc: financeRows.reduce((sum, row) => sum + row.totalTtc, 0),
        paid: financeRows.reduce((sum, row) => sum + row.paid, 0),
        remaining: financeRows.reduce((sum, row) => sum + row.remaining, 0),
        overdue: financeRows
            .filter((row) => row.status === 'overdue')
            .reduce((sum, row) => sum + row.remaining, 0),
    };
}

export function formatMoney(value: number) {
    return new Intl.NumberFormat('en-MA', {
        style: 'currency',
        currency: 'MAD',
        maximumFractionDigits: 0,
    }).format(value);
}

```


## FILE: resources\js\features\finance\drawers\FinanceDocumentBuilderDrawer.tsx
```
import { useEffect, useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { AppButton } from '@/components/ui/AppButton';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppTextField } from '@/components/ui/AppTextField';
import { AppTextarea } from '@/components/ui/AppTextarea';
import { FinanceClientDossierFields } from '@/features/finance/components/FinanceClientDossierFields';
import { FinanceDateFields } from '@/features/finance/components/FinanceDateFields';
import { FinanceDocumentLockNotice, getFinanceDocumentLockMessage, isFinanceDocumentLocked } from '@/features/finance/components/FinanceDocumentLockNotice';
import { FinanceDocumentPreview } from '@/features/finance/components/FinanceDocumentPreview';
import { FinanceItemsTable } from '@/features/finance/components/FinanceItemsTable';
import { FinanceTotalsBox } from '@/features/finance/components/FinanceTotalsBox';
import type { ClientOption, DossierOption, FinanceDocument, FinanceDocumentItem, FinanceDocumentType, FinanceSettings, TemplateOption } from '@/features/finance/types';
import { calculateItem, calculateTotals, createEmptyItem, normalizeCurrency, normalizeNumber } from '@/features/finance/utils/calculations';

type UiLockAwareFinanceDocument = {
    numberLocked?: boolean;
    numberLockedAt?: string | null;
    lock?: {
        isLocked?: boolean;
        lockedAtFormatted?: string | null;
        message?: string;
        canEditNumberFields?: boolean;
        canRegenerateExports?: boolean;
        canGeneratePdf?: boolean;
        canGenerateExcel?: boolean;
    } | null;
};

function isFinanceDocumentLocked(document: UiLockAwareFinanceDocument | null | undefined) {
    return Boolean(document?.lock?.isLocked ?? document?.numberLocked);
}

function canEditFinanceDocumentNumberFields(document: UiLockAwareFinanceDocument | null | undefined) {
    return document?.lock?.canEditNumberFields ?? !isFinanceDocumentLocked(document);
}

function FinanceDocumentLockedInlineBadge({ document }: { document: UiLockAwareFinanceDocument | null | undefined }) {
    if (!isFinanceDocumentLocked(document)) {
        return null;
    }

    const lockedAt = document?.lock?.lockedAtFormatted ?? document?.numberLockedAt ?? null;

    return (
        <span
            className="ml-2 inline-flex items-center rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-300"
            title={lockedAt ? `Locked at ${lockedAt}` : 'Locked after export'}
        >
            
            <FinanceDocumentLockInlineNotice document={document} />
Locked
        </span>
    );
}

function FinanceDocumentLockInlineNotice({ document }: { document: UiLockAwareFinanceDocument | null | undefined }) {
    if (!isFinanceDocumentLocked(document)) {
        return null;
    }

    const lockedAt = document?.lock?.lockedAtFormatted ?? document?.numberLockedAt ?? null;
    const message = document?.lock?.message ?? 'Document locked after export. Number, type, and issue date cannot be changed.';

    return (
        <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
            <div className="font-semibold text-amber-200">Locked document</div>
            <div className="mt-1 text-amber-100/80">{message}</div>
            {lockedAt ? <div className="mt-1 text-xs text-amber-100/60">Locked at {lockedAt}</div> : null}
        </div>
    );
}


type FinanceDocumentBuilderDrawerProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    mode: 'create' | 'edit';
    type: FinanceDocumentType;
    document?: FinanceDocument | null;
    clients: ClientOption[];
    dossiers: DossierOption[];
    templates: TemplateOption[];
    settings: FinanceSettings;
    onSaved?: (type: FinanceDocumentType) => void;
};

type BuilderForm = {
    type: FinanceDocumentType;
    clientId: string;
    dossierId: string;
    issueDate: string;
    dueDate: string;
    validUntil: string;
    currency: string;
    tvaRate: number;
    discountTotal: number;
    notes: string;
    terms: string;
    templateId: string;
    items: FinanceDocumentItem[];
};

const today = () => new Date().toISOString().slice(0, 10);

function addDays(date: string, days: number): string {
    const value = new Date(`${date}T00:00:00`);
    value.setDate(value.getDate() + days);
    return value.toISOString().slice(0, 10);
}

function createForm(type: FinanceDocumentType, settings: FinanceSettings, document?: FinanceDocument | null): BuilderForm {
    const issueDate = document?.issueDate || today();

    if (document) {
        return {
            type: document.type,
            clientId: document.client ? String(document.client.id) : '',
            dossierId: document.dossier ? String(document.dossier.id) : '',
            issueDate,
            dueDate: document.dueDate || '',
            validUntil: document.validUntil || '',
            currency: normalizeCurrency(document.currency || settings.defaultCurrency),
            tvaRate: normalizeNumber(document.tvaRate || settings.defaultTvaRate),
            discountTotal: normalizeNumber(document.discountTotal),
            notes: document.notes || '',
            terms: document.terms || '',
            templateId: document.templateId ? String(document.templateId) : '',
            items: document.items.length > 0
                ? document.items.map((item, index) => calculateItem({ ...item, position: index + 1 }, document.tvaRate || settings.defaultTvaRate))
                : [createEmptyItem(settings.defaultTvaRate)],
        };
    }

    return {
        type,
        clientId: '',
        dossierId: '',
        issueDate,
        dueDate: type === 'invoice' ? addDays(issueDate, settings.defaultPaymentTermsDays) : '',
        validUntil: type === 'quote' ? addDays(issueDate, settings.defaultQuoteValidityDays) : '',
        currency: normalizeCurrency(settings.defaultCurrency),
        tvaRate: settings.defaultTvaRate,
        discountTotal: 0,
        notes: '',
        terms: '',
        templateId: '',
        items: [createEmptyItem(settings.defaultTvaRate)],
    };
}

export function FinanceDocumentBuilderDrawer({
    isOpen,
    onOpenChange,
    mode,
    type,
    document,
    clients,
    dossiers,
    templates,
    settings,
    onSaved,
}: FinanceDocumentBuilderDrawerProps) {
    const [form, setForm] = useState<BuilderForm>(() => createForm(type, settings, document));
    const isLocked = isFinanceDocumentLocked(document);
    const canEditNumberFields = !isLocked && (document?.lock?.canEditNumberFields ?? true);
    const lockMessage = isLocked ? getFinanceDocumentLockMessage(document) : undefined;

    useEffect(() => {
        if (isOpen) {
            setForm(createForm(type, settings, document));
        }
    }, [document, isOpen, settings, type]);

    const totals = useMemo(
        () => calculateTotals(form.items, form.discountTotal, form.tvaRate),
        [form.discountTotal, form.items, form.tvaRate],
    );

    const selectedClient = clients.find((client) => client.id === form.clientId);
    const selectedDossier = dossiers.find((dossier) => dossier.id === form.dossierId);
    const title = mode === 'edit'
        ? `Modifier ${document?.number || 'document'}`
        : form.type === 'quote'
            ? 'Nouveau devis'
            : form.type === 'invoice'
                ? 'Nouvelle facture'
                : 'Nouveau recu';

    function update<K extends keyof BuilderForm>(key: K, value: BuilderForm[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    function submit() {
        const payload: Record<string, unknown> = {
            type: form.type,
            client_id: form.clientId || null,
            dossier_id: form.dossierId || null,
            issue_date: form.issueDate || null,
            due_date: form.dueDate || null,
            valid_until: form.validUntil || null,
            currency: form.currency,
            tva_rate: form.tvaRate,
            discount_total: form.discountTotal,
            notes: form.notes || null,
            terms: form.terms || null,
            template_id: form.templateId || null,
            items: form.items.map((item, index) => ({
                title: item.title || `Ligne ${index + 1}`,
                description: item.description || null,
                quantity: item.quantity || 1,
                unit: item.unit || null,
                unit_price: item.unitPrice || 0,
                discount_rate: item.discountRate || 0,
                tva_rate: item.tvaRate || form.tvaRate,
            })),
        };

        if (mode === 'edit' && isLocked) {
            delete payload.type;
            delete payload.issue_date;
        }

        const options = {
            preserveScroll: true,
            preserveState: false,
            onSuccess: () => {
                toast.success(mode === 'edit' ? 'Document mis a jour.' : 'Document cree.');
                onSaved?.(form.type);
                onOpenChange(false);
            },
            onError: () => toast.error('Impossible enregistrer le document.'),
        };

        if (mode === 'edit' && document) {
            router.put(`/finance/documents/${document.id}`, payload, options);
            return;
        }

        router.post('/finance/documents', payload, options);
    }

    return (
        <AppDrawer
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            title={title}
            description="Construire le document avec calcul HT, TVA, TTC et apercu en direct."
            panelClassName="!w-[min(1200px,calc(100vw-24px))] !max-w-[1200px] sm:!w-[min(1200px,calc(100vw-40px))]"
            footer={
                <>
                    <AppButton variant="ghost" onPress={() => onOpenChange(false)}>Annuler</AppButton>
                    <AppButton variant="primary" onPress={submit}>Enregistrer</AppButton>
                </>
            }
        >
            <div className="finance-builder-container"><div className="finance-builder-layout">
                <div className="min-w-0 space-y-5">
                    <FinanceDocumentLockNotice document={document} compact />
                    <div className="grid gap-3 sm:grid-cols-3">
                        <AppSelect
                            label="Type"
                            options={[
                                { id: 'quote', label: 'Devis' },
                                { id: 'invoice', label: 'Facture' },
                                { id: 'receipt', label: 'Recu' },
                            ]}
                            selectedKey={form.type}
                            isDisabled={!canEditNumberFields}
                            description={!canEditNumberFields ? lockMessage : undefined}
                            onSelectionChange={(key) => update('type', String(key || 'quote') as FinanceDocumentType)}
                        />
                        <AppTextField label="Devise" value={form.currency} onChange={(value) => update('currency', normalizeCurrency(value))} />
                        <AppTextField label="TVA par defaut (%)" type="number" min="0" max="100" step="0.01" value={String(form.tvaRate)} onChange={(value) => update('tvaRate', normalizeNumber(value))} />
                    </div>

                    <FinanceClientDossierFields
                        clientId={form.clientId}
                        dossierId={form.dossierId}
                        clients={clients}
                        dossiers={dossiers}
                        onClientChange={(value) => update('clientId', value)}
                        onDossierChange={(value) => update('dossierId', value)}
                    />

                    <FinanceDateFields
                        type={form.type}
                        issueDate={form.issueDate}
                        dueDate={form.dueDate}
                        validUntil={form.validUntil}
                        isIssueDateDisabled={!canEditNumberFields}
                        issueDateDescription={!canEditNumberFields ? lockMessage : undefined}
                        onChange={(field, value) => update(field, value)}
                    />

                    <div className="grid gap-3 sm:grid-cols-2">
                        <AppTextField label="Remise document" type="number" min="0" step="0.01" value={String(form.discountTotal)} onChange={(value) => update('discountTotal', normalizeNumber(value))} />
                        <AppSelect
                            label="Template"
                            placeholder="Template optionnel"
                            options={[{ id: '', label: 'Aucun template' }, ...templates.filter((template) => template.type === form.type || template.type === 'finance')]}
                            selectedKey={form.templateId || null}
                            onSelectionChange={(key) => update('templateId', key ? String(key) : '')}
                        />
                    </div>

                    <FinanceItemsTable
                        items={totals.items}
                        defaultTvaRate={form.tvaRate}
                        currency={form.currency}
                        onChange={(items) => update('items', items)}
                    />

                    <FinanceTotalsBox
                        subtotalHt={totals.subtotalHt}
                        discountTotal={totals.discountTotal}
                        taxTotal={totals.taxTotal}
                        totalTtc={totals.totalTtc}
                        paidTotal={document?.paidTotal || 0}
                        remainingTotal={document ? Math.max(0, totals.totalTtc - document.paidTotal) : totals.totalTtc}
                        currency={form.currency}
                    />

                    <div className="grid gap-3 lg:grid-cols-2">
                        <AppTextarea label="Notes" value={form.notes} onChange={(value) => update('notes', value)} />
                        <AppTextarea label="Conditions" value={form.terms} onChange={(value) => update('terms', value)} />
                    </div>
                </div>

                <FinanceDocumentPreview
                    type={form.type}
                    number={document?.number}
                    clientLabel={selectedClient?.label}
                    dossierLabel={selectedDossier?.label}
                    issueDate={form.issueDate}
                    dueDate={form.dueDate}
                    validUntil={form.validUntil}
                    currency={form.currency}
                    items={totals.items}
                    subtotalHt={totals.subtotalHt}
                    discountTotal={totals.discountTotal}
                    taxTotal={totals.taxTotal}
                    totalTtc={totals.totalTtc}
                    notes={form.notes}
                    terms={form.terms}
                />
            </div></div>
        </AppDrawer>
    );
}






```


## FILE: resources\js\features\finance\drawers\FinanceDocumentDrawer.tsx
```
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { AppButton } from '@/components/ui/AppButton';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppFormErrorSummary } from '@/components/ui/AppFormErrorSummary';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppTextField } from '@/components/ui/AppTextField';
import { AppTextarea } from '@/components/ui/AppTextarea';
import type { FormErrors } from '@/lib/formErrors';

type UiLockAwareFinanceDocument = {
    numberLocked?: boolean;
    numberLockedAt?: string | null;
    lock?: {
        isLocked?: boolean;
        lockedAtFormatted?: string | null;
        message?: string;
        canEditNumberFields?: boolean;
        canRegenerateExports?: boolean;
        canGeneratePdf?: boolean;
        canGenerateExcel?: boolean;
    } | null;
};

function isFinanceDocumentLocked(document: UiLockAwareFinanceDocument | null | undefined) {
    return Boolean(document?.lock?.isLocked ?? document?.numberLocked);
}

function canEditFinanceDocumentNumberFields(document: UiLockAwareFinanceDocument | null | undefined) {
    return document?.lock?.canEditNumberFields ?? !isFinanceDocumentLocked(document);
}

function FinanceDocumentLockedInlineBadge({ document }: { document: UiLockAwareFinanceDocument | null | undefined }) {
    if (!isFinanceDocumentLocked(document)) {
        return null;
    }

    const lockedAt = document?.lock?.lockedAtFormatted ?? document?.numberLockedAt ?? null;

    return (
        <span
            className="ml-2 inline-flex items-center rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-300"
            title={lockedAt ? `Locked at ${lockedAt}` : 'Locked after export'}
        >
            
            <FinanceDocumentLockInlineNotice document={document} />
Locked
        </span>
    );
}

function FinanceDocumentLockInlineNotice({ document }: { document: UiLockAwareFinanceDocument | null | undefined }) {
    if (!isFinanceDocumentLocked(document)) {
        return null;
    }

    const lockedAt = document?.lock?.lockedAtFormatted ?? document?.numberLockedAt ?? null;
    const message = document?.lock?.message ?? 'Document locked after export. Number, type, and issue date cannot be changed.';

    return (
        <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
            <div className="font-semibold text-amber-200">Locked document</div>
            <div className="mt-1 text-amber-100/80">{message}</div>
            {lockedAt ? <div className="mt-1 text-xs text-amber-100/60">Locked at {lockedAt}</div> : null}
        </div>
    );
}


type ClientOption = { id: string; label: string };
type DossierOption = { id: string; label: string };

type LineItemForm = {
    key: number;
    title: string;
    description: string;
    quantity: string;
    unit: string;
    unit_price: string;
    discount_rate: string;
    tva_rate: string;
};

export type FinanceDocFormPayload = {
    type: string;
    client_id: string;
    dossier_id: string;
    issue_date: string;
    due_date: string;
    valid_until: string;
    currency: string;
    tva_rate: string;
    notes: string;
    terms: string;
    items: LineItemForm[];
};

type CalculatedTotals = {
    subtotalHt: number;
    discountTotal: number;
    taxTotal: number;
    totalTtc: number;
};

type LineItemCalculations = {
    totalHt: number;
    totalTva: number;
    totalTtc: number;
};

const emptyItem = (key: number, tvaRate = '20'): LineItemForm => ({
    key,
    title: '',
    description: '',
    quantity: '1',
    unit: '',
    unit_price: '0',
    discount_rate: '0',
    tva_rate: tvaRate,
});

const emptyForm: FinanceDocFormPayload = {
    type: 'quote',
    client_id: '',
    dossier_id: '',
    issue_date: new Date().toISOString().slice(0, 10),
    due_date: '',
    valid_until: '',
    currency: 'MAD',
    tva_rate: '20',
    notes: '',
    terms: '',
    items: [emptyItem(1, '20')],
};

const calculateLineItem = (item: LineItemForm): LineItemCalculations => {
    const quantity = parseFloat(item.quantity) || 0;
    const unitPrice = parseFloat(item.unit_price) || 0;
    const discountRate = parseFloat(item.discount_rate) || 0;
    const tvaRate = parseFloat(item.tva_rate) || 0;

    const subtotal = quantity * unitPrice;
    const discountAmount = (subtotal * discountRate) / 100;
    const totalHt = subtotal - discountAmount;
    const totalTva = (totalHt * tvaRate) / 100;
    const totalTtc = totalHt + totalTva;

    return { totalHt, totalTva, totalTtc };
};

type Props = {
    isOpen: boolean;
    mode: 'create' | 'edit';
    clients: ClientOption[];
    dossiers: DossierOption[];
    onOpenChange: (open: boolean) => void;
    onSubmit: (payload: FinanceDocFormPayload) => void;
    initialType?: string;
    errors?: FormErrors;
};

export function FinanceDocumentDrawer({
    isOpen,
    mode,
    clients,
    dossiers,
    onOpenChange,
    onSubmit,
    initialType,
    errors = {},
}: Props) {
    const [form, setForm] = useState<FinanceDocFormPayload>(emptyForm);
    const [nextItemKey, setNextItemKey] = useState(2);

    useEffect(() => {
        if (isOpen && mode === 'create') {
            setForm({
                ...emptyForm,
                type: initialType || emptyForm.type,
                items: [emptyItem(1, emptyForm.tva_rate)],
            });
            setNextItemKey(2);
        }
    }, [isOpen, mode, initialType]);

    const update = useCallback(
        <K extends keyof FinanceDocFormPayload>(
            key: K,
            value: FinanceDocFormPayload[K],
        ) => setForm((prev) => ({ ...prev, [key]: value })),
        [],
    );

    const updateItem = useCallback(
        (itemKey: number, field: keyof LineItemForm, value: string) => {
            setForm((prev) => ({
                ...prev,
                items: prev.items.map((item) =>
                    item.key === itemKey ? { ...item, [field]: value } : item,
                ),
            }));
        },
        [],
    );

    const addItem = useCallback(() => {
        setForm((prev) => ({
            ...prev,
            items: [
                ...prev.items,
                emptyItem(nextItemKey, prev.tva_rate),
            ],
        }));
        setNextItemKey((k) => k + 1);
    }, [nextItemKey]);

    const removeItem = useCallback((itemKey: number) => {
        setForm((prev) => ({
            ...prev,
            items: prev.items.filter((item) => item.key !== itemKey),
        }));
    }, []);

    const totals: CalculatedTotals = useMemo(() => {
        let subtotalHt = 0;
        let discountTotal = 0;
        let taxTotal = 0;

        form.items.forEach(item => {
            const calc = calculateLineItem(item);
            const quantity = parseFloat(item.quantity) || 0;
            const unitPrice = parseFloat(item.unit_price) || 0;
            const discountRate = parseFloat(item.discount_rate) || 0;
            
            subtotalHt += calc.totalHt;
            taxTotal += calc.totalTva;
            discountTotal += (quantity * unitPrice * discountRate) / 100;
        });

        const totalTtc = subtotalHt + taxTotal;

        return { subtotalHt, discountTotal, taxTotal, totalTtc };
    }, [form.items]);

    const formatCurrency = (amount: number): string => {
        return amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    function handleSubmit() {
        onSubmit(form);
    }

    const typeOptions = [
        { id: 'quote', label: 'Devis' },
        { id: 'invoice', label: 'Facture' },
        { id: 'receipt', label: 'ReÃ§u' },
    ];

    const clientOptions = clients.map((c) => ({ id: c.id, label: c.label }));
    const dossierOptions = dossiers.map((d) => ({ id: d.id, label: d.label }));

    return (
        <AppDrawer
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            title={mode === 'create' ? 'New document' : 'Edit document'}
            description={
                mode === 'create'
                    ? 'Create a new devis, invoice, or receipt.'
                    : 'Update the document details and items.'
            }
            footer={
                <>
                    <AppButton variant="ghost" onPress={() => onOpenChange(false)}>
                        Cancel
                    </AppButton>
                    <AppButton variant="primary" onPress={handleSubmit}>
                        {mode === 'create' ? 'Create' : 'Save'}
                    </AppButton>
                </>
            }
        >
            <div className="space-y-5">
                <AppFormErrorSummary errors={errors} />

                <AppSelect
                    label="Type"
                    options={typeOptions}
                    selectedKey={form.type}
                    onSelectionChange={(key) => update('type', String(key))}
                />

                <AppSelect
                    label="Client"
                    placeholder="Select client"
                    options={
                        form.client_id
                            ? [{ id: '', label: 'None' }, ...clientOptions]
                            : clientOptions
                    }
                    selectedKey={form.client_id || undefined}
                    onSelectionChange={(key) => update('client_id', key ? String(key) : '')}
                />

                <AppSelect
                    label="Project"
                    placeholder="Select project"
                    options={
                        form.dossier_id
                            ? [{ id: '', label: 'None' }, ...dossierOptions]
                            : dossierOptions
                    }
                    selectedKey={form.dossier_id || undefined}
                    onSelectionChange={(key) => update('dossier_id', key ? String(key) : '')}
                />

                <div className="grid grid-cols-2 gap-3">
                    <AppTextField
                        label="Issue date"
                        type="date"
                        value={form.issue_date}
                        onChange={(v) => update('issue_date', v)}
                    />
                    <AppTextField
                        label="Due date"
                        type="date"
                        value={form.due_date}
                        onChange={(v) => update('due_date', v)}
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <AppTextField
                        label="Valid until"
                        type="date"
                        value={form.valid_until}
                        onChange={(v) => update('valid_until', v)}
                    />
                    <AppTextField
                        label="TVA rate (%)"
                        type="number"
                        value={form.tva_rate}
                        onChange={(v) => update('tva_rate', v)}
                    />
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-[var(--text)]">
                            Line items
                        </h3>
                        <AppButton variant="ghost" size="sm" onPress={addItem}>
                            <Plus size={14} />
                            Add item
                        </AppButton>
                    </div>

                    <div className="space-y-3">
                        {form.items.map((item, idx) => {
                            const itemTotals = calculateLineItem(item);
                            return (
                            <div
                                key={item.key}
                                className="space-y-2 rounded-2xl border p-3"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-[var(--text-muted)]">
                                        Item {idx + 1}
                                    </span>
                                    {form.items.length > 1 && (
                                        <AppButton
                                            variant="ghost"
                                            size="sm"
                                            onPress={() => removeItem(item.key)}
                                        >
                                            <Trash2 size={13} />
                                        </AppButton>
                                    )}
                                </div>

                                <AppTextField
                                    label="Title"
                                    value={item.title}
                                    onChange={(v) => updateItem(item.key, 'title', v)}
                                />

                                <AppTextarea
                                    label="Description"
                                    value={item.description}
                                    onChange={(v) =>
                                        updateItem(item.key, 'description', v)
                                    }
                                />

                                <div className="grid grid-cols-4 gap-2">
                                    <AppTextField
                                        label="Qty"
                                        type="number"
                                        step="0.001"
                                        value={item.quantity}
                                        onChange={(v) =>
                                            updateItem(item.key, 'quantity', v)
                                        }
                                    />
                                    <AppTextField
                                        label="Unit"
                                        value={item.unit}
                                        onChange={(v) =>
                                            updateItem(item.key, 'unit', v)
                                        }
                                    />
                                    <AppTextField
                                        label="Unit price"
                                        type="number"
                                        step="0.01"
                                        value={item.unit_price}
                                        onChange={(v) =>
                                            updateItem(item.key, 'unit_price', v)
                                        }
                                    />
                                    <AppTextField
                                        label="Disc. %"
                                        type="number"
                                        step="0.01"
                                        value={item.discount_rate}
                                        onChange={(v) =>
                                            updateItem(item.key, 'discount_rate', v)
                                        }
                                    />
                                </div>

                                <div className="mt-2 flex justify-between text-xs text-[var(--text-muted)]">
                                    <span>HT: {formatCurrency(itemTotals.totalHt)} MAD</span>
                                    <span>TVA: {formatCurrency(itemTotals.totalTva)} MAD</span>
                                    <span>TTC: {formatCurrency(itemTotals.totalTtc)} MAD</span>
                                </div>
                            </div>
                        );})}
                    </div>
                </div>

                <div className="rounded-2xl border p-4 bg-[var(--card-muted)]">
                    <h3 className="mb-3 text-sm font-medium text-[var(--text)]">Totals</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-[var(--text-muted)]">Subtotal HT</span>
                            <span className="font-mono text-sm">{formatCurrency(totals.subtotalHt)} MAD</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-[var(--text-muted)]">Discount</span>
                            <span className="font-mono text-sm text-[var(--danger)]">-{formatCurrency(totals.discountTotal)} MAD</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-[var(--text-muted)]">TVA ({form.tva_rate}%)</span>
                            <span className="font-mono text-sm">{formatCurrency(totals.taxTotal)} MAD</span>
                        </div>
                        <div className="pt-2 border-t border-[var(--border)] flex justify-between">
                            <span className="text-base font-semibold text-[var(--text)]">Total TTC</span>
                            <span className="font-mono text-base font-bold text-[var(--primary)]">{formatCurrency(totals.totalTtc)} MAD</span>
                        </div>
                    </div>
                </div>

                <AppTextarea
                    label="Notes"
                    value={form.notes}
                    onChange={(v) => update('notes', v)}
                />

                <AppTextarea
                    label="Terms"
                    value={form.terms}
                    onChange={(v) => update('terms', v)}
                />
            </div>
        </AppDrawer>
    );
}
```


## FILE: resources\js\features\finance\drawers\FinanceDrawer.tsx
```
import { FormEvent, useEffect, useState } from 'react';
import type { Key } from 'react-aria-components';
import { AppButton } from '@/components/ui/AppButton';
import { AppFormErrorSummary } from '@/components/ui/AppFormErrorSummary';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppTextField } from '@/components/ui/AppTextField';
import { AppTextarea } from '@/components/ui/AppTextarea';
import type {
    FinanceDossierOption,
    FinanceFormPayload,
    FinanceRecordRow,
} from '@/features/finance/types';

type FinanceDrawerProps = {
    isOpen: boolean;
    mode: 'create' | 'edit';
    record: FinanceRecordRow | null;
    dossiers: FinanceDossierOption[];
    onOpenChange: (isOpen: boolean) => void;
    onSubmit: (payload: FinanceFormPayload) => void;
    errors?: FormErrors;
};

const emptyForm: FinanceFormPayload = {
    dossierId: '',
    type: 'devis',
    status: 'draft',
    ht: '',
    tva: '',
    totalTtc: '',
    paid: '0',
    issuedAt: '',
    dueDate: '',
    paidAt: '',
    notes: '',
};

const typeOptions = [
    { id: 'devis', label: 'Devis' },
    { id: 'invoice', label: 'Invoice' },
    { id: 'payment', label: 'Payment' },
];

const statusOptions = [
    { id: 'draft', label: 'Draft' },
    { id: 'sent', label: 'Sent' },
    { id: 'paid', label: 'Paid' },
    { id: 'partially_paid', label: 'Partially paid' },
    { id: 'overdue', label: 'Overdue' },
    { id: 'cancelled', label: 'Cancelled' },
];

export function FinanceDrawer({
    isOpen,
    mode,
    record,
    dossiers,
    onOpenChange,
    onSubmit,
    errors = {},
}: FinanceDrawerProps) {
    const [form, setForm] = useState<FinanceFormPayload>(emptyForm);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        if (mode === 'edit' && record) {
            setForm({
                dossierId: record.dossierId || '',
                type: record.type || 'devis',
                status: record.status || 'draft',
                ht: record.ht ? String(record.ht) : '',
                tva: record.tva ? String(record.tva) : '',
                totalTtc: record.totalTtc ? String(record.totalTtc) : '',
                paid: record.paid ? String(record.paid) : '0',
                issuedAt: record.issuedAt || '',
                dueDate: record.dueDate || '',
                paidAt: record.paidAt || '',
                notes: record.notes || '',
            });
            return;
        }

        setForm(emptyForm);
    }, [isOpen, mode, record]);

    function updateField(field: keyof FinanceFormPayload, value: string) {
        setForm((current) => ({ ...current, [field]: value }));
    }

    function updateSelect(field: keyof FinanceFormPayload, value: Key | null) {
        setForm((current) => ({ ...current, [field]: value ? String(value) : '' }));
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        onSubmit(form);
    }

    return (
        <AppDrawer
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            title={mode === 'create' ? 'Create finance record' : 'Edit finance record'}
            description="Save devis, invoice, or payment tracking to the database."
            footer={
                <>
                    <AppButton variant="secondary" onPress={() => onOpenChange(false)}>
                        Cancel
                    </AppButton>

                    <AppButton variant="primary" type="submit" form="finance-form">
                        Save
                    </AppButton>
                </>
            }
        >
            <form id="finance-form" className="space-y-6" onSubmit={handleSubmit}>
                <AppFormErrorSummary errors={errors} />
                <section>
                    <h3 className="mb-3 text-sm font-semibold">Project and type</h3>

                    <div className="grid gap-4">
                        <AppSelect
                            label="Dossier / Project"
                            placeholder="Select dossier"
                            selectedKey={form.dossierId}
                            onSelectionChange={(value) => updateSelect('dossierId', value)}
                            options={dossiers}
                        />

                        <div className="grid gap-4 md:grid-cols-2">
                            <AppSelect
                                label="Type"
                                selectedKey={form.type}
                                onSelectionChange={(value) => updateSelect('type', value)}
                                options={typeOptions}
                            />

                            <AppSelect
                                label="Status"
                                selectedKey={form.status}
                                onSelectionChange={(value) => updateSelect('status', value)}
                                options={statusOptions}
                            />
                        </div>
                    </div>
                </section>

                <section>
                    <h3 className="mb-3 text-sm font-semibold">Amounts</h3>

                    <div className="grid gap-4 md:grid-cols-2">
                        <AppTextField
                            label="HT"
                            value={form.ht}
                            onChange={(value) => updateField('ht', value)}
                        />

                        <AppTextField
                            label="TVA"
                            value={form.tva}
                            onChange={(value) => updateField('tva', value)}
                        />

                        <AppTextField
                            label="Total TTC"
                            value={form.totalTtc}
                            onChange={(value) => updateField('totalTtc', value)}
                        />

                        <AppTextField
                            label="Paid"
                            value={form.paid}
                            onChange={(value) => updateField('paid', value)}
                        />
                    </div>
                </section>

                <section>
                    <h3 className="mb-3 text-sm font-semibold">Dates</h3>

                    <div className="grid gap-4 md:grid-cols-3">
                        <AppTextField
                            label="Issued at"
                            value={form.issuedAt}
                            onChange={(value) => updateField('issuedAt', value)}
                        />

                        <AppTextField
                            label="Due date"
                            value={form.dueDate}
                            onChange={(value) => updateField('dueDate', value)}
                        />

                        <AppTextField
                            label="Paid at"
                            value={form.paidAt}
                            onChange={(value) => updateField('paidAt', value)}
                        />
                    </div>
                </section>

                <section>
                    <AppTextarea
                        label="Notes"
                        value={form.notes}
                        onChange={(value) => updateField('notes', value)}
                    />
                </section>
            </form>
        </AppDrawer>
    );
}
```


## FILE: resources\js\features\finance\drawers\PaymentDrawer.tsx
```
import { useEffect, useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import { Dialog, Heading, Modal, ModalOverlay } from 'react-aria-components';
import { AlertTriangle, FileDown, FileSpreadsheet, FileText, Printer, ReceiptText } from 'lucide-react';
import { toast } from 'sonner';
import { AppButton } from '@/components/ui/AppButton';
import { AppDatePicker } from '@/components/ui/AppDatePicker';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppTextField } from '@/components/ui/AppTextField';
import { AppTextarea } from '@/components/ui/AppTextarea';
import type { FinanceDocument } from '@/features/finance/types';
import { formatMoney, normalizeNumber } from '@/features/finance/utils/calculations';

type PaymentDrawerProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    invoices: FinanceDocument[];
    invoice?: FinanceDocument | null;
};

type PaymentForm = {
    financeDocumentId: string;
    amount: string;
    method: string;
    reference: string;
    paidAt: string;
    notes: string;
};

type PaymentReceiptFlash = {
    paymentNumber: string;
    number: string;
    showUrl: string | null;
    generatePdfUrl: string | null;
    generateExcelUrl: string | null;
    pdfDownloadUrl: string | null;
    excelDownloadUrl: string | null;
};

type PaymentSuccessPage = {
    props?: {
        flash?: {
            receipt?: PaymentReceiptFlash | null;
        };
    };
};

const today = () => new Date().toISOString().slice(0, 10);

const paymentMethods = [
    { id: 'cash', label: 'Especes' },
    { id: 'bank_transfer', label: 'Virement bancaire' },
    { id: 'check', label: 'Cheque' },
    { id: 'card', label: 'Carte bancaire' },
    { id: 'other', label: 'Autre' },
];

function makeForm(selectedInvoice?: FinanceDocument | null): PaymentForm {
    return {
        financeDocumentId: selectedInvoice ? String(selectedInvoice.id) : '',
        amount: selectedInvoice ? String(selectedInvoice.remainingTotal) : '',
        method: 'cash',
        reference: '',
        paidAt: today(),
        notes: '',
    };
}

export function PaymentDrawer({ isOpen, onOpenChange, invoices, invoice }: PaymentDrawerProps) {
    const [form, setForm] = useState<PaymentForm>(() => makeForm(invoice));
    const [receiptPrompt, setReceiptPrompt] = useState<PaymentReceiptFlash | null>(null);
    const payableInvoices = useMemo(
        () => invoices.filter((item) => item.type === 'invoice' && item.status !== 'cancelled' && item.remainingTotal > 0),
        [invoices],
    );

    const activeInvoice = payableInvoices.find((item) => String(item.id) === form.financeDocumentId) || invoice || null;
    const amount = normalizeNumber(form.amount);
    const remainingBefore = activeInvoice?.remainingTotal || 0;
    const remainingAfter = Math.max(0, remainingBefore - amount);
    const isOverpayment = amount > remainingBefore && remainingBefore > 0;
    const isFullPayment = activeInvoice ? amount === remainingBefore && amount > 0 : false;
    const canSubmit = Boolean(form.financeDocumentId) && amount > 0 && !isOverpayment;

    useEffect(() => {
        if (isOpen) {
            setForm(makeForm(invoice));
        }
    }, [invoice, isOpen]);

    function update<K extends keyof PaymentForm>(key: K, value: PaymentForm[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    function submit() {
        if (!canSubmit) {
            toast.error(isOverpayment ? 'Le montant depasse le reste a payer.' : 'Paiement invalide.');
            return;
        }

        router.post('/finance/payments', {
            finance_document_id: form.financeDocumentId,
            amount,
            method: form.method || null,
            reference: form.reference || null,
            paid_at: form.paidAt || null,
            notes: form.notes || null,
        }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: (page) => {
                const receipt = (page as PaymentSuccessPage).props?.flash?.receipt ?? null;
                toast.success('Paiement enregistre. Le recu est cree automatiquement.');
                onOpenChange(false);

                if (receipt) {
                    setReceiptPrompt(receipt);
                }
            },
            onError: (errors) => {
                const firstError = Object.values(errors)[0];
                toast.error(typeof firstError === 'string' ? firstError : 'Impossible enregistrer le paiement.');
            },
        });
    }

    function openUrl(url: string | null | undefined, errorMessage = 'Lien recu indisponible.') {
        if (!url) {
            toast.error(errorMessage);
            return;
        }

        window.open(url, '_blank');
    }

    function generateReceiptFile(url: string | null | undefined, label: string) {
        if (!url) {
            toast.error('Action recu indisponible.');
            return;
        }

        router.put(url, {}, {
            preserveScroll: true,
            preserveState: true,
            onStart: () => toast.loading(`${label} en cours...`, { id: label }),
            onSuccess: () => toast.success(`${label} termine.`, { id: label }),
            onError: () => toast.error(`${label} impossible.`, { id: label }),
        });
    }

    return (
        <>
            <AppDrawer
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                title="Enregistrer un paiement"
                description="Ajouter un paiement sur une facture. Le reste a payer est recalcule et un recu est cree automatiquement."
                footer={
                    <>
                        <AppButton variant="ghost" onPress={() => onOpenChange(false)}>Annuler</AppButton>
                        <AppButton variant="primary" onPress={submit} isDisabled={!canSubmit}>Enregistrer + creer recu</AppButton>
                    </>
                }
            >
                <div className="space-y-5">
                    <AppSelect
                        label="Facture"
                        placeholder="Choisir une facture"
                        options={payableInvoices.map((item) => ({
                            id: String(item.id),
                            label: `${item.number} - ${formatMoney(item.remainingTotal, item.currency)} restant`,
                        }))}
                        selectedKey={form.financeDocumentId || null}
                        onSelectionChange={(key) => {
                            const id = key ? String(key) : '';
                            const selected = payableInvoices.find((item) => String(item.id) === id);
                            setForm((prev) => ({
                                ...prev,
                                financeDocumentId: id,
                                amount: selected ? String(selected.remainingTotal) : '',
                            }));
                        }}
                    />

                    {activeInvoice ? (
                        <div className="rounded-2xl border bg-[var(--surface-2)] p-4 text-sm">
                            <div className="flex items-center gap-2 font-semibold">
                                <ReceiptText size={16} />
                                {activeInvoice.number}
                            </div>
                            <div className="mt-3 grid gap-2 sm:grid-cols-3">
                                <p>Total TTC: <strong>{formatMoney(activeInvoice.totalTtc, activeInvoice.currency)}</strong></p>
                                <p>Paye: <strong>{formatMoney(activeInvoice.paidTotal, activeInvoice.currency)}</strong></p>
                                <p>Restant: <strong>{formatMoney(activeInvoice.remainingTotal, activeInvoice.currency)}</strong></p>
                            </div>
                        </div>
                    ) : null}

                    <div className="grid gap-3 sm:grid-cols-2">
                        <AppTextField
                            label="Montant paye"
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.amount}
                            onChange={(value) => update('amount', value)}
                            error={isOverpayment ? 'Le montant depasse le reste a payer.' : undefined}
                        />

                        <AppDatePicker
                            label="Date paiement"
                            value={form.paidAt}
                            onChange={(value) => update('paidAt', value)}
                        />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <AppSelect
                            label="Mode de paiement"
                            options={paymentMethods}
                            selectedKey={form.method}
                            onSelectionChange={(key) => update('method', key ? String(key) : '')}
                        />

                        <AppTextField
                            label="Reference"
                            value={form.reference}
                            onChange={(value) => update('reference', value)}
                        />
                    </div>

                    {activeInvoice ? (
                        <div className={`rounded-2xl border p-4 text-sm ${isOverpayment ? 'border-red-300 bg-red-50 text-red-800' : 'bg-[var(--surface-2)]'}`}>
                            <div className="flex items-center gap-2 font-semibold">
                                {isOverpayment ? <AlertTriangle size={16} /> : null}
                                Resultat apres paiement
                            </div>
                            <div className="mt-3 grid gap-2 sm:grid-cols-3">
                                <p>Paiement: <strong>{formatMoney(amount, activeInvoice.currency)}</strong></p>
                                <p>Reste apres: <strong>{formatMoney(remainingAfter, activeInvoice.currency)}</strong></p>
                                <p>Statut: <strong>{isFullPayment ? 'Paiement complet' : 'Paiement partiel'}</strong></p>
                            </div>
                        </div>
                    ) : null}

                    <AppTextarea
                        label="Notes"
                        value={form.notes}
                        onChange={(value) => update('notes', value)}
                    />
                </div>
            </AppDrawer>

            <ModalOverlay
                isOpen={Boolean(receiptPrompt)}
                onOpenChange={(open) => {
                    if (!open) setReceiptPrompt(null);
                }}
                className="app-modal-overlay app-dialog-overlay"
                isDismissable
            >
                <Modal className="app-dialog-panel max-w-xl">
                    <Dialog className="outline-none">
                        {({ close }) => (
                            <div className="p-5">
                                <div className="flex gap-4">
                                    <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                                        <ReceiptText size={20} />
                                    </div>
                                    <div className="min-w-0">
                                        <Heading slot="title" className="text-base font-semibold">
                                            Recu cree: {receiptPrompt?.number}
                                        </Heading>
                                        <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">
                                            Paiement {receiptPrompt?.paymentNumber} enregistre. Voulez-vous ouvrir, imprimer ou sauvegarder le recu maintenant ?
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                                    <AppButton variant="primary" onPress={() => openUrl(receiptPrompt?.showUrl)}>
                                        <Printer size={16} />
                                        Ouvrir / imprimer
                                    </AppButton>
                                    <AppButton variant="secondary" onPress={() => generateReceiptFile(receiptPrompt?.generatePdfUrl, 'Generation PDF recu')}>
                                        <FileText size={16} />
                                        Generer PDF
                                    </AppButton>
                                    <AppButton variant="secondary" onPress={() => openUrl(receiptPrompt?.pdfDownloadUrl, 'PDF recu non genere.')}>
                                        <FileDown size={16} />
                                        Telecharger PDF
                                    </AppButton>
                                    <AppButton variant="secondary" onPress={() => receiptPrompt?.excelDownloadUrl ? openUrl(receiptPrompt.excelDownloadUrl) : generateReceiptFile(receiptPrompt?.generateExcelUrl, 'Generation Excel recu')}>
                                        <FileSpreadsheet size={16} />
                                        Excel
                                    </AppButton>
                                </div>

                                <div className="mt-5 flex justify-end">
                                    <AppButton variant="ghost" onPress={close}>Plus tard</AppButton>
                                </div>
                            </div>
                        )}
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </>
    );
}

```


## FILE: resources\js\features\finance\templates\TemplateCodeEditor.tsx
```
import { autocompletion, CompletionContext } from '@codemirror/autocomplete';
import { defaultKeymap, indentWithTab } from '@codemirror/commands';
import { css } from '@codemirror/lang-css';
import { html } from '@codemirror/lang-html';
import { EditorView, keymap } from '@codemirror/view';
import CodeMirror from '@uiw/react-codemirror';
import { Braces, Code2 } from 'lucide-react';
import { useMemo } from 'react';
import { oneDark } from '@codemirror/theme-one-dark';
import type { TemplatePlaceholder } from '@/features/finance/types';

type TemplateCodeEditorProps = {
    label: string;
    language: 'html' | 'css';
    value: string;
    onChange: (value: string) => void;
    onSave: () => void;
    placeholders: TemplatePlaceholder[];
    minRows?: number;
};

const htmlSnippets = [
    { label: 'Section', value: '<section class="block">\n  <h2>Titre</h2>\n  <p>Contenu</p>\n</section>' },
    { label: 'Client', value: '<div class="info-card">\n  <p class="eyebrow">Client</p>\n  <h3>{{client.name}}</h3>\n  <p>{{client.address}}</p>\n</div>' },
    { label: 'Items', value: '{{items_table}}' },
    { label: 'Totals', value: '<table class="totals-table">\n  <tr><td>Total HT</td><td>{{totals.subtotal_ht}}</td></tr>\n  <tr class="grand-total"><td>Total TTC</td><td>{{totals.total_ttc}}</td></tr>\n</table>' },
];

const cssSnippets = [
    { label: 'A4', value: 'body{font-family:DejaVu Sans,Arial,sans-serif;font-size:12px;color:#172033}.document-shell{padding:28px}' },
    { label: 'Table', value: '.items-table{width:100%;border-collapse:collapse}.items-table th{background:#1a365d;color:#fff}.items-table td,.items-table th{border:1px solid #d7dde8;padding:8px}' },
    { label: 'Right', value: '.text-right{text-align:right}' },
    { label: 'Footer', value: '.legal-footer{margin-top:24px;padding-top:10px;border-top:1px solid #d7dde8;text-align:center;color:#64748b}' },
];

function placeholderCompletion(placeholders: string[]) {
    return (context: CompletionContext) => {
        const word = context.matchBefore(/\{\{?[\w.]*$/);

        if (!word && !context.explicit) {
            return null;
        }

        return {
            from: word?.from ?? context.pos,
            options: placeholders.map((placeholder) => ({
                label: placeholder,
                type: 'variable',
                apply: placeholder,
                detail: 'ARCHI LBO',
            })),
        };
    };
}

export function TemplateCodeEditor({ label, language, value, onChange, onSave, placeholders, minRows = 14 }: TemplateCodeEditorProps) {
    const snippets = language === 'html' ? htmlSnippets : cssSnippets;
    const allPlaceholders = useMemo(() => placeholders.flatMap((group) => group.items), [placeholders]);
    const commonPlaceholders = allPlaceholders.slice(0, 8);
    const minHeight = `${Math.max(280, minRows * 18)}px`;
    const extensions = useMemo(() => [
        language === 'html' ? html() : css(),
        EditorView.lineWrapping,
        autocompletion({ override: [placeholderCompletion(allPlaceholders)] }),
        keymap.of([
            { key: 'Mod-s', run: () => { onSave(); return true; } },
            indentWithTab,
            ...defaultKeymap,
        ]),
        EditorView.theme({
            '&': { minHeight, fontSize: '12px' },
            '.cm-content': { minHeight, paddingTop: '8px', paddingBottom: '8px', fontFamily: 'var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)' },
            '.cm-gutters': { minHeight },
            '.cm-line': { paddingLeft: '8px', paddingRight: '8px' },
            '.cm-scroller': { minHeight, maxHeight: '520px' },
            '.cm-tooltip': { zIndex: 80 },
        }),
    ], [allPlaceholders, language, minHeight, onSave]);

    function insertText(text: string) {
        onChange(value ? `${value}\n${text}` : text);
    }

    return (
        <div className="overflow-hidden rounded-xl border bg-[#0b1020] text-slate-100 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-[#101827] px-2.5 py-1.5">
                <div className="flex min-w-0 items-center gap-2">
                    <Code2 size={14} className="shrink-0 text-sky-300" />
                    <span className="truncate text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-300">{label}</span>
                    <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[9px] uppercase text-slate-400">CodeMirror / {language}</span>
                </div>
                <p className="text-[10px] text-slate-500">Tab / Ctrl+S / autocomplete</p>
            </div>

            <div className="flex flex-wrap items-center gap-1 border-b border-white/10 bg-[#0f172a] px-2.5 py-1.5">
                <span className="mr-1 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500"><Braces size={12} /> Insert</span>
                {snippets.map((snippet) => (
                    <button key={snippet.label} type="button" onClick={() => insertText(snippet.value)} className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-200 hover:bg-white/10">
                        {snippet.label}
                    </button>
                ))}
                <span className="mx-1 h-4 w-px bg-white/10" />
                {commonPlaceholders.map((placeholder) => (
                    <button key={placeholder} type="button" onClick={() => insertText(placeholder)} className="rounded-md bg-sky-500/10 px-1.5 py-0.5 font-mono text-[10px] text-sky-200 hover:bg-sky-500/20">
                        {placeholder}
                    </button>
                ))}
            </div>

            <CodeMirror
                value={value}
                height={minHeight}
                theme={oneDark}
                basicSetup={{ lineNumbers: true, foldGutter: true, highlightActiveLine: true, autocompletion: true, bracketMatching: true }}
                extensions={extensions}
                onChange={onChange}
            />
        </div>
    );
}

```


## FILE: resources\js\features\finance\templates\TemplateEditorForm.tsx
```
import {
    AlertTriangle,
    CheckCircle2,
    Code2,
    Copy,
    FileCode2,
    FileText,
    Layout,
    Palette,
    RotateCcw,
    Save,
    Search,
    Sparkles,
} from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import type { DocumentTemplate, TemplatePlaceholder } from '@/features/finance/types';

type TemplateEditorFormProps = {
    value: DocumentTemplate;
    placeholders: TemplatePlaceholder[];
    onChange: (value: DocumentTemplate) => void;
    onSave: () => void;
    onReset: () => void;
};

type EditorTab = 'body' | 'header' | 'footer' | 'css';

type Warning = {
    type: 'error' | 'warning' | 'info';
    message: string;
};

const tabConfig: Array<{
    id: EditorTab;
    label: string;
    icon: typeof FileText;
    language: string;
    help: string;
}> = [
    {
        id: 'body',
        label: 'Body',
        icon: FileText,
        language: 'HTML',
        help: 'Main document content. For Devis/Facture, keep {{items_table}}.',
    },
    {
        id: 'header',
        label: 'Header',
        icon: Layout,
        language: 'HTML',
        help: 'Top section of the A4 document. Recommended logo placeholder: {{company.logo_html}}.',
    },
    {
        id: 'footer',
        label: 'Footer',
        icon: FileCode2,
        language: 'HTML',
        help: 'Legal footer, company identifiers, contact and final closing tags.',
    },
    {
        id: 'css',
        label: 'CSS',
        icon: Palette,
        language: 'CSS',
        help: 'Visual design for PDF and preview. Keep DomPDF-compatible CSS.',
    },
];

function getCode(value: DocumentTemplate, tab: EditorTab): string {
    if (tab === 'header') {
        return value.headerHtml || '';
    }

    if (tab === 'footer') {
        return value.footerHtml || '';
    }

    if (tab === 'css') {
        return value.css || '';
    }

    return value.bodyHtml || '';
}

function setCode(value: DocumentTemplate, tab: EditorTab, code: string): DocumentTemplate {
    if (tab === 'header') {
        return { ...value, headerHtml: code };
    }

    if (tab === 'footer') {
        return { ...value, footerHtml: code };
    }

    if (tab === 'css') {
        return { ...value, css: code };
    }

    return { ...value, bodyHtml: code };
}

function allTemplateCode(value: DocumentTemplate): string {
    return [
        value.headerHtml || '',
        value.bodyHtml || '',
        value.footerHtml || '',
        value.css || '',
    ].join('\n');
}

function flattenPlaceholders(groups: TemplatePlaceholder[]): string[] {
    return groups.flatMap((group) => group.items || []);
}

function extractPlaceholders(code: string): string[] {
    const matches = code.match(/{{\s*[a-zA-Z0-9_.]+\s*}}/g) || [];

    return Array.from(new Set(matches.map((item) => item.replace(/\s+/g, ''))));
}

function validateTemplate(value: DocumentTemplate, placeholders: TemplatePlaceholder[]): Warning[] {
    const warnings: Warning[] = [];
    const code = allTemplateCode(value);
    const supported = new Set(flattenPlaceholders(placeholders).map((item) => item.replace(/\s+/g, '')));
    const used = extractPlaceholders(code);

    if (/<script\b/i.test(code)) {
        warnings.push({
            type: 'error',
            message: 'Script tags are not allowed and will be removed by backend validation.',
        });
    }

    if (/\son[a-z]+\s*=/i.test(code)) {
        warnings.push({
            type: 'error',
            message: 'Inline event handlers like onclick/onload are unsafe and should be removed.',
        });
    }

    const unsupported = used.filter((item) => !supported.has(item));

    if (unsupported.length > 0) {
        warnings.push({
            type: 'warning',
            message: `Unsupported placeholders: ${unsupported.slice(0, 8).join(', ')}${unsupported.length > 8 ? '...' : ''}`,
        });
    }

    if ((value.type === 'quote' || value.type === 'invoice') && !code.includes('{{items_table}}')) {
        warnings.push({
            type: 'warning',
            message: 'This template type should include {{items_table}}.',
        });
    }

    if (value.type === 'receipt' && !code.includes('{{payments_table}}')) {
        warnings.push({
            type: 'info',
            message: 'Receipt templates usually include {{payments_table}}.',
        });
    }

    if (!code.includes('{{company.logo_html}}')) {
        warnings.push({
            type: 'info',
            message: 'Add {{company.logo_html}} in the header to use the uploaded logo.',
        });
    }

    if (!value.bodyHtml?.trim()) {
        warnings.push({
            type: 'warning',
            message: 'Body HTML is empty.',
        });
    }

    if (!value.css?.trim()) {
        warnings.push({
            type: 'info',
            message: 'CSS is empty. The document may look unstyled.',
        });
    }

    return warnings;
}

function Field({
    label,
    value,
    onChange,
    placeholder,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}) {
    return (
        <label className="min-w-0">
            <span className="mb-1.5 block text-xs font-semibold text-[var(--text)]">{label}</span>

            <input
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                className="h-10 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] outline-none transition hover:border-[var(--accent)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent)_20%,transparent)]"
            />
        </label>
    );
}

function SelectField({
    label,
    value,
    onChange,
    options,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: Array<{ value: string; label: string }>;
}) {
    return (
        <label className="min-w-0">
            <span className="mb-1.5 block text-xs font-semibold text-[var(--text)]">{label}</span>

            <select
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="h-10 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] outline-none transition hover:border-[var(--accent)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent)_20%,transparent)]"
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </label>
    );
}

function WarningBox({ warnings }: { warnings: Warning[] }) {
    if (!warnings.length) {
        return (
            <div className="flex items-start gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-500">
                <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
                <div>
                    <p className="font-semibold">Template looks healthy.</p>
                    <p className="mt-1 opacity-80">No major structure issues detected.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {warnings.map((warning, index) => {
                const tone =
                    warning.type === 'error'
                        ? 'border-red-500/20 bg-red-500/10 text-red-500'
                        : warning.type === 'warning'
                          ? 'border-amber-500/20 bg-amber-500/10 text-amber-500'
                          : 'border-sky-500/20 bg-sky-500/10 text-sky-500';

                return (
                    <div key={`${warning.message}-${index}`} className={`flex items-start gap-2 rounded-2xl border p-3 text-xs ${tone}`}>
                        <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                        <p>{warning.message}</p>
                    </div>
                );
            })}
        </div>
    );
}

export function TemplateEditorForm({
    value,
    placeholders,
    onChange,
    onSave,
    onReset,
}: TemplateEditorFormProps) {
    const [activeTab, setActiveTab] = useState<EditorTab>('body');
    const [placeholderSearch, setPlaceholderSearch] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const activeConfig = tabConfig.find((item) => item.id === activeTab) || tabConfig[0];
    const code = getCode(value, activeTab);
    const warnings = useMemo(() => validateTemplate(value, placeholders), [value, placeholders]);

    const flatPlaceholders = useMemo(() => {
        const query = placeholderSearch.trim().toLowerCase();

        return flattenPlaceholders(placeholders)
            .filter((item) => !query || item.toLowerCase().includes(query))
            .slice(0, 20);
    }, [placeholders, placeholderSearch]);

    const usedCount = useMemo(() => extractPlaceholders(allTemplateCode(value)).length, [value]);

    function update<K extends keyof DocumentTemplate>(key: K, nextValue: DocumentTemplate[K]) {
        onChange({
            ...value,
            [key]: nextValue,
        });
    }

    function updateCode(nextCode: string) {
        onChange(setCode(value, activeTab, nextCode));
    }

    function insertPlaceholder(placeholder: string) {
        const textarea = textareaRef.current;

        if (!textarea) {
            updateCode(`${code}${placeholder}`);
            return;
        }

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const nextCode = `${code.slice(0, start)}${placeholder}${code.slice(end)}`;

        updateCode(nextCode);

        requestAnimationFrame(() => {
            textarea.focus();
            textarea.setSelectionRange(start + placeholder.length, start + placeholder.length);
        });
    }

    async function copyCurrentCode() {
        await navigator.clipboard.writeText(code);
        toast.success(`${activeConfig.label} code copied.`);
    }

    function beautifyCode() {
        const next = code
            .replace(/>\s+</g, '>\n<')
            .replace(/\n{3,}/g, '\n\n')
            .trim();

        updateCode(next);
        toast.success('Code cleaned lightly.');
    }

    return (
        <section className="overflow-hidden rounded-2xl border bg-[var(--surface)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b px-3 py-2">
                <div className="flex min-w-0 items-center gap-2">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent)]">
                        <Code2 size={17} />
                    </div>

                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="truncate text-sm font-semibold">{value.name || 'Template editor'}</h2>

                            {value.isDefault ? (
                                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-500">
                                    Default
                                </span>
                            ) : null}
                        </div>

                        <p className="mt-0.5 truncate text-[11px] text-[var(--text-muted)]">
                            {value.slug || 'template'} / {value.typeLabel || value.type}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                    <button
                        type="button"
                        onClick={onReset}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border bg-[var(--surface)] px-3 text-xs font-semibold text-[var(--text-muted)] transition hover:border-amber-500 hover:text-amber-500"
                    >
                        <RotateCcw size={14} />
                        Reset
                    </button>

                    <button
                        type="button"
                        onClick={onSave}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-3 text-xs font-semibold text-white transition hover:opacity-90"
                    >
                        <Save size={14} />
                        Save
                    </button>
                </div>
            </div>

            <div className="grid gap-3 p-3 xl:grid-cols-[minmax(0,1fr)_280px]">
                <div className="min-w-0 space-y-3">
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
                        <div className="xl:col-span-2">
                            <Field
                                label="Name"
                                value={value.name || ''}
                                onChange={(next) => update('name', next)}
                            />
                        </div>

                        <div className="xl:col-span-2">
                            <Field
                                label="Slug"
                                value={value.slug || ''}
                                onChange={(next) => update('slug', next)}
                            />
                        </div>

                        <SelectField
                            label="Format"
                            value={value.paperSize || 'A4'}
                            onChange={(next) => update('paperSize', next)}
                            options={[
                                { value: 'A4', label: 'A4' },
                                { value: 'A5', label: 'A5' },
                                { value: 'Letter', label: 'Letter' },
                            ]}
                        />

                        <SelectField
                            label="Orientation"
                            value={value.orientation || 'portrait'}
                            onChange={(next) => update('orientation', next)}
                            options={[
                                { value: 'portrait', label: 'Portrait' },
                                { value: 'landscape', label: 'Landscape' },
                            ]}
                        />

                        <div className="md:col-span-2 xl:col-span-3">
                            <Field
                                label="Logo path"
                                value={value.logoPath || ''}
                                onChange={(next) => update('logoPath', next)}
                                placeholder="Optional template-specific logo path"
                            />
                        </div>

                        <div className="md:col-span-2 xl:col-span-3">
                            <Field
                                label="Accent"
                                value={String((value.settings as Record<string, unknown> | undefined)?.accent_color || '')}
                                onChange={(next) =>
                                    update('settings', {
                                        ...((value.settings as Record<string, unknown> | undefined) || {}),
                                        accent_color: next,
                                    })
                                }
                                placeholder="#d8aa26"
                            />
                        </div>
                    </div>

                    <div className="rounded-2xl border bg-[var(--surface-2)] p-1">
                        <div className="grid grid-cols-4 gap-1">
                            {tabConfig.map((tab) => {
                                const Icon = tab.icon;
                                const active = activeTab === tab.id;

                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setActiveTab(tab.id)}
                                        className={[
                                            'inline-flex h-9 items-center justify-center gap-2 rounded-xl text-xs font-semibold transition',
                                            active
                                                ? 'bg-[var(--accent)] text-white'
                                                : 'text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]',
                                        ].join(' ')}
                                    >
                                        <Icon size={14} />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-2xl border">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-[var(--surface-2)] px-3 py-2">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                                    {activeConfig.label} / {activeConfig.language}
                                </p>
                                <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">{activeConfig.help}</p>
                            </div>

                            <div className="flex items-center gap-1.5">
                                <button
                                    type="button"
                                    onClick={beautifyCode}
                                    className="inline-flex h-8 items-center justify-center gap-1.5 rounded-xl border bg-[var(--surface)] px-2.5 text-xs font-semibold text-[var(--text-muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                                >
                                    <Sparkles size={13} />
                                    Clean
                                </button>

                                <button
                                    type="button"
                                    onClick={() => void copyCurrentCode()}
                                    className="inline-flex h-8 items-center justify-center gap-1.5 rounded-xl border bg-[var(--surface)] px-2.5 text-xs font-semibold text-[var(--text-muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                                >
                                    <Copy size={13} />
                                    Copy
                                </button>
                            </div>
                        </div>

                        <textarea
                            ref={textareaRef}
                            value={code}
                            onChange={(event) => updateCode(event.target.value)}
                            spellCheck={false}
                            className="min-h-[520px] w-full resize-y bg-[#111827] px-4 py-3 font-mono text-[12px] leading-6 text-slate-100 outline-none selection:bg-[var(--accent)]/30"
                        />
                    </div>
                </div>

                <aside className="space-y-3">
                    <div className="rounded-2xl border bg-[var(--surface-2)] p-3">
                        <div className="mb-3 flex items-center justify-between gap-2">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                                    Template status
                                </p>
                                <p className="mt-1 text-xs text-[var(--text-muted)]">{usedCount} placeholders used</p>
                            </div>

                            <span className="rounded-full bg-[var(--surface)] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                                {warnings.filter((item) => item.type === 'error').length} errors
                            </span>
                        </div>

                        <WarningBox warnings={warnings} />
                    </div>

                    <div className="rounded-2xl border bg-[var(--surface-2)] p-3">
                        <div className="mb-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                                Insert placeholder
                            </p>

                            <label className="mt-2 flex h-10 items-center gap-2 rounded-2xl border bg-[var(--surface)] px-3">
                                <Search size={14} className="text-[var(--text-muted)]" />
                                <input
                                    value={placeholderSearch}
                                    onChange={(event) => setPlaceholderSearch(event.target.value)}
                                    placeholder="Search company, total..."
                                    className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--text-muted)]"
                                />
                            </label>
                        </div>

                        <div className="max-h-[360px] space-y-1 overflow-auto">
                            {flatPlaceholders.map((placeholder) => (
                                <button
                                    key={placeholder}
                                    type="button"
                                    onClick={() => insertPlaceholder(placeholder)}
                                    className="block w-full truncate rounded-xl bg-[var(--surface)] px-3 py-2 text-left font-mono text-[11px] text-[var(--text-muted)] transition hover:bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] hover:text-[var(--accent)]"
                                    title={placeholder}
                                >
                                    {placeholder}
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>
        </section>
    );
}

export default TemplateEditorForm;
```


## FILE: resources\js\features\finance\templates\TemplateList.tsx
```
import { Copy, Star, Trash2 } from 'lucide-react';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import type { DocumentTemplate } from '@/features/finance/types';

type Props = {
    templates: DocumentTemplate[];
    selectedId?: number;
    onSelect: (template: DocumentTemplate) => void;
    onDuplicate: (template: DocumentTemplate) => void;
    onSetDefault: (template: DocumentTemplate) => void;
    onDelete: (template: DocumentTemplate) => void;
};

export function TemplateList({ templates, selectedId, onSelect, onDuplicate, onSetDefault, onDelete }: Props) {
    return (
        <AppCard className="sticky top-3 max-h-[calc(100vh-104px)] overflow-auto p-2">
            <div className="mb-1.5 flex items-center justify-between gap-2">
                <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">Templates</h2>
                <span className="rounded-md bg-[var(--surface-2)] px-1.5 py-0.5 text-[10px] text-[var(--text-muted)]">{templates.length}</span>
            </div>
            <div className="space-y-1">
                {templates.map((template) => (
                    <div key={template.id} className={`rounded-lg border p-1.5 transition ${selectedId === template.id ? 'border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_8%,transparent)]' : 'bg-[var(--surface)] hover:bg-[var(--surface-2)]'}`}>
                        <button type="button" onClick={() => onSelect(template)} className="w-full text-left">
                            <div className="flex items-center justify-between gap-1.5">
                                <p className="truncate text-xs font-semibold leading-5">{template.name}</p>
                                {template.isDefault ? <AppBadge tone="green" className="text-[9px]">Defaut</AppBadge> : null}
                            </div>
                            <p className="truncate font-mono text-[10px] text-[var(--text-muted)]">{template.slug}</p>
                        </button>
                        <div className="mt-1 flex gap-1">
                            <AppButton size="sm" variant="ghost" onPress={() => onDuplicate(template)}><Copy size={12} /></AppButton>
                            <AppButton size="sm" variant="ghost" onPress={() => onSetDefault(template)} isDisabled={template.isDefault}><Star size={12} /></AppButton>
                            <AppButton size="sm" variant="ghost" onPress={() => onDelete(template)}><Trash2 size={12} /></AppButton>
                        </div>
                    </div>
                ))}
                {templates.length === 0 ? <p className="p-2 text-sm text-[var(--text-muted)]">Aucun template.</p> : null}
            </div>
        </AppCard>
    );
}

```


## FILE: resources\js\features\finance\templates\TemplatePlaceholderPanel.tsx
```
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AppCard } from '@/components/ui/AppCard';
import { AppTextField } from '@/components/ui/AppTextField';
import type { TemplatePlaceholder } from '@/features/finance/types';

export function TemplatePlaceholderPanel({ placeholders }: { placeholders: TemplatePlaceholder[] }) {
    const [search, setSearch] = useState('');
    const filtered = useMemo(() => placeholders.map((group) => ({ ...group, items: group.items.filter((item) => item.toLowerCase().includes(search.toLowerCase())) })).filter((group) => group.items.length), [placeholders, search]);
    const total = placeholders.reduce((sum, group) => sum + group.items.length, 0);

    async function copy(value: string) {
        await navigator.clipboard?.writeText(value);
        toast.success('Copied');
    }

    return (
        <AppCard className="p-2">
            <div className="mb-1.5 flex items-center justify-between gap-2">
                <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">Placeholders</h2>
                <span className="rounded-md bg-[var(--surface-2)] px-1.5 py-0.5 text-[10px] text-[var(--text-muted)]">{total}</span>
            </div>
            <AppTextField label="Search" value={search} onChange={setSearch} icon={<Search size={14} />} placeholder="company, total..." />
            <div className="mt-2 max-h-44 space-y-2 overflow-auto pr-1">
                {filtered.map((group) => (
                    <div key={group.group}>
                        <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">{group.group}</p>
                        <div className="flex flex-wrap gap-1">
                            {group.items.map((item) => <button key={item} type="button" onClick={() => copy(item)} className="rounded-md border bg-[var(--surface-2)] px-1.5 py-0.5 font-mono text-[10px] hover:border-[var(--accent)] hover:text-[var(--accent)]">{item}</button>)}
                        </div>
                    </div>
                ))}
            </div>
        </AppCard>
    );
}

```


## FILE: resources\js\features\finance\templates\TemplatePreviewPanel.tsx
```
import { Monitor, RefreshCw } from 'lucide-react';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';

export function TemplatePreviewPanel({ html, onRefresh }: { html: string; onRefresh: () => void }) {
    return (
        <AppCard className="p-2">
            <div className="mb-1.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                    <Monitor size={14} className="text-[var(--accent)]" />
                    <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">Preview</h2>
                </div>
                <AppButton size="sm" variant="secondary" onPress={onRefresh}><RefreshCw size={13} /> Exact</AppButton>
            </div>
            <div className="overflow-auto rounded-xl border bg-neutral-200 p-1.5 dark:bg-neutral-900">
                <iframe title="Template preview" srcDoc={html} sandbox="" className="h-[480px] w-full rounded-lg bg-white shadow-sm" />
            </div>
        </AppCard>
    );
}

```


## FILE: resources\js\features\finance\templates\TemplateToolbar.tsx
```
import { Plus, RotateCcw } from 'lucide-react';
import { AppButton } from '@/components/ui/AppButton';
import { AppCompactTabs } from '@/components/ui/AppCompactTabs';
import type { FinanceDocumentType } from '@/features/finance/types';

const tabs = [
    { id: 'quote', label: 'Devis' },
    { id: 'invoice', label: 'Facture' },
    { id: 'receipt', label: 'Recu' },
];

export function TemplateToolbar({ selectedType, onTypeChange, onCreate, onResetDefault, children }: { selectedType: FinanceDocumentType; onTypeChange: (type: FinanceDocumentType) => void; onCreate: () => void; onResetDefault: () => void; children: React.ReactNode }) {
    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-2">
                    <AppButton variant="primary" onPress={onCreate}><Plus size={16} /> Nouveau template</AppButton>
                    <AppButton variant="secondary" onPress={onResetDefault}><RotateCcw size={16} /> Reset defaut</AppButton>
                </div>
            </div>
            <AppCompactTabs tabs={tabs} selectedKey={selectedType} onSelectionChange={(key) => onTypeChange(String(key) as FinanceDocumentType)}>
                {children}
            </AppCompactTabs>
        </div>
    );
}

```


## FILE: resources\js\features\finance\templates\templateValidation.ts
```
import type { FinanceDocumentType, TemplatePlaceholder } from '@/features/finance/types';

export type TemplateValidationResult = {
    warnings: string[];
    errors: string[];
    unsupported: string[];
};

export function validateTemplateContent(type: FinanceDocumentType, bodyHtml: string, allPlaceholders: TemplatePlaceholder[]): TemplateValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const supported = new Set(allPlaceholders.flatMap((group) => group.items));
    const unsupported = Array.from(new Set(Array.from(bodyHtml.matchAll(/{{\s*[^}]+\s*}}/g)).map((match) => match[0]))).filter((placeholder) => !supported.has(placeholder));

    if (!bodyHtml.trim()) {
        warnings.push('Le corps du template est vide.');
    }

    if (/<\s*script\b/i.test(bodyHtml) || /\son[a-z]+\s*=/i.test(bodyHtml)) {
        errors.push('Les scripts et attributs JavaScript ne sont pas autorises.');
    }

    if ((type === 'quote' || type === 'invoice') && !bodyHtml.includes('{{items_table}}') && !bodyHtml.includes('{{items_rows}}')) {
        warnings.push('Le template ne contient pas {{items_table}}.');
    }

    if (unsupported.length > 0) {
        warnings.push('Certains placeholders ne sont pas reconnus.');
    }

    return { errors, warnings, unsupported };
}

```


## FILE: resources\js\features\finance\utils\calculations.ts
```
import type { FinanceDocumentItem } from '@/features/finance/types';

export function normalizeNumber(value: unknown): number {
    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : 0;
    }

    if (typeof value === 'string') {
        const normalized = value.replace(',', '.').trim();
        const parsed = Number.parseFloat(normalized);
        return Number.isFinite(parsed) ? parsed : 0;
    }

    return 0;
}

export function calculateItem(
    item: Partial<FinanceDocumentItem>,
    defaultTvaRate: number,
): FinanceDocumentItem {
    const quantity = normalizeNumber(item.quantity || 1) || 1;
    const unitPrice = normalizeNumber(item.unitPrice);
    const discountRate = normalizeNumber(item.discountRate);
    const tvaRate = item.tvaRate === undefined || item.tvaRate === null
        ? defaultTvaRate
        : normalizeNumber(item.tvaRate);

    const grossHt = quantity * unitPrice;
    const discountAmount = (grossHt * discountRate) / 100;
    const totalHt = Math.max(0, grossHt - discountAmount);
    const totalTva = (totalHt * tvaRate) / 100;
    const totalTtc = totalHt + totalTva;

    return {
        id: item.id,
        position: item.position || 1,
        title: item.title || '',
        description: item.description || '',
        quantity,
        unit: item.unit || '',
        unitPrice,
        discountRate,
        tvaRate,
        totalHt,
        totalTva,
        totalTtc,
    };
}

export function calculateTotals(
    items: Partial<FinanceDocumentItem>[],
    discountTotal = 0,
    defaultTvaRate = 20,
) {
    const calculatedItems = items.map((item, index) => calculateItem({ ...item, position: index + 1 }, defaultTvaRate));
    const subtotalHt = calculatedItems.reduce((sum, item) => sum + item.totalHt, 0);
    const taxTotal = calculatedItems.reduce((sum, item) => sum + item.totalTva, 0);
    const safeDiscount = Math.max(0, normalizeNumber(discountTotal));
    const totalTtc = Math.max(0, subtotalHt - safeDiscount + taxTotal);

    return {
        subtotalHt,
        discountTotal: safeDiscount,
        taxTotal,
        totalTtc,
        items: calculatedItems,
    };
}

export function createEmptyItem(defaultTvaRate: number): FinanceDocumentItem {
    return calculateItem(
        {
            position: 1,
            title: '',
            description: '',
            quantity: 1,
            unit: 'm2',
            unitPrice: 0,
            discountRate: 0,
            tvaRate: defaultTvaRate,
        },
        defaultTvaRate,
    );
}

export function normalizeCurrency(currency: unknown): string {
    if (typeof currency !== 'string') {
        return 'MAD';
    }

    const normalized = currency.trim().toUpperCase();

    return /^[A-Z]{3}$/.test(normalized) ? normalized : 'MAD';
}

export function formatMoney(value: unknown, currency = 'MAD'): string {
    const safeCurrency = normalizeCurrency(currency);

    try {
        return new Intl.NumberFormat('fr-MA', {
            style: 'currency',
            currency: safeCurrency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(normalizeNumber(value));
    } catch {
        return `${normalizeNumber(value).toLocaleString('fr-MA', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })} MAD`;
    }
}


```


## FILE: resources\js\features\finance\types.ts
```

export type FinanceDocumentLockState = {
    isLocked: boolean;
    lockedAt: string | null;
    lockedAtFormatted: string | null;
    message: string;
    blockedFields: string[];
    canEditNumberFields: boolean;
    canRegenerateExports: boolean;
    canGeneratePdf: boolean;
    canGenerateExcel: boolean;
};
export type FinanceDocumentType = 'quote' | 'invoice' | 'receipt';

export type FinanceDocumentStatus =
    | 'draft'
    | 'sent'
    | 'accepted'
    | 'rejected'
    | 'converted'
    | 'issued'
    | 'partially_paid'
    | 'paid'
    | 'overdue'
    | 'cancelled';

export type FinanceDocumentLock = {
    isLocked: boolean;
    lockedAt: string | null;
    lockedAtFormatted: string | null;
    message: string;
    blockedFields: string[];
    canEditNumberFields: boolean;
    canRegenerateExports: boolean;
    canGeneratePdf: boolean;
    canGenerateExcel: boolean;
};

export type FinanceDocumentItem = {
    id?: number;
    position: number;
    title: string;
    description: string | null;
    quantity: number;
    unit: string | null;
    unitPrice: number;
    discountRate: number;
    tvaRate: number;
    totalHt: number;
    totalTva: number;
    totalTtc: number;
};

export type FinanceDocument = {
    id: number;
    type: FinanceDocumentType;
    typeLabel: string;
    number: string;
    numberLocked?: boolean;
    numberLockedAt?: string | null;
    lock?: FinanceDocumentLock | null;
    status: FinanceDocumentStatus;
    client: { id: number | string; name: string; cin?: string | null; address?: string | null } | null;
    dossier: {
        id: number | string;
        number: string;
        projectObject?: string | null;
        address?: string | null;
        floorArea?: number | string | null;
        landSurface?: number | string | null;
    } | null;
    sourceDocumentId: number | null;
    issueDate: string | null;
    dueDate: string | null;
    validUntil: string | null;
    currency: string;
    tvaRate: number;
    subtotalHt: number;
    discountTotal: number;
    taxTotal: number;
    totalTtc: number;
    paidTotal: number;
    remainingTotal: number;
    notes: string | null;
    terms: string | null;
    templateId: number | string | null;
    pdfPath: string | null;
    excelPath: string | null;
    generatedAt: string | null;
    items: FinanceDocumentItem[];
    payments?: Payment[];
    paymentsCount: number;
    createdAt?: string | null;
    updatedAt?: string | null;
    showUrl?: string | null;
    updateUrl?: string | null;
    deleteUrl?: string | null;
    acceptUrl?: string | null;
    rejectUrl?: string | null;
    cancelUrl?: string | null;
    convertToInvoiceUrl?: string | null;
    hasPdf?: boolean;
    hasExcel?: boolean;
    generateUrl?: string | null;
    generatePdfUrl?: string | null;
    generateExcelUrl?: string | null;
    downloadUrl?: string | null;
    excelDownloadUrl?: string | null;
    pdfDownloadUrl?: string | null;
    revealFilesUrl?: string | null;
    paymentUrl?: string | null;
};

export type DocumentTemplate = {
    id: number;
    type: FinanceDocumentType;
    typeLabel: string;
    name: string;
    slug: string;
    isDefault: boolean;
    paperSize: 'A4' | 'A5' | 'Letter' | string;
    orientation: 'portrait' | 'landscape' | string;
    headerHtml: string;
    bodyHtml: string;
    footerHtml: string;
    css: string;
    settings: Record<string, unknown>;
    logoPath: string;
    createdAt?: string | null;
    updatedAt?: string | null;
    urls: {
        update: string;
        delete: string;
        duplicate: string;
        setDefault: string;
        preview: string;
        versions?: string;
        snapshot?: string;
    };
};

export type TemplatePlaceholder = {
    group: string;
    items: string[];
};

export type TemplatePreviewData = {
    html: string;
};
export type FinanceSettings = {
    defaultTvaRate: number;
    defaultCurrency: string;
    defaultPaymentTermsDays: number;
    defaultQuoteValidityDays: number;
    defaultUnitPriceM2: number;
    defaultArchitectRate: number;
    companyInfo: Record<string, string | null>;
    bankInfo: Record<string, string | null>;
};

export type ClientOption = {
    id: string;
    label: string;
    cin?: string | null;
    address?: string | null;
};

export type DossierOption = {
    id: string;
    label: string;
    clientId: string;
    projectObject?: string | null;
    address?: string | null;
    floorArea?: number | string | null;
    landSurface?: number | string | null;
};

export type TemplateOption = {
    id: string;
    label: string;
    type: FinanceDocumentType | string;
};

export type PaymentReceiptUrls = {
    show: string | null;
    download: string | null;
    pdf: string | null;
    excel: string | null;
    generatePdf: string | null;
    generateExcel: string | null;
};

export type PaymentReceipt = {
    id: number;
    number: string;
    type: 'receipt' | string;
    status: FinanceDocumentStatus | string;
    issueDate: string | null;
    amount: number;
    pdfPath: string | null;
    excelPath: string | null;
    urls: PaymentReceiptUrls;
};

export type Payment = {
    id: number;
    paymentNumber: string;
    amount: number;
    method: string | null;
    reference: string | null;
    paidAt: string | null;
    notes: string | null;
    document?: {
        id: number;
        number: string;
        type: string;
        status?: string;
        totalTtc?: number;
        paidTotal?: number;
        remainingTotal?: number;
    } | null;
    client?: { id: number; name: string } | null;
    dossier?: { id: number; number: string } | null;
    receiptDocumentId?: number | null;
    receipt?: PaymentReceipt | null;
    createdAt?: string | null;
};

export type FinanceRecordType = 'devis' | 'invoice' | 'payment' | string;

export type FinanceRecordStatus =
    | 'draft'
    | 'sent'
    | 'paid'
    | 'partially_paid'
    | 'overdue'
    | 'cancelled'
    | string;

export type FinanceRecordRow = {
    id: number;
    dossierId: string;
    clientId: string;
    dossierNumber: string;
    projectObject: string;
    clientName: string;
    clientCin: string;
    recordNumber: string;
    type: FinanceRecordType;
    status: FinanceRecordStatus;
    ht: number;
    tva: number;
    totalTtc: number;
    paid: number;
    remaining: number;
    issuedAt: string | null;
    dueDate: string | null;
    paidAt: string | null;
    notes: string | null;
    updatedAt: string | null;
    createdAt: string | null;
    generatedFilePath: string | null;
    generatedPdfPath: string | null;
    generatedAt: string | null;
    downloadUrl: string;
    pdfDownloadUrl: string;
    hasGeneratedFile: boolean;
    hasPdf: boolean;
};

export type FinanceDossierOption = {
    id: string;
    label: string;
    clientName: string;
};

export type FinanceFormPayload = {
    dossierId: string;
    type: string;
    status: string;
    ht: string;
    tva: string;
    totalTtc: string;
    paid: string;
    issuedAt: string;
    dueDate: string;
    paidAt: string;
    notes: string;
};

export type FinanceMonthDocumentRow = {
    id: number;
    type: FinanceDocumentType | string;
    number: string;
    status: FinanceDocumentStatus | string;
    clientName: string | null;
    dossierNumber: string | null;
    province: string | null;
    commune: string | null;
    issueDate: string | null;
    totalTtc: number;
    paidTotal: number;
    remainingTotal: number;
};

export type FinanceMonthPaymentRow = {
    id: number;
    paymentNumber: string;
    documentNumber: string | null;
    clientName: string | null;
    dossierNumber: string | null;
    province: string | null;
    commune: string | null;
    amount: number;
    method: string | null;
    paidAt: string | null;
};

export type FinanceMonthSummary = {
    year: number;
    month: number;
    key: string;
    label: string;
    currency: string;
    quotesCount: number;
    invoicesCount: number;
    receiptsCount: number;
    paymentsCount: number;
    quotesTotalTtc: number;
    invoicesTotalTtc: number;
    receiptsTotalTtc: number;
    paidTotal: number;
    remainingTotal: number;
    overdueTotal: number;
    subtotalHt: number;
    taxTotal: number;
    totalTtc: number;
    documents: FinanceMonthDocumentRow[];
    payments: FinanceMonthPaymentRow[];
};
```


## FILE: resources\js\features\documents\components\DocumentChecklist.tsx
```
import { CheckCircle2, Circle, AlertTriangle } from 'lucide-react';
import { AppCard } from '@/components/ui/AppCard';
import { AppBadge } from '@/components/ui/AppBadge';
import { useTranslation } from '@/lib/i18n';

type ChecklistItem = {
    labelKey: string;
    status: 'done' | 'pending' | 'blocked';
};

const items: ChecklistItem[] = [
    {
        labelKey: 'documentsWorkspace.checklist.cni',
        status: 'done',
    },
    {
        labelKey: 'documentsWorkspace.checklist.ownership',
        status: 'pending',
    },
    {
        labelKey: 'documentsWorkspace.checklist.cadastral',
        status: 'blocked',
    },
    {
        labelKey: 'documentsWorkspace.checklist.surface',
        status: 'blocked',
    },
    {
        labelKey: 'documentsWorkspace.checklist.contractReady',
        status: 'pending',
    },
];

export function DocumentChecklist() {
    const { t } = useTranslation();

    return (
        <AppCard className="p-5">
            <div className="mb-4">
                <h2 className="text-sm font-semibold">{t('documentsWorkspace.checklist.title')}</h2>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                    {t('documentsWorkspace.checklist.description')}
                </p>
            </div>

            <div className="space-y-3">
                {items.map((item) => {
                    const done = item.status === 'done';
                    const blocked = item.status === 'blocked';

                    return (
                        <div key={item.labelKey} className="flex items-center gap-3 rounded-2xl border bg-[var(--surface)] p-3">
                            {done ? (
                                <CheckCircle2 size={17} className="text-[var(--success)]" />
                            ) : blocked ? (
                                <AlertTriangle size={17} className="text-[var(--danger)]" />
                            ) : (
                                <Circle size={17} className="text-[var(--text-muted)]" />
                            )}

                            <p className="flex-1 text-sm font-medium">{t(item.labelKey)}</p>

                            <AppBadge tone={done ? 'green' : blocked ? 'red' : 'amber'}>
                                {done ? t('common.completed') : blocked ? t('common.blocked') : t('common.pending')}
                            </AppBadge>
                        </div>
                    );
                })}
            </div>
        </AppCard>
    );
}

```


## FILE: resources\js\features\documents\components\DocumentGroupedExplorer.tsx
```
import { router } from '@inertiajs/react';
import {
    ChevronRight,
    Download,
    Eye,
    FileCheck2,
    FileText,
    FolderKanban,
    MapPinned,
    Search,
    UserRound,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { AppButton } from '@/components/ui/AppButton';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import type {
    DocumentClientGroup,
    DocumentCommuneGroup,
    DocumentGroupRow,
    DocumentLocationGroup,
    DocumentProjectGroup,
    DocumentStatus,
    DocumentTypeGroup,
} from '@/features/documents/types';

/* COLUMN_DOCUMENT_BROWSER_53EC */

type Props = {
    groups: DocumentLocationGroup[];
};

type Level = 'clients' | 'projects' | 'types';

function statusClass(status: DocumentStatus) {
    if (status === 'verified') return 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300';
    if (status === 'uploaded') return 'border-sky-400/25 bg-sky-400/10 text-sky-300';
    if (status === 'missing') return 'border-amber-400/25 bg-amber-400/10 text-amber-300';
    if (status === 'rejected') return 'border-red-400/25 bg-red-400/10 text-red-300';

    return 'border-zinc-500/30 bg-zinc-500/10 text-zinc-300';
}

function searchDocument(document: DocumentGroupRow, query: string) {
    if (!query.trim()) {
        return true;
    }

    return [
        document.templateName,
        document.documentType,
        document.documentNumber,
        document.originalFilename,
        document.status,
        document.dossierNumber,
        document.projectObject,
        document.clientName,
    ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query.trim().toLowerCase());
}

function ColumnButton({
    active,
    icon,
    title,
    subtitle,
    onClick,
}: {
    active: boolean;
    icon?: React.ReactNode;
    title: string;
    subtitle: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                'flex w-full items-center justify-between gap-3 border-b border-[var(--crm-border)] px-3 py-3 text-left transition',
                active
                    ? 'bg-[var(--crm-gold-soft)] text-[var(--crm-gold)]'
                    : 'text-[var(--crm-text-muted)] hover:bg-[var(--crm-surface-hover)] hover:text-[var(--crm-text)]',
            ].join(' ')}
        >
            <span className="flex min-w-0 items-center gap-2">
                {icon ? <span className="shrink-0">{icon}</span> : null}
                <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{title}</span>
                    <span className="block truncate text-xs opacity-75">{subtitle}</span>
                </span>
            </span>

            <ChevronRight size={15} className="shrink-0" />
        </button>
    );
}

function DocumentCard({ document }: { document: DocumentGroupRow }) {
    return (
        <article className="crm-panel-soft p-3 transition hover:border-[var(--crm-gold)]">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0">
                    <div className="flex min-w-0 items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--crm-gold-soft)] text-[var(--crm-gold)]">
                            <FileText size={16} />
                        </span>

                        <div className="min-w-0">
                            <h3 className="truncate text-sm font-semibold text-[var(--crm-text)]">
                                {document.templateName || document.originalFilename || 'Document'}
                            </h3>
                            <p className="text-xs text-[var(--crm-text-muted)]">
                                {document.documentNumber || document.documentType || 'No number'}
                            </p>
                        </div>
                    </div>

                    <p className="mt-2 truncate text-xs text-[var(--crm-text-soft)]">
                        {document.originalFilename || 'No uploaded file'}
                    </p>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <span className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-semibold ${statusClass(document.status)}`}>
                        {document.status}
                    </span>

                    <AppButton variant="secondary" size="sm" onPress={() => router.visit(`/dossiers/${document.dossierId}`)}>
                        <Eye size={14} />
                        Project
                    </AppButton>

                    <button
                        type="button"
                        className="crm-action-button"
                        title="Download"
                        onClick={() => window.location.assign(`/documents/${document.id}/download`)}
                    >
                        <Download size={14} />
                    </button>
                </div>
            </div>

            <div className="mt-3 grid gap-2 md:grid-cols-3">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">Project</p>
                    <p className="mt-1 truncate text-sm font-semibold">{document.dossierNumber || '-'}</p>
                    <p className="truncate text-xs text-[var(--crm-text-muted)]">{document.projectObject || '-'}</p>
                </div>

                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">Client</p>
                    <p className="mt-1 truncate text-sm font-semibold">{document.clientName || '-'}</p>
                </div>

                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">Uploaded</p>
                    <p className="mt-1 truncate text-sm font-semibold">{document.uploadedAt || '-'}</p>
                </div>
            </div>
        </article>
    );
}

function flattenClientDocuments(client: DocumentClientGroup): DocumentGroupRow[] {
    return client.projects.flatMap((project) =>
        project.types.flatMap((type) => type.documents),
    );
}

function flattenProjectDocuments(project: DocumentProjectGroup): DocumentGroupRow[] {
    return project.types.flatMap((type) => type.documents);
}

export function DocumentGroupedExplorer({ groups }: Props) {
    const [selectedProvince, setSelectedProvince] = useState(groups[0]?.province ?? '');
    const selectedProvinceGroup = groups.find((group) => group.province === selectedProvince) ?? groups[0] ?? null;

    const [selectedCommune, setSelectedCommune] = useState(selectedProvinceGroup?.communes[0]?.commune ?? '');
    const selectedCommuneGroup = selectedProvinceGroup?.communes.find((commune) => commune.commune === selectedCommune)
        ?? selectedProvinceGroup?.communes[0]
        ?? null;

    const [level, setLevel] = useState<Level>('clients');
    const [selectedClient, setSelectedClient] = useState(selectedCommuneGroup?.clients[0]?.clientName ?? '');
    const activeClient = selectedCommuneGroup?.clients.find((client) => client.clientName === selectedClient)
        ?? selectedCommuneGroup?.clients[0]
        ?? null;

    const [selectedProject, setSelectedProject] = useState(activeClient?.projects[0]?.dossierNumber ?? '');
    const activeProject = activeClient?.projects.find((project) => project.dossierNumber === selectedProject)
        ?? activeClient?.projects[0]
        ?? null;

    const [selectedType, setSelectedType] = useState(activeProject?.types[0]?.type ?? '');
    const activeType = activeProject?.types.find((type) => type.type === selectedType)
        ?? activeProject?.types[0]
        ?? null;

    const [query, setQuery] = useState('');

    const documents = useMemo(() => {
        let rows: DocumentGroupRow[] = [];

        if (level === 'clients' && activeClient) {
            rows = flattenClientDocuments(activeClient);
        }

        if (level === 'projects' && activeProject) {
            rows = flattenProjectDocuments(activeProject);
        }

        if (level === 'types' && activeType) {
            rows = activeType.documents;
        }

        return rows.filter((document) => searchDocument(document, query));
    }, [activeClient, activeProject, activeType, level, query]);

    if (!groups.length) {
        return (
            <AppEmptyState
                title="No document groups found"
                description="Upload project documents to see province, commune, client, project, and type grouping."
            />
        );
    }

    function chooseProvince(group: DocumentLocationGroup) {
        const firstCommune = group.communes[0] ?? null;
        const firstClient = firstCommune?.clients[0] ?? null;
        const firstProject = firstClient?.projects[0] ?? null;
        const firstType = firstProject?.types[0] ?? null;

        setSelectedProvince(group.province);
        setSelectedCommune(firstCommune?.commune ?? '');
        setSelectedClient(firstClient?.clientName ?? '');
        setSelectedProject(firstProject?.dossierNumber ?? '');
        setSelectedType(firstType?.type ?? '');
        setLevel('clients');
        setQuery('');
    }

    function chooseCommune(commune: DocumentCommuneGroup) {
        const firstClient = commune.clients[0] ?? null;
        const firstProject = firstClient?.projects[0] ?? null;
        const firstType = firstProject?.types[0] ?? null;

        setSelectedCommune(commune.commune);
        setSelectedClient(firstClient?.clientName ?? '');
        setSelectedProject(firstProject?.dossierNumber ?? '');
        setSelectedType(firstType?.type ?? '');
        setLevel('clients');
        setQuery('');
    }

    function chooseClient(client: DocumentClientGroup) {
        const firstProject = client.projects[0] ?? null;
        const firstType = firstProject?.types[0] ?? null;

        setSelectedClient(client.clientName);
        setSelectedProject(firstProject?.dossierNumber ?? '');
        setSelectedType(firstType?.type ?? '');
        setLevel('clients');
        setQuery('');
    }

    function chooseProject(project: DocumentProjectGroup) {
        const firstType = project.types[0] ?? null;

        setSelectedProject(project.dossierNumber);
        setSelectedType(firstType?.type ?? '');
        setLevel('projects');
        setQuery('');
    }

    function chooseType(type: DocumentTypeGroup) {
        setSelectedType(type.type);
        setLevel('types');
        setQuery('');
    }

    return (
        <section className="crm-panel overflow-hidden">
            <div className="grid min-h-[640px] grid-cols-1 xl:grid-cols-[210px_210px_250px_minmax(0,1fr)]">
                <aside className="border-b border-[var(--crm-border)] xl:border-b-0 xl:border-r">
                    <div className="border-b border-[var(--crm-border)] p-3">
                        <div className="flex items-center gap-2">
                            <span className="flex size-8 items-center justify-center rounded-lg bg-[var(--crm-gold-soft)] text-[var(--crm-gold)]">
                                <MapPinned size={15} />
                            </span>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">Provinces</p>
                                <p className="text-xs text-[var(--crm-text-muted)]">{groups.length} province(s)</p>
                            </div>
                        </div>
                    </div>

                    <div className="app-scrollbar max-h-[580px] overflow-y-auto">
                        {groups.map((group) => (
                            <ColumnButton
                                key={group.province}
                                active={selectedProvinceGroup?.province === group.province}
                                icon={<MapPinned size={14} />}
                                title={group.province}
                                subtitle={`${group.communes.length} communes Â· ${group.stats.documentsCount} docs`}
                                onClick={() => chooseProvince(group)}
                            />
                        ))}
                    </div>
                </aside>

                <aside className="border-b border-[var(--crm-border)] xl:border-b-0 xl:border-r">
                    <div className="border-b border-[var(--crm-border)] p-3">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">Communes</p>
                        <p className="truncate text-xs text-[var(--crm-text-muted)]">{selectedProvinceGroup?.province}</p>
                    </div>

                    <div className="app-scrollbar max-h-[580px] overflow-y-auto">
                        {(selectedProvinceGroup?.communes ?? []).map((commune) => (
                            <ColumnButton
                                key={`${selectedProvinceGroup?.province}-${commune.commune}`}
                                active={selectedCommuneGroup?.commune === commune.commune}
                                title={commune.commune}
                                subtitle={`${commune.clients.length} clients Â· ${commune.stats.documentsCount} docs`}
                                onClick={() => chooseCommune(commune)}
                            />
                        ))}
                    </div>
                </aside>

                <aside className="border-b border-[var(--crm-border)] xl:border-b-0 xl:border-r">
                    <div className="border-b border-[var(--crm-border)] p-3">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">Scope</p>
                        <p className="truncate text-xs text-[var(--crm-text-muted)]">Client / project / type</p>
                    </div>

                    <div className="app-scrollbar max-h-[580px] overflow-y-auto">
                        <div className="border-b border-[var(--crm-border)] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">
                            Clients
                        </div>
                        {(selectedCommuneGroup?.clients ?? []).map((client) => (
                            <ColumnButton
                                key={`${selectedCommuneGroup?.commune}-${client.clientName}`}
                                active={level === 'clients' && activeClient?.clientName === client.clientName}
                                icon={<UserRound size={14} />}
                                title={client.clientName}
                                subtitle={`${client.projects.length} projects Â· ${client.stats.documentsCount} docs`}
                                onClick={() => chooseClient(client)}
                            />
                        ))}

                        {activeClient ? (
                            <>
                                <div className="border-b border-[var(--crm-border)] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">
                                    Projects
                                </div>
                                {activeClient.projects.map((project) => (
                                    <ColumnButton
                                        key={`${activeClient.clientName}-${project.dossierNumber}`}
                                        active={level === 'projects' && activeProject?.dossierNumber === project.dossierNumber}
                                        icon={<FolderKanban size={14} />}
                                        title={project.projectObject || project.dossierNumber}
                                        subtitle={`${project.types.length} types Â· ${project.stats.documentsCount} docs`}
                                        onClick={() => chooseProject(project)}
                                    />
                                ))}
                            </>
                        ) : null}

                        {activeProject ? (
                            <>
                                <div className="border-b border-[var(--crm-border)] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">
                                    Types
                                </div>
                                {activeProject.types.map((type) => (
                                    <ColumnButton
                                        key={`${activeProject.dossierNumber}-${type.type}`}
                                        active={level === 'types' && activeType?.type === type.type}
                                        icon={<FileCheck2 size={14} />}
                                        title={type.type}
                                        subtitle={`${type.stats.documentsCount} docs`}
                                        onClick={() => chooseType(type)}
                                    />
                                ))}
                            </>
                        ) : null}
                    </div>
                </aside>

                <main className="min-w-0">
                    <div className="flex flex-col gap-3 border-b border-[var(--crm-border)] p-4 xl:flex-row xl:items-center xl:justify-between">
                        <div className="min-w-0">
                            <p className="crm-eyebrow">Document browser</p>
                            <h2 className="mt-1 truncate text-lg font-semibold">
                                {selectedProvinceGroup?.province || '-'} / {selectedCommuneGroup?.commune || '-'}
                            </h2>
                            <p className="mt-1 text-sm text-[var(--crm-text-muted)]">
                                {documents.length} visible document(s). Select province, commune, then client/project/type.
                            </p>
                        </div>

                        <div className="crm-command-input relative w-full xl:w-[340px]">
                            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--crm-text-soft)]" />
                            <input
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Search documents in scope..."
                                className="h-full w-full bg-transparent pl-9 pr-9 text-sm outline-none placeholder:text-[var(--crm-text-soft)]"
                            />
                        </div>
                    </div>

                    <div className="app-scrollbar max-h-[580px] space-y-3 overflow-y-auto p-4">
                        {documents.length > 0 ? (
                            documents.map((document) => (
                                <DocumentCard key={document.id} document={document} />
                            ))
                        ) : (
                            <div className="py-16 text-center">
                                <p className="text-sm font-semibold">No documents found</p>
                                <p className="mt-1 text-sm text-[var(--crm-text-muted)]">Choose another scope or clear search.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </section>
    );
}
```


## FILE: resources\js\features\documents\components\DocumentPreviewPanel.tsx
```
import { FileText } from 'lucide-react';
import { AppCard } from '@/components/ui/AppCard';
import { AppBadge } from '@/components/ui/AppBadge';
import { RequiredDocumentRow } from '@/features/documents/data/mockDocuments';
import { useTranslation } from '@/lib/i18n';

type DocumentPreviewPanelProps = {
    document: RequiredDocumentRow | null;
};

export function DocumentPreviewPanel({ document }: DocumentPreviewPanelProps) {
    const { t } = useTranslation();

    return (
        <AppCard className="p-5">
            <div className="mb-4">
                <h2 className="text-sm font-semibold">{t('documentsWorkspace.preview.title')}</h2>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                    {document
                        ? t('documentsWorkspace.preview.selectedTitle')
                        : t('documentsWorkspace.preview.emptyDescription')}
                </p>
            </div>

            {document ? (
                <div className="space-y-4">
                    <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed bg-[var(--surface-2)]">
                        <div className="text-center">
                            <FileText className="mx-auto text-[var(--text-muted)]" size={36} />
                            <p className="mt-3 text-sm font-medium">{document.title}</p>
                            <p className="mt-1 text-xs text-[var(--text-muted)]">{document.fileName}</p>
                        </div>
                    </div>

                    <div className="grid gap-3 text-sm">
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-[var(--text-muted)]">{t('documentsWorkspace.preview.fileName')}</span>
                            <span className="max-w-[220px] truncate font-medium">{document.fileName}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-[var(--text-muted)]">{t('documentsWorkspace.preview.fileSize')}</span>
                            <span className="font-medium">{document.fileSize}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-[var(--text-muted)]">{t('documentsWorkspace.preview.uploadedBy')}</span>
                            <span className="font-medium">{document.uploadedBy}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-[var(--text-muted)]">{t('documentsWorkspace.preview.uploadedAt')}</span>
                            <span className="font-medium">{document.uploadedAt}</span>
                        </div>
                    </div>

                    <AppBadge tone="blue">{document.dossierNumber}</AppBadge>
                </div>
            ) : (
                <div className="flex h-72 items-center justify-center rounded-2xl border border-dashed bg-[var(--surface-2)]">
                    <div className="px-6 text-center">
                        <FileText className="mx-auto text-[var(--text-muted)]" size={38} />
                        <p className="mt-3 text-sm font-semibold">
                            {t('documentsWorkspace.preview.emptyTitle')}
                        </p>
                        <p className="mt-1 max-w-sm text-sm text-[var(--text-muted)]">
                            {t('documentsWorkspace.preview.emptyDescription')}
                        </p>
                    </div>
                </div>
            )}
        </AppCard>
    );
}

```


## FILE: resources\js\features\documents\components\DocumentUploadCard.tsx
```
import { ReactNode } from 'react';
import { FileTrigger } from 'react-aria-components';
import { Upload } from 'lucide-react';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';

type DocumentUploadCardProps = {
    title: string;
    description: string;
    acceptedText: string;
    chooseLabel: string;
    icon?: ReactNode;
    onSelect: (fileName: string) => void;
};

export function DocumentUploadCard({
    title,
    description,
    acceptedText,
    chooseLabel,
    icon,
    onSelect,
}: DocumentUploadCardProps) {
    return (
        <AppCard className="p-4">
            <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)]">
                    {icon ?? <Upload size={18} />}
                </div>

                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{title}</p>
                    <p className="mt-1 text-sm leading-5 text-[var(--text-muted)]">
                        {description}
                    </p>
                    <p className="mt-2 text-xs text-[var(--text-subtle)]">
                        {acceptedText}
                    </p>

                    <div className="mt-4">
                        <FileTrigger
                            acceptedFileTypes={[
                                'application/pdf',
                                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                                'image/jpeg',
                                'image/png',
                            ]}
                            onSelect={(files) => {
                                const file = files?.item(0);
                                if (file) {
                                    onSelect(file.name);
                                }
                            }}
                        >
                            <AppButton size="sm" variant="primary">
                                <Upload size={15} />
                                {chooseLabel}
                            </AppButton>
                        </FileTrigger>
                    </div>
                </div>
            </div>
        </AppCard>
    );
}

```


## FILE: resources\js\features\documents\data\mockDocuments.ts
```
export type RequiredDocumentType =
    | 'cni'
    | 'ownership'
    | 'cadastral'
    | 'surface'
    | 'contract'
    | 'authorization';

export type RequiredDocumentStatus =
    | 'missing'
    | 'uploaded'
    | 'verified'
    | 'rejected'
    | 'expired';

export type RequiredDocumentRow = {
    id: number;
    title: string;
    type: RequiredDocumentType;
    status: RequiredDocumentStatus;
    dossierNumber: string;
    projectObject: string;
    client: string;
    cin: string;
    fileName: string;
    fileSize: string;
    uploadedBy: string;
    uploadedAt: string;
    updatedAt: string;
};

export const requiredDocumentRows: RequiredDocumentRow[] = [
    {
        id: 1,
        title: 'CNI copy',
        type: 'cni',
        status: 'verified',
        dossierNumber: 'DOS-2026-0001',
        projectObject: 'Villa construction study',
        client: 'Mohamed Ouknin',
        cin: 'EE123456',
        fileName: 'cni-mohamed-ouknin.pdf',
        fileSize: '1.2 MB',
        uploadedBy: 'Assistant',
        uploadedAt: 'Today',
        updatedAt: 'Today',
    },
    {
        id: 2,
        title: 'Ownership certificate',
        type: 'ownership',
        status: 'uploaded',
        dossierNumber: 'DOS-2026-0001',
        projectObject: 'Villa construction study',
        client: 'Mohamed Ouknin',
        cin: 'EE123456',
        fileName: 'ownership-certificate.pdf',
        fileSize: '2.4 MB',
        uploadedBy: 'Assistant',
        uploadedAt: 'Today',
        updatedAt: 'Today',
    },
    {
        id: 3,
        title: 'Cadastral plan',
        type: 'cadastral',
        status: 'missing',
        dossierNumber: 'DOS-2026-0001',
        projectObject: 'Villa construction study',
        client: 'Mohamed Ouknin',
        cin: 'EE123456',
        fileName: '-',
        fileSize: '-',
        uploadedBy: '-',
        uploadedAt: '-',
        updatedAt: 'Today',
    },
    {
        id: 4,
        title: 'Surface calculation',
        type: 'surface',
        status: 'missing',
        dossierNumber: 'DOS-2026-0001',
        projectObject: 'Villa construction study',
        client: 'Mohamed Ouknin',
        cin: 'EE123456',
        fileName: '-',
        fileSize: '-',
        uploadedBy: '-',
        uploadedAt: '-',
        updatedAt: 'Today',
    },
    {
        id: 5,
        title: 'CNI copy',
        type: 'cni',
        status: 'verified',
        dossierNumber: 'DOS-2026-0002',
        projectObject: 'Apartment renovation',
        client: 'Salma El Mansouri',
        cin: 'BK884210',
        fileName: 'cni-salma.pdf',
        fileSize: '1.1 MB',
        uploadedBy: 'Manager',
        uploadedAt: 'Yesterday',
        updatedAt: 'Yesterday',
    },
    {
        id: 6,
        title: 'Cadastral plan',
        type: 'cadastral',
        status: 'rejected',
        dossierNumber: 'DOS-2026-0002',
        projectObject: 'Apartment renovation',
        client: 'Salma El Mansouri',
        cin: 'BK884210',
        fileName: 'old-cadastral-plan.pdf',
        fileSize: '3.6 MB',
        uploadedBy: 'Assistant',
        uploadedAt: '2 days ago',
        updatedAt: 'Yesterday',
    },
];

export function getDocumentMetrics() {
    return {
        total: requiredDocumentRows.length,
        verified: requiredDocumentRows.filter((document) => document.status === 'verified').length,
        missing: requiredDocumentRows.filter((document) => document.status === 'missing').length,
        rejected: requiredDocumentRows.filter((document) => document.status === 'rejected').length,
    };
}

```


## FILE: resources\js\features\documents\drawers\DocumentUploadDrawer.tsx
```
import { FormEvent, useEffect, useState } from 'react';
import type { Key } from 'react-aria-components';
import { UploadCloud } from 'lucide-react';
import { AppButton } from '@/components/ui/AppButton';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppFormErrorSummary } from '@/components/ui/AppFormErrorSummary';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppTextarea } from '@/components/ui/AppTextarea';
import type {
    DocumentTemplateOption,
    DocumentUploadPayload,
    DossierOption,
} from '@/features/documents/types';
import type { FormErrors } from '@/lib/formErrors';
import { firstError } from '@/lib/formErrors';

type DocumentUploadDrawerProps = {
    isOpen: boolean;
    dossiers: DossierOption[];
    templates: DocumentTemplateOption[];
    initialDossierId?: string;
    initialTemplateId?: string;
    onOpenChange: (isOpen: boolean) => void;
    onSubmit: (payload: DocumentUploadPayload) => void;
    errors?: FormErrors;
};

const emptyForm: DocumentUploadPayload = {
    dossierId: '',
    documentTemplateId: '',
    status: 'uploaded',
    notes: '',
    file: null,
};

const statusOptions = [
    { id: 'uploaded', label: 'Uploaded' },
    { id: 'verified', label: 'Verified' },
    { id: 'missing', label: 'Missing' },
    { id: 'rejected', label: 'Rejected' },
];

export function DocumentUploadDrawer({
    isOpen,
    dossiers,
    templates,
    initialDossierId = '',
    initialTemplateId = '',
    onOpenChange,
    onSubmit,
    errors = {},
}: DocumentUploadDrawerProps) {
    const [form, setForm] = useState<DocumentUploadPayload>(emptyForm);
    const [fileName, setFileName] = useState('');

    useEffect(() => {
        if (isOpen) {
            setForm({
                ...emptyForm,
                dossierId: initialDossierId,
                documentTemplateId: initialTemplateId,
            });
            setFileName('');
        }
    }, [initialDossierId, initialTemplateId, isOpen]);

    function updateField(field: keyof DocumentUploadPayload, value: string) {
        setForm((current) => ({ ...current, [field]: value }));
    }

    function updateSelect(field: keyof DocumentUploadPayload, value: Key | null) {
        setForm((current) => ({
            ...current,
            [field]: value ? String(value) : '',
        }));
    }

    function handleFileChange(fileList: FileList | null) {
        const file = fileList?.[0] ?? null;

        setForm((current) => ({
            ...current,
            file,
        }));

        setFileName(file?.name ?? '');
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        onSubmit(form);
    }

    return (
        <AppDrawer
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            title="Upload document"
            description="Attach a document to a project/dossier."
            footer={
                <>
                    <AppButton variant="secondary" onPress={() => onOpenChange(false)}>
                        Cancel
                    </AppButton>

                    <AppButton variant="primary" type="submit" form="document-upload-form">
                        Save document
                    </AppButton>
                </>
            }
        >
            <form id="document-upload-form" className="space-y-6" onSubmit={handleSubmit}>
                <AppFormErrorSummary errors={errors} />

                <section>
                    <h3 className="mb-3 text-sm font-semibold">Document information</h3>

                    <div className="grid gap-4">
                        <AppSelect
                            label="Dossier / Project"
                            placeholder="Select dossier"
                            selectedKey={form.dossierId}
                            onSelectionChange={(value) => updateSelect('dossierId', value)}
                            options={dossiers}
                            error={firstError(errors, 'dossier_id')}
                        />

                        <AppSelect
                            label="Document template"
                            placeholder="Select document type"
                            selectedKey={form.documentTemplateId}
                            onSelectionChange={(value) => updateSelect('documentTemplateId', value)}
                            options={templates}
                            error={firstError(errors, 'document_template_id')}
                        />

                        <AppSelect
                            label="Status"
                            selectedKey={form.status}
                            onSelectionChange={(value) => updateSelect('status', value)}
                            options={statusOptions}
                            error={firstError(errors, 'status')}
                        />
                    </div>
                </section>

                <section>
                    <h3 className="mb-3 text-sm font-semibold">File</h3>

                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed bg-[var(--surface)] p-6 text-center transition hover:border-[var(--accent)] hover:bg-[var(--surface-2)]">
                        <UploadCloud size={26} className="text-[var(--accent)]" />

                        <span className="mt-3 text-sm font-semibold">
                            {fileName || 'Choose file'}
                        </span>

                        <span className="mt-1 text-xs text-[var(--text-muted)]">
                            PDF, image, DOCX, or office file. Max 20 MB.
                        </span>

                        <input
                            type="file"
                            className="hidden"
                            onChange={(event) => handleFileChange(event.target.files)}
                        />
                    </label>

                    {firstError(errors, 'file') ? (
                        <p className="mt-2 text-xs font-medium text-[var(--danger)]">
                            {firstError(errors, 'file')}
                        </p>
                    ) : null}
                </section>

                <section>
                    <AppTextarea
                        label="Notes"
                        value={form.notes}
                        onChange={(value) => updateField('notes', value)}
                        error={firstError(errors, 'notes')}
                    />
                </section>
            </form>
        </AppDrawer>
    );
}

```


## FILE: resources\js\features\documents\types.ts
```
export type DocumentStatus = 'uploaded' | 'verified' | 'missing' | 'rejected' | string;

export type DossierDocumentRow = {
    id: number;
    dossierId: number;
    dossierNumber: string | null;
    projectObject: string | null;
    clientName: string | null;
    templateName: string | null;
    documentType: string | null;
    documentNumber: string | null;
    status: DocumentStatus;
    originalFilename: string | null;
    sizeLabel?: string | null;
    uploadedAt: string | null;
    downloadUrl?: string | null;
    notes?: string | null;
};

export type DossierOption = {
    id: string;
    label: string;
};

export type DocumentTemplateOption = {
    id: string;
    label: string;
    type?: string | null;
};

export type DocumentUploadPayload = {
    dossierId: string;
    documentTemplateId: string;
    status: string;
    notes: string;
    file: File | null;
};

export type DocumentGroupStats = {
    documentsCount: number;
    uploadedCount: number;
    verifiedCount: number;
    missingCount: number;
    rejectedCount: number;
};

export type DocumentGroupRow = {
    id: number;
    dossierId: number;
    dossierNumber: string | null;
    projectObject: string | null;
    clientName: string | null;
    templateName: string | null;
    documentType: string | null;
    documentNumber: string | null;
    status: DocumentStatus;
    originalFilename: string | null;
    uploadedAt: string | null;
};

export type DocumentTypeGroup = {
    type: string;
    stats: DocumentGroupStats;
    documents: DocumentGroupRow[];
};

export type DocumentProjectGroup = {
    dossierNumber: string;
    projectObject: string | null;
    stats: DocumentGroupStats;
    types: DocumentTypeGroup[];
};

export type DocumentClientGroup = {
    clientName: string;
    stats: DocumentGroupStats;
    projects: DocumentProjectGroup[];
};

export type DocumentCommuneGroup = {
    commune: string;
    stats: DocumentGroupStats;
    clients: DocumentClientGroup[];
};

export type DocumentLocationGroup = {
    province: string;
    stats: DocumentGroupStats;
    communes: DocumentCommuneGroup[];
};
```


## FILE: resources\js\features\contracts\components\ContractCalculationPanel.tsx
```
import { useMemo, useState } from 'react';
import { Calculator, Lock, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppTextField } from '@/components/ui/AppTextField';
import { formatMoney } from '@/features/contracts/data/mockContracts';
import { useTranslation } from '@/lib/i18n';

function toNumber(value: string) {
    const parsed = Number(value.replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : 0;
}

export function ContractCalculationPanel() {
    const { t } = useTranslation();

    const [surface, setSurface] = useState('280');
    const [pricePerMeter, setPricePerMeter] = useState('120');
    const [honorairesRate, setHonorairesRate] = useState('2');
    const [tvaRate, setTvaRate] = useState('20');

    const result = useMemo(() => {
        const floorArea = toNumber(surface);
        const price = toNumber(pricePerMeter);
        const rate = toNumber(honorairesRate);
        const tva = toNumber(tvaRate);

        const estimation = floorArea * price;
        const ht = estimation / (1 + tva / 100);
        const tvaAmount = ht * (tva / 100);
        const ttc = ht + tvaAmount;

        return {
            estimation,
            ht,
            tvaAmount,
            ttc,
            rate,
        };
    }, [honorairesRate, pricePerMeter, surface, tvaRate]);

    return (
        <AppCard className="p-5">
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="flex size-9 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)]">
                            <Calculator size={17} />
                        </div>
                        <h2 className="text-sm font-semibold">{t('contractsWorkspace.calculator.title')}</h2>
                    </div>
                    <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">
                        {t('contractsWorkspace.calculator.description')}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <AppButton
                        size="sm"
                        variant="secondary"
                        onPress={() => {
                            setSurface('280');
                            setPricePerMeter('120');
                            setHonorairesRate('2');
                            setTvaRate('20');
                            toast.info(t('contractsWorkspace.toast.reset'));
                        }}
                    >
                        <RotateCcw size={15} />
                        {t('contractsWorkspace.calculator.reset')}
                    </AppButton>

                    <AppButton
                        size="sm"
                        variant="primary"
                        onPress={() => toast.success(t('contractsWorkspace.toast.lock'))}
                    >
                        <Lock size={15} />
                        {t('contractsWorkspace.calculator.lock')}
                    </AppButton>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <AppTextField
                    label={t('contractsWorkspace.calculator.surface')}
                    value={surface}
                    onChange={setSurface}
                />

                <AppTextField
                    label={t('contractsWorkspace.calculator.pricePerMeter')}
                    value={pricePerMeter}
                    onChange={setPricePerMeter}
                />

                <AppTextField
                    label={t('contractsWorkspace.calculator.honorairesRate')}
                    value={honorairesRate}
                    onChange={setHonorairesRate}
                />

                <AppTextField
                    label={t('contractsWorkspace.calculator.tvaRate')}
                    value={tvaRate}
                    onChange={setTvaRate}
                />
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-4">
                <div className="rounded-2xl border bg-[var(--surface-2)] p-4">
                    <p className="text-xs text-[var(--text-muted)]">{t('contractsWorkspace.calculator.estimation')}</p>
                    <p className="mt-1 text-lg font-semibold">{formatMoney(result.estimation)}</p>
                </div>

                <div className="rounded-2xl border bg-[var(--surface-2)] p-4">
                    <p className="text-xs text-[var(--text-muted)]">{t('contractsWorkspace.calculator.ht')}</p>
                    <p className="mt-1 text-lg font-semibold">{formatMoney(result.ht)}</p>
                </div>

                <div className="rounded-2xl border bg-[var(--surface-2)] p-4">
                    <p className="text-xs text-[var(--text-muted)]">{t('contractsWorkspace.calculator.tvaAmount')}</p>
                    <p className="mt-1 text-lg font-semibold">{formatMoney(result.tvaAmount)}</p>
                </div>

                <div className="rounded-2xl border bg-[color-mix(in_srgb,var(--accent)_9%,var(--surface))] p-4">
                    <p className="text-xs text-[var(--accent)]">{t('contractsWorkspace.calculator.ttc')}</p>
                    <p className="mt-1 text-lg font-semibold text-[var(--accent)]">{formatMoney(result.ttc)}</p>
                </div>
            </div>
        </AppCard>
    );
}

```


## FILE: resources\js\features\contracts\components\ContractPreviewPanel.tsx
```
import { FileText } from 'lucide-react';
import { AppCard } from '@/components/ui/AppCard';
import { AppBadge } from '@/components/ui/AppBadge';
import { ContractRow } from '@/features/contracts/data/mockContracts';
import { useTranslation } from '@/lib/i18n';

type ContractPreviewPanelProps = {
    contract: ContractRow | null;
};

export function ContractPreviewPanel({ contract }: ContractPreviewPanelProps) {
    const { t } = useTranslation();

    return (
        <AppCard className="p-5">
            <div className="mb-4">
                <h2 className="text-sm font-semibold">{t('contractsWorkspace.preview.title')}</h2>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                    {t('contractsWorkspace.preview.description')}
                </p>
            </div>

            {contract ? (
                <div className="space-y-4">
                    <div className="flex h-56 items-center justify-center rounded-2xl border border-dashed bg-[var(--surface-2)]">
                        <div className="text-center">
                            <FileText className="mx-auto text-[var(--text-muted)]" size={40} />
                            <p className="mt-3 text-sm font-semibold">{contract.contractNumber}</p>
                            <p className="mt-1 text-xs text-[var(--text-muted)]">{contract.fileName}</p>
                        </div>
                    </div>

                    <div className="grid gap-3 text-sm">
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-[var(--text-muted)]">{t('contractsWorkspace.preview.fileName')}</span>
                            <span className="max-w-[220px] truncate font-medium">{contract.fileName}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-[var(--text-muted)]">{t('contractsWorkspace.preview.template')}</span>
                            <span className="font-medium">{contract.template}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-[var(--text-muted)]">{t('contractsWorkspace.preview.version')}</span>
                            <span className="font-medium">{contract.version}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-[var(--text-muted)]">{t('contractsWorkspace.preview.lastGenerated')}</span>
                            <span className="font-medium">{contract.lastGenerated}</span>
                        </div>
                    </div>

                    <AppBadge tone="blue">{contract.dossierNumber}</AppBadge>
                </div>
            ) : (
                <div className="flex h-72 items-center justify-center rounded-2xl border border-dashed bg-[var(--surface-2)]">
                    <div className="px-6 text-center">
                        <FileText className="mx-auto text-[var(--text-muted)]" size={38} />
                        <p className="mt-3 text-sm font-semibold">
                            {t('contractsWorkspace.preview.noPreview')}
                        </p>
                    </div>
                </div>
            )}
        </AppCard>
    );
}

```


## FILE: resources\js\features\contracts\components\ContractWorkflow.tsx
```
import { CheckCircle2, Circle, Clock3 } from 'lucide-react';
import { AppCard } from '@/components/ui/AppCard';
import { AppBadge } from '@/components/ui/AppBadge';
import { useTranslation } from '@/lib/i18n';

const steps = [
    {
        key: 'calculation',
        done: true,
    },
    {
        key: 'docxGenerated',
        done: true,
    },
    {
        key: 'pdfGenerated',
        done: false,
    },
    {
        key: 'givenToClient',
        done: false,
    },
    {
        key: 'ownerSigned',
        done: false,
    },
    {
        key: 'submitted',
        done: false,
    },
    {
        key: 'returned',
        done: false,
    },
];

export function ContractWorkflow() {
    const { t } = useTranslation();

    return (
        <AppCard className="p-5">
            <div className="mb-4">
                <h2 className="text-sm font-semibold">{t('contractsWorkspace.workflow.title')}</h2>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                    {t('contractsWorkspace.workflow.description')}
                </p>
            </div>

            <div className="space-y-3">
                {steps.map((step, index) => {
                    const active = index === 2;

                    return (
                        <div key={step.key} className="flex items-center gap-3 rounded-2xl border bg-[var(--surface)] p-3">
                            <div className="flex size-8 items-center justify-center rounded-full bg-[var(--surface-2)]">
                                {step.done ? (
                                    <CheckCircle2 size={16} className="text-[var(--success)]" />
                                ) : active ? (
                                    <Clock3 size={16} className="text-[var(--warning)]" />
                                ) : (
                                    <Circle size={16} className="text-[var(--text-muted)]" />
                                )}
                            </div>

                            <p className="flex-1 text-sm font-medium">
                                {t(`contractsWorkspace.workflow.${step.key}`)}
                            </p>

                            <AppBadge tone={step.done ? 'green' : active ? 'amber' : 'neutral'}>
                                {step.done ? t('common.completed') : active ? t('common.pending') : t('common.ready')}
                            </AppBadge>
                        </div>
                    );
                })}
            </div>
        </AppCard>
    );
}

```


## FILE: resources\js\features\contracts\data\mockContracts.ts
```
export type ContractStatus =
    | 'draft'
    | 'calculated'
    | 'generated'
    | 'givenToClient'
    | 'signed'
    | 'submitted'
    | 'returned'
    | 'completed'
    | 'cancelled';

export type ContractRow = {
    id: number;
    contractNumber: string;
    dossierNumber: string;
    projectObject: string;
    client: string;
    cin: string;
    status: ContractStatus;
    surface: number;
    pricePerMeter: number;
    estimation: number;
    honorairesRate: number;
    ht: number;
    tvaRate: number;
    tvaAmount: number;
    ttc: number;
    template: string;
    version: string;
    fileName: string;
    lastGenerated: string;
    updatedAt: string;
};

export const contractRows: ContractRow[] = [
    {
        id: 1,
        contractNumber: 'CTR-2026-0001',
        dossierNumber: 'DOS-2026-0001',
        projectObject: 'Villa construction study',
        client: 'Mohamed Ouknin',
        cin: 'EE123456',
        status: 'calculated',
        surface: 280,
        pricePerMeter: 120,
        estimation: 33600,
        honorairesRate: 2,
        ht: 28000,
        tvaRate: 20,
        tvaAmount: 5600,
        ttc: 33600,
        template: "CONTRAT D'ARCHITECTE",
        version: 'v1',
        fileName: 'contract-dos-2026-0001.docx',
        lastGenerated: 'Not generated',
        updatedAt: 'Today',
    },
    {
        id: 2,
        contractNumber: 'CTR-2026-0002',
        dossierNumber: 'DOS-2026-0002',
        projectObject: 'Apartment renovation',
        client: 'Salma El Mansouri',
        cin: 'BK884210',
        status: 'signed',
        surface: 140,
        pricePerMeter: 120,
        estimation: 16800,
        honorairesRate: 2,
        ht: 14000,
        tvaRate: 20,
        tvaAmount: 2800,
        ttc: 16800,
        template: "CONTRAT D'ARCHITECTE",
        version: 'v2',
        fileName: 'contract-dos-2026-0002.pdf',
        lastGenerated: 'Yesterday',
        updatedAt: 'Yesterday',
    },
    {
        id: 3,
        contractNumber: 'CTR-2026-0003',
        dossierNumber: 'DOS-2026-0004',
        projectObject: 'Riad restoration',
        client: 'Nadia Amrani',
        cin: 'MA778845',
        status: 'generated',
        surface: 360,
        pricePerMeter: 110,
        estimation: 39600,
        honorairesRate: 2,
        ht: 33000,
        tvaRate: 20,
        tvaAmount: 6600,
        ttc: 39600,
        template: "CONTRAT D'ARCHITECTE",
        version: 'v1',
        fileName: 'contract-dos-2026-0004.docx',
        lastGenerated: '4 days ago',
        updatedAt: '4 days ago',
    },
];

export function getContractMetrics() {
    return {
        total: contractRows.length,
        generated: contractRows.filter((contract) => ['generated', 'signed', 'submitted', 'returned', 'completed'].includes(contract.status)).length,
        signed: contractRows.filter((contract) => ['signed', 'submitted', 'returned', 'completed'].includes(contract.status)).length,
        pending: contractRows.filter((contract) => ['draft', 'calculated', 'givenToClient'].includes(contract.status)).length,
    };
}

export function formatMoney(value: number) {
    return new Intl.NumberFormat('en-MA', {
        style: 'currency',
        currency: 'MAD',
        maximumFractionDigits: 0,
    }).format(value);
}

```


## FILE: resources\js\features\contracts\drawers\ContractDrawer.tsx
```
import { FormEvent, useEffect, useMemo, useState } from 'react';
import type { Key } from 'react-aria-components';
import { AppButton } from '@/components/ui/AppButton';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppFormErrorSummary } from '@/components/ui/AppFormErrorSummary';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppTextField } from '@/components/ui/AppTextField';
import { AppTextarea } from '@/components/ui/AppTextarea';
import type {
    ContractDossierOption,
    ContractFormPayload,
    ContractRow,
} from '@/features/contracts/types';
import type { FormErrors } from '@/lib/formErrors';
import { firstError } from '@/lib/formErrors';

type ContractDrawerProps = {
    isOpen: boolean;
    mode: 'create' | 'edit';
    contract: ContractRow | null;
    dossiers: ContractDossierOption[];
    initialDossierId?: string;
    onOpenChange: (isOpen: boolean) => void;
    onSubmit: (payload: ContractFormPayload) => void;
    errors?: FormErrors;
};

const emptyForm: ContractFormPayload = {
    dossierId: '',
    status: 'draft',
    surface: '',
    pricePerSquareMeter: '900',
    calculationMode: 'percentage',
    feeRatePercent: '0.5',
    forfaitTtc: '',
    notes: '',
};

const statusOptions = [
    { id: 'draft', label: 'Draft' },
    { id: 'generated', label: 'Generated' },
    { id: 'signed', label: 'Signed' },
    { id: 'cancelled', label: 'Cancelled' },
];

const calculationModeOptions = [
    { id: 'percentage', label: 'Percentage 0.5% / 2%' },
    { id: 'forfait', label: 'FORFAIT - enter TTC' },
];

const feeRateOptions = [
    { id: '0.5', label: '0.5%' },
    { id: '2', label: '2%' },
];

function parseAmount(value: string): number {
    return Number(String(value || '0').replace(',', '.')) || 0;
}

function formatMoney(value: number): string {
    return new Intl.NumberFormat('fr-MA', {
        style: 'currency',
        currency: 'MAD',
        maximumFractionDigits: 2,
    }).format(value);
}

export function ContractDrawer({
    isOpen,
    mode,
    contract,
    dossiers,
    initialDossierId = '',
    onOpenChange,
    onSubmit,
    errors = {},
}: ContractDrawerProps) {
    const [form, setForm] = useState<ContractFormPayload>(emptyForm);

    const dossierOptions = useMemo(
        () =>
            dossiers.map((dossier) => ({
                id: dossier.id,
                label:
                    mode === 'create' && dossier.hasContract
                        ? `${dossier.label} - already has contract`
                        : dossier.label,
            })),
        [dossiers, mode],
    );

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        if (mode === 'edit' && contract) {
            setForm({
                dossierId: contract.dossierId || '',
                status: contract.status || 'draft',
                surface: contract.surface ? String(contract.surface) : '',
                pricePerSquareMeter: contract.pricePerSquareMeter
                    ? String(contract.pricePerSquareMeter)
                    : '900',
                calculationMode: contract.calculationMode || 'percentage',
                feeRatePercent: contract.feeRatePercent
                    ? String(contract.feeRatePercent)
                    : '0.5',
                forfaitTtc: contract.forfaitTtc ? String(contract.forfaitTtc) : '',
                notes: contract.notes || '',
            });

            return;
        }

        const initialDossier = dossiers.find((dossier) => dossier.id === initialDossierId);

        setForm({
            ...emptyForm,
            dossierId: initialDossierId,
            surface: initialDossier?.floorArea ? String(initialDossier.floorArea) : '',
        });
    }, [contract, dossiers, initialDossierId, isOpen, mode]);

    function updateField(field: keyof ContractFormPayload, value: string) {
        setForm((current) => ({ ...current, [field]: value }));
    }

    function updateSelect(field: keyof ContractFormPayload, value: Key | null) {
        setForm((current) => ({ ...current, [field]: value ? String(value) : '' }));
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        onSubmit(form);
    }

    const isForfait = form.calculationMode === 'forfait';
    const surface = parseAmount(form.surface);
    const pricePerSquareMeter = parseAmount(form.pricePerSquareMeter);
    const estimation = surface * pricePerSquareMeter;
    const ht = isForfait ? parseAmount(form.forfaitTtc) / 1.2 : estimation * (parseAmount(form.feeRatePercent) / 100);
    const tva = isForfait ? parseAmount(form.forfaitTtc) - ht : ht * 0.2;
    const ttc = isForfait ? parseAmount(form.forfaitTtc) : ht + tva;

    return (
        <AppDrawer
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            title={mode === 'create' ? 'Create contract' : 'Edit contract'}
            description="Save contract calculation to the database. Use FORFAIT when the client has a fixed TTC price."
            footer={
                <>
                    <AppButton variant="secondary" onPress={() => onOpenChange(false)}>
                        Cancel
                    </AppButton>

                    <AppButton variant="primary" type="submit" form="contract-form">
                        Save
                    </AppButton>
                </>
            }
        >
            <form id="contract-form" className="space-y-6" onSubmit={handleSubmit}>
                <AppFormErrorSummary errors={errors} />

                <section>
                    <h3 className="mb-3 text-sm font-semibold">Project and status</h3>

                    <div className="grid gap-4">
                        <AppSelect
                            label="Dossier / Project"
                            placeholder="Select dossier"
                            selectedKey={form.dossierId}
                            onSelectionChange={(value) => updateSelect('dossierId', value)}
                            options={dossierOptions}
                            error={firstError(errors, 'dossier_id')}
                        />

                        <AppSelect
                            label="Status"
                            selectedKey={form.status}
                            onSelectionChange={(value) => updateSelect('status', value)}
                            options={statusOptions}
                            error={firstError(errors, 'status')}
                        />
                    </div>
                </section>

                <section>
                    <h3 className="mb-3 text-sm font-semibold">Calculation</h3>

                    <div className="grid gap-4">
                        <AppSelect
                            label="Calculation mode"
                            selectedKey={form.calculationMode}
                            onSelectionChange={(value) => updateSelect('calculationMode', value)}
                            options={calculationModeOptions}
                            error={firstError(errors, 'calculation_mode')}
                        />

                        {isForfait ? (
                            <AppTextField
                                label="FORFAIT TTC"
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.forfaitTtc}
                                onChange={(value) => updateField('forfaitTtc', value)}
                                description="Enter only the final TTC amount. HT and TVA are calculated automatically."
                                error={firstError(errors, 'forfait_ttc')}
                            />
                        ) : (
                            <AppSelect
                                label="Contract rate"
                                selectedKey={form.feeRatePercent}
                                onSelectionChange={(value) => updateSelect('feeRatePercent', value)}
                                options={feeRateOptions}
                                error={firstError(errors, 'fee_rate_percent')}
                            />
                        )}
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <AppTextField
                            label="Surface"
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.surface}
                            onChange={(value) => updateField('surface', value)}
                            error={firstError(errors, 'surface')}
                        />

                        <AppTextField
                            label="Price / m2"
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.pricePerSquareMeter}
                            onChange={(value) => updateField('pricePerSquareMeter', value)}
                            error={firstError(errors, 'price_per_square_meter')}
                        />
                    </div>

                    <div className="mt-4 grid gap-2 rounded-2xl border bg-[var(--surface-2)] p-4 text-sm sm:grid-cols-3">
                        <div>
                            <p className="text-xs text-[var(--text-muted)]">HT</p>
                            <p className="mt-1 font-semibold">{formatMoney(ht)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-[var(--text-muted)]">TVA 20%</p>
                            <p className="mt-1 font-semibold">{formatMoney(tva)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-[var(--text-muted)]">TTC</p>
                            <p className="mt-1 font-semibold">{formatMoney(ttc)}</p>
                        </div>
                    </div>
                </section>

                <section>
                    <AppTextarea
                        label="Notes"
                        value={form.notes}
                        onChange={(value) => updateField('notes', value)}
                        error={firstError(errors, 'notes')}
                    />
                </section>
            </form>
        </AppDrawer>
    );
}

```


## FILE: resources\js\features\contracts\types.ts
```
export type ContractStatus = 'draft' | 'generated' | 'signed' | 'cancelled' | string;

export type ContractRow = {
    id: number;
    dossierId: string;
    dossierNumber: string;
    projectObject: string;
    clientName: string;
    clientCin: string;

    contractNumber: string;
    status: ContractStatus;

    surface: number;
    pricePerSquareMeter: number;
    calculationMode: 'percentage' | 'forfait' | string;
    feeRatePercent: number;
    forfaitTtc: number | null;
    ht: number;
    tva: number;
    ttc: number;

    generatedDocumentPath: string | null;
    pdfPath: string | null;
    generatedAt: string | null;
    signedAt: string | null;
    updatedAt: string | null;
    createdAt: string | null;
    notes: string | null;

    hasGeneratedDocument: boolean;
    hasPdf: boolean;
    generatedDocumentDownloadUrl: string | null;
    pdfDownloadUrl: string | null;
    generatedDocumentPublicUrl: string | null;
    pdfPublicUrl: string | null;
};

export type ContractDossierOption = {
    id: string;
    label: string;
    floorArea: number | null;
    hasContract: boolean;
};

export type ContractFormPayload = {
    dossierId: string;
    status: string;
    surface: string;
    pricePerSquareMeter: string;
    calculationMode: string;
    feeRatePercent: string;
    forfaitTtc: string;
    notes: string;
};

```


# SEARCH IMPORTANT PATTERNS



## Search: HeroUIProvider
```

```


## Search: @heroui/react
```
resources\js\components\ui\AppModal.tsx:1: import { Modal, ModalBody, ModalHeader, ModalHeading, ModalCloseTrigger } from '@heroui/react';
resources\js\components\ui\AvatarPill.tsx:1: import { Avatar } from '@heroui/react';
resources\js\app.tsx:3: import '@heroui/react/styles';

```


## Search: DataTable
```
resources\js\components\ui\AppDataTable.tsx:26: type AppDataTableProps<TData extends object> = {
resources\js\components\ui\AppDataTable.tsx:39: export function AppDataTable<TData extends object>({
resources\js\components\ui\AppDataTable.tsx:50: }: AppDataTableProps<TData>) {
resources\js\pages\Clients\Index.tsx:10: import { AppDataTable } from '@/components/ui/AppDataTable';
resources\js\pages\Clients\Index.tsx:223: <AppDataTable
resources\js\pages\Contracts\Index.tsx:9: import { AppDataTable } from '@/components/ui/AppDataTable';
resources\js\pages\Contracts\Index.tsx:200: <AppDataTable
resources\js\pages\Documents\Index.tsx:10: import { AppDataTable } from '@/components/ui/AppDataTable';
resources\js\pages\Documents\Index.tsx:253: <AppDataTable
resources\js\pages\Dossiers\Index.tsx:13: import { AppDataTable } from '@/components/ui/AppDataTable';
resources\js\pages\Dossiers\Index.tsx:316: <AppDataTable
resources\js\pages\Finance\Index.tsx:22: import { AppDataTable } from '@/components/ui/AppDataTable';
resources\js\pages\Finance\Index.tsx:516: <AppDataTable
resources\js\pages\Intermediaries\Index.tsx:10: import { AppDataTable } from '@/components/ui/AppDataTable';
resources\js\pages\Intermediaries\Index.tsx:236: <AppDataTable
resources\js\pages\Planning\Index.tsx:20: import { AppDataTable } from '@/components/ui/AppDataTable';
resources\js\pages\Planning\Index.tsx:297: <AppDataTable

```


## Search: PageHeader
```
resources\js\components\layout\AppPageHeader.tsx:4: type AppPageHeaderProps = {
resources\js\components\layout\AppPageHeader.tsx:11: export function AppPageHeader({
resources\js\components\layout\AppPageHeader.tsx:16: }: AppPageHeaderProps) {
resources\js\components\layout\AppShell.tsx:5: import { AppPageHeader } from '@/components/ui/AppPageHeader';
resources\js\components\layout\AppShell.tsx:49: <AppPageHeader
resources\js\components\ui\AppPageHeader.tsx:4: type AppPageHeaderProps = {
resources\js\components\ui\AppPageHeader.tsx:13: export function AppPageHeader({
resources\js\components\ui\AppPageHeader.tsx:20: }: AppPageHeaderProps) {

```


## Search: PageToolbar
```

```


## Search: StatusPill
```

```


## Search: AppShell
```
resources\js\components\layout\AppShell.tsx:8: type AppShellProps = {
resources\js\components\layout\AppShell.tsx:18: export function AppShell({ eyebrowKey, titleKey, subtitleKey, action, children, fullBleed, hideMobileNav }: AppShellProps) {
resources\js\pages\Admin\Users\Index.tsx:19: import { AppShell } from '@/components/layout/AppShell';
resources\js\pages\Admin\Users\Index.tsx:178: <AppShell
resources\js\pages\Admin\Users\Index.tsx:491: </AppShell>
resources\js\pages\Archives\Index.tsx:19: import { AppShell } from '@/components/layout/AppShell';
resources\js\pages\Archives\Index.tsx:610: <AppShell
resources\js\pages\Archives\Index.tsx:860: </AppShell>
resources\js\pages\Authorizations\Index.tsx:19: import { AppShell } from '@/components/layout/AppShell';
resources\js\pages\Authorizations\Index.tsx:431: <AppShell
resources\js\pages\Authorizations\Index.tsx:658: </AppShell>
resources\js\pages\BackendQa\Index.tsx:10: import { AppShell } from '@/components/layout/AppShell';
resources\js\pages\BackendQa\Index.tsx:65: <AppShell
resources\js\pages\BackendQa\Index.tsx:226: </AppShell>
resources\js\pages\Calendar\Index.tsx:4: import { AppShell } from '@/components/layout/AppShell';
resources\js\pages\Calendar\Index.tsx:197: <AppShell
resources\js\pages\Calendar\Index.tsx:275: </AppShell>
resources\js\pages\Clients\Index.tsx:8: import { AppShell } from '@/components/layout/AppShell';
resources\js\pages\Clients\Index.tsx:205: <AppShell
resources\js\pages\Clients\Index.tsx:348: </AppShell>
resources\js\pages\Clients\Show.tsx:11: import { AppShell } from '@/components/layout/AppShell';
resources\js\pages\Clients\Show.tsx:310: <AppShell
resources\js\pages\Clients\Show.tsx:428: </AppShell>
resources\js\pages\Contracts\Index.tsx:7: import { AppShell } from '@/components/layout/AppShell';
resources\js\pages\Contracts\Index.tsx:181: <AppShell
resources\js\pages\Contracts\Index.tsx:299: </AppShell>
resources\js\pages\Documents\Index.tsx:8: import { AppShell } from '@/components/layout/AppShell';
resources\js\pages\Documents\Index.tsx:195: <AppShell
resources\js\pages\Documents\Index.tsx:364: </AppShell>
resources\js\pages\Dossiers\Index.tsx:11: import { AppShell } from '@/components/layout/AppShell';
resources\js\pages\Dossiers\Index.tsx:247: <AppShell
resources\js\pages\Dossiers\Index.tsx:367: </AppShell>
resources\js\pages\Dossiers\Show.tsx:18: import { AppShell } from '@/components/layout/AppShell';
resources\js\pages\Dossiers\Show.tsx:209: <AppShell
resources\js\pages\Dossiers\Show.tsx:475: </AppShell>
resources\js\pages\Finance\Documents\Index.tsx:24: import { AppShell } from '@/components/layout/AppShell';
resources\js\pages\Finance\Documents\Index.tsx:860: <AppShell
resources\js\pages\Finance\Documents\Index.tsx:964: </AppShell>
resources\js\pages\Finance\Documents\Show.tsx:22: import { AppShell } from '@/components/layout/AppShell';
resources\js\pages\Finance\Documents\Show.tsx:213: <AppShell
resources\js\pages\Finance\Documents\Show.tsx:509: </AppShell>
resources\js\pages\Finance\Settings\Index.tsx:15: import { AppShell } from '@/components/layout/AppShell';
resources\js\pages\Finance\Settings\Index.tsx:358: <AppShell
resources\js\pages\Finance\Settings\Index.tsx:564: </AppShell>
resources\js\pages\Finance\Templates\Index.tsx:16: import { AppShell } from '@/components/layout/AppShell';
resources\js\pages\Finance\Templates\Index.tsx:288: <AppShell
resources\js\pages\Finance\Templates\Index.tsx:561: </AppShell>
resources\js\pages\Finance\Templates\Versions.tsx:5: import { AppShell } from '@/components/layout/AppShell';
resources\js\pages\Finance\Templates\Versions.tsx:147: <AppShell
resources\js\pages\Finance\Templates\Versions.tsx:369: </AppShell>
resources\js\pages\Finance\Index.tsx:18: import { AppShell } from '@/components/layout/AppShell';
resources\js\pages\Finance\Index.tsx:458: <AppShell
resources\js\pages\Finance\Index.tsx:683: </AppShell>
resources\js\pages\Finance\Settings.tsx:4: import { AppShell } from '@/components/layout/AppShell';
resources\js\pages\Finance\Settings.tsx:121: <AppShell
resources\js\pages\Finance\Settings.tsx:168: </AppShell>
resources\js\pages\FrontendQa\Index.tsx:12: import { AppShell } from '@/components/layout/AppShell';
resources\js\pages\FrontendQa\Index.tsx:80: <AppShell
resources\js\pages\FrontendQa\Index.tsx:262: </AppShell>
resources\js\pages\Inbox\Index.tsx:6: import { AppShell } from '@/components/layout/AppShell';
resources\js\pages\Inbox\Index.tsx:546: <AppShell fullBleed hideMobileNav={selectedConv !== null}>
resources\js\pages\Inbox\Index.tsx:638: </AppShell>
resources\js\pages\Intermediaries\Index.tsx:6: import { AppShell } from '@/components/layout/AppShell';
resources\js\pages\Intermediaries\Index.tsx:216: <AppShell
resources\js\pages\Intermediaries\Index.tsx:268: </AppShell>
resources\js\pages\Notifications\Index.tsx:5: import { AppShell } from '@/components/layout/AppShell';
resources\js\pages\Notifications\Index.tsx:50: <AppShell eyebrowKey="nav.notifications" titleKey="nav.notifications" subtitleKey="Task updates, chat messages, and system alerts"
resources\js\pages\Notifications\Index.tsx:132: </AppShell>
resources\js\pages\Operations\Reports.tsx:3: import { AppShell } from '@/components/layout/AppShell';
resources\js\pages\Operations\Reports.tsx:40: <AppShell eyebrowKey="nav.tasks" titleKey="nav.tasks" subtitleKey="Operations reports">
resources\js\pages\Operations\Reports.tsx:138: </AppShell>
resources\js\pages\Planning\Index.tsx:16: import { AppShell } from '@/components/layout/AppShell';
resources\js\pages\Planning\Index.tsx:247: <AppShell
resources\js\pages\Planning\Index.tsx:340: </AppShell>
resources\js\pages\TaskRequests\Index.tsx:5: import { AppShell } from '@/components/layout/AppShell';
resources\js\pages\TaskRequests\Index.tsx:69: <AppShell eyebrowKey="nav.tasks" titleKey="nav.tasks" subtitleKey="Operations intake requests">
resources\js\pages\TaskRequests\Index.tsx:170: </AppShell>
resources\js\pages\Tasks\Index.tsx:5: import { AppShell } from '@/components/layout/AppShell';
resources\js\pages\Tasks\Index.tsx:257: <AppShell eyebrowKey="nav.tasks" titleKey="nav.tasks" subtitleKey="Track and organize all office operations in one place."
resources\js\pages\Tasks\Index.tsx:386: </AppShell>
resources\js\pages\Workload\Index.tsx:2: import { AppShell } from '@/components/layout/AppShell';
resources\js\pages\Workload\Index.tsx:18: <AppShell eyebrowKey="nav.tasks" titleKey="nav.tasks" subtitleKey="Team workload summary">
resources\js\pages\Workload\Index.tsx:54: </AppShell>
resources\js\pages\Dashboard.tsx:25: import { AppShell } from '@/components/layout/AppShell';
resources\js\pages\Dashboard.tsx:106: <AppShell
resources\js\pages\Dashboard.tsx:502: </AppShell>

```


## Search: AppSidebar
```
resources\js\components\layout\AppShell.tsx:3: import { AppSidebar } from '@/components/layout/AppSidebar';
resources\js\components\layout\AppShell.tsx:25: <AppSidebar />
resources\js\components\layout\AppSidebar.tsx:43: export function AppSidebar() {

```


## Search: BottomNav
```
resources\js\config\archilboTheme.ts:6: mobileBottomNavHeight: 72,
resources\js\config\archilboTheme.ts:76: '--mobile-bottom-nav-h': `${layout.mobileBottomNavHeight}px`,

```


## Search: router.post
```
resources\js\components\layout\AppSidebar.tsx:163: <button type="button" onClick={() => router.post('/logout')}
resources\js\components\layout\AppSidebar.tsx:196: <button type="button" onClick={() => { router.post('/logout'); setUserOpen(false); }}
resources\js\components\layout\AppSidebar.tsx:345: <button type="button" onClick={() => { router.post('/logout'); setUserOpen(false); }}
resources\js\components\layout\AppTopbar.tsx:10: router.post('/logout');
resources\js\features\calendar\components\CalendarEventDrawer.tsx:69: router.post('/calendar/events', form, {
resources\js\features\finance\components\FinanceDocumentActions.tsx:38: router.post(url, {}, {
resources\js\features\finance\drawers\FinanceDocumentBuilderDrawer.tsx:242: router.post('/finance/documents', payload, options);
resources\js\features\finance\drawers\PaymentDrawer.tsx:102: router.post('/finance/payments', {
resources\js\features\notifications\components\NotificationPopover.tsx:34: <button type="button" onClick={(e) => { e.stopPropagation(); router.post(`/notifications/${id}/read`, {}, { preserveScroll: true, onSuccess: () => toast.success('Marked as read.') }); }}
resources\js\features\notifications\components\NotificationPopover.tsx:47: router.post(`/notifications/${n.id}/read`, {}, { preserveScroll: true });
resources\js\features\notifications\components\NotificationPopover.tsx:128: router.post('/notifications/read-all', {}, { preserveScroll: true, onSuccess: () => toast.success('All marked as read.') });
resources\js\features\tasks\components\TaskRequestCreateDrawer.tsx:80: router.post('/task-requests', form, {
resources\js\pages\Admin\Users\Index.tsx:450: router.post('/admin/users/invite', inviteForm, {
resources\js\pages\Archives\Index.tsx:563: router.post('/archives', backendPayload, {
resources\js\pages\Auth\AcceptInvitation.tsx:23: router.post(`/accept-invitation/${token}`, form, {
resources\js\pages\Auth\Login.tsx:71: router.post('/login', form, {
resources\js\pages\Authorizations\Index.tsx:384: router.post('/authorizations', backendPayload, {
resources\js\pages\Clients\Index.tsx:107: router.post('/clients', toBackendPayload(payload), {
resources\js\pages\Clients\Show.tsx:203: router.post('/dossiers', { ...dossierPayload(payload), return_to: `/clients/${client.id}` }, {
resources\js\pages\Clients\Show.tsx:226: router.post('/documents', formData, {
resources\js\pages\Clients\Show.tsx:253: router.post('/finance/documents', {
resources\js\pages\Clients\Show.tsx:282: router.post('/archives', {
resources\js\pages\Clients\Show.tsx:296: router.post('/contracts', { ...contractPayload(payload), return_to: returnTo }, {
resources\js\pages\Contracts\Index.tsx:86: router.post('/contracts', payload, {
resources\js\pages\Documents\Index.tsx:83: router.post('/documents', formData, {
resources\js\pages\Dossiers\Index.tsx:125: router.post('/dossiers', backendPayload, {
resources\js\pages\Finance\Documents\Index.tsx:824: router.post(url, {}, {
resources\js\pages\Finance\Documents\Show.tsx:177: router.post(url, {}, {
resources\js\pages\Finance\Settings\Index.tsx:330: router.post(routes.uploadLogo, formData, {
resources\js\pages\Finance\Templates\Index.tsx:219: router.post(routes.store, {
resources\js\pages\Finance\Templates\Index.tsx:243: router.post(template.urls.duplicate, {}, {
resources\js\pages\Finance\Templates\Versions.tsx:104: router.post(
resources\js\pages\Finance\Templates\Versions.tsx:129: router.post(`/finance/templates/${template.id}/versions/${version.id}/restore`, {}, {
resources\js\pages\Finance\Index.tsx:209: router.post('/finance', backendPayload, {
resources\js\pages\Inbox\Index.tsx:519: router.post('/inbox', {
resources\js\pages\Intermediaries\Index.tsx:92: router.post('/intermediaries', toBackendPayload(payload), {
resources\js\pages\Notifications\Index.tsx:34: router.post(`/notifications/${id}/read`, {}, {
resources\js\pages\Notifications\Index.tsx:41: router.post('/notifications/read-all', {}, {
resources\js\pages\TaskRequests\Index.tsx:38: router.post(url, data, {
resources\js\pages\Tasks\Index.tsx:156: router.post('/tasks', payload, {
resources\js\pages\Tasks\Index.tsx:220: router.post(`/tasks/${taskId}/checklist`, { label }, { preserveScroll: true, onSuccess: () => toast.success('Checklist item added.'), onError: () => toast.error('Checklist item could not be added.') });
resources\js\pages\Tasks\Index.tsx:224: router.post(`/tasks/${taskId}/comments`, { body, is_note: false }, { preserveScroll: true, onSuccess: () => toast.success('Comment added.'), onError: () => toast.error('Comment could not be added.') });
resources\js\pages\Tasks\Index.tsx:228: router.post(`/tasks/${taskId}/attachments`, { file }, { forceFormData: true, preserveScroll: true, onSuccess: () => toast.success('Attachment uploaded.'), onError: () => toast.error('Attachment upload failed.') });

```


## Search: router.put
```
resources\js\features\calendar\components\CalendarEventDrawer.tsx:63: router.put(`/calendar/events/${editEvent!.id}`, form, {
resources\js\features\clients\components\ClientProjectWorkflowStepper.tsx:46: router.put(`/dossiers/${dossierId}/workflow-requirements`, {
resources\js\features\finance\components\FinanceDocumentActions.tsx:24: router.put(url, {}, {
resources\js\features\finance\drawers\FinanceDocumentBuilderDrawer.tsx:238: router.put(`/finance/documents/${document.id}`, payload, options);
resources\js\features\finance\drawers\PaymentDrawer.tsx:143: router.put(url, {}, {
resources\js\features\tasks\components\TaskCard.tsx:44: onClick={(e) => { e.stopPropagation(); setMenuOpen(false); router.put(`/tasks/${task.id}/status`, { status }, { preserveScroll: true, preserveState: true }); }}
resources\js\features\tasks\components\TaskDetailDrawer.tsx:213: <button key={action.s} type="button" onClick={() => router.put(`/tasks/${task.id}/status`, { status: action.s }, { preserveScroll: true, preserveState: true })}
resources\js\pages\Admin\Users\Index.tsx:163: router.put(
resources\js\pages\Archives\Index.tsx:547: router.put(`/archives/${selectedArchive.id}`, backendPayload, {
resources\js\pages\Archives\Index.tsx:578: router.put(
resources\js\pages\Authorizations\Index.tsx:368: router.put(`/authorizations/${selectedAuthorization.id}`, backendPayload, {
resources\js\pages\Authorizations\Index.tsx:399: router.put(
resources\js\pages\Clients\Index.tsx:100: router.put(`/clients/${selectedClient.id}`, toBackendPayload(payload, selectedClient.status), {
resources\js\pages\Contracts\Index.tsx:79: router.put(`/contracts/${selectedContract.id}`, payload, {
resources\js\pages\Documents\Index.tsx:91: router.put(`/documents/${document.id}/status`, { status, notes: document.notes || '' }, {
resources\js\pages\Dossiers\Index.tsx:117: router.put(`/dossiers/${selectedDossier.id}`, backendPayload, {
resources\js\pages\Finance\Documents\Index.tsx:811: router.put(url, {}, {
resources\js\pages\Finance\Documents\Show.tsx:164: router.put(url, {}, {
resources\js\pages\Finance\Settings\Index.tsx:299: router.put(routes.update, toPayload(form), {
resources\js\pages\Finance\Settings\Index.tsx:312: router.put(routes.reset, {}, {
resources\js\pages\Finance\Templates\Index.tsx:211: router.put(draft.urls.update, templatePayload(draft), {
resources\js\pages\Finance\Templates\Index.tsx:235: router.put(resetUrlFor(selectedType, routes), {}, {
resources\js\pages\Finance\Templates\Index.tsx:264: router.put(template.urls.setDefault, {}, {
resources\js\pages\Finance\Index.tsx:194: router.put(`/finance/${selectedRecord.id}`, backendPayload, {
resources\js\pages\Finance\Index.tsx:223: router.put(`/finance/${record.id}/paid`, {}, {
resources\js\pages\Finance\Index.tsx:240: router.put(`/finance/${record.id}/generate`, {}, {
resources\js\pages\Finance\Index.tsx:256: router.put(`/finance/${record.id}/export-pdf`, {}, {
resources\js\pages\Finance\Settings.tsx:47: router.put(
resources\js\pages\Intermediaries\Index.tsx:78: router.put(`/intermediaries/${selectedIntermediary.id}`, toBackendPayload(payload), {
resources\js\pages\Tasks\Index.tsx:191: router.put(`/tasks/${task.id}/status`, { status }, {
resources\js\pages\Tasks\Index.tsx:212: router.put(`/tasks/${taskId}/checklist/${itemId}/toggle`, {}, {

```


## Search: router.delete
```
resources\js\pages\Archives\Index.tsx:596: router.delete(`/archives/${deleteTarget.id}`, {
resources\js\pages\Authorizations\Index.tsx:417: router.delete(`/authorizations/${deleteTarget.id}`, {
resources\js\pages\Clients\Index.tsx:116: router.delete(`/clients/${deleteTarget.id}`, {
resources\js\pages\Contracts\Index.tsx:95: router.delete(`/contracts/${deleteTarget.id}`, {
resources\js\pages\Documents\Index.tsx:100: router.delete(`/documents/${deleteTarget.id}`, {
resources\js\pages\Dossiers\Index.tsx:134: router.delete(`/dossiers/${deleteTarget.id}`, {
resources\js\pages\Finance\Documents\Index.tsx:834: router.delete(deleteTarget.deleteUrl || `/finance/documents/${deleteTarget.id}`, {
resources\js\pages\Finance\Documents\Show.tsx:200: router.delete(document.deleteUrl, {
resources\js\pages\Finance\Settings\Index.tsx:346: router.delete(routes.deleteLogo, {
resources\js\pages\Finance\Templates\Index.tsx:256: router.delete(`/finance/templates/${deleteTarget.id}`, {
resources\js\pages\Finance\Templates\Versions.tsx:135: router.delete(`/finance/templates/${template.id}/versions/${version.id}`, {
resources\js\pages\Finance\Index.tsx:232: router.delete(`/finance/${deleteTarget.id}`, {
resources\js\pages\Intermediaries\Index.tsx:107: router.delete(`/intermediaries/${deleteTarget.id}`, {

```


## Search: fetch(
```
resources\js\components\layout\AppGlobalSearch.tsx:63: fetch(`/global-search?q=${encodeURIComponent(cleanQuery)}`, {
resources\js\features\inbox\components\MessageThread.tsx:296: const res = await fetch(`/inbox/${conversation.id}/messages/${editingMsg.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': (window as any).csrfToken || '' }, body: JSON.stringify({ body }) });
resources\js\features\inbox\components\MessageThread.tsx:312: fetch(`/inbox/${conversation.id}/messages/${msg.id}`, { method: 'DELETE', headers: { 'X-CSRF-TOKEN': (window as any).csrfToken || '' } }).then((res) => { if (res.ok) onMessageDelete?.(msg.id); }).catch(() => {});
resources\js\features\inbox\components\MessageThread.tsx:337: const res = await fetch(`/inbox/${conversation.id}/messages/${forwardMsg.id}/forward`, {
resources\js\features\inbox\components\MessageThread.tsx:357: const res = await fetch(`/inbox/${conversation.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': (window as any).csrfToken || '' }, body: JSON.stringify({ subject: groupSubject.trim() }) });
resources\js\features\inbox\components\MessageThread.tsx:365: const res = await fetch(`/inbox/${conversation.id}/participants`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': (window as any).csrfToken || '' }, body: JSON.stringify({ user_id: Number(addUserId) }) });
resources\js\features\inbox\components\MessageThread.tsx:372: const res = await fetch(`/inbox/${conversation.id}/participants/${userId}`, { method: 'DELETE', headers: { 'X-CSRF-TOKEN': (window as any).csrfToken || '' } });
resources\js\features\tasks\components\TaskDetailDrawer.tsx:47: fetch(`/tasks/${task.id}/detail`, {
resources\js\pages\Calendar\Index.tsx:99: fetch(`/calendar/events/${id}`)
resources\js\pages\Calendar\Index.tsx:115: fetch(`/calendar/events/${event.id}`)
resources\js\pages\Calendar\Index.tsx:146: fetch(`/calendar/events/${id}/move`, {
resources\js\pages\Calendar\Index.tsx:166: fetch(`/calendar/events/${id}/resize`, {
resources\js\pages\Finance\Templates\Index.tsx:275: const response = await fetch(draft.urls.preview, { headers: { Accept: 'application/json' } });
resources\js\pages\Inbox\Index.tsx:205: fetch('/inbox/archived')
resources\js\pages\Inbox\Index.tsx:364: fetch(`/inbox/${conv.id}?page=1`)
resources\js\pages\Inbox\Index.tsx:381: fetch(`/inbox/${selectedConv.id}?page=${nextPage}`)
resources\js\pages\Inbox\Index.tsx:403: fetch(url, {
resources\js\pages\Inbox\Index.tsx:476: promise = fetch(`/inbox/${selectedConv.id}/messages`, {
resources\js\pages\Inbox\Index.tsx:482: promise = fetch(`/inbox/${selectedConv.id}/messages`, {

```


## Search: route(
```
resources\js\pages\FrontendQa\Index.tsx:51: function openRoute(href: string) {
resources\js\pages\FrontendQa\Index.tsx:137: onPress={() => openRoute(route.href)}
resources\js\pages\FrontendQa\Index.tsx:218: onPress={() => openRoute(project.href)}

```


## Search: console.debug
```

```


## Search: TODO
```
resources\js\features\calendar\components\CalendarRightPanel.tsx:1: import { CalendarDays, ListTodo, StickyNote, Bell, AlertTriangle, Plus } from 'lucide-react';
resources\js\features\calendar\components\CalendarRightPanel.tsx:115: <ListTodo size={14} className="text-[var(--crm-text-muted)]" />
resources\js\features\tasks\components\TaskOverview.tsx:1: import { AlertTriangle, CalendarDays, CheckCircle2, Clock3, Flame, ListTodo, ShieldAlert } from 'lucide-react';
resources\js\features\tasks\components\TaskOverview.tsx:93: <KpiCard icon={ListTodo} label="Open" value={metrics.open.length} sub="Active operational work" accent="blue" />
resources\js\pages\Operations\Reports.tsx:2: import { AlertTriangle, CheckCircle2, Clock3, ListTodo, TimerOff } from 'lucide-react';
resources\js\pages\Operations\Reports.tsx:45: { label: 'Total tasks', value: report.totalTasks, icon: ListTodo, color: 'text-blue-400' },

```


## Search: fake
```
resources\js\features\frontend-qa\data\qaData.ts:81: title: 'Fake contract download',
resources\js\features\frontend-qa\data\qaData.ts:82: description: 'Download a fake contract file to prove button logic works before backend.',
resources\js\features\frontend-qa\data\qaData.ts:84: fileName: 'ARCHI-LBO-fake-contract.txt',
resources\js\features\frontend-qa\data\qaData.ts:88: title: 'Fake invoice download',
resources\js\features\frontend-qa\data\qaData.ts:89: description: 'Download a fake invoice file to prove finance button logic works before backend.',
resources\js\features\frontend-qa\data\qaData.ts:91: fileName: 'ARCHI-LBO-fake-invoice.txt',
resources\js\locales\en.ts:1216: actionsDescription: 'Test non-database actions such as fake downloads, toasts, and navigation.',
resources\js\locales\en.ts:1225: fakeDownload: 'Fake download',

```


## Search: mock
```
resources\js\features\archives\components\ArchiveFocusPanel.tsx:10: } from '@/features/archives/data/mockArchives';
resources\js\features\archives\components\ArchiveLocationPanel.tsx:3: import { ArchiveRecordRow } from '@/features/archives/data/mockArchives';
resources\js\features\authorizations\components\AuthorizationBoard.tsx:4: import { AuthorizationRow, AuthorizationStatus } from '@/features/authorizations/data/mockAuthorizations';
resources\js\features\authorizations\components\AuthorizationPreviewPanel.tsx:4: import { AuthorizationRow } from '@/features/authorizations/data/mockAuthorizations';
resources\js\features\authorizations\components\ObservationsPanel.tsx:6: import { AuthorizationObservation } from '@/features/authorizations/data/mockAuthorizations';
resources\js\features\contracts\components\ContractCalculationPanel.tsx:7: import { formatMoney } from '@/features/contracts/data/mockContracts';
resources\js\features\contracts\components\ContractPreviewPanel.tsx:4: import { ContractRow } from '@/features/contracts/data/mockContracts';
resources\js\features\dashboard\components\DashboardActivityFeed.tsx:6: import { recentActivity } from '@/features/dashboard/data/mockDashboard';
resources\js\features\dashboard\components\DashboardFinanceStats.tsx:3: import { financeRows, formatMoney, getFinanceMetrics } from '@/features/finance/data/mockFinance';
resources\js\features\dashboard\components\DashboardKpiCard.tsx:5: import { DashboardKpi } from '@/features/dashboard/data/mockDashboard';
resources\js\features\dashboard\components\DashboardModulesOverview.tsx:5: import { moduleOverview } from '@/features/dashboard/data/mockDashboard';
resources\js\features\dashboard\components\DashboardUrgentList.tsx:5: import { urgentItems } from '@/features/dashboard/data/mockDashboard';
resources\js\features\dashboard\components\DashboardWorkflow.tsx:5: import { workflowSteps } from '@/features/dashboard/data/mockDashboard';
resources\js\features\documents\components\DocumentPreviewPanel.tsx:4: import { RequiredDocumentRow } from '@/features/documents/data/mockDocuments';
resources\js\features\finance\components\FinanceBreakdownPanel.tsx:2: import { FinanceRecordRow, formatMoney } from '@/features/finance/data/mockFinance';
resources\js\features\finance\components\FinanceFocusPanel.tsx:11: } from '@/features/finance/data/mockFinance';

```


## Search: dummy
```

```


## Search: Lorem
```

```


# BUILD CHECK



## npm run build note
```
Run this separately and paste errors if it fails: npm run build
```
