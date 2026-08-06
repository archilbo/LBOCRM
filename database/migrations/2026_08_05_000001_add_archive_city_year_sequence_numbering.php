<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── 1. Per-company × city × year counter table ──
        // Mirrors dossier_number_sequences, but scoped by company because dossiers
        // (and therefore archive numbers) are company-scoped while cities are global.
        Schema::create('archive_number_sequences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->foreignId('city_id')->constrained('cities')->cascadeOnDelete();
            $table->unsignedSmallInteger('year');
            $table->unsignedInteger('last_sequence')->default(0);
            $table->timestamps();

            $table->unique(['company_id', 'city_id', 'year']);
        });

        // ── 2. Scope snapshots on archive_records (company/city come from the
        //       dossier; archive_year/archive_sequence are the yearly components) ──
        Schema::table('archive_records', function (Blueprint $table) {
            $table->foreignId('company_id')->nullable()->after('dossier_id')->constrained('companies')->nullOnDelete();
            $table->foreignId('city_id')->nullable()->after('company_id')->constrained('cities')->nullOnDelete();
            $table->unsignedSmallInteger('archive_year')->nullable()->after('city_id');
            $table->unsignedInteger('archive_sequence')->nullable()->after('archive_year');
        });

        // ── 3. Deterministic backfill: legacy numbers are NEVER rewritten, only the
        //       scope snapshots + sequences are derived (by id order, per scope/year) ──
        $this->backfillArchiveScope();

        // ── 4. DB-level guarantees: number unique per company; sequence unique per
        //       logical scope (company × city × year × sequence). Explicit short
        //       name: the auto-generated one exceeds MySQL's 64-char limit. ──
        Schema::table('archive_records', function (Blueprint $table) {
            $table->dropUnique(['archive_number']);
            $table->unique(['company_id', 'archive_number']);
            $table->unique(['company_id', 'city_id', 'archive_year', 'archive_sequence'], 'archive_records_scope_unique');
        });
    }

    public function down(): void
    {
        Schema::table('archive_records', function (Blueprint $table) {
            $table->dropUnique(['company_id', 'archive_number']);
            $table->dropUnique('archive_records_scope_unique');
            $table->unique('archive_number');
            $table->dropForeign(['company_id']);
            $table->dropForeign(['city_id']);
            $table->dropColumn(['company_id', 'city_id', 'archive_year', 'archive_sequence']);
        });

        Schema::dropIfExists('archive_number_sequences');
    }

    private function backfillArchiveScope(): void
    {
        $records = DB::table('archive_records')
            ->join('dossiers', 'dossiers.id', '=', 'archive_records.dossier_id')
            ->select([
                'archive_records.id',
                'archive_records.created_at',
                'dossiers.company_id',
                'dossiers.city_id',
            ])
            ->orderBy('archive_records.id')
            ->get();

        $sequences = [];

        foreach ($records as $record) {
            $companyId = $record->company_id;
            $cityId = $record->city_id;

            if (! $companyId) {
                Log::warning("[archive numbering backfill] archive_records.{$record->id} has no dossier company_id; left without company scope.");
            }
            if (! $cityId) {
                Log::warning("[archive numbering backfill] archive_records.{$record->id} has no dossier city_id; left without city scope.");
            }

            $year = $record->created_at
                ? (int) date('Y', strtotime($record->created_at))
                : (int) now()->format('Y');

            $key = ($companyId ?? 0) . '|' . ($cityId ?? 0) . '|' . $year;
            $sequences[$key] = ($sequences[$key] ?? 0) + 1;

            DB::table('archive_records')
                ->where('id', $record->id)
                ->update([
                    'company_id' => $companyId,
                    'city_id' => $cityId,
                    'archive_year' => $year,
                    'archive_sequence' => $sequences[$key],
                ]);
        }

        // Pre-seed counters so the next generated number continues after legacy data.
        $groups = DB::table('archive_records')
            ->select('company_id', 'city_id', 'archive_year')
            ->selectRaw('MAX(archive_sequence) as max_sequence')
            ->whereNotNull('company_id')
            ->whereNotNull('city_id')
            ->whereNotNull('archive_year')
            ->groupBy('company_id', 'city_id', 'archive_year')
            ->get();

        foreach ($groups as $group) {
            DB::table('archive_number_sequences')->insertOrIgnore([
                'company_id' => $group->company_id,
                'city_id' => $group->city_id,
                'year' => $group->archive_year,
                'last_sequence' => $group->max_sequence,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
};
