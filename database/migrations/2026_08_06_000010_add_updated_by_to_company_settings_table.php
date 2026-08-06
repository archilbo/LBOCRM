<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('company_settings') || Schema::hasColumn('company_settings', 'updated_by')) {
            return;
        }

        Schema::table('company_settings', function (Blueprint $table) {
            $table->foreignId('updated_by')
                ->nullable()
                ->after('is_public')
                ->constrained('users')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('company_settings') || !Schema::hasColumn('company_settings', 'updated_by')) {
            return;
        }

        Schema::table('company_settings', function (Blueprint $table) {
            $table->dropConstrainedForeignId('updated_by');
        });
    }
};
