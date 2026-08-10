<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('finance_payment_reminders', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('finance_document_id')->constrained()->cascadeOnDelete();
            $table->foreignId('client_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('dossier_id')->nullable()->constrained()->nullOnDelete();
            $table->string('type')->default('custom');
            $table->dateTime('remind_at');
            $table->string('status')->default('pending');
            $table->dateTime('snoozed_until')->nullable();
            $table->dateTime('triggered_at')->nullable();
            $table->dateTime('completed_at')->nullable();
            $table->dateTime('cancelled_at')->nullable();
            $table->text('note')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['company_id', 'branch_id', 'status', 'remind_at'], 'finance_reminders_due_idx');
            $table->index(['finance_document_id', 'status'], 'finance_reminders_document_status_idx');
            $table->index(['client_id', 'dossier_id'], 'finance_reminders_client_dossier_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('finance_payment_reminders');
    }
};
