<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('dossiers', function (Blueprint $table): void {
            $table->foreignId('intermediary_id')
                ->nullable()
                ->after('client_id')
                ->constrained('intermediaries')
                ->nullOnDelete();
        });

        // Preserve current referral data while projects become the source of truth.
        DB::table('dossiers')
            ->whereNull('intermediary_id')
            ->whereNotNull('client_id')
            ->update([
                'intermediary_id' => DB::raw('(SELECT intermediary_id FROM clients WHERE clients.id = dossiers.client_id)'),
            ]);
    }

    public function down(): void
    {
        Schema::table('dossiers', function (Blueprint $table): void {
            $table->dropForeign(['intermediary_id']);
            $table->dropColumn('intermediary_id');
        });
    }
};
