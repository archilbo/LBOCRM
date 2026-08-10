<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dossier_cahiers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dossier_id')->unique()->constrained('dossiers')->cascadeOnDelete();
            $table->string('cahier_number', 32)->index();
            $table->date('received_at');
            $table->date('delivered_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dossier_cahiers');
    }
};
