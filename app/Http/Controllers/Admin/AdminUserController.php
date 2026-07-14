<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateUserPermissionsRequest;
use App\Http\Requests\Admin\UpdateUserRoleRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class AdminUserController extends Controller
{
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
        $user->syncRoles([$request->validated('role')]);

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

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'User removed successfully.');
    }

    public function updatePermissions(UpdateUserPermissionsRequest $request, User $user): RedirectResponse
    {
        abort_unless($request->user()?->can('manage users'), 403);

        $validated = $request->validated();

        $user->syncRoles([$validated['role']]);
        $user->module_permissions = $validated['permissions'];
        $user->save();

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

        $message = "{$removed} user(s) removed.";
        if ($skipped > 0) {
            $message .= " {$skipped} skipped (self or last admin).";
        }

        return redirect()
            ->route('admin.users.index')
            ->with('success', $message);
    }
}
