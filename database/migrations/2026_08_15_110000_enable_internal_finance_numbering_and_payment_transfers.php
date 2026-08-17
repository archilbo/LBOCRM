<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('finance_documents', function (Blueprint $table): void {
            $table->dropUnique('finance_documents_number_unique');
            $table->unique(['company_id', 'type', 'number'], 'finance_documents_company_type_number_unique');
        });

        Schema::create('payment_document_transfers', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('payment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('from_finance_document_id')->constrained('finance_documents')->restrictOnDelete();
            $table->foreignId('to_finance_document_id')->constrained('finance_documents')->restrictOnDelete();
            $table->decimal('amount', 14, 2);
            $table->string('reason', 80);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique('payment_id', 'payment_document_transfers_payment_unique');
            $table->index(['company_id', 'from_finance_document_id'], 'payment_transfers_company_from_index');
            $table->index(['company_id', 'to_finance_document_id'], 'payment_transfers_company_to_index');
        });
    }

    public function down(): void
    {
        $hasSharedNumbers = DB::table('finance_documents')
            ->select('number')
            ->whereNotNull('number')
            ->groupBy('number')
            ->havingRaw('COUNT(*) > 1')
            ->exists();

        if ($hasSharedNumbers) {
            throw new \RuntimeException('Rollback is unsafe after per-type finance numbers have been allocated.');
        }

        Schema::dropIfExists('payment_document_transfers');

        Schema::table('finance_documents', function (Blueprint $table): void {
            $table->dropUnique('finance_documents_company_type_number_unique');
            $table->unique('number', 'finance_documents_number_unique');
        });
    }
};
