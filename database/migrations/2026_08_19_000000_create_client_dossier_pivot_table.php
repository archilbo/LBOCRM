<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * PHASE A of the Clients <-> Dossiers many-to-many migration.
 *
 * - Creates the client_dossier pivot (unique per pair, is_primary, role).
 * - Backfills membership from the legacy dossiers.client_id column
 *   (every existing dossier keeps its historical owner as PRIMARY).
 * - Keeps dossiers.client_id in place for backward compatibility; only its
 *   foreign-key delete behavior is relaxed from cascadeOnDelete to
 *   nullOnDelete so purging one client can never destroy shared projects.
 *
 * The legacy column is intentionally NOT removed in this migration.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('client_dossier', function (Blueprint $table) {
            $table->id();
            // A permanently deleted client must never cascade into shared
            // project membership. RecoveryService blocks such purges until
            // relationships are reassigned or detached deliberately.
            $table->foreignId('client_id')->constrained('clients')->restrictOnDelete();
            $table->foreignId('dossier_id')->constrained('dossiers')->cascadeOnDelete();
            $table->boolean('is_primary')->default(false);
            $table->string('role', 100)->nullable();
            $table->timestamps();

            $table->unique(['client_id', 'dossier_id'], 'client_dossier_pair_unique');
            $table->index('dossier_id', 'client_dossier_dossier_index');
        });

        // Idempotent backfill: each existing dossier.client_id becomes a
        // primary membership. NOT EXISTS keeps retries/recovery duplicate-free.
        // CURRENT_TIMESTAMP (standard SQL) works on both MySQL/MariaDB and
        // the SQLite test database — now() does not exist on SQLite.
        DB::table('client_dossier')->insertUsing(
            ['client_id', 'dossier_id', 'is_primary', 'created_at', 'updated_at'],
            DB::table('dossiers')
                ->whereNotNull('client_id')
                ->select('client_id', 'id')
                ->selectRaw('1 as is_primary')
                ->selectRaw('CURRENT_TIMESTAMP as created_at')
                ->selectRaw('CURRENT_TIMESTAMP as updated_at')
                ->whereNotExists(function ($query): void {
                    $query->selectRaw('1')
                        ->from('client_dossier')
                        ->whereColumn('client_dossier.client_id', 'dossiers.client_id')
                        ->whereColumn('client_dossier.dossier_id', 'dossiers.id');
                }),
        );

        // Purge safety: deleting (force-deleting) a client must never delete
        // its shared projects. The column stays; only the FK behavior changes.
        Schema::table('dossiers', function (Blueprint $table) {
            $table->dropForeign(['client_id']);
            $table->foreignId('client_id')->nullable()->change();
            $table->foreign('client_id')->references('id')->on('clients')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('dossiers', function (Blueprint $table) {
            $table->dropForeign(['client_id']);
            $table->foreignId('client_id')->nullable(false)->change();
            $table->foreign('client_id')->references('id')->on('clients')->cascadeOnDelete();
        });

        Schema::dropIfExists('client_dossier');
    }
};
