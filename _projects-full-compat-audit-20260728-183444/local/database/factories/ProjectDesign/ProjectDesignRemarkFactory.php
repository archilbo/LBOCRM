<?php

namespace Database\Factories\ProjectDesign;

use App\Models\Company;
use App\Models\ProjectDesign\ProjectDesignFileVersion;
use App\Models\ProjectDesign\ProjectDesignRemark;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProjectDesignRemarkFactory extends Factory
{
    protected $model = ProjectDesignRemark::class;

    public function definition(): array
    {
        $company = Company::first() ?? Company::factory()->create();
        $version = ProjectDesignFileVersion::factory()->create();
        return [
            'company_id' => $company->id,
            'version_id' => $version->id,
            'severity' => $this->faker->randomElement(['information', 'minor', 'normal', 'major', 'critical']),
            'status' => 'open',
            'title' => $this->faker->sentence(),
            'description' => $this->faker->paragraph(),
            'created_by' => User::factory(),
        ];
    }
}
