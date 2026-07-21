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
            'finance.view',
            'finance.documents.create',
            'finance.documents.update',
            'finance.documents.issue',
            'finance.documents.cancel',
            'finance.documents.delete',
            'finance.payments.view',
            'finance.payments.create',
            'finance.payments.update',
            'finance.payments.reverse',
            'finance.expenses.view',
            'finance.expenses.create',
            'finance.expenses.update',
            'finance.expenses.delete',
            'finance.templates.view',
            'finance.templates.manage',
            'finance.reports.export',
            'finance.settings.view',
            'finance.settings.update',
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
            'project_design',
            'project-design.view',
            'project-design.create-folder',
            'project-design.update-folder',
            'project-design.delete-folder',
            'project-design.create-file',
            'project-design.update-file',
            'project-design.upload',
            'project-design.download-source',
            'project-design.create-version',
            'project-design.submit-review',
            'project-design.review',
            'project-design.annotate',
            'project-design.create-remark',
            'project-design.assign-remark',
            'project-design.address-remark',
            'project-design.verify-remark',
            'project-design.reopen-remark',
            'project-design.approve',
            'project-design.request-changes',
            'project-design.archive',
            'project-design.restore',
            'project-design.delete',
            'project-design.manage',
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

        $projectDesignPerms = [
            'project-design.view',
            'project-design.create-folder',
            'project-design.create-file',
            'project-design.upload',
            'project-design.download-source',
            'project-design.create-version',
            'project-design.submit-review',
            'project-design.annotate',
            'project-design.create-remark',
            'project-design.address-remark',
        ];

        $projectDesignManagerPerms = array_merge($projectDesignPerms, [
            'project-design.update-folder',
            'project-design.delete-folder',
            'project-design.update-file',
            'project-design.review',
            'project-design.assign-remark',
            'project-design.verify-remark',
            'project-design.reopen-remark',
            'project-design.approve',
            'project-design.request-changes',
            'project-design.archive',
            'project-design.restore',
        ]);

        $permissionModels = Permission::query()
            ->where('guard_name', 'web')
            ->whereIn('name', $permissions)
            ->get();

        $admin->syncPermissions(Permission::all());

        $manager->syncPermissions(
            $permissionModels->whereIn('name', array_merge([
                'view dashboard',
                'manage clients',
                'manage dossiers',
                'manage documents',
                'manage contracts',
                'manage authorizations',
                'manage finance',
                'finance.view',
                'finance.documents.create',
                'finance.documents.update',
                'finance.documents.issue',
                'finance.documents.cancel',
                'finance.documents.delete',
                'finance.payments.view',
                'finance.payments.create',
                'finance.payments.update',
                'finance.payments.reverse',
                'finance.expenses.view',
                'finance.expenses.create',
                'finance.expenses.update',
                'finance.expenses.delete',
                'finance.templates.view',
                'finance.templates.manage',
                'finance.reports.export',
                'finance.settings.view',
                'finance.settings.update',
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
            ], $projectDesignManagerPerms))
        );

        $staff->syncPermissions(
            $permissionModels->whereIn('name', array_merge([
                'view dashboard',
                'manage clients',
                'manage dossiers',
                'manage documents',
                'manage contracts',
                'manage authorizations',
                'finance.view',
                'finance.documents.create',
                'finance.documents.update',
                'finance.payments.view',
                'finance.payments.create',
                'finance.expenses.view',
                'finance.expenses.create',
                'finance.templates.view',
                'finance.settings.view',
                'manage archives',
                'view tasks',
                'manage tasks',
                'view task requests',
                'manage task requests',
                'view inbox',
                'manage inbox',
                'view notifications',
            ], $projectDesignPerms))
        );

        $viewer->syncPermissions(
            $permissionModels->whereIn('name', array_merge([
                'view dashboard',
                'view tasks',
                'view inbox',
                'view notifications',
                'finance.view',
                'finance.payments.view',
                'finance.expenses.view',
                'finance.templates.view',
                'finance.settings.view',
            ], [
                'project-design.view',
            ]))
        );

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
