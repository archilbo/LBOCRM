<?php

namespace Database\Factories;

use App\Models\Dossier;
use Illuminate\Database\Eloquent\Factories\Factory;

class DossierFactory extends Factory
{
    protected $model = Dossier::class;

    public function definition(): array
    {
        return [
            'client_id' => \App\Models\Client::factory(),
            'dossier_number' => 'DOS-TEST-' . $this->faker->unique()->randomNumber(5),
            'project_object' => $this->faker->sentence(3),
            'status' => 'active',
            'workflow_step' => 'contract',
            'opened_at' => now(),
        ];
    }
}
