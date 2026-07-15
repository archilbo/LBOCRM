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
    }
}