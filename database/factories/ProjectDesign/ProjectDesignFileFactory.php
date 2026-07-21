<?php

namespace Database\Factories\ProjectDesign;

use App\Models\Dossier;
use App\Models\ProjectDesign\ProjectDesignFile;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProjectDesignFileFactory extends Factory
{
    protected $model = ProjectDesignFile::class;

    public function definition(): array
    {
        return [
            'dossier_id' => Dossier::factory(),
            'name' => $this->faker->words(3, true),
            'description' => $this->faker->sentence(),
            'type' => $this->faker->randomElement(['source', 'review', 'supporting']),
            'status' => 'active',
            'sort_order' => 0,
        ];
    }

    public function source(): static
    {
        return $this->state(['type' => 'source']);
    }

    public function review(): static
    {
        return $this->state(['type' => 'review']);
    }

    public function archived(): static
    {
        return $this->state(['status' => 'archived']);
    }
}
