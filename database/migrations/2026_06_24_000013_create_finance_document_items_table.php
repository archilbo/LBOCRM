<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('finance_document_items')) {
            return;
        }

        Schema::create('finance_document_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('finance_document_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('position')->default(1);
            $table->string('title')->nullable();
            $table->text('description')->nullable();
            $table->decimal('quantity', 14, 3)->default(1);
            $table->string('unit')->nullable();
            $table->decimal('unit_price', 14, 2)->default(0);
            $table->decimal('discount_rate', 8, 2)->default(0);
            $table->decimal('tva_rate', 8, 2)->default(20);
            $table->decimal('total_ht', 14, 2)->default(0);
            $table->decimal('total_tva', 14, 2)->default(0);
            $table->decimal('total_ttc', 14, 2)->default(0);
            $table->timestamps();

            $table->index('finance_document_id');
            $table->index('position');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('finance_document_items');
    }
};
