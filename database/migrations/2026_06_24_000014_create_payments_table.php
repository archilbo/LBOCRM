<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('payments')) {
            return;
        }

        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('finance_document_id')->constrained()->cascadeOnDelete();
            $table->foreignId('client_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('dossier_id')->nullable()->constrained()->nullOnDelete();
            $table->string('payment_number')->unique();
            $table->decimal('amount', 14, 2)->default(0);
            $table->string('method')->nullable();
            $table->string('reference')->nullable();
            $table->date('paid_at')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('receipt_document_id')->nullable()->constrained('finance_documents')->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('finance_document_id');
            $table->index('client_id');
            $table->index('dossier_id');
            $table->index('paid_at');
            $table->index('method');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
