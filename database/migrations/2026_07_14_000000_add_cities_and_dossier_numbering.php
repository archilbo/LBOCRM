<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('cities', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code', 8)->unique();
            $table->string('color', 9)->default('#64748B');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('dossier_number_sequences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('city_id')->constrained()->cascadeOnDelete();
            $table->string('period', 7);
            $table->unsignedInteger('last_seq')->default(0);
            $table->timestamps();
            $table->unique(['city_id', 'period']);
        });

        Schema::table('dossiers', function (Blueprint $table) {
            $table->foreignId('city_id')->nullable()->after('client_id')
                  ->constrained('cities')->nullOnDelete();
            $table->unsignedInteger('sequence_number')->nullable()->after('dossier_number');
            $table->string('period', 7)->nullable()->after('sequence_number');
            $table->index(['city_id', 'period']);
        });
    }

    public function down(): void
    {
        Schema::table('dossiers', function (Blueprint $table) {
            $table->dropConstrainedForeignId('city_id');
            $table->dropColumn(['sequence_number', 'period']);
        });
        Schema::dropIfExists('dossier_number_sequences');
        Schema::dropIfExists('cities');
    }
};
