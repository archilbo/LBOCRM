<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Company;
use App\Models\Branch;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        if (app()->environment('production')) {
            return;
        }

        $company = Company::query()->where('slug', 'archi-lbo')->first();
        $branch = $company ? Branch::query()->where('company_id', $company->id)->where('code', 'RAK')->first() : null;
        $localPassword = env('LOCAL_BASELINE_PASSWORD');
        $accounts = [
            ['name' => env('ADMIN_NAME', 'ARCHI LBO Admin'), 'email' => env('ADMIN_EMAIL', 'admin@archilbo.local'), 'role' => 'admin'],
            ['name' => 'ARCHI LBO Super Admin', 'email' => 'superadmin@archilbo.local', 'role' => 'super_admin'],
            ['name' => 'Manager User', 'email' => 'manager@archilbo.local', 'role' => 'manager'],
            ['name' => 'Staff User', 'email' => 'staff@archilbo.local', 'role' => 'staff'],
            ['name' => 'Viewer User', 'email' => 'viewer@archilbo.local', 'role' => 'viewer'],
        ];

        $createdCredentials = [];

        foreach ($accounts as $account) {
            $user = User::query()->where('email', $account['email'])->first();

            if (! $user) {
                $temporaryPassword = $localPassword ?: Str::password(24);
                $user = User::query()->create([
                    'name' => $account['name'],
                    'email' => $account['email'],
                    'password' => Hash::make($temporaryPassword),
                    'company_id' => $company?->id,
                    'branch_id' => $branch?->id,
                ]);
                $createdCredentials[] = [$account['email'], $temporaryPassword];
            } else {
                $user->update([
                    'name' => $account['name'],
                    'company_id' => $company?->id,
                    'branch_id' => $branch?->id,
                    ...($localPassword ? ['password' => Hash::make($localPassword)] : []),
                ]);
            }

            $user->syncRoles([Role::findByName($account['role'], 'web')]);
        }

        foreach ($createdCredentials as [$email, $temporaryPassword]) {
            $this->command?->warn("Temporary local login: {$email} / {$temporaryPassword}");
        }
    }
}
