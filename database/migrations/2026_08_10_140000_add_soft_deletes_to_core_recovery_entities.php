<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        foreach (['clients', 'intermediaries', 'dossiers'] as $tableName) {
            Schema::table($tableName, function (Blueprint $table): void { $table->softDeletes()->index(); });
        }
    }

    public function down(): void
    {
        foreach (['clients', 'intermediaries', 'dossiers'] as $tableName) {
            Schema::table($tableName, function (Blueprint $table): void { $table->dropSoftDeletes(); });
        }
    }
};
