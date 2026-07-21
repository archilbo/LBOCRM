<?php

namespace Database\Factories\ProjectDesign;

use App\Models\ProjectDesign\ProjectDesignAnnotation;
use App\Models\ProjectDesign\ProjectDesignFileVersion;
use App\Models\Company;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProjectDesignAnnotationFactory extends Factory
{
    protected $model = ProjectDesignAnnotation::class;

    public function definition(): array
    {
        return [
            'company_id' => Company::factory(),
            'version_id' => ProjectDesignFileVersion::factory(),
            'type' => $this->faker->randomElement(['pin', 'rectangle', 'arrow']),
            'geometry' => [
                'x' => $this->faker->randomFloat(4, 0.1, 0.9),
                'y' => $this->faker->randomFloat(4, 0.1, 0.9),
                'width' => $this->faker->randomFloat(4, 0.05, 0.3),
                'height' => $this->faker->randomFloat(4, 0.05, 0.3),
            ],
            'authored_by' => User::factory(),
        ];
    }
}
