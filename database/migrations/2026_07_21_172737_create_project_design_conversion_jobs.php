<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('project_design_conversion_jobs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('company_id');
            $table->unsignedBigInteger('asset_id');
            $table->string('provider', 50);
            $table->string('provider_job_id', 255)->nullable();
            $table->string('status', 30)->default('queued');
            $table->unsignedInteger('progress')->default(0);
            $table->text('error_message')->nullable();
            $table->string('error_code', 100)->nullable();
            $table->unsignedBigInteger('derivative_asset_id')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->unsignedTinyInteger('retry_count')->default(0);
            $table->timestamps();

            $table->index('company_id');
            $table->index('asset_id');
            $table->index('status');
            $table->index(['asset_id', 'provider']);
            $table->foreign('company_id')->references('id')->on('companies');
            $table->foreign('asset_id')->references('id')->on('project_design_assets')->cascadeOnDelete();
            $table->foreign('derivative_asset_id')->references('id')->on('project_design_assets')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_design_conversion_jobs');
    }
};
