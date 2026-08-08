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

        Permission::query()
            ->whereIn('name', ['manage authorizations', 'view task requests', 'manage task requests'])
            ->delete();

        $legacyPermissions = [
            'view dashboard',
            'manage clients',
            'manage dossiers',
            'manage documents',
            'manage contracts',
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
            'view inbox',
            'manage inbox',
            'view notifications',
            'manage notifications',
            'view workload',
            'view operations reports',
            'calendar.view',
            'calendar.create',
            'calendar.update',
            'calendar.delete',
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

        $permissions = array_values(array_unique([
            ...$legacyPermissions,
            ...array_keys(config('archilbo_permissions.permissions', [])),
        ]));

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

        $superAdmin = Role::query()->firstOrCreate([
            'name' => 'super_admin',
            'guard_name' => 'web',
        ]);

        $financeAdmin = Role::query()->firstOrCreate([
            'name' => 'finance_admin',
            'guard_name' => 'web',
        ]);

        $manager = Role::query()->firstOrCreate([
            'name' => 'manager',
            'guard_name' => 'web',
        ]);

        $operationsManager = Role::query()->firstOrCreate([
            'name' => 'operations_manager',
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

        $custom = Role::query()->firstOrCreate([
            'name' => 'custom',
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

        /*
         * Fiche efficacité mirrors Project document access: roles that fully
         * manage dossiers/contracts get the full set; read-only Project roles
         * get the read set; roles without Project access get nothing.
         */
        $efficiencySheetPerms = [
            'projects.efficiency_sheet.view',
            'projects.efficiency_sheet.create',
            'projects.efficiency_sheet.update',
            'projects.efficiency_sheet.generate',
            'projects.efficiency_sheet.download',
            'projects.efficiency_sheet.delete',
        ];

        $efficiencySheetReadPerms = [
            'projects.efficiency_sheet.view',
            'projects.efficiency_sheet.download',
        ];

        $permissionModels = Permission::query()
            ->where('guard_name', 'web')
            ->whereIn('name', $permissions)
            ->get();

        $admin->syncPermissions(Permission::all());
        $superAdmin->syncPermissions(Permission::all());

        $operationsManagerPermissions = array_merge([
            'view dashboard',
            'manage clients',
            'manage dossiers',
            'manage documents',
            'manage contracts',
            'manage archives',
            'view tasks',
            'manage tasks',
            'view inbox',
            'manage inbox',
            'view notifications',
            'manage notifications',
            'view workload',
            'view operations reports',
            'calendar.view',
            'calendar.create',
            'calendar.update',
            'calendar.delete',
            'view qa',
        ], $projectDesignManagerPerms, $efficiencySheetPerms);

        $managerFinanceReadPermissions = [
            'finance.view',
            'finance.payments.view',
            'finance.expenses.view',
            'finance.templates.view',
            'finance.settings.view',
        ];

        $financeAdminPermissions = [
            'view dashboard',
            'view inbox',
            'view notifications',
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
        ];

        $operationsManager->syncPermissions(
            $permissionModels->whereIn('name', $operationsManagerPermissions)
        );

        $financeAdmin->syncPermissions(
            $permissionModels->whereIn('name', $financeAdminPermissions)
        );

        $manager->syncPermissions(
            $permissionModels->whereIn('name', array_merge(
                $operationsManagerPermissions,
                $managerFinanceReadPermissions,
            ))
        );

        $staff->syncPermissions(
            $permissionModels->whereIn('name', array_merge([
                'view dashboard',
                'manage clients',
                'manage dossiers',
                'manage documents',
                'manage contracts',
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
                'view inbox',
                'manage inbox',
                'view notifications',
                'calendar.view',
                'calendar.create',
                'calendar.update',
                'calendar.delete',
            ], $projectDesignPerms, $efficiencySheetPerms))
        );

        $viewer->syncPermissions(
            $permissionModels->whereIn('name', array_merge([
                'view dashboard',
                'view tasks',
                'view inbox',
                'view notifications',
                'calendar.view',
                'finance.view',
                'finance.payments.view',
                'finance.expenses.view',
                'finance.templates.view',
                'finance.settings.view',
            ], [
                'project-design.view',
            ], $efficiencySheetReadPerms))
        );

        $custom->syncPermissions([]);

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
