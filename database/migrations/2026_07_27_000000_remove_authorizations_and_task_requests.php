<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Drop FKs first, then tables
        Schema::table('calendar_events', function (Blueprint $table) {
            $table->dropForeign(['authorization_id']);
            $table->dropColumn('authorization_id');
        });

        Schema::table('tasks', function (Blueprint $table) {
            $table->dropForeign(['authorization_id']);
            $table->dropColumn('authorization_id');
        });

        Schema::dropIfExists('task_requests');
        Schema::dropIfExists('authorizations');
    }

    public function down(): void
    {
        // Re-create authorizations table
        Schema::create('authorizations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('dossier_id')->constrained()->cascadeOnDelete();
            $table->string('submission_number')->nullable();
            $table->string('authorization_number')->nullable();
            $table->string('authority_name')->nullable();
            $table->string('authority_type')->nullable();
            $table->string('status')->default('not_started');
            $table->date('submitted_at')->nullable();
            $table->date('authorization_date')->nullable();
            $table->string('receipt_path')->nullable();
            $table->string('authorization_path')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('task_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('dossier_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('authorization_id')->nullable()->constrained()->nullOnDelete();
            $table->string('type');
            $table->string('status')->default('submitted');
            $table->text('description')->nullable();
            $table->text('reason')->nullable();
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->timestamp('converted_at')->nullable();
            $table->timestamps();
        });

        Schema::table('tasks', function (Blueprint $table) {
            $table->foreignId('authorization_id')->nullable()->constrained()->nullOnDelete();
        });

        Schema::table('calendar_events', function (Blueprint $table) {
            $table->foreignId('authorization_id')->nullable()->constrained()->nullOnDelete();
        });
    }
};
