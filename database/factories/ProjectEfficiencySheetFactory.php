<?php

namespace Database\Factories;

use App\Models\Dossier;
use App\Models\ProjectEfficiencySheet;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProjectEfficiencySheetFactory extends Factory
{
    protected $model = ProjectEfficiencySheet::class;

    public function definition(): array
    {
        return [
            'dossier_id' => Dossier::factory(),
            'status' => 'draft',
            'version' => 1,
            'template_key' => 'fiche_efficacite',
        ];
    }
}
