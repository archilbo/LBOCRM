# ARCHI LBO — Projects Workspace V1.1

## Target snapshot

```text
Branch: finance-template-editor
Commit: 9557060ab1d224c43993d6a1c6c7a8925749fe40
```

This package is intentionally locked to the exact GitHub snapshot that was audited. It
uses full-file copies only—there are no brittle locale block replacements or embedded
TypeScript patches.

## What the repair covers

### Projects index (`/dossiers`)

- Rebuilds the list with the typed shared `AppWorkspaceTable` API.
- Adds icon-led sortable headers and correct numeric sorting.
- Persists column order in `archilbo.projects.table.columns.v1`.
- Uses 10 projects per page with safe page clamping and icon pagination.
- Uses a compact icon-only New Project action with tooltip.
- Keeps direct View/Edit actions and removes duplicated View from the overflow menu.
- Uses a portal-based React Aria menu so row actions are keyboard accessible and are not
  clipped by the table container.
- Displays real document and current finance-document counts.
- Uses backend monthly project data and tenant-scoped KPI metrics.
- Preserves the location explorer.

### Project workspace (`/dossiers/{id}`)

All eight tabs remain available and backend-connected:

```text
Overview
Workflow
Project Design
Documents
Contract
Finance
Notes
Activity
```

- Adds accessible React Aria workspace tabs matching the Finance visual pattern.
- Preserves Project Design URL state, lazy loading, editor/fullscreen behavior, and all
  existing design query parameters.
- Supplies real documents, contract, current finance documents, payments, archive record,
  workflow history, and generated activity data.
- Uses invoice document ledgers for Total/Paid/Remaining KPI consistency.
- Keeps document upload, project edit, contract generation/signing/download, finance links,
  archive links, and delete behavior.
- Notes edit opens the project drawer directly.

### Backend and data correctness

- Applies `CompanyContext` tenant scope to the Projects index and option datasets.
- Loads documents and current `financeDocuments` counts without the legacy relation.
- Removes stale Authorization-module references from the Project controller payload.
- Fixes project city updates by validating and persisting `city_id` in
  `UpdateDossierRequest`.
- Adds a validated, local-only `return_to` flow so mutations return to the selected tab.
- Adds real activity events from project, workflow, documents, contract, finance,
  payments, and archive data.

### Localization

Adds dedicated French and English `projects` dictionaries and merges them through the
existing i18n provider. No existing language dictionary is patched by string matching.

## Files changed

```text
app/Http/Controllers/DossierController.php
app/Http/Requests/UpdateDossierRequest.php
app/Http/Resources/DossierResource.php
resources/js/features/dossiers/types.ts
resources/js/lib/i18n.ts
resources/js/pages/Dossiers/Index.tsx
resources/js/pages/Dossiers/Show.tsx
resources/js/components/ui/AppWorkspaceTabs.tsx
resources/js/features/dossiers/projectPayload.ts
resources/js/locales/en/projects.ts
resources/js/locales/fr/projects.ts
tests/Feature/ProjectWorkspaceTest.php
```

## Install

Extract the ZIP directly into:

```text
D:\ARCHI LBO\LBOSM\LBOCRM
```

Confirm this folder exists:

```text
D:\ARCHI LBO\LBOSM\LBOCRM\_projects-workspace-v1-1
```

Run:

```powershell
Set-Location 'D:\ARCHI LBO\LBOSM\LBOCRM'

PowerShell.exe -ExecutionPolicy Bypass `
    -File .\_projects-workspace-v1-1\install-projects-workspace-v1-1.ps1
```

The installer verifies package hashes, branch, exact commit, clean target files, baseline
TypeScript diagnostics, baseline build, PHP syntax, focused backend tests, focused ESLint
with zero warnings, TypeScript regression, post-install production build, text integrity,
and Git diff integrity. Any post-install failure restores every original file and removes
all newly added files.


## V1.1 commit re-lock

The first package was locked to:

```text
4284dbf343e10fda511a81e565ba0d8fac03dfe1
```

The local branch advanced to:

```text
9557060ab1d224c43993d6a1c6c7a8925749fe40
```

The intervening commit is:

```text
feat(intermediaries): rebuild show workspace with backend tabs
```

It changes six Intermediary-specific files only. None of the twelve Projects workspace
target paths changed, so V1.1 preserves the original audited Projects payload and updates
the exact source-snapshot guard to the new commit.

No validation gate was removed or relaxed.
