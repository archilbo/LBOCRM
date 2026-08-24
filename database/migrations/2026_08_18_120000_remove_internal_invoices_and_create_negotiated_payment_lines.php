<?php

use App\Models\FinanceDocument;
use App\Models\Payment;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * This migration is intentionally irreversible: the product no longer supports
     * internal invoices and the confirmed requirement is to remove their history.
     */
    public function up(): void
    {
        DB::transaction(function (): void {
            $internalDocumentIds = DB::table('finance_documents')
                ->where('type', 'internal_invoice')
                ->pluck('id');

            $paymentIds = DB::table('payments')
                ->where(function ($query) use ($internalDocumentIds): void {
                    if ($internalDocumentIds->isNotEmpty()) {
                        $query->whereIn('finance_document_id', $internalDocumentIds);
                    }

                    $query->orWhere('payment_kind', 'internal_invoice');
                })
                ->pluck('id');

            if ($internalDocumentIds->isNotEmpty() || $paymentIds->isNotEmpty()) {
                $receiptIds = DB::table('payments')
                    ->whereIn('id', $paymentIds)
                    ->whereNotNull('receipt_document_id')
                    ->pluck('receipt_document_id');

                if (Schema::hasTable('payment_document_transfers')) {
                    DB::table('payment_document_transfers')
                        ->whereIn('from_finance_document_id', $internalDocumentIds)
                        ->orWhereIn('to_finance_document_id', $internalDocumentIds)
                        ->delete();
                }

                if (Schema::hasTable('finance_activity_logs')) {
                    DB::table('finance_activity_logs')
                        ->where('subject_type', FinanceDocument::class)
                        ->whereIn('subject_id', $internalDocumentIds)
                        ->delete();
                    DB::table('finance_activity_logs')
                        ->where('subject_type', Payment::class)
                        ->whereIn('subject_id', $paymentIds)
                        ->delete();
                }

                DB::table('payments')->whereIn('id', $paymentIds)->delete();

                if ($receiptIds->isNotEmpty()) {
                    DB::table('finance_documents')->whereIn('id', $receiptIds)->delete();
                }

                DB::table('finance_documents')->whereIn('id', $internalDocumentIds)->delete();
            }

            if (Schema::hasTable('finance_document_sequences')) {
                DB::table('finance_document_sequences')
                    ->where('document_type', 'internal_invoice')
                    ->delete();
            }
        });

        Schema::dropIfExists('payment_document_transfers');

        Schema::create('dossier_negotiated_payment_lines', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('client_id')->constrained()->restrictOnDelete();
            $table->foreignId('dossier_id')->constrained()->cascadeOnDelete();
            $table->string('designation', 255);
            $table->decimal('negotiated_amount', 14, 2);
            $table->unsignedInteger('position')->default(1);
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['company_id', 'branch_id', 'dossier_id'], 'negotiated_payment_lines_scope_dossier_index');
        });

        Schema::table('payments', function (Blueprint $table): void {
            $table->foreignId('dossier_negotiated_payment_line_id')
                ->nullable()
                ->after('dossier_id')
                ->constrained('dossier_negotiated_payment_lines')
                ->restrictOnDelete();
            $table->index('dossier_negotiated_payment_line_id', 'payments_negotiated_line_index');
        });
    }

    public function down(): void
    {
        throw new RuntimeException('Rollback is unsafe: internal-invoice financial records were permanently deleted.');
    }
};
