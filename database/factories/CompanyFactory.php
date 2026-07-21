<?php

namespace Database\Factories;

use App\Models\Company;
use Illuminate\Database\Eloquent\Factories\Factory;

class CompanyFactory extends Factory
{
    protected $model = Company::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->company(),
            'legal_name' => $this->faker->company(),
            'slug' => $this->faker->unique()->slug(2),
            'is_active' => true,
        ];
    }
}
