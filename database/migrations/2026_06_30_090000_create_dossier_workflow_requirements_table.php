<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dossier_workflow_requirements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dossier_id')->constrained('dossiers')->cascadeOnDelete();
            $table->string('step_key');
            $table->string('requirement_key');
            $table->boolean('is_done')->default(false);
            $table->timestamp('checked_at')->nullable();
            $table->foreignId('checked_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['dossier_id', 'step_key', 'requirement_key'], 'dossier_workflow_requirement_unique');
            $table->index(['dossier_id', 'step_key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dossier_workflow_requirements');
    }
};
