<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('intermediary_payment_batches', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('intermediary_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 14, 2);
            $table->date('paid_at');
            $table->string('method')->nullable();
            $table->string('reference')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('cancelled_at')->nullable();
            $table->foreignId('cancelled_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('cancellation_reason')->nullable();
            $table->timestamps();
            $table->index(['company_id', 'branch_id', 'intermediary_id', 'paid_at'], 'intermediary_payment_batches_scope_idx');
        });

        Schema::create('intermediary_payment_allocations', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('intermediary_payment_batch_id');
            $table->foreign('intermediary_payment_batch_id', 'intermediary_payment_allocations_batch_fk')->references('id')->on('intermediary_payment_batches')->cascadeOnDelete();
            $table->unsignedBigInteger('dossier_id');
            $table->foreign('dossier_id', 'intermediary_payment_allocations_dossier_fk')->references('id')->on('dossiers')->cascadeOnDelete();
            $table->unsignedBigInteger('finance_document_id');
            $table->foreign('finance_document_id', 'intermediary_payment_allocations_document_fk')->references('id')->on('finance_documents')->cascadeOnDelete();
            $table->unsignedBigInteger('payment_id')->nullable();
            $table->foreign('payment_id', 'intermediary_payment_allocations_payment_fk')->references('id')->on('payments')->nullOnDelete();
            $table->decimal('amount', 14, 2);
            $table->timestamps();
            $table->unique(['intermediary_payment_batch_id', 'finance_document_id'], 'intermediary_payment_allocations_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('intermediary_payment_allocations');
        Schema::dropIfExists('intermediary_payment_batches');
    }
};
