<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Company;
use Illuminate\Database\Seeder;

class CompanyBaselineSeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::query()->updateOrCreate(
            ['slug' => 'archi-lbo'],
            [
                'name' => 'ARCHI LBO',
                'legal_name' => 'ARCHI LBO',
                'is_active' => true,
            ],
        );

        Branch::query()->updateOrCreate(
            ['company_id' => $company->id, 'code' => 'RAK'],
            [
                'name' => 'Marrakech',
                'city' => 'Marrakech',
                'is_active' => true,
            ],
        );
    }
}
