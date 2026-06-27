<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('finance_document_number_counters')) {
            return;
        }

        Schema::create('finance_document_number_counters', function (Blueprint $table): void {
            $table->id();
            $table->string('document_type', 80);
            $table->unsignedInteger('year')->nullable();
            $table->unsignedBigInteger('last_number')->default(0);
            $table->timestamps();

            $table->unique(['document_type', 'year'], 'finance_doc_num_type_year_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('finance_document_number_counters');
    }
};
