<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $permissions = [
            'view dashboard',
            'manage clients',
            'manage dossiers',
            'manage documents',
            'manage contracts',
            'manage authorizations',
            'manage finance',
            'manage archives',
            'view tasks',
            'manage tasks',
            'view task requests',
            'manage task requests',
            'view inbox',
            'manage inbox',
            'view notifications',
            'manage notifications',
            'view workload',
            'view operations reports',
            'manage users',
            'view qa',
        ];

        foreach ($permissions as $permission) {
            Permission::query()->firstOrCreate([
                'name' => $permission,
                'guard_name' => 'web',
            ]);
        }

        $admin = Role::query()->firstOrCreate([
            'name' => 'admin',
            'guard_name' => 'web',
        ]);

        $manager = Role::query()->firstOrCreate([
            'name' => 'manager',
            'guard_name' => 'web',
        ]);

        $staff = Role::query()->firstOrCreate([
            'name' => 'staff',
            'guard_name' => 'web',
        ]);

        $viewer = Role::query()->firstOrCreate([
            'name' => 'viewer',
            'guard_name' => 'web',
        ]);

        $permissionModels = Permission::query()
            ->where('guard_name', 'web')
            ->whereIn('name', $permissions)
            ->get();

        $admin->syncPermissions($permissionModels);

        $manager->syncPermissions(
            $permissionModels->whereIn('name', [
                'view dashboard',
                'manage clients',
                'manage dossiers',
                'manage documents',
                'manage contracts',
                'manage authorizations',
                'manage finance',
                'manage archives',
                'view tasks',
                'manage tasks',
                'view task requests',
                'manage task requests',
                'view inbox',
                'manage inbox',
                'view notifications',
                'manage notifications',
                'view workload',
                'view operations reports',
                'view qa',
            ])
        );

        $staff->syncPermissions(
            $permissionModels->whereIn('name', [
                'view dashboard',
                'manage clients',
                'manage dossiers',
                'manage documents',
                'manage contracts',
                'manage authorizations',
                'manage finance',
                'manage archives',
                'view tasks',
                'manage tasks',
                'view task requests',
                'manage task requests',
                'view inbox',
                'manage inbox',
                'view notifications',
            ])
        );

        $viewer->syncPermissions(
            $permissionModels->whereIn('name', [
                'view dashboard',
                'view tasks',
                'view inbox',
                'view notifications',
            ])
        );

        $adminEmail = env('ADMIN_EMAIL', 'admin@archilbo.local');

        $adminUser = User::query()->where('email', $adminEmail)->first();

        if ($adminUser) {
            $adminUser->syncRoles([$admin]);
        }

        User::query()
            ->whereDoesntHave('roles')
            ->get()
            ->each(function (User $user) use ($staff) {
                $user->assignRole($staff);
            });

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
