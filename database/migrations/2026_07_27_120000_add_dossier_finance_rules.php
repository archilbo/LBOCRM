<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('finance_documents', function (Blueprint $table) {
            if (! Schema::hasColumn('finance_documents', 'active_invoice_dossier_key')) {
                $table->string('active_invoice_dossier_key')->nullable()->after('dossier_id');
                $table->unique(['company_id', 'active_invoice_dossier_key'], 'finance_documents_active_invoice_unique');
            }
        });

        Schema::table('payments', function (Blueprint $table) {
            if (! Schema::hasColumn('payments', 'payment_kind')) {
                $table->dropForeign(['finance_document_id']);
                $table->foreignId('finance_document_id')->nullable()->change();
                $table->string('payment_kind')->default('invoice')->after('finance_document_id')->index();
                $table->foreign('finance_document_id')->references('id')->on('finance_documents')->nullOnDelete();
            }
        });

        $groups = DB::table('finance_documents')
            ->where('type', 'invoice')
            ->where('status', '!=', 'cancelled')
            ->whereNull('deleted_at')
            ->whereNotNull('dossier_id')
            ->selectRaw('company_id, branch_id, dossier_id, COUNT(*) as total')
            ->groupBy('company_id', 'branch_id', 'dossier_id')
            ->get()
            ->keyBy(fn (object $row) => $this->groupKey($row->company_id, $row->branch_id, $row->dossier_id));

        DB::table('finance_documents')
            ->where('type', 'invoice')
            ->where('status', '!=', 'cancelled')
            ->whereNull('deleted_at')
            ->whereNotNull('dossier_id')
            ->orderBy('id')
            ->each(function (object $document) use ($groups) {
                $key = $this->groupKey($document->company_id, $document->branch_id, $document->dossier_id);

                if ((int) ($groups[$key]->total ?? 0) !== 1) {
                    return;
                }

                DB::table('finance_documents')->where('id', $document->id)->update([
                    'active_invoice_dossier_key' => $this->invoiceGuardKey($document->branch_id, $document->dossier_id),
                ]);
            });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            if (Schema::hasColumn('payments', 'payment_kind')) {
                $table->dropForeign(['finance_document_id']);
                $table->dropIndex(['payment_kind']);
                $table->dropColumn('payment_kind');
                $table->foreignId('finance_document_id')->nullable()->change();
                $table->foreign('finance_document_id')->references('id')->on('finance_documents')->cascadeOnDelete();
            }
        });

        Schema::table('finance_documents', function (Blueprint $table) {
            if (Schema::hasColumn('finance_documents', 'active_invoice_dossier_key')) {
                $table->dropUnique('finance_documents_active_invoice_unique');
                $table->dropColumn('active_invoice_dossier_key');
            }
        });
    }

    private function groupKey(mixed $companyId, mixed $branchId, mixed $dossierId): string
    {
        return sprintf('%s:%s:%s', $companyId, $branchId ?? 'global', $dossierId);
    }

    private function invoiceGuardKey(mixed $branchId, mixed $dossierId): string
    {
        return sprintf('branch:%s:dossier:%s', $branchId ?? 'global', $dossierId);
    }
};
