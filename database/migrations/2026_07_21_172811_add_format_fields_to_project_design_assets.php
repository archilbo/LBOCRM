<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('project_design_assets', function (Blueprint $table) {
            $table->string('source_application', 50)->nullable()->after('asset_type');
            $table->string('conversion_status', 30)->nullable()->after('scan_status');

            $table->index('source_application');
            $table->index('conversion_status');
        });
    }

    public function down(): void
    {
        Schema::table('project_design_assets', function (Blueprint $table) {
            $table->dropIndex(['source_application']);
            $table->dropIndex(['conversion_status']);
            $table->dropColumn('source_application');
            $table->dropColumn('conversion_status');
        });
    }
};
