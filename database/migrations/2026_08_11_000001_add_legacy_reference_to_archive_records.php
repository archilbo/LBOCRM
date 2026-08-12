<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('archive_records', function (Blueprint $table): void {
            $table->string('legacy_reference', 120)->nullable()->after('archive_number');
            $table->index(['company_id', 'legacy_reference'], 'archive_records_legacy_reference_idx');
        });
    }

    public function down(): void
    {
        Schema::table('archive_records', function (Blueprint $table): void {
            $table->dropIndex('archive_records_legacy_reference_idx');
            $table->dropColumn('legacy_reference');
        });
    }
};
