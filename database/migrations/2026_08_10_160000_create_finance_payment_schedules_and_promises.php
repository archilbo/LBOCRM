<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('finance_payment_schedule_items', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('finance_document_id')->constrained()->cascadeOnDelete();
            $table->string('label');
            $table->decimal('amount', 14, 2);
            $table->date('due_date');
            $table->unsignedSmallInteger('position');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['finance_document_id', 'position'], 'finance_schedule_item_position_unique');
            $table->index(['company_id', 'branch_id', 'due_date'], 'finance_schedule_items_due_idx');
        });

        Schema::create('finance_payment_promises', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('finance_document_id')->constrained()->cascadeOnDelete();
            $table->foreignId('client_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('dossier_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('amount', 14, 2);
            $table->decimal('baseline_paid_total', 14, 2)->default(0);
            $table->date('promised_for');
            $table->string('status')->default('active');
            $table->text('note')->nullable();
            $table->timestamp('fulfilled_at')->nullable();
            $table->timestamp('broken_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['company_id', 'branch_id', 'status', 'promised_for'], 'finance_promises_due_idx');
            $table->index(['finance_document_id', 'status'], 'finance_promises_document_status_idx');
        });

        Schema::table('payments', function (Blueprint $table): void {
            $table->timestamp('cancelled_at')->nullable()->after('notes');
            $table->foreignId('cancelled_by')->nullable()->after('cancelled_at')->constrained('users')->nullOnDelete();
            $table->text('cancellation_reason')->nullable()->after('cancelled_by');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table): void {
            $table->dropForeign(['cancelled_by']);
            $table->dropColumn(['cancelled_at', 'cancelled_by', 'cancellation_reason']);
        });

        Schema::dropIfExists('finance_payment_promises');
        Schema::dropIfExists('finance_payment_schedule_items');
    }
};
