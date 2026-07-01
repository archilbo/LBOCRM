<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('calendar_events', function (Blueprint $table) {
            $table->id();
            $table->string('event_number')->unique();
            $table->string('type');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('status')->default('scheduled');
            $table->string('priority')->default('medium');
            $table->string('color')->nullable();
            $table->dateTime('starts_at');
            $table->dateTime('ends_at')->nullable();
            $table->boolean('all_day')->default(false);
            $table->string('timezone')->default('UTC');
            $table->string('visibility')->default('assigned_users');
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->foreignId('owner_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('task_id')->nullable()->constrained('tasks')->nullOnDelete();
            $table->foreignId('client_id')->nullable()->constrained('clients')->nullOnDelete();
            $table->foreignId('dossier_id')->nullable()->constrained('dossiers')->nullOnDelete();
            $table->foreignId('dossier_document_id')->nullable()->constrained('dossier_documents')->nullOnDelete();
            $table->foreignId('finance_document_id')->nullable()->constrained('finance_documents')->nullOnDelete();
            $table->foreignId('contract_id')->nullable()->constrained('contracts')->nullOnDelete();
            $table->foreignId('authorization_id')->nullable()->constrained('authorizations')->nullOnDelete();
            $table->foreignId('archive_record_id')->nullable()->constrained('archive_records')->nullOnDelete();
            $table->json('metadata')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['starts_at', 'ends_at']);
            $table->index(['status', 'priority']);
            $table->index('type');
            $table->index('created_by');
            $table->index('owner_id');
        });

        Schema::create('calendar_event_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('calendar_event_id')->constrained('calendar_events')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('role')->default('assignee');
            $table->string('response_status')->default('pending');
            $table->timestamp('last_read_at')->nullable();
            $table->timestamps();

            $table->unique(['calendar_event_id', 'user_id']);
        });

        Schema::create('calendar_event_reminders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('calendar_event_id')->constrained('calendar_events')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->integer('offset_minutes')->nullable();
            $table->timestamp('remind_at')->nullable();
            $table->string('channel')->default('in_app');
            $table->string('status')->default('pending');
            $table->timestamp('snoozed_until')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('remind_at');
        });

        Schema::create('calendar_event_activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('calendar_event_id')->constrained('calendar_events')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('event');
            $table->json('old_value')->nullable();
            $table->json('new_value')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('created_at')->nullable();

            $table->index('event');
        });

        Schema::create('calendar_event_recurrences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('calendar_event_id')->constrained('calendar_events')->cascadeOnDelete();
            $table->string('frequency');
            $table->unsignedSmallInteger('interval')->default(1);
            $table->json('days_of_week')->nullable();
            $table->date('ends_at')->nullable();
            $table->unsignedInteger('count')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('calendar_event_recurrences');
        Schema::dropIfExists('calendar_event_activity_logs');
        Schema::dropIfExists('calendar_event_reminders');
        Schema::dropIfExists('calendar_event_participants');
        Schema::dropIfExists('calendar_events');
    }
};
