<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Company;
use App\Models\Branch;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $email = env('ADMIN_EMAIL', 'admin@archilbo.local');
        $password = env('ADMIN_PASSWORD', 'password');
        $name = env('ADMIN_NAME', 'ARCHI LBO Admin');
        $company = Company::query()->where('slug', 'archi-lbo')->first();
        $branch = $company ? Branch::query()->where('company_id', $company->id)->where('code', 'RAK')->first() : null;

        if (app()->environment('production') && env('ADMIN_PASSWORD') === null) {
            return;
        }

        User::query()->updateOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => Hash::make($password),
                'company_id' => $company?->id,
                'branch_id' => $branch?->id,
            ],
        );
    }
}
