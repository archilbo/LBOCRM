<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateUserPermissionsRequest;
use App\Http\Requests\Admin\UpdateUserRoleRequest;
use App\Http\Resources\UserResource;
use App\Models\AuditLog;
use App\Models\User;
use App\Traits\AuditsActions;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class AdminUserController extends Controller
{
    use AuditsActions;
    public function index(): Response
    {
        abort_unless(auth()->user()?->can('manage users'), 403);

        $users = User::query()
            ->with('roles', 'permissions')
            ->latest()
            ->get();

        return Inertia::render('Admin/Users/Index', [
            'users' => UserResource::collection($users)->resolve(),
            'roles' => Role::query()
                ->orderBy('name')
                ->get()
                ->map(fn (Role $role) => [
                    'id' => $role->name,
                    'label' => ucfirst($role->name),
                ])
                ->values()
                ->all(),
        ]);
    }

    public function updateRole(UpdateUserRoleRequest $request, User $user): RedirectResponse
    {
        $oldRole = $user->getRoleNames()->first() ?? 'none';
        $user->syncRoles([$request->validated('role')]);

        $this->audit($request, 'user.role.updated', "Changed {$user->name}'s role from {$oldRole} to {$request->validated('role')}", [
            'user_id' => $user->id,
            'old_role' => $oldRole,
            'new_role' => $request->validated('role'),
        ]);

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'User role updated successfully.');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        abort_unless($request->user()?->can('manage users'), 403);

        if ($user->id === $request->user()->id) {
            return redirect()
                ->route('admin.users.index')
                ->with('error', 'You cannot delete your own account.');
        }

        if ($user->hasRole('admin') && User::role('admin')->count() <= 1) {
            return redirect()
                ->route('admin.users.index')
                ->with('error', 'Cannot delete the last admin account.');
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
        abort_unless($request->user()?->can('manage users'), 403);

        $validated = $request->validated();

        $oldRole = $user->getRoleNames()->first() ?? 'none';
        $user->syncRoles([$validated['role']]);
        $user->module_permissions = $validated['permissions'];
        $user->save();

        $this->audit($request, 'user.permissions.updated', "Updated permissions for {$user->name} (role: {$oldRole} → {$validated['role']})", [
            'user_id' => $user->id,
            'old_role' => $oldRole,
            'new_role' => $validated['role'],
            'is_custom' => $validated['isCustom'] ?? false,
        ]);

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'Permissions updated successfully.');
    }

    public function bulkUpdateRole(Request $request): RedirectResponse
    {
        abort_unless($request->user()?->can('manage users'), 403);

        $data = $request->validate([
            'userIds' => 'required|array',
            'userIds.*' => 'exists:users,id',
            'role' => 'required|string|in:admin,manager,staff,viewer',
        ]);

        $count = 0;
        User::whereIn('id', $data['userIds'])->each(function (User $user) use ($data, &$count) {
            $user->syncRoles([$data['role']]);
            $count++;
        });

        $this->audit($request, 'bulk.role.updated', "Bulk updated {$count} user(s) to role {$data['role']}", [
            'user_ids' => $data['userIds'],
            'role' => $data['role'],
            'count' => $count,
        ]);

        return redirect()
            ->route('admin.users.index')
            ->with('success', "Role updated for {$count} user(s).");
    }

    public function bulkSuspend(Request $request): RedirectResponse
    {
        abort_unless($request->user()?->can('manage users'), 403);

        $data = $request->validate([
            'userIds' => 'required|array',
            'userIds.*' => 'exists:users,id',
        ]);

        $count = User::whereIn('id', $data['userIds'])->whereNull('suspended_at')->update([
            'suspended_at' => now(),
        ]);

        $this->audit($request, 'bulk.suspended', "Suspended {$count} user(s)", [
            'user_ids' => $data['userIds'],
            'count' => $count,
        ]);

        return redirect()
            ->route('admin.users.index')
            ->with('success', "{$count} user(s) suspended.");
    }

    public function bulkDestroy(Request $request): RedirectResponse
    {
        abort_unless($request->user()?->can('manage users'), 403);

        $data = $request->validate([
            'userIds' => 'required|array',
            'userIds.*' => 'exists:users,id',
        ]);

        $currentUserId = $request->user()->id;
        $removed = 0;
        $skipped = 0;

        foreach (User::whereIn('id', $data['userIds'])->cursor() as $user) {
            if ($user->id === $currentUserId) {
                $skipped++;
                continue;
            }
            if ($user->hasRole('admin') && User::role('admin')->where('id', '!=', $user->id)->count() === 0) {
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
            $message .= " {$skipped} skipped (self or last admin).";
        }

        return redirect()
            ->route('admin.users.index')
            ->with('success', $message);
    }

    public function auditLogs(Request $request): JsonResponse
    {
        abort_unless($request->user()?->can('manage users'), 403);

        $logs = AuditLog::with('user')
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
}
