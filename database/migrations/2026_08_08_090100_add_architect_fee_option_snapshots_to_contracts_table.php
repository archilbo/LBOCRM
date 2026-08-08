<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('contracts', function (Blueprint $table) {
            $table->foreignId('architect_fee_option_id')->nullable()->after('fee_rate_percent')
                ->constrained('architect_fee_options')->nullOnDelete();
            $table->string('architect_fee_type', 20)->nullable()->after('architect_fee_option_id');
            $table->decimal('architect_fee_rate', 8, 4)->nullable()->after('architect_fee_type');
            $table->decimal('architect_fee_amount', 12, 2)->nullable()->after('architect_fee_rate');
            $table->string('architect_fee_label')->nullable()->after('architect_fee_amount');
            $table->string('contract_template_key', 50)->nullable()->after('architect_fee_label');
        });
    }

    public function down(): void
    {
        Schema::table('contracts', function (Blueprint $table) {
            $table->dropConstrainedForeignId('architect_fee_option_id');
            $table->dropColumn(['architect_fee_type', 'architect_fee_rate', 'architect_fee_amount', 'architect_fee_label', 'contract_template_key']);
        });
    }
};
