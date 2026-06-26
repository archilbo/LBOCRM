<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('finance_templates', function (Blueprint $table) {
            $table->id();
            $table->string('type')->index();
            $table->string('name');
            $table->string('slug')->unique();
            $table->boolean('is_default')->default(false);
            $table->string('paper_size')->default('A4');
            $table->string('orientation')->default('portrait');
            $table->longText('header_html')->nullable();
            $table->longText('body_html')->nullable();
            $table->longText('footer_html')->nullable();
            $table->longText('css')->nullable();
            $table->json('settings')->nullable();
            $table->string('logo_path')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('finance_templates');
    }
};
