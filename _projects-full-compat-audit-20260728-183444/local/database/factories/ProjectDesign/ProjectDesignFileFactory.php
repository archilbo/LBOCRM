<?php

namespace Database\Factories\ProjectDesign;

use App\Models\Company;
use App\Models\Dossier;
use App\Models\ProjectDesign\ProjectDesignFile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProjectDesignFileFactory extends Factory
{
    protected $model = ProjectDesignFile::class;

    public function definition(): array
    {
        $dossier = Dossier::factory()->create();
        $company = Company::first() ?? Company::factory()->create();
        return [
            'company_id' => $company->id,
            'dossier_id' => $dossier->id,
            'name' => $this->faker->words(3, true),
            'description' => $this->faker->sentence(),
            'discipline' => $this->faker->randomElement(['architecture', 'structure', 'mep', 'interior', 'landscape']),
            'category' => $this->faker->randomElement(['plan', 'section', 'elevation', 'detail', 'schedule']),
            'status' => 'active',
            'requires_approval' => true,
            'created_by' => User::factory(),
        ];
    }

    public function archived(): static
    {
        return $this->state(['status' => 'archived', 'archived_at' => now()]);
    }
}
