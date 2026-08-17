<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('finance_document_sequences', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnUpdate()->restrictOnDelete();
            $table->string('document_type', 40);
            $table->unsignedSmallInteger('sequence_year');
            $table->unsignedInteger('next_number')->default(0);
            $table->timestamps();

            $table->unique(
                ['company_id', 'document_type', 'sequence_year'],
                'finance_document_sequences_company_type_year_unique',
            );
        });

        if (! Schema::hasColumn('finance_documents', 'converted_to_document_id')) {
            Schema::table('finance_documents', function (Blueprint $table): void {
                $table->foreignId('converted_to_document_id')
                    ->nullable()
                    ->after('source_document_id')
                    ->constrained('finance_documents')
                    ->nullOnDelete();
                $table->unique('converted_to_document_id', 'finance_documents_converted_to_unique');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('finance_documents', 'converted_to_document_id')) {
            Schema::table('finance_documents', function (Blueprint $table): void {
                $table->dropUnique('finance_documents_converted_to_unique');
                $table->dropForeign(['converted_to_document_id']);
                $table->dropColumn('converted_to_document_id');
            });
        }

        Schema::dropIfExists('finance_document_sequences');
    }
};
