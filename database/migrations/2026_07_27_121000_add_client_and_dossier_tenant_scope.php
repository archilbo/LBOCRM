<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        foreach (['clients', 'dossiers'] as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->foreignId('company_id')->nullable()->constrained()->nullOnDelete();
                $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
                $table->index(['company_id', 'branch_id']);
            });
        }

        $companyId = DB::table('companies')->where('slug', 'archi-lbo')->value('id');
        $branchId = $companyId
            ? DB::table('branches')->where('company_id', $companyId)->where('code', 'RAK')->value('id')
            : null;

        if (! $companyId || ! $branchId) {
            throw new RuntimeException('La societe ARCHI LBO ou la branche RAK est requise avant le backfill clients/dossiers.');
        }

        foreach (['clients', 'dossiers'] as $tableName) {
            DB::table($tableName)
                ->whereNull('company_id')
                ->update(['company_id' => $companyId, 'branch_id' => $branchId]);
        }
    }

    public function down(): void
    {
        foreach (['dossiers', 'clients'] as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->dropIndex(['company_id', 'branch_id']);
                $table->dropForeign(['company_id']);
                $table->dropForeign(['branch_id']);
                $table->dropColumn(['company_id', 'branch_id']);
            });
        }
    }
};
