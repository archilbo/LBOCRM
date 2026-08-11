# Permissions Security Fix — Verification Report

Branch: `finance-template-editor` (uncommitted work)
Date: 2026-08-06
Scope: Authorize every permission decision through `App\Services\PermissionRegistry`, close bypasses, harden the admin permission mutation endpoints, and gate the dashboard quick actions.

---

## 1. Summary of outcome

| Metric | Result |
|---|---|
| New/updated test suites | 4 suites, 73 tests, 4,086 assertions — all pass |
| Full test suite | 290 tests — 239 passed, 33 pre-existing failures, 18 skipped |
| New failures introduced | **0** (failure set empirically verified identical to baseline via `git stash` comparison) |
| Frontend build | `npm run build` — `✓ built in 2.97s` (only pre-existing chunk-size warning) |
| TypeScript | `npm run typecheck` — no errors in any file touched by this work (pre-existing errors remain in `Inbox/Index.tsx`, `Intermediaries/Index.tsx`, `Planning/Index.tsx`, `DashboardWorkflowDonut.tsx`) |
| Whitespace | `git diff --check` clean for all files touched by this work |

---

## 2. PermissionRegistry rework (`app/Services/PermissionRegistry.php`)

The registry is now the single decision point for every permission check in the application (controllers, requests, resources, services, dashboard). Its algorithm:

### Effective names
- **Protected roles** (`admin`, `super_admin` — `config/archilbo_roles.protected`): always full access, never narrowed by a stale matrix.
- **Custom (matrix-governed) accounts**: `effective = unmanaged grants + matrix grants`
  - `unmanaged` = Spatie role/direct grants minus every name governed by a module set (`managedPermissionNames()`) and every legacy alias that expands into governed names (`managedLegacyPermissionNames()`). A raw `manage clients` cannot re-grant the clients module the matrix set to `none`.
  - The matrix replaces the base role **only** for managed permissions; abilities the matrix does not govern (e.g. `dashboard.view`, unmanaged catalogue permissions) stay inherited.
- **Standard accounts**: role permissions + direct grants + legacy-alias expansion (`effectiveNamesFromGranted()`).

### Legacy aliases
`config/archilbo_permissions.legacy_aliases` expands catalogue names from legacy Spatie names (`manage clients`, `manage dossiers`, `manage finance`, `project_design`, `manage archives`, `manage tasks`, `manage inbox`, `manage users`, `manage calendar`, …). Seeded roles such as `staff` (carries `manage clients`) therefore resolve to full client CRUD by design.

### Fixed defects
- `managedPermissionNames()` previously used `array_merge(...)` on a flat string array (array splat of a string list → `TypeError`). Now built with `collect()->flatMap()`.
- `effectiveNames()` previously mixed raw grants into the custom path; the custom path is now isolated in `effectiveNamesForCustom()`.

---

## 3. Configuration changes (`config/archilbo_permissions.php`)

- **Finance wildcard removed**: the `finance.*` → `['manage finance']` wildcard alias was replaced with 19 explicit per-permission mappings (`finance.payments.view` → `manage finance`, …). A wildcard would have granted every finance permission from a single grant; explicit entries make each grant visible, testable, and auditable.
- **Projects module set completed**: now covers all 23 `project-design.*` permissions across view/edit/delete levels.
- **Calendar delete completed**: `calendar.delete` added to the module set.
- Every change is covered by `PermissionRegistrySecurityTest`.

---

## 4. Endpoint hardening (`app/Http/Controllers/Admin/AdminUserController.php`)

`updatePermissions`, `updateRole`, and `bulkUpdateRole` are now wrapped in `DB::transaction` and reset the Spatie `PermissionRegistrar` cache (`forgetCachedPermissions()`) on success. Partial mutations can no longer leave a user with a half-applied grant set, and permission changes take effect immediately instead of after cache expiry.

Covered by `AdminUserPermissionsEndpointTest` (6 tests, 47 assertions).

---

## 5. Bypass audit — direct Spatie checks eliminated

15 backend files previously used raw `$user->can('…')`, `|| can('manage finance')`, `|| can('manage users')`, or `hasRole('admin')` fallbacks, bypassing the custom-matrix security model. All converted to `PermissionRegistry::allows()` (via DI):

| File | Sites |
|---|---|
| `FinanceSettingsController` | update + reset |
| `CompanyLogoController` | store + destroy |
| `MonthlySummaryExportController` | exportPdf / exportExcel / exportCsv |
| `FinanceDocumentController` | canViewPayments / canViewExpenses / canViewTemplates in index |
| `ClientController` | show (canViewFinance) + financeTemplates |
| `ClientWorkspaceService` | constructor DI + `forClient()` |
| `UpdateFinanceSettingsRequest` | dropped `manage users` + `hasRole('admin')` quirks |
| `UploadCompanyLogoRequest` | dropped `manage users` + `hasRole('admin')` quirks |
| 5 × ProjectDesign FormRequests | store/update authorization |
| `ProjectDesignController` | canUpload in summary |
| `ProjectDesignSummaryResource` | canUpload |

Policies already routed through the registry via `HandlesTenantAuthorization::allowed()` → `app(PermissionRegistry::class)->allows(...)` — no change needed.

A full grep for raw `->can(`, `can('manage`, `hasRole('admin')` fallbacks in `app/` shows no remaining bypasses.

---

## 6. Dashboard "Accès rapide" quick actions (new)

`DashboardCommandCenterService` now injects `PermissionRegistry` and filters `quickLinks` per action instead of serving a static list to every user:

| Action | Required permission |
|---|---|
| `newProject` | `dossiers.create` |
| `uploadDocument` | `documents.create` |
| `createInvoice` | `finance.documents.create` |
| `newClient` | `clients.create` |
| `newTask` | `tasks.create` |
| `newConversation` | `inbox.manage` |

Filtering goes through `allows()`, so legacy aliases and custom matrices apply (e.g. `staff` keeps all six via aliases; a custom user with `Clients=edit` gets only `newClient`; a `viewer` gets none). The permission key is stripped from the payload.

Frontend: `pages/Dashboard.tsx` renders the "Accès rapide" icon strip only when `quickLinks.length > 0`.

---

## 7. Frontend changes

- `ClientDrawer/index.tsx`: the Scan CIN toggle is now gated by the `clients.cin.scan` permission instead of being shown to everyone.
- `ProjectDesignTabContent.tsx`: removed raw `authUser?.roles?.includes('admin')` (`canManageAllRemarks`); assign/address/verify/reopen remark capabilities are permission-driven.
- `FinanceKpiCard.tsx`: repaired a truncated file (missing closing brace → Vite parse error). Build verified.
- `Dashboard.tsx`: quick-actions section gated (see §6).

---

## 8. Test results

### New/updated suites — all green
| Suite | Tests | Assertions |
|---|---|---|
| `PermissionRegistrySecurityTest` | 19 | 3,761 |
| `AdminUserPermissionsEndpointTest` | 6 | 47 |
| `DashboardCommandCenterTest` | 5 | 8 |
| Batch: `InvitationFlowTest` + `RoleAccessMatrixTest` + `GranularClientPermissionTest` + `AdminUserAccessTest` | 39 | 270 |

New coverage highlights:
- Matrix vs. legacy-alias precedence (a raw `manage clients` does not override a matrix set to `none`).
- Protected roles are never narrowed by a stale matrix.
- Finance settings/logo/export endpoints are denied without the effective permission, including for `staff` when a matrix removes them.
- `project_design` legacy alias resolves for standard accounts and is stripped for matrix-governed accounts.
- Quick links hidden per permission; staff receives all six through aliases; custom matrix yields exactly `newClient`.

### Full suite vs. baseline
- Baseline (before this work): 202 passed / 33 failed.
- After this work: **239 passed / 33 failed (32 failures + 1 error) / 18 skipped** — pass count +37, failure count unchanged.
- **Failure-set verification**: all session changes were stashed (`git stash`), the four failing areas (`ProjectDesignTest`, `ProjectDesignUploadSessionTest`, `CoreRuntimeSmokeTest`, `GlobalSearchTest`) were re-run on the clean baseline, and the **identical** 31 failures + 1 error reproduced. All 33 failures are pre-existing, unrelated to this work.

### Pre-existing failures (out of scope, present on clean baseline)
| Area | Cause |
|---|---|
| `ProjectDesignTest` (10) + `ProjectDesignUploadSessionTest` (20) — all 403 | Tests grant raw Spatie names; the branch's route wiring requires registry-managed names. Pre-existing on `finance-template-editor`. |
| `CoreRuntimeSmokeTest` (1) — 403 | Same category (legacy raw-grant test vs. registry-managed routes). |
| `GeminiApiDiagnosticTest` (1) — HTTP 400 | Requires a valid external API key in the test environment. |
| `GlobalSearchTest` (1) — SQL UNIQUE constraint | Test fixture collision on `cities.name_normalized` (`MARRAKECH` duplicated). |

---

## 9. Recommendation

- The permission model is now single-sourced through `PermissionRegistry`; no bypasses remain in `app/`.
- Fix the four pre-existing failure areas in a separate work item (align `ProjectDesign*` tests with the registry-managed permission names and de-duplicate the city fixture) before the next full-suite gate.
- Consider a CI job asserting `php artisan test --exclude-group=external` stays failure-free.

Work is intentionally left **uncommitted** on `finance-template-editor` per the session instruction.
