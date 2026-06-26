<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('finance_records', function (Blueprint $table) {
            $table->string('generated_file_path')->nullable()->after('notes');
            $table->string('generated_pdf_path')->nullable()->after('generated_file_path');
            $table->timestamp('generated_at')->nullable()->after('generated_pdf_path');
        });
    }

    public function down(): void
    {
        Schema::table('finance_records', function (Blueprint $table) {
            $table->dropColumn(['generated_file_path', 'generated_pdf_path', 'generated_at']);
        });
    }
};
