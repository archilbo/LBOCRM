# Permissions Security Fix — Work Report

**Date:** 2026-08-06
**Branch:** `finance-template-editor` (work is local and uncommitted)
**Scope:** Application-wide roles & permissions — the custom module matrix (`users.module_permissions`) is now authoritative at runtime, the permission editor and runtime enforcement agree, and two unguarded surfaces were closed.

---

## 1. Reported Defect

> A user with the Manager role shows **Finance = Aucun** in the custom permission editor, but the **Finance sidebar entry and the Finance page are still accessible**, and `/finance` works when hit directly.

Expected: the editor's module matrix and the runtime authorization must always agree. Finance = Aucun must deny every Finance surface (sidebar, page, direct URL, child routes, search results, API).

## 2. Root Cause Analysis (evidence-based)

Live-DB probe (MySQL `archi_lbo_os`, framework bootstrapped, read-only):

| Probe | Result |
|---|---|
| Manager user (id 3) roles | `["manager"]`, `module_permissions = null` |
| Manager Spatie role permission count | 44 |
| `PermissionRegistry::allows(manager, 'finance.view')` | `true` |
| Users with a stored custom matrix | 0 |
| Spatie `custom` role permission count | 0 |

Two independent root causes:

1. **The registry never read the custom matrix.** `PermissionRegistry::effectiveNames()` / `allows()` resolved everything from Spatie `getAllPermissions()` (role permissions). The editor *writes* `users.module_permissions` (`AdminUserController::updatePermissions`), but no check path ever *read* it — the matrix was cosmetic, and Spatie role permissions were the de facto authority.
2. **The matrix derivation and the runtime disagree for the Manager/Finance case.** `access_modules['Finance']['view']` is an all-required list of 5 permissions (`finance.view`, `finance.payments.view`, `finance.expenses.view`, `finance.templates.view`, `finance.settings.view`). The seeded Manager role has the first four but **not** `finance.settings.view`. Therefore:
   - `rolePermissionMatrix('manager')` → Finance = `none` (editor showed **Aucun**),
   - runtime `allows('finance.view')` → `true` (page + sidebar worked).

### Additional gaps found during the inventory

| Surface | Problem | Severity |
|---|---|---|
| `planning.index` route | No `permission.route` middleware and no `route_permissions` entry; controller-only check on legacy `view tasks` | Medium |
| `CinOcrController` (`api/ocr/scan`, `api/ocr/scan-cin`) | Authenticated API with **zero** permission check | High |
| `TaskPermissionService` | Raw `$user->can('manage tasks')` + `hasRole('admin')` bypass — custom users (whose direct permissions are catalogue names) could never pass it | High (functional) |
| `PlanningController` | Same legacy bypass | Medium |
| `HandlesFinanceAuthorization` | `|| $user->can('manage finance')` fallback outside the registry | Low |

Surfaces verified **already correct** (no change needed): all policies route through `HandlesTenantAuthorization` → registry; `GlobalSearchController` filters every category via the registry; Finance controllers use catalogue names (`finance.view`, …) that work for both role-based and custom users; `tasks.*`, `calendar.*`, `workload.*`, `operations.reports.*`, `admin.users.*`, `finance.*` route groups are behind `permission.route`.

## 3. Changes

### `app/Services/PermissionRegistry.php` (core)

- `customConfiguration(User): ?array` / `hasCustomConfiguration(User): bool` — normalized accessors for the stored matrix.
- `effectiveNames(User)` — **custom accounts are now governed by the stored matrix** (`permissionsForModuleLevels(modules)`); all other accounts keep the Spatie-role + legacy-alias path. Protected roles (`admin`, `super_admin`) are never narrowed by a stale matrix.
- `allowsAny(User, array)` / `allowsAll(User, array)` — set helpers with the same protected-role bypass.
- `managedPermissionNames()` / `managedLegacyPermissionNames()` — inventory helpers over the catalogue.
- Because `HandleInertiaRequests` shares `effectiveNames` unchanged, the frontend (sidebar, mobile nav, `usePermissions()->can()`) becomes consistent automatically once the registry is fixed — no React permission duplication.

### `config/archilbo_permissions.php`

- `legacy_aliases`: added `'finance.*' => ['manage finance']` so legacy holders of `manage finance` are covered through the registry (the raw `can('manage finance')` fallback in `HandlesFinanceAuthorization` was then safe to remove).
- `route_permissions`: added `'planning.index' => 'tasks.view'`.

### `database/seeders/RolesAndPermissionsSeeder.php`

- Manager role now includes `finance.settings.view` in `$managerFinanceReadPermissions` — the role fully covers the Finance view set, so the editor matrix (`Voir`) and runtime (`finance.view` allowed) agree.
- **Live DB repaired:** the seeder was re-run against MySQL (idempotent; `syncPermissions` + cache reset).

### Bypass removal

- `app/Services/Task/TaskPermissionService.php` — now registry-backed (`tasks.view` / `tasks.update` / `tasks.delete`); `hasRole('admin')` dropped (protected roles already bypass in the registry).
- `app/Http/Controllers/PlanningController.php` — `abort_unless(registry->allows($user, 'tasks.view'), 403)`.
- `app/Policies/Concerns/HandlesFinanceAuthorization.php` — removed the raw `can('manage finance')` fallback.
- `app/Http/Controllers/Api/CinOcrController.php` — both endpoints now `abort_unless(registry->allows($user, 'clients.cin.scan'), 403)` **before** validation.

### Consistency

- `app/Http/Resources/UserResource.php` — `permissions` now comes from `PermissionRegistry::effectiveNames()` (was raw `getAllPermissions()`), so the Users page shows exactly what the runtime enforces.
- `routes/web.php` — `planning.index` wrapped in `permission.route`.

### Tests

- **`tests/Feature/PermissionRegistrySecurityTest.php` (new, 10 tests / 40 assertions):**
  1. Manager matrix & runtime agree on Finance (Voir both sides) — the reported defect.
  2. Other roles keep their finance levels (`finance_admin` = delete, `staff`/`viewer` = view, `operations_manager` = none).
  3. Custom matrix Finance = Aucun → `allows()` false everywhere, `/finance` → 403, base role (manager) does **not** leak finance.
  4. Custom matrix Finance = Voir → `/finance` → 200.
  5. Inertia shared `auth.user.permissions` hides `finance.view` for a Finance = Aucun custom user (sidebar contract).
  6. Protected role is never narrowed by a stale custom matrix.
  7. Legacy `manage finance` aliases into the Finance module.
  8. `allowsAny` / `allowsAll` semantics (no empty-list true).
  9. `planning.index` requires `tasks.view` (403 / 200).
  10. OCR API requires `clients.cin.scan` (403 / 422).

## 4. Verification

| Check | Result |
|---|---|
| `PermissionRegistrySecurityTest` (10) | ✅ 10/10 passed, 40 assertions |
| `RoleAccessMatrixTest` (2) | ✅ passed |
| `GranularClientPermissionTest` (3) | ✅ passed |
| `AdminUserAccessTest` (4) | ✅ passed |
| Batch total (19 tests, 92 assertions) | ✅ 19/19 after correcting one wrong test expectation (`finance_admin` correctly = `delete`, seeder grants both delete perms) |
| Live seeder re-run | ✅ completed (`INFO Seeding database.`) |

Not yet run in this session: the full PHPUnit suite (baseline: 202 passed / 33 pre-existing failures — must remain unchanged), `npm run build` + `tsc` (no frontend code changed), `git diff --check`, and a live-browser QA pass.

## 5. Design Notes

- **Two sources, one authority per account type:** role-based accounts are governed by the seeded Spatie role permissions (the editor matrix for them is *derived*, not stored); custom accounts are governed by the stored `users.module_permissions` matrix, which **replaces** the base role instead of layering on top of it.
- **Why not change the level derivation to "any-of"?** The all-required derivation is mathematically clean; the inconsistency existed only because the seeded Manager role partially covered the Finance view set. Fixing the seeder keeps strict semantics and adds no new permissions.
- **Why the registry instead of Spatie `can()` overrides?** The registry is the single query point already used by middleware, policies, and resources; `effectiveNames` is shared to React, so one fix propagates to every layer.

## 6. Manual QA Checklist

1. `php artisan db:seed --class=Database\Seeders\RolesAndPermissionsSeeder --force` (already run).
2. As Super Admin: Users → edit a Manager → the matrix shows Finance = **Voir**; save as custom with Finance = **Aucun** → sidebar hides Finance, `/finance` → 403.
3. Custom user with Finance = Voir → Finance page renders; Finance = Aucun → global search returns no finance results.
4. `/planning` → 403 for a user without `tasks.view`; OCR endpoints → 403 without `clients.cin.scan`.
