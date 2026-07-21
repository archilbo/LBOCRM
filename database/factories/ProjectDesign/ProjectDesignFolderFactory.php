<?php

namespace Database\Factories\ProjectDesign;

use App\Models\Company;
use App\Models\Dossier;
use App\Models\ProjectDesign\ProjectDesignFolder;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProjectDesignFolderFactory extends Factory
{
    protected $model = ProjectDesignFolder::class;

    public function definition(): array
    {
        $company = Company::first() ?? Company::factory()->create();
        $dossier = Dossier::factory()->create();
        return [
            'company_id' => $company->id,
            'dossier_id' => $dossier->id,
            'name' => $this->faker->word(),
        ];
    }
}
