<?php

namespace Database\Factories\ProjectDesign;

use App\Models\ProjectDesign\ProjectDesignFileVersion;
use App\Models\ProjectDesign\ProjectDesignRemark;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProjectDesignRemarkFactory extends Factory
{
    protected $model = ProjectDesignRemark::class;

    public function definition(): array
    {
        return [
            'version_id' => ProjectDesignFileVersion::factory(),
            'severity' => $this->faker->randomElement(['cosmetic', 'minor', 'major', 'critical']),
            'status' => 'open',
            'title' => $this->faker->sentence(),
            'description' => $this->faker->paragraph(),
            'created_by' => User::factory(),
        ];
    }
}
