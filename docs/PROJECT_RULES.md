# ARCHI LBO OS — Project Rules

## Stack

Laravel + Inertia + React + TypeScript + MySQL + Tailwind CSS v4 + HeroUI v3 + React Aria Components.

HeroUI v3 is the preferred frontend component library for new UI work where useful. Existing React Aria shared components remain valid and should be migrated gradually through shared wrappers, not by rewriting every page at once.

## Main Rule

Do not code randomly.

Pipeline:

1. MERISE planning
2. MCD
3. MLD
4. MPD
5. Setup
6. Frontend prototype
7. Full frontend
8. Backend
9. Integration/testing/deployment

## UI Rule

Use the new shared frontend system:

- Tailwind CSS v4 for layout and utility styling.
- HeroUI v3 components where useful: Button, Input, Table, Tabs, Modal, Drawer, Popover, Tooltip, Chip, Avatar, Dropdown.
- React Aria Components remain allowed for existing shared primitives and for accessibility-focused wrappers.
- Keep the ARCHI LBO dark/gold CRM theme.
- Keep global CSS minimal: base height, scroll helpers, theme tokens, and shared shell/table/card utilities only.
- Use shared wrappers/components instead of page-by-page handmade UI.

Do not use:
- shadcn
- Chakra UI
- MUI
- Ant Design
- Bootstrap
- DaisyUI
- Flowbite

## Frontend Migration Rule

Work in phases:

1. Backup and audit.
2. Design foundation: providers, theme tokens, shared config, shared components.
3. App shell: sidebar, topbar, bottom nav, page header.
4. Shared components: data table, toolbar, drawer, modal, badges, cards, empty states.
5. Projects/Dossiers pilot.
6. Validate and only then migrate other pages.

Do not migrate all pages at once.
Do not change backend during frontend phases unless explicitly requested.
Do not use fake frontend data in final screens.
Every visible control must work, be connected to existing behavior, or be hidden/disabled with a clear reason.

## Backend Rule

Controllers must stay thin.
Business logic goes into Actions and Services.
Use Form Requests, Resources, Policies, Enums, and Activity Logs.

## AGent Rules

Token efficiency rules:
- Do not paste whole existing files into the response unless necessary.
- For audits, show only relevant snippets and file paths.
- For patches, edit only the needed files.
- Prefer creating focused files/components instead of rewriting massive pages.
- Do not repeat the same helper functions in multiple files; put shared helpers in one local utility only if reused.
- Do not create abstractions before they are needed.
- Do not explain obvious code.
- Keep comments minimal and useful.
- When reporting, summarize changed files and test results only.
- If a build fails, report only the real error and the next fix.
- Work one phase at a time.
- Stop after each phase with build/QA status and next recommended phase.

Important:
- Do not start coding immediately unless instructed for a specific phase.
- Work phase by phase.
- Do not rewrite unrelated files.
- Do not revert dirty files.
- Do not remove existing CRM modules.
- Use backend data only. No fake frontend data in final screens.
- Keep UI consistent with the existing dark/gold CRM design.