<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected array $candidateTables = [
        'finance_documents',
        'finance_quotes',
        'finance_invoices',
        'finance_receipts',
        'finance_credit_notes',
        'quotes',
        'invoices',
        'receipts',
        'credit_notes',
    ];

    public function up(): void
    {
        foreach ($this->candidateTables as $tableName) {
            if (! Schema::hasTable($tableName)) {
                continue;
            }

            Schema::table($tableName, function (Blueprint $table) use ($tableName): void {
                if (! Schema::hasColumn($tableName, 'document_number')) {
                    $table->string('document_number', 80)->nullable()->after('id');
                }

                if (! Schema::hasColumn($tableName, 'number_locked')) {
                    $table->boolean('number_locked')->default(false)->after('document_number');
                }

                if (! Schema::hasColumn($tableName, 'number_locked_at')) {
                    $table->timestamp('number_locked_at')->nullable()->after('number_locked');
                }
            });
        }
    }

    public function down(): void
    {
        foreach ($this->candidateTables as $tableName) {
            if (! Schema::hasTable($tableName)) {
                continue;
            }

            Schema::table($tableName, function (Blueprint $table) use ($tableName): void {
                foreach (['number_locked_at', 'number_locked', 'document_number'] as $column) {
                    if (Schema::hasColumn($tableName, $column)) {
                        $table->dropColumn($column);
                    }
                }
            });
        }
    }
};