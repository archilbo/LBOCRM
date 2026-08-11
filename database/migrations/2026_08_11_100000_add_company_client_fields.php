<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('clients', function (Blueprint $table): void {
            $table->string('client_type', 20)->default('person')->after('client_number')->index();
            $table->string('company_name')->nullable()->after('full_name');
            $table->string('ice', 40)->nullable()->unique()->after('cin');
            $table->json('managers')->nullable()->after('ice');
        });
    }

    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table): void {
            $table->dropUnique(['ice']);
            $table->dropIndex(['client_type']);
            $table->dropColumn(['client_type', 'company_name', 'ice', 'managers']);
        });
    }
};
