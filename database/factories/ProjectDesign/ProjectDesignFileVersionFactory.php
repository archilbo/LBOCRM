<?php

namespace Database\Factories\ProjectDesign;

use App\Models\ProjectDesign\ProjectDesignFile;
use App\Models\ProjectDesign\ProjectDesignFileVersion;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProjectDesignFileVersionFactory extends Factory
{
    protected $model = ProjectDesignFileVersion::class;

    public function definition(): array
    {
        return [
            'file_id' => ProjectDesignFile::factory(),
            'version_number' => 1,
            'status' => 'draft',
            'file_size' => $this->faker->numberBetween(1000, 5000000),
            'mime_type' => $this->faker->mimeType(),
            'original_filename' => $this->faker->word() . '.pdf',
            'disk_path' => 'project-design/' . $this->faker->uuid() . '.pdf',
            'disk' => 'local',
        ];
    }
}
