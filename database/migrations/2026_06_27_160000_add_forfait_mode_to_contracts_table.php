<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('contracts', function (Blueprint $table) {
            if (! Schema::hasColumn('contracts', 'calculation_mode')) {
                $table->string('calculation_mode', 20)->default('percentage')->after('fee_rate_percent');
            }

            if (! Schema::hasColumn('contracts', 'forfait_ttc')) {
                $table->decimal('forfait_ttc', 12, 2)->nullable()->after('calculation_mode');
            }
        });
    }

    public function down(): void
    {
        Schema::table('contracts', function (Blueprint $table) {
            if (Schema::hasColumn('contracts', 'forfait_ttc')) {
                $table->dropColumn('forfait_ttc');
            }

            if (Schema::hasColumn('contracts', 'calculation_mode')) {
                $table->dropColumn('calculation_mode');
            }
        });
    }
};
