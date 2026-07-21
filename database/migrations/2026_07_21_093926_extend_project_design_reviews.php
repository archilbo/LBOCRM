<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('project_design_reviews', function (Blueprint $table) {
            $table->string('decision', 50)->nullable()->after('status');
            $table->text('general_note')->nullable()->after('notes');
            $table->dateTime('requested_at')->nullable()->after('general_note');
            $table->dateTime('started_at')->nullable()->after('requested_at');
            $table->dateTime('due_at')->nullable()->after('started_at');
            $table->dateTime('completed_at')->nullable()->after('due_at');
        });
    }

    public function down(): void
    {
        Schema::table('project_design_reviews', function (Blueprint $table) {
            $table->dropColumn(['decision', 'general_note', 'requested_at', 'started_at', 'due_at', 'completed_at']);
        });
    }
};
