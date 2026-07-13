<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('finance_document_items', function (Blueprint $table) {
            $table->dropColumn(['discount_rate', 'tva_rate']);
        });
    }

    public function down(): void
    {
        Schema::table('finance_document_items', function (Blueprint $table) {
            $table->decimal('discount_rate', 8, 2)->default(0)->after('unit_price');
            $table->decimal('tva_rate', 8, 2)->default(20)->after('discount_rate');
        });
    }
};
