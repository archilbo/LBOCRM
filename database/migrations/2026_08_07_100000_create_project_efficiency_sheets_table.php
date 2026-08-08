<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('project_efficiency_sheets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dossier_id')->constrained('dossiers')->cascadeOnDelete();

            /*
             * Manual fiche fields. Never auto-filled from Client/Project data.
             */
            $table->string('usage_du_batiment')->nullable();
            $table->string('owner_name')->nullable();

            $table->string('status')->default('draft');
            $table->unsignedInteger('version')->default(1);
            $table->string('template_key')->default('fiche_efficacite');

            /*
             * Generated file metadata. Paths stay nullable until generation;
             * only relative project-storage paths may ever be stored here.
             */
            $table->string('docx_path')->nullable();
            $table->string('pdf_path')->nullable();
            $table->foreignId('generated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('generated_at')->nullable();

            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['dossier_id']);
            $table->index(['status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_efficiency_sheets');
    }
};
