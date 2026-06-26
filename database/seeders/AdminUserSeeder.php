<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $email = env('ADMIN_EMAIL', 'admin@archilbo.local');
        $password = env('ADMIN_PASSWORD', 'password');
        $name = env('ADMIN_NAME', 'ARCHI LBO Admin');

        if (app()->environment('production') && env('ADMIN_PASSWORD') === null) {
            return;
        }

        User::query()->updateOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => Hash::make($password),
            ],
        );
    }
}