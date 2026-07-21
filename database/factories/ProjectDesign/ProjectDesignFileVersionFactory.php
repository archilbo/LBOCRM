<?php

namespace Database\Factories\ProjectDesign;

use App\Models\Company;
use App\Models\ProjectDesign\ProjectDesignFile;
use App\Models\ProjectDesign\ProjectDesignFileVersion;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProjectDesignFileVersionFactory extends Factory
{
    protected $model = ProjectDesignFileVersion::class;

    public function definition(): array
    {
        $file = ProjectDesignFile::factory()->create();
        $company = Company::first() ?? Company::factory()->create();
        return [
            'company_id' => $company->id,
            'dossier_id' => $file->dossier_id,
            'file_id' => $file->id,
            'version_number' => 1,
            'status' => 'draft',
            'upload_status' => 'pending',
            'preview_status' => 'pending',
            'review_status' => 'none',
            'uploaded_by' => User::factory(),
        ];
    }
}
