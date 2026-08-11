<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Company;
use App\Models\User;
use Illuminate\Database\Seeder;
use RuntimeException;
use Spatie\Permission\Models\Role;

/**
 * Explicit, idempotent production bootstrap. It is deliberately not part of
 * DatabaseSeeder: production credentials must be supplied only at deployment
 * time and never live in source control.
 */
class ProductionSuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        $email = trim((string) env('PROVISION_SUPER_ADMIN_EMAIL'));
        $password = (string) env('PROVISION_SUPER_ADMIN_PASSWORD');

        if ($email === '' || $password === '') {
            throw new RuntimeException('Set PROVISION_SUPER_ADMIN_EMAIL and PROVISION_SUPER_ADMIN_PASSWORD before running this seeder.');
        }

        $company = Company::query()->where('slug', 'archi-lbo')->first();
        $branch = $company
            ? Branch::query()->where('company_id', $company->id)->where('code', 'RAK')->first()
            : null;

        if (! $company || ! $branch) {
            throw new RuntimeException('Run CompanyBaselineSeeder before provisioning the super administrator.');
        }

        $superAdminRole = Role::query()->where('name', 'super_admin')->where('guard_name', 'web')->first();

        if (! $superAdminRole) {
            throw new RuntimeException('Run RolesAndPermissionsSeeder before provisioning the super administrator.');
        }

        $user = User::query()->firstOrNew(['email' => $email]);
        $user->fill([
            'name' => trim((string) env('PROVISION_SUPER_ADMIN_NAME', 'ARCHI LBO Super Admin')),
            'password' => $password,
            'company_id' => $company->id,
            'branch_id' => $branch->id,
            'suspended_at' => null,
        ]);
        $user->save();
        $user->syncRoles([$superAdminRole]);
    }
}
