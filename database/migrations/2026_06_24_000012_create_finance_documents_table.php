<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('finance_documents')) {
            return;
        }

        Schema::create('finance_documents', function (Blueprint $table) {
            $table->id();
            $table->string('type')->index();
            $table->string('number')->unique();
            $table->string('status')->index()->default('draft');
            $table->foreignId('client_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('dossier_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('source_document_id')->nullable()->constrained('finance_documents')->nullOnDelete();
            $table->date('issue_date')->nullable();
            $table->date('due_date')->nullable();
            $table->date('valid_until')->nullable();
            $table->string('currency')->default('MAD');
            $table->decimal('tva_rate', 8, 2)->default(20);
            $table->decimal('subtotal_ht', 14, 2)->default(0);
            $table->decimal('discount_total', 14, 2)->default(0);
            $table->decimal('tax_total', 14, 2)->default(0);
            $table->decimal('total_ttc', 14, 2)->default(0);
            $table->decimal('paid_total', 14, 2)->default(0);
            $table->decimal('remaining_total', 14, 2)->default(0);
            $table->text('notes')->nullable();
            $table->text('terms')->nullable();
            $table->foreignId('template_id')->nullable()->constrained('finance_templates')->nullOnDelete();
            $table->string('pdf_path')->nullable();
            $table->string('excel_path')->nullable();
            $table->timestamp('generated_at')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('client_id');
            $table->index('dossier_id');
            $table->index('issue_date');
            $table->index('due_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('finance_documents');
    }
};
