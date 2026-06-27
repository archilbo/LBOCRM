<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('document_template_versions')) {
            return;
        }

        Schema::create('document_template_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_template_id')->constrained('document_templates')->cascadeOnDelete();
            $table->unsignedInteger('version_number')->default(1);
            $table->string('name');
            $table->string('slug')->nullable();
            $table->string('type')->index();
            $table->boolean('is_default')->default(false);
            $table->string('paper_size')->default('A4');
            $table->string('orientation')->default('portrait');
            $table->longText('header_html')->nullable();
            $table->longText('body_html')->nullable();
            $table->longText('footer_html')->nullable();
            $table->longText('css')->nullable();
            $table->json('settings')->nullable();
            $table->string('logo_path')->nullable();
            $table->string('snapshot_reason')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['document_template_id', 'version_number'], 'template_version_unique');
            $table->index(['document_template_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_template_versions');
    }
};