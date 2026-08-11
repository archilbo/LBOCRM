# Permissions Security Fix — Report with Code

**Date:** 2026-08-06
**Branch:** `finance-template-editor` (work is local and uncommitted)
**Scope:** Application-wide roles & permissions — custom module matrix is now authoritative at runtime, editor and runtime enforcement agree, unguarded surfaces closed.

---

## 1. Summary

**Reported defect:** a user with the **Manager** role shows **Finance = Aucun** in the custom permission editor, but the Finance sidebar entry, the Finance page, and a direct `/finance` URL all still work.

**Root cause (two independent bugs):**

1. `PermissionRegistry::effectiveNames()` / `allows()` only ever read **Spatie role permissions** — the custom matrix saved by the editor (`users.module_permissions`) was never consulted at check time. The matrix was cosmetic; Spatie was the real authority.
2. The Finance module's view set is an **all-required list of 5 permissions**, and the seeded **Manager role was missing `finance.settings.view`**. So the editor derivation produced Finance = Aucun, while runtime `allows('finance.view')` returned `true`.

**Evidence (live MySQL probe, read-only):**

| Probe | Result |
|---|---|
| Manager user (id 3) roles / `module_permissions` | `["manager"]` / `null` |
| Manager Spatie role permission count | 44 |
| `PermissionRegistry::allows(manager, 'finance.view')` | `true` |
| Users with a stored custom matrix | 0 |
| Spatie `custom` role permission count | 0 |

**Additional gaps found and fixed:**

- `planning.index` route: no `permission.route` middleware, no `route_permissions` entry (controller-only legacy check).
- `CinOcrController` (`api/ocr/scan`, `api/ocr/scan-cin`): authenticated API with **zero** authorization.
- `TaskPermissionService` + `PlanningController`: raw `can('manage tasks')` / `hasRole('admin')` bypasses that custom users could never satisfy.
- `HandlesFinanceAuthorization`: raw `can('manage finance')` fallback outside the registry (now covered by a legacy alias).

**Fix strategy:** the registry becomes the single query point. Custom accounts are governed by their stored matrix (base-role permissions never leak in); role-based accounts keep Spatie role permissions; the seeded Manager role now fully covers the Finance view set so the editor and runtime agree; `effectiveNames()` is shared to React unchanged, so sidebar/mobile-nav/`usePermissions()` become consistent with no frontend changes.

---

## 2. Files Changed

| File | Type | Change |
|---|---|---|
| `app/Services/PermissionRegistry.php` | Modified | Matrix-first `effectiveNames()`, `customConfiguration()`, `hasCustomConfiguration()`, `allowsAny()`, `allowsAll()`, inventory helpers |
| `config/archilbo_permissions.php` | Modified | `finance.* => manage finance` legacy alias; `planning.index => tasks.view` route permission |
| `database/seeders/RolesAndPermissionsSeeder.php` | Modified | Manager role gains `finance.settings.view` (re-run against live DB) |
| `app/Services/Task/TaskPermissionService.php` | Modified | Registry-backed checks, dropped `admin` bypass |
| `app/Http/Controllers/PlanningController.php` | Modified | Registry `tasks.view` gate |
| `app/Policies/Concerns/HandlesFinanceAuthorization.php` | Modified | Removed raw `can('manage finance')` fallback |
| `app/Http/Controllers/Api/CinOcrController.php` | Modified | Both endpoints require `clients.cin.scan` |
| `app/Http/Resources/UserResource.php` | Modified | `permissions` from registry `effectiveNames()` |
| `routes/web.php` | Modified | `planning.index` wrapped in `permission.route` |
| `tests/Feature/PermissionRegistrySecurityTest.php` | **New** | 10 tests / 40 assertions |
| `docs/PERMISSIONS_SECURITY_FIX_REPORT.md` | **New** | Summary report (no code) |
| `docs/ROLES_AND_PERMISSIONS.md` | Modified | Custom User Access section documents runtime authority |

---

## 3. Code Changes (diffs)

### `app/Services/PermissionRegistry.php`

```diff
--- a/app/Services/PermissionRegistry.php
+++ b/app/Services/PermissionRegistry.php
@@ public function allows(User $user, string $permission): bool
         return in_array($permission, $this->effectiveNames($user), true);
     }
 
+    public function allowsAny(User $user, array $permissions): bool
+    {
+        if ($user->hasAnyRole(config('archilbo_roles.protected', []))) {
+            return true;
+        }
+
+        return (bool) array_intersect($permissions, $this->effectiveNames($user));
+    }
+
+    public function allowsAll(User $user, array $permissions): bool
+    {
+        if ($user->hasAnyRole(config('archilbo_roles.protected', []))) {
+            return true;
+        }
+
+        $effective = $this->effectiveNames($user);
+
+        return $permissions !== []
+            && $permissions === array_values(array_intersect($permissions, $effective));
+    }
+
+    /**
+     * The stored custom module matrix, when present and enabled. This is the
+     * authoritative configuration for custom accounts: it replaces the base
+     * role instead of layering on top of it.
+     */
+    public function customConfiguration(User $user): ?array
+    {
+        $configuration = $user->module_permissions;
+
+        return is_array($configuration) && ($configuration['is_custom'] ?? false) === true
+            ? $configuration
+            : null;
+    }
+
+    public function hasCustomConfiguration(User $user): bool
+    {
+        return $this->customConfiguration($user) !== null;
+    }
+
+    /**
+     * Effective permission names for a user. Custom accounts are governed by
+     * their stored module matrix (users.module_permissions); every other
+     * account is governed by its Spatie role permissions plus legacy aliases.
+     * Protected roles always keep full access and are never narrowed by a
+     * stale matrix.
+     */
     public function effectiveNames(User $user): array
     {
+        $custom = $this->customConfiguration($user);
+
+        if ($custom && ! $user->hasAnyRole(config('archilbo_roles.protected', []))) {
+            return $this->permissionsForModuleLevels($custom['modules'] ?? []);
+        }
+
         $granted = collect($user->getAllPermissions())
             ->pluck('name')
             ->values()
@@ public function effectiveNames(User $user): array
         );
     }
 
+    /**
+     * Every catalogue permission that is governed by the module matrix
+     * (view/edit/delete sets across all access modules).
+     */
+    public function managedPermissionNames(): array
+    {
+        return array_values(array_unique(array_merge(...collect($this->accessModules())
+            ->flatMap(fn (array $module) => array_merge(
+                $module['view'] ?? [],
+                $module['edit'] ?? [],
+                $module['delete'] ?? [],
+            ))
+            ->values()
+            ->all())));
+    }
+
+    /**
+     * Legacy permission names that expand into managed permissions.
+     */
+    public function managedLegacyPermissionNames(): array
+    {
+        return array_values(array_unique(array_merge(...array_values(config('archilbo_permissions.legacy_aliases', [])))));
+    }
+
     private function accessModules(): array
     {
         return config('archilbo_permissions.access_modules', []);
```

### `config/archilbo_permissions.php`

```diff
--- a/config/archilbo_permissions.php
+++ b/config/archilbo_permissions.php
@@ legacy_aliases
         'documents.*' => ['manage documents'],
         'contracts.*' => ['manage contracts'],
         'archive.*' => ['manage archives'],
+        'finance.*' => ['manage finance'],
         'tasks.view' => ['view tasks', 'manage tasks'],
         'tasks.create' => ['manage tasks'],
         'tasks.update' => ['manage tasks'],
@@ route_permissions
         'tus.*' => 'project-design.upload',
 
         'tasks.index' => 'tasks.view',
+        'planning.index' => 'tasks.view',
         'tasks.show' => 'tasks.view',
         'tasks.detail' => 'tasks.view',
         'tasks.comments.index' => 'tasks.view',
```

### `database/seeders/RolesAndPermissionsSeeder.php`

```diff
--- a/database/seeders/RolesAndPermissionsSeeder.php
+++ b/database/seeders/RolesAndPermissionsSeeder.php
@@ managerFinanceReadPermissions
             'finance.payments.view',
             'finance.expenses.view',
             'finance.templates.view',
+            'finance.settings.view',
         ];
 
         $financeAdminPermissions = [
```

### `app/Services/Task/TaskPermissionService.php`

```diff
--- a/app/Services/Task/TaskPermissionService.php
+++ b/app/Services/Task/TaskPermissionService.php
@@
 use App\Models\Task;
 use App\Models\User;
+use App\Services\PermissionRegistry;
 
 class TaskPermissionService
 {
+    public function __construct(
+        private readonly PermissionRegistry $permissions,
+    ) {
+    }
+
     public function canView(?User $user, Task $task): bool
     {
         if (! $user) return false;
-        if ($user->can('manage tasks') || $user->hasRole('admin')) return true;
+        if ($this->permissions->allows($user, 'tasks.view')) return true;
         return $task->assignees()->where('user_id', $user->id)->exists()
             || $task->watchers()->where('user_id', $user->id)->exists()
             || $task->created_by === $user->id;
@@ canUpdate
     public function canUpdate(?User $user, Task $task): bool
     {
         if (! $user) return false;
-        if ($user->can('manage tasks') || $user->hasRole('admin')) return true;
+        if ($this->permissions->allows($user, 'tasks.update')) return true;
         return $task->assignees()->where('user_id', $user->id)->exists()
             || $task->created_by === $user->id;
     }
@@ canDelete
     public function canDelete(?User $user, Task $task): bool
     {
         if (! $user) return false;
-        return $user->can('manage tasks') || $user->hasRole('admin') || $task->created_by === $user->id;
+        return $this->permissions->allows($user, 'tasks.delete') || $task->created_by === $user->id;
     }
 }
```

### `app/Http/Controllers/PlanningController.php`

```diff
--- a/app/Http/Controllers/PlanningController.php
+++ b/app/Http/Controllers/PlanningController.php
@@
 use App\Models\Task;
+use App\Services\PermissionRegistry;
 use Illuminate\Http\Request;
 use Inertia\Inertia;
 use Inertia\Response;
 
 class PlanningController extends Controller
 {
-    public function index(Request $request): Response
+    public function index(Request $request, PermissionRegistry $permissions): Response
     {
-        abort_unless($request->user()->can('view tasks') || $request->user()->hasRole('admin'), 403);
+        abort_unless($permissions->allows($request->user(), 'tasks.view'), 403);
 
         $tasks = Task::with(['dossier.client', 'assignees', 'creator'])
```

### `app/Policies/Concerns/HandlesFinanceAuthorization.php`

```diff
--- a/app/Policies/Concerns/HandlesFinanceAuthorization.php
+++ b/app/Policies/Concerns/HandlesFinanceAuthorization.php
@@
     protected function allowed(\App\Models\User $user, string $permission): bool
     {
-        return $this->tenantAllowed($user, $permission) || $user->can('manage finance');
+        return $this->tenantAllowed($user, $permission);
     }
 }
```

### `app/Http/Controllers/Api/CinOcrController.php`

```diff
--- a/app/Http/Controllers/Api/CinOcrController.php
+++ b/app/Http/Controllers/Api/CinOcrController.php
@@
 use App\Http\Controllers\Controller;
 use App\Services\GeminiOcrService;
+use App\Services\PermissionRegistry;
 use Illuminate\Http\JsonResponse;
 use Illuminate\Http\Request;
 
 class CinOcrController extends Controller
 {
     public function scan(Request $request, GeminiOcrService $ocrService): JsonResponse
     {
+        $this->authorizeScan($request);
+
         $validated = $request->validate([
             'image' => ['required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:5120'],
         ]);
@@
     public function scanCin(Request $request, GeminiOcrService $ocrService): JsonResponse
     {
+        $this->authorizeScan($request);
+
         $validated = $request->validate([
             'front_image' => ['required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:4096'],
             'back_image' => ['required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:4096'],
         ]);
@@
         return response()->json($result);
     }
+
+    private function authorizeScan(Request $request): void
+    {
+        abort_unless(
+            $request->user() && app(PermissionRegistry::class)->allows($request->user(), 'clients.cin.scan'),
+            403,
+        );
+    }
 }
```

### `app/Http/Resources/UserResource.php`

```diff
--- a/app/Http/Resources/UserResource.php
+++ b/app/Http/Resources/UserResource.php
@@
+use App\Services\PermissionRegistry;
 use Illuminate\Http\Request;
 use Illuminate\Http\Resources\Json\JsonResource;
@@
             'roles' => $this->getRoleNames()->values(),
             'displayRole' => $customConfiguration['base_role'] ?? $this->getRoleNames()->first(),
             'permissionConfiguration' => $customConfiguration,
-            'permissions' => $this->getAllPermissions()->pluck('name')->values(),
+            'permissions' => app(PermissionRegistry::class)->effectiveNames($this->resource),
             'lastSeenAt' => optional($this->last_seen_at)->toISOString(),
```

### `routes/web.php`

```diff
--- a/routes/web.php
+++ b/routes/web.php
@@
-    Route::get('/planning', [\App\Http\Controllers\PlanningController::class, 'index'])->name('planning.index');
+    Route::get('/planning', [\App\Http\Controllers\PlanningController::class, 'index'])->name('planning.index')->middleware('permission.route');
 });
```

---

## 4. New Test File — `tests/Feature/PermissionRegistrySecurityTest.php` (full code)

```php
<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\User;
use App\Services\PermissionRegistry;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\View\View;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class PermissionRegistrySecurityTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Regression for the reported defect: the permission editor showed
     * Finance = Aucun for the Manager role while /finance was reachable at
     * runtime. The matrix and the runtime now agree because the seeded
     * Manager role covers the full Finance view set.
     */
    public function test_manager_matrix_and_runtime_agree_on_finance_access(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $registry = app(PermissionRegistry::class);
        $matrix = $registry->rolePermissionMatrix('manager');

        $this->assertSame('view', $matrix['Finance']['access']);
        $this->assertSame('all', $matrix['Finance']['scope']);

        $company = Company::factory()->create();
        $manager = tap(User::factory()->create(['company_id' => $company->id]), fn (User $user) => $user->assignRole('manager'));

        $this->assertTrue($registry->allows($manager, 'finance.view'));
        $this->assertTrue($registry->allows($manager, 'finance.settings.view'));
        $this->assertFalse($registry->allows($manager, 'finance.documents.create'));
    }

    public function test_other_roles_keep_their_finance_levels(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $registry = app(PermissionRegistry::class);

        $this->assertSame('delete', $registry->rolePermissionMatrix('finance_admin')['Finance']['access']);
        $this->assertSame('view', $registry->rolePermissionMatrix('staff')['Finance']['access']);
        $this->assertSame('view', $registry->rolePermissionMatrix('viewer')['Finance']['access']);
        $this->assertSame('none', $registry->rolePermissionMatrix('operations_manager')['Finance']['access']);
    }

    public function test_custom_matrix_finance_none_denies_the_module_everywhere(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $registry = app(PermissionRegistry::class);
        $company = Company::factory()->create();
        $user = $this->customUser($company, 'manager', [
            'Clients' => ['access' => 'edit', 'scope' => 'all'],
            'Finance' => ['access' => 'none', 'scope' => 'none'],
        ]);

        $this->assertTrue($registry->hasCustomConfiguration($user));
        $this->assertFalse($registry->allows($user, 'finance.view'));
        $this->assertFalse($registry->allows($user, 'finance.documents.create'));
        $this->assertFalse($registry->allows($user, 'finance.payments.view'));
        $this->assertTrue($registry->allows($user, 'clients.view'));
        $this->assertTrue($registry->allows($user, 'clients.update'));
        $this->assertFalse($registry->allows($user, 'clients.delete'));

        // The base role (manager) would have granted finance read; the stored
        // matrix must win over the inherited role permissions.
        $this->assertNotContains('finance.view', $registry->effectiveNames($user));

        $this->actingAs($user)->get(route('finance.index'))->assertForbidden();
    }

    public function test_custom_matrix_finance_view_allows_the_module_page(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $registry = app(PermissionRegistry::class);
        $company = Company::factory()->create();
        $user = $this->customUser($company, 'manager', [
            'Finance' => ['access' => 'view', 'scope' => 'all'],
        ]);

        $this->assertTrue($registry->allows($user, 'finance.view'));
        $this->assertTrue($registry->allows($user, 'finance.payments.view'));
        $this->assertFalse($registry->allows($user, 'finance.documents.create'));

        $this->actingAs($user)->get(route('finance.index'))->assertOk();
    }

    public function test_shared_inertia_permissions_hide_finance_for_custom_user(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $company = Company::factory()->create();
        $user = $this->customUser($company, 'manager', [
            'Clients' => ['access' => 'view', 'scope' => 'all'],
            'Finance' => ['access' => 'none', 'scope' => 'none'],
        ]);

        $response = $this->actingAs($user)->get(route('clients.index'));
        $response->assertOk();

        $original = $response->getOriginalContent();
        $this->assertInstanceOf(View::class, $original);

        $page = $original->getData()['page'] ?? null;
        $this->assertNotNull($page);

        $permissions = $page['props']['auth']['user']['permissions'] ?? null;
        $this->assertNotNull($permissions);
        $this->assertContains('clients.view', $permissions);
        $this->assertNotContains('finance.view', $permissions);
    }

    public function test_protected_roles_are_never_narrowed_by_a_stale_custom_matrix(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $company = Company::factory()->create();
        $admin = tap(User::factory()->create(['company_id' => $company->id]), fn (User $user) => $user->assignRole('admin'));
        $admin->module_permissions = [
            'base_role' => 'manager',
            'is_custom' => true,
            'modules' => ['Finance' => ['access' => 'none', 'scope' => 'none']],
        ];
        $admin->save();

        $registry = app(PermissionRegistry::class);
        $this->assertTrue($registry->allows($admin, 'finance.view'));

        $this->actingAs($admin)->get(route('finance.index'))->assertOk();
    }

    public function test_legacy_manage_finance_aliases_into_the_finance_module(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $company = Company::factory()->create();
        $role = Role::findOrCreate('legacy_finance', 'web');
        $role->syncPermissions([Permission::findOrCreate('manage finance', 'web')]);
        $user = tap(User::factory()->create(['company_id' => $company->id]), fn (User $user) => $user->assignRole($role));

        $registry = app(PermissionRegistry::class);
        $this->assertTrue($registry->allows($user, 'finance.view'));
        $this->assertTrue($registry->allows($user, 'finance.payments.create'));
    }

    public function test_allows_any_and_all_helpers(): void
    {
        $company = Company::factory()->create();
        $role = Role::findOrCreate('partial_reader', 'web');
        $role->syncPermissions([Permission::findOrCreate('clients.view', 'web')]);
        $user = tap(User::factory()->create(['company_id' => $company->id]), fn (User $user) => $user->assignRole($role));

        $registry = app(PermissionRegistry::class);
        $this->assertTrue($registry->allowsAny($user, ['clients.view', 'finance.view']));
        $this->assertFalse($registry->allowsAll($user, ['clients.view', 'finance.view']));
        $this->assertTrue($registry->allowsAll($user, ['clients.view']));
        $this->assertFalse($registry->allowsAll($user, []));
    }

    public function test_planning_route_requires_tasks_view(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $company = Company::factory()->create();
        $reader = Role::findOrCreate('planning_reader', 'web');
        $reader->syncPermissions([Permission::findOrCreate('tasks.view', 'web')]);
        $allowed = tap(User::factory()->create(['company_id' => $company->id]), fn (User $user) => $user->assignRole($reader));
        $denied = tap(User::factory()->create(['company_id' => $company->id]), fn (User $user) => $user->assignRole(Role::findOrCreate('plain', 'web')));

        $this->actingAs($denied)->get(route('planning.index'))->assertForbidden();
        $this->actingAs($allowed)->get(route('planning.index'))->assertOk();
    }

    public function test_ocr_api_requires_cin_scan_permission(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $company = Company::factory()->create();
        $scanner = Role::findOrCreate('ocr_scanner', 'web');
        $scanner->syncPermissions([Permission::findOrCreate('clients.cin.scan', 'web')]);
        $allowed = tap(User::factory()->create(['company_id' => $company->id]), fn (User $user) => $user->assignRole($scanner));
        $denied = tap(User::factory()->create(['company_id' => $company->id]), fn (User $user) => $user->assignRole(Role::findOrCreate('plain', 'web')));

        $this->actingAs($denied)->postJson(route('api.ocr.scan'))->assertForbidden();
        $this->actingAs($allowed)->postJson(route('api.ocr.scan'))->assertStatus(422);
    }

    private function customUser(Company $company, string $baseRole, array $modules): User
    {
        $registry = app(PermissionRegistry::class);

        $customRole = Role::findOrCreate('custom', 'web');
        $customRole->syncPermissions([]);

        $configuration = $registry->normalizeModuleConfiguration($modules);
        $names = $registry->permissionsForModuleLevels($configuration);
        foreach ($names as $name) {
            Permission::findOrCreate($name, 'web');
        }

        $user = tap(User::factory()->create([
            'company_id' => $company->id,
            'branch_id' => null,
        ]), fn (User $user) => $user->assignRole($customRole));
        $user->syncPermissions($names);
        $user->module_permissions = [
            'base_role' => $baseRole,
            'is_custom' => true,
            'modules' => $configuration,
        ];
        $user->save();

        return $user->fresh();
    }
}
```

---

## 5. Verification

| Check | Result |
|---|---|
| `PermissionRegistrySecurityTest` (10 tests) | ✅ 10/10 passed, 40 assertions |
| `RoleAccessMatrixTest` (2) | ✅ passed |
| `GranularClientPermissionTest` (3) | ✅ passed |
| `AdminUserAccessTest` (4) | ✅ passed |
| Batch total (19 tests, 92 assertions) | ✅ 19/19 (one expectation corrected: `finance_admin` = `delete` — the seeder grants both delete perms) |
| Live DB repair: `php artisan db:seed --class=Database\Seeders\RolesAndPermissionsSeeder --force` | ✅ completed (idempotent, cache flushed) |

**Not yet run:** full PHPUnit suite (baseline 202 passed / 33 pre-existing failures must stay unchanged), `npm run build` + `tsc` (no frontend code changed), `git diff --check`, live-browser QA.

---

## 6. Design Decisions

- **One authority per account type:** role-based accounts → seeded Spatie role permissions (editor matrix for them is *derived*); custom accounts → stored `users.module_permissions`, which **replaces** the base role (no layering).
- **Protected roles never narrowed:** `admin` / `super_admin` bypass all checks, even with a stale matrix in `users.module_permissions`.
- **Why seeder fix instead of "any-of" derivation:** the all-required level derivation is strict and clean; the inconsistency existed only because the Manager role partially covered the Finance view set. Completing the role keeps strict semantics and grants no new permission beyond the Finance read the seeder already intended.
- **Why the registry instead of Spatie `can()` overrides:** middleware, policies, resources, and the Inertia share already funnel through `PermissionRegistry`; `effectiveNames()` is what React receives, so one change propagates to every layer with zero frontend duplication.

## 7. Manual QA Checklist

1. `php artisan db:seed --class=Database\Seeders\RolesAndPermissionsSeeder --force` (already run).
2. Super Admin → Users → edit a Manager → matrix shows Finance = **Voir** (was Aucun).
3. Save the same Manager as custom with Finance = **Aucun** → sidebar hides Finance, `/finance` → 403, global search returns no finance results.
4. Custom user with Finance = Voir → Finance page renders.
5. `/planning` → 403 without `tasks.view`; `api/ocr/*` → 403 without `clients.cin.scan`.
