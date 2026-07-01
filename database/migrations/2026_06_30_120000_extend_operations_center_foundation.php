<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            if (! Schema::hasColumn('tasks', 'type')) {
                $table->string('type')->default('general')->index();
            }

            if (! Schema::hasColumn('tasks', 'impact')) {
                $table->string('impact')->default('normal')->index();
            }

            if (! Schema::hasColumn('tasks', 'reviewed_at')) {
                $table->timestamp('reviewed_at')->nullable();
            }

            if (! Schema::hasColumn('tasks', 'blocked_reason')) {
                $table->text('blocked_reason')->nullable();
            }

            if (! Schema::hasColumn('tasks', 'estimated_minutes')) {
                $table->unsignedInteger('estimated_minutes')->nullable();
            }

            if (! Schema::hasColumn('tasks', 'actual_minutes')) {
                $table->unsignedInteger('actual_minutes')->nullable();
            }

            if (! Schema::hasColumn('tasks', 'recurrence_rule')) {
                $table->string('recurrence_rule')->nullable();
            }

            if (! Schema::hasColumn('tasks', 'conversation_id')) {
                $table->foreignId('conversation_id')->nullable()->constrained('conversations')->nullOnDelete();
            }
        });

        if (! Schema::hasTable('task_requests')) {
            Schema::create('task_requests', function (Blueprint $table) {
                $table->id();
                $table->string('request_number')->unique();
                $table->string('request_type');
                $table->string('title');
                $table->text('description')->nullable();
                $table->foreignId('requested_by')->constrained('users')->cascadeOnDelete();
                $table->foreignId('target_user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('status')->default('submitted')->index();
                $table->foreignId('client_id')->nullable()->constrained('clients')->nullOnDelete();
                $table->foreignId('dossier_id')->nullable()->constrained('dossiers')->nullOnDelete();
                $table->foreignId('dossier_document_id')->nullable()->constrained('dossier_documents')->nullOnDelete();
                $table->foreignId('finance_document_id')->nullable()->constrained('finance_documents')->nullOnDelete();
                $table->foreignId('contract_id')->nullable()->constrained('contracts')->nullOnDelete();
                $table->foreignId('authorization_id')->nullable()->constrained('authorizations')->nullOnDelete();
                $table->foreignId('archive_record_id')->nullable()->constrained('archive_records')->nullOnDelete();
                $table->foreignId('converted_task_id')->nullable()->constrained('tasks')->nullOnDelete();
                $table->json('metadata')->nullable();
                $table->timestamps();
                $table->softDeletes();

                $table->index(['request_type', 'status']);
                $table->index(['requested_by', 'status']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('task_requests');

        Schema::table('tasks', function (Blueprint $table) {
            foreach ([
                'conversation_id',
                'recurrence_rule',
                'actual_minutes',
                'estimated_minutes',
                'blocked_reason',
                'reviewed_at',
                'impact',
                'type',
            ] as $column) {
                if (Schema::hasColumn('tasks', $column)) {
                    if ($column === 'conversation_id') {
                        $table->dropConstrainedForeignId($column);
                    } else {
                        $table->dropColumn($column);
                    }
                }
            }
        });
    }
};
