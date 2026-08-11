
# ARCHI LBO OS — Project Structure & Architecture

## Overview

ARCHI LBO OS is a full-stack web application for an architecture firm's office management. It handles clients, dossiers (projects), documents (devis/invoices/receipts), physical archives, contracts, tasks, planning/calendar, notifications, chat/inbox, and more.

**Stack**: Laravel 13 (PHP 8.3) + Inertia.js 3 + React 19 + Tailwind CSS 4 + TypeScript 6
**Real-time**: Laravel Reverb (WebSocket) via Laravel Echo
**PDF/Excel**: DomPDF, PhpSpreadsheet
**AI**: Google Gemini 2 for OCR (CIN scanning)
**Auth**: Laravel Breeze / Spatie permissions

---

## Directory Structure

```
├── app/                          # Laravel backend
│   ├── Actions/                  # Single-action classes (e.g. GeneratePdf)
│   ├── Console/                  # Artisan commands
│   ├── DTO/                      # Data Transfer Objects
│   ├── Enums/                    # PHP enums
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Api/              # JSON API controllers (CIN OCR, etc.)
│   │   │   ├── Auth/             # Auth controllers
│   │   │   └── *.php             # Resource controllers
│   │   ├── Middleware/
│   │   └── Requests/             # Form request validation
│   ├── Models/                   # Eloquent models
│   ├── Notifications/            # Database/mail notifications
│   ├── Observers/                # Model observers
│   ├── Policies/                 # Authorization policies
│   ├── Providers/                # Service providers
│   ├── Services/                 # Business logic services
│   │   ├── Chat/
│   │   ├── Finance/
│   │   └── GeminiOcrService.php
│   └── Support/                  # Helpers, macros
│
├── config/                       # Laravel config files
├── database/                     # Migrations, seeders, factories
├── routes/
│   ├── web.php                   # Inertia routes (SPA)
│   ├── api.php                   # JSON API routes
│   ├── channels.php              # WebSocket channels
│   └── console.php               # Artisan console routes
│
├── resources/
│   ├── css/                      # Global CSS + Tailwind
│   └── js/                       # Frontend (React + Inertia)
│       ├── app.tsx               # Entry point — Inertia setup, Echo config
│       │
│       ├── components/           # Shared UI components
│       │   ├── layout/           # AppShell, AppSidebar, AppTopbar, AppMobileNav
│       │   └── ui/               # AppButton, AppModal, AppDrawer, AppSelect, etc.
│       │
│       ├── config/               # JS-side config
│       │   ├── navigation.ts     # Sidebar navigation routes (re-exports lib/appRoutes)
│       │   ├── theme.ts          # Theme CSS variable definitions
│       │   └── statuses.ts       # Finance/archive status configs
│       │
│       ├── features/             # Feature modules (domain logic)
│       │   ├── archives/         # Physical archive management
│       │   │   ├── components/   # Feature-specific components
│       │   │   ├── drawers/      # Drawer forms (ArchiveDrawer)
│       │   │   └── types.ts      # Feature types
│       │   ├── clients/
│       │   ├── dossiers/
│       │   ├── finance/          # Quotes, invoices, receipts
│       │   │   ├── components/
│       │   │   ├── data/
│       │   │   ├── drawers/      # FinanceDocumentBuilderDrawer
│       │   │   ├── templates/    # Template editing helpers
│       │   │   ├── types.ts
│       │   │   └── utils/
│       │   ├── documents/
│       │   ├── tasks/
│       │   ├── notifications/
│       │   ├── inbox/            # Chat/messaging
│       │   ├── calendar/
│       │   ├── contracts/
│       │   ├── settings/
│       │   └── ...               # Other feature modules
│       │
│       ├── lib/                  # Utility functions
│       │   ├── appRoutes.ts      # Route definitions for sidebar
│       │   ├── cn.ts             # clsx + tailwind-merge helper
│       │   ├── filters.ts        # Array filter/count utilities
│       │   ├── formErrors.ts     # Form error type
│       │   └── i18n.ts           # Translation hook
│       │
│       ├── pages/                # Page components (one per route)
│       │   ├── Dashboard.tsx
│       │   ├── Clients/          # Index.tsx, Show.tsx
│       │   ├── Dossiers/
│       │   ├── Documents/
│       │   ├── Finance/
│       │   │   └── Templates/    # Template studio (3-pane editor)
│       │   │       ├── Index.tsx
│       │   │       ├── Versions.tsx
│       │   │       ├── TemplatePreviewPanel.tsx
│       │   │       └── components/
│       │   │           ├── TemplateCodeEditor.tsx
│       │   │           ├── TemplateEditorForm.tsx
│       │   │           ├── TemplateList.tsx
│       │   │           ├── TemplatePlaceholderPanel.tsx
│       │   │           └── TemplateToolbar.tsx
│       │   ├── Archives/
│       │   ├── Tasks/
│       │   ├── Calendar/
│       │   └── ...
│       │
│       ├── providers/            # React context providers
│       │   ├── AppProviders.tsx  # Root provider (Router + Theme + Toasts)
│       │   ├── AppToastProvider.tsx
│       │   └── ThemeProvider.tsx # Dark/light theme context
│       │
│       └── types/                # Global TypeScript declarations
│
├── storage/                      # Laravel storage (logs, uploads, PDFs)
├── tests/                        # PHPUnit tests
├── vite.config.ts                # Vite build config
├── tsconfig.json                 # TypeScript config
├── package.json                  # Node dependencies
└── composer.json                 # PHP dependencies
```

---

## Architecture & Data Flow

### Request Lifecycle

```
Browser URL → Laravel Route (web.php) → Controller
  → Inertia::render('PageName', props) → React page component renders
  → User interacts → Inertia router.visit() / router.post() / router.put() / router.delete()
  → Server responds with new props or redirect → Inertia patches the page
```

### Key Architectural Patterns

**1. Inertia.js SPA** — No API calls for page navigation. All routing goes through Laravel controllers that return Inertia responses. Form submissions use `router.post/put/delete` which trigger Inertia visits.

**2. Feature-based organization** — Each domain (finance, archives, clients) has its own directory under `features/` containing types, components, drawers, and utils. Pages import from these features.

**3. Shared UI Kit** — Reusable components in `components/ui/` (AppButton, AppModal, AppDrawer, AppTextField, AppSelect, AppTextarea, StatusPill) are used across all features. These follow a consistent design system with CSS variables.

**4. Full-bleed workspace pattern** (newer pages) — Pages like Finance Templates use `AppShell fullBleed` to fill the entire viewport with a fixed-height 3-pane workspace. The pattern:

```
<AppShell fullBleed>
  <div className="flex h-full w-full flex-col min-h-0">
    <CompactHeaderBar />           <!-- h-14, always visible -->
    <div className="flex flex-1 min-h-0 w-full">
      <SidePanel />                <!-- fixed width, overflow-y-auto -->
      <main className="flex-1 min-w-0 min-h-0 flex flex-col">
        <!-- fills remaining space -->
      </main>
      <PreviewPanel />             <!-- fixed width, collapsible -->
    </div>
  </div>
</AppShell>
```

**5. Dark theme via CSS variables** — CSS custom properties defined in `resources/js/config/theme.ts`:

- `--surface` = card/panel background
- `--surface-2` = secondary surface (hover, inputs)
- `--accent` = amber accent color
- `--border` = border color
- `--text` / `--text-muted` / `--text-subtle` = text hierarchy
- `--background` = page background

**6. Drawer forms** — Create/edit forms use `AppDrawer` component with a slide-in panel. The drawer contains the form and submits via Inertia. Example: `ArchiveDrawer.tsx`, `FinanceDocumentBuilderDrawer.tsx`.

**7. Real-time updates** — Laravel Reverb + Echo for:

- Notifications (bell icon badge updates)
- Chat/inbox messages
- Task assignments

---

## Key Technologies


| Layer         | Technology                       | Purpose                   |
| --------------- | ---------------------------------- | --------------------------- |
| UI Framework  | React 19 + TypeScript 6          | SPA rendering             |
| Routing       | Inertia.js 3 + Laravel           | Server-driven SPA         |
| Styling       | Tailwind CSS 4 + CSS variables   | Design system             |
| UI Components | HeroUI 3 + react-aria-components | Accessible primitives     |
| Icons         | Lucide React                     | Icon set                  |
| Charts        | Recharts                         | Dashboard graphs          |
| Calendar      | FullCalendar 6                   | Planning/calendar         |
| Tables        | @tanstack/react-table            | Data tables               |
| Code editor   | @uiw/react-codemirror            | Template HTML/CSS editing |
| Forms         | react-hook-form + zod            | Form validation           |
| Animations    | framer-motion                    | Transitions               |
| Notifications | sonner                           | Toast notifications       |
| Real-time     | Laravel Reverb + Echo            | WebSocket events          |
| PDF           | DomPDF (barryvdh/laravel-dompdf) | PDF generation            |
| Excel         | PhpSpreadsheet                   | Excel export              |
| AI OCR        | Google Gemini                    | CIN document scanning     |
| Auth          | Spatie/laravel-permission        | Roles & permissions       |

---

## Feature Modules

### Clients (`features/clients/`)

- CRUD with drawer forms
- CIN scanner using Gemini OCR
- Client dashboard with dossier count

### Dossiers (`features/dossiers/`)

- Project management (address, floor area, land surface)
- Linked to clients, documents, archives, tasks
- Explorer with grouped documents

### Finance (`features/finance/`)

- Quotes (Devis), Invoices (Factures), Receipts (Recus)
- Builder drawer with items table
- PDF/Excel generation
- **Template Studio** (`pages/Finance/Templates/`): 3-pane IDE for editing document templates with live preview, CodeMirror, variable insertion

### Archives (`features/archives/`)

- Physical archive tracking (room/shelf/box/folder)
- Status flow: Ready → Stored → Checked out → Returned
- Storage browser with room/shelf drilldown
- Drawer-based create/edit

### Documents (`features/documents/`)

- File upload with grouping by dossier
- Explorer component

### Tasks (`features/tasks/`)

- Task table with status tracking
- Assignment to users

### Calendar / Planning (`features/calendar/`, `features/planning/`)

- FullCalendar integration
- Visual planning board

### Chat / Inbox (`features/inbox/`)

- Real-time messaging
- Conversation threads

### Notifications (`features/notifications/`)

- Bell icon with real-time badge count
- Notification list

---

## Page Layout Components

### AppShell (`components/layout/AppShell.tsx`)

The root layout wrapper:

```tsx
<div className="flex h-screen w-screen overflow-hidden bg-[var(--background)]">
  <AppSidebar />                    <!-- Fixed left sidebar (236px expanded, 64px rail) -->
  <div className="flex min-w-0 flex-1 flex-col h-screen overflow-hidden">
    <AppTopbar />                    <!-- Top bar with search, notifications, user menu -->
    <main className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
      {children}                     <!-- Page content -->
    </main>
  </div>
  <AppMobileNav />                  <!-- Mobile bottom navigation -->
</div>
```

**Props**: `fullBleed` — when `true`, children render directly in `main` without `AppPageContainer` wrapper. Use for workspace-style pages (Templates, Archives). Default (`false`) wraps children in `AppPageContainer` with max-width and padding for traditional page layouts.

### AppPageContainer (`components/ui/AppPageContainer.tsx`)

```tsx
<div className="w-full max-w-none flex-1 space-y-5 px-4 py-4 sm:px-6 sm:py-5">
  {children}
</div>
```

---

## Styling Convention

- **Tailwind utility classes** exclusively — no CSS modules or styled-components
- **CSS variables** for theme colors (e.g., `bg-[var(--surface)]`, `text-[var(--text-muted)]`)
- **Spacing**: `p-3/4`, `gap-2/3/4`, `h-8/9` — compact by default
- **Text sizes**: `text-xs` (12px) for labels/meta, `text-sm` (14px) for body, `text-[13px]` for mono editors
- **No emojis** — use Lucide icons only (16px default)
- **Buttons**: `h-9 max`, `rounded-xl` for primary, `rounded-lg` for inline
- **Cards/panels**: `rounded-xl border bg-[var(--surface)]` with optional `shadow-sm`

---

## Naming Conventions


| Pattern            | Example                                                       |
| -------------------- | --------------------------------------------------------------- |
| Pages              | `Index.tsx`, `Show.tsx` (PascalCase files)                    |
| Shared components  | `AppButton.tsx`, `AppModal.tsx` (`App` prefix)                |
| Feature components | `ArchiveDrawer.tsx`, `TemplateEditorForm.tsx` (domain prefix) |
| Feature types      | `types.ts` within feature folder                              |
| Feature data       | `data/` subdirectory (static data, enums)                     |
| Feature utils      | `utils/` subdirectory (helpers)                               |
| Drawers            | `drawers/*.tsx` (slide-in form panels)                        |
| Layout components  | `layout/AppShell.tsx`, `layout/AppSidebar.tsx`                |
| Exports            | Named exports + default export (both)                         |

---

## Running the Project

```bash
# Development (4 concurrent processes: server, queue, Reverb, Vite)
composer dev

# Build for production
npm run build
```

The dev command runs:

1. `php artisan serve` — Laravel dev server
2. `php artisan queue:listen` — Queue worker
3. `php artisan reverb:start --debug` — Local Reverb server
4. `npm run dev` — Vite HMR
