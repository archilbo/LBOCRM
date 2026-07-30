<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateUserPermissionsRequest;
use App\Http\Requests\Admin\UpdateUserRoleRequest;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Resources\UserResource;
use App\Models\AuditLog;
use App\Models\User;
use App\Services\PermissionRegistry;
use App\Traits\AuditsActions;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class AdminUserController extends Controller
{
    use AuditsActions;

    public function __construct(private readonly PermissionRegistry $permissions)
    {
    }

    public function index(Request $request): Response
    {
        $this->ensurePermission($request, 'users.view');

        $users = $this->companyUsers($request)
            ->with('roles', 'permissions')
            ->latest()
            ->get();

        $assignableRoleNames = $this->assignableRoles($request);
        $filterRoleNames = $users
            ->flatMap(fn (User $user) => $user->getRoleNames())
            ->merge($assignableRoleNames)
            ->unique()
            ->values()
            ->all();

        return Inertia::render('Admin/Users/Index', [
            'users' => UserResource::collection($users)->resolve(),
            'currentUserId' => $request->user()->id,
            'roles' => $this->roleOptions($assignableRoleNames),
            'filterRoles' => $this->roleOptions($filterRoleNames),
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $user = User::query()->create([
            'company_id' => $request->user()->company_id,
            'branch_id' => $request->user()->branch_id,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'invitation_token' => null,
            'invited_at' => now(),
            'accepted_at' => now(),
            'invited_by' => $request->user()->id,
        ]);
        $user->assignRole($validated['role']);

        $this->audit($request, 'user.created', "Created {$user->name} with the {$validated['role']} role", [
            'user_id' => $user->id,
            'email' => $user->email,
            'role' => $validated['role'],
        ]);

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'User account created successfully.');
    }

    public function updateRole(UpdateUserRoleRequest $request, User $user): RedirectResponse
    {
        $this->ensurePermission($request, 'users.roles.manage');
        $this->ensureManagedUser($request, $user);

        $oldRole = $user->getRoleNames()->first() ?? 'none';
        $user->syncRoles([$request->validated('role')]);
        $user->syncPermissions([]);
        $user->update(['module_permissions' => null]);

        $this->audit($request, 'user.role.updated', "Changed {$user->name}'s role from {$oldRole} to {$request->validated('role')}", [
            'user_id' => $user->id,
            'old_role' => $oldRole,
            'new_role' => $request->validated('role'),
        ]);

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'User role updated successfully.');
    }

    public function updateAccess(Request $request, User $user): RedirectResponse
    {
        $this->ensurePermission($request, 'users.access.manage');
        $this->ensureManagedUser($request, $user);

        $request->validate(['is_active' => ['required', 'boolean']]);
        $isActive = $request->boolean('is_active');

        if (! $isActive && $user->is($request->user())) {
            return back()->with('error', 'You cannot disable your own account.');
        }

        if (! $isActive && $user->hasAnyRole(config('archilbo_roles.protected'))) {
            return back()->with('error', 'Protected administrator accounts cannot be disabled.');
        }

        $wasActive = is_null($user->suspended_at);

        if ($wasActive === $isActive) {
            return back();
        }

        $user->update(['suspended_at' => $isActive ? null : now()]);

        $this->audit(
            $request,
            $isActive ? 'user.access.restored' : 'user.access.suspended',
            ($isActive ? 'Restored' : 'Suspended') . " access for {$user->name}",
            ['user_id' => $user->id, 'is_active' => $isActive],
        );

        return back()->with('success', $isActive ? 'User access restored.' : 'User access suspended.');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        $this->ensurePermission($request, 'users.delete');
        $this->ensureManagedUser($request, $user);

        if ($user->id === $request->user()->id) {
            return redirect()
                ->route('admin.users.index')
                ->with('error', 'You cannot delete your own account.');
        }

        if ($user->hasAnyRole(config('archilbo_roles.protected'))) {
            return redirect()
                ->route('admin.users.index')
                ->with('error', 'Protected administrator accounts cannot be removed.');
        }

        $user->delete();

        $this->audit($request, 'user.deleted', "Removed user {$user->name} ({$user->email})", [
            'user_id' => $user->id,
            'email' => $user->email,
        ]);

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'User removed successfully.');
    }

    public function updatePermissions(UpdateUserPermissionsRequest $request, User $user): RedirectResponse
    {
        $this->ensurePermission($request, 'users.roles.manage');
        $this->ensureManagedUser($request, $user);

        $validated = $request->validated();

        $oldRole = $user->getRoleNames()->first() ?? 'none';
        $customPermissions = $this->permissions->permissionsForModuleLevels($validated['permissions']);

        if ($validated['isCustom']) {
            $user->syncRoles(['custom']);
            $user->syncPermissions($customPermissions);
            $user->module_permissions = [
                'base_role' => $validated['role'],
                'is_custom' => true,
                'modules' => $validated['permissions'],
            ];
        } else {
            $user->syncRoles([$validated['role']]);
            $user->syncPermissions([]);
            $user->module_permissions = null;
        }
        $user->save();

        $this->audit($request, 'user.permissions.updated', "Updated permissions for {$user->name} (role: {$oldRole} → {$validated['role']})", [
            'user_id' => $user->id,
            'old_role' => $oldRole,
            'new_role' => $validated['isCustom'] ? 'custom' : $validated['role'],
            'is_custom' => $validated['isCustom'] ?? false,
            'direct_permissions' => $customPermissions,
        ]);

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'Permissions updated successfully.');
    }

    public function bulkUpdateRole(Request $request): RedirectResponse
    {
        $this->ensurePermission($request, 'users.roles.manage');

        $data = $request->validate([
            'userIds' => 'required|array',
            'userIds.*' => 'exists:users,id',
            'role' => ['required', 'string', \Illuminate\Validation\Rule::in($this->assignableRoles($request))],
        ]);

        $count = 0;
        $skipped = 0;
        $canManageProtectedUsers = $request->user()->hasRole(config('archilbo_roles.super_admin_role'));

        $this->companyUsers($request)->whereIn('id', $data['userIds'])->each(function (User $user) use ($data, &$count, &$skipped, $canManageProtectedUsers) {
            if (! $canManageProtectedUsers && $user->hasAnyRole(config('archilbo_roles.protected'))) {
                $skipped++;
                return;
            }

            $user->syncRoles([$data['role']]);
            $user->syncPermissions([]);
            $user->update(['module_permissions' => null]);
            $count++;
        });

        $this->audit($request, 'bulk.role.updated', "Bulk updated {$count} user(s) to role {$data['role']}", [
            'user_ids' => $data['userIds'],
            'role' => $data['role'],
            'count' => $count,
            'skipped' => $skipped,
        ]);

        return redirect()
            ->route('admin.users.index')
            ->with('success', "Role updated for {$count} user(s)." . ($skipped > 0 ? " {$skipped} protected account(s) skipped." : ''));
    }

    public function bulkSuspend(Request $request): RedirectResponse
    {
        $this->ensurePermission($request, 'users.access.manage');

        $data = $request->validate([
            'userIds' => 'required|array',
            'userIds.*' => 'exists:users,id',
        ]);

        $suspended = 0;
        $skipped = 0;

        foreach ($this->companyUsers($request)->whereIn('id', $data['userIds'])->whereNull('suspended_at')->cursor() as $user) {
            if ($user->id === $request->user()->id) {
                $skipped++;
                continue;
            }

            if ($user->hasAnyRole(config('archilbo_roles.protected'))) {
                $skipped++;
                continue;
            }

            $user->update(['suspended_at' => now()]);
            $suspended++;
        }

        $this->audit($request, 'bulk.suspended', "Suspended {$suspended} user(s) ({$skipped} skipped)", [
            'user_ids' => $data['userIds'],
            'suspended' => $suspended,
            'skipped' => $skipped,
        ]);

        return redirect()
            ->route('admin.users.index')
            ->with('success', "{$suspended} user(s) suspended." . ($skipped > 0 ? " {$skipped} protected account(s) skipped." : ''));
    }

    public function bulkDestroy(Request $request): RedirectResponse
    {
        $this->ensurePermission($request, 'users.delete');

        $data = $request->validate([
            'userIds' => 'required|array',
            'userIds.*' => 'exists:users,id',
        ]);

        $currentUserId = $request->user()->id;
        $removed = 0;
        $skipped = 0;

        foreach ($this->companyUsers($request)->whereIn('id', $data['userIds'])->cursor() as $user) {
            if ($user->id === $currentUserId) {
                $skipped++;
                continue;
            }
            if ($user->hasAnyRole(config('archilbo_roles.protected'))) {
                $skipped++;
                continue;
            }
            $user->delete();
            $removed++;
        }

        $this->audit($request, 'bulk.deleted', "Bulk removed {$removed} user(s) ({$skipped} skipped)", [
            'user_ids' => $data['userIds'],
            'removed' => $removed,
            'skipped' => $skipped,
        ]);

        $message = "{$removed} user(s) removed.";
        if ($skipped > 0) {
            $message .= " {$skipped} protected account(s) skipped.";
        }

        return redirect()
            ->route('admin.users.index')
            ->with('success', $message);
    }

    public function auditLogs(Request $request): JsonResponse
    {
        $this->ensurePermission($request, 'users.view');

        $logs = AuditLog::with('user')
            ->whereHas('user', fn ($query) => $query->where('company_id', $request->user()->company_id))
            ->latest('created_at')
            ->take(100)
            ->get()
            ->map(fn (AuditLog $log) => [
                'id' => $log->id,
                'timestamp' => $log->created_at->format('Y-m-d H:i:s'),
                'user' => $log->user?->name ?? 'System',
                'action' => $log->description ?? $log->action,
                'ip' => $log->ip_address ?? '-',
            ]);

        return response()->json(['logs' => $logs]);
    }

    private function companyUsers(Request $request)
    {
        return User::query()->where('company_id', $request->user()->company_id);
    }

    private function assignableRoles(Request $request): array
    {
        $roles = config('archilbo_roles.assignable');

        if (! $request->user()->hasRole(config('archilbo_roles.super_admin_role'))) {
            $roles = array_values(array_diff($roles, [config('archilbo_roles.super_admin_role')]));
        }

        return $roles;
    }

    private function roleOptions(array $roleNames): array
    {
        return Role::query()
            ->whereIn('name', $roleNames)
            ->orderBy('name')
            ->get()
            ->map(fn (Role $role) => [
                'id' => $role->name,
                'label' => Str::headline($role->name),
            ])
            ->values()
            ->all();
    }

    private function ensureManagedUser(Request $request, User $user): void
    {
        abort_unless((int) $user->company_id === (int) $request->user()->company_id, 404);

        if ($user->hasAnyRole(config('archilbo_roles.protected'))) {
            abort_unless(
                $request->user()->hasRole(config('archilbo_roles.super_admin_role')),
                403,
            );
        }
    }

    private function ensurePermission(Request $request, string $permission): void
    {
        abort_unless($request->user() && $this->permissions->allows($request->user(), $permission), 403);
    }
}
