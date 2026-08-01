<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Only run if the old city_id column still exists (already-migrated installs are no-ops)
        if (!Schema::hasColumn('dossier_number_sequences', 'city_id')) {
            return;
        }

        // ── 1. Merge duplicate periods: keep the row with the highest last_seq ──
        $duplicates = DB::table('dossier_number_sequences')
            ->select('period', DB::raw('MAX(last_seq) as max_seq'))
            ->groupBy('period')
            ->havingRaw('COUNT(*) > 1')
            ->get();

        foreach ($duplicates as $dup) {
            DB::table('dossier_number_sequences')
                ->where('period', $dup->period)
                ->where('last_seq', '<', $dup->max_seq)
                ->delete();
        }

        // ── 2. Drop city_id FK first (MySQL 1553: the composite unique index is
        //       needed by the FK, so the FK must go before the index/column) ──
        Schema::table('dossier_number_sequences', function (Blueprint $table) {
            $table->dropForeign(['city_id']);
            $table->dropUnique(['city_id', 'period']);
            $table->dropColumn('city_id');
            $table->unique('period');
        });
    }

    public function down(): void
    {
        if (Schema::hasColumn('dossier_number_sequences', 'city_id')) {
            return; // Can't reverse if already reversed
        }

        Schema::table('dossier_number_sequences', function (Blueprint $table) {
            $table->dropUnique(['period']);
            $table->foreignId('city_id')->nullable()->constrained()->cascadeOnDelete();
            $table->unique(['city_id', 'period']);
        });
    }
};
