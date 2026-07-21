<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $this->call([
            CitySeeder::class,
            AdminUserSeeder::class,
            RolesAndPermissionsSeeder::class,
            ArchiLboMasterSeeder::class,
            TaskDemoSeeder::class,
            NotificationsDemoSeeder::class,
            CalendarDemoSeeder::class,
            ChatDemoSeeder::class,
            DemoDataSeeder::class,
            ExpensesDemoSeeder::class,
            ArchiveDemoSeeder::class,
            FinanceDemoSeeder::class,
        ]);
        
        app(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();

        $admin = \Spatie\Permission\Models\Role::findByName('admin', 'web');
        $manager = \Spatie\Permission\Models\Role::findByName('manager', 'web');
        $staff = \Spatie\Permission\Models\Role::findByName('staff', 'web');

        \App\Models\User::query()
            ->where('email', env('ADMIN_EMAIL', 'admin@archilbo.local'))
            ->each(fn (\App\Models\User $u) => $u->syncRoles([$admin]));

        \App\Models\User::query()
            ->where('email', 'manager@archilbo.local')
            ->each(fn (\App\Models\User $u) => $u->syncRoles([$manager]));

        \App\Models\User::query()
            ->whereDoesntHave('roles')
            ->get()
            ->each(fn (\App\Models\User $u) => $u->assignRole($staff));

        $company = \App\Models\Company::query()->where('is_active', true)->first();
        $branch = $company?->branches()->where('is_active', true)->first();

        if ($company) {
            \App\Models\User::query()->whereNull('company_id')->update([
                'company_id' => $company->id,
                'branch_id' => $branch?->id,
            ]);
        }

        \App\Models\Conversation::query()
            ->whereNull('company_id')
            ->whereHas('participants')
            ->each(function (\App\Models\Conversation $c) {
                $first = $c->participants()->with('user')->first();
                if ($first && $first->user?->company_id) {
                    $c->update(['company_id' => $first->user->company_id]);
                }
            });
    }
}
