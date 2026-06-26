<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateUserRoleRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
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
        $role = $request->validated('role');

        $user->syncRoles([$role]);

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'User role updated successfully.');
    }
}