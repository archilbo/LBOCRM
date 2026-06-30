<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('invitation_token', 100)->nullable()->unique()->after('remember_token');
            $table->timestamp('invited_at')->nullable()->after('invitation_token');
            $table->timestamp('accepted_at')->nullable()->after('invited_at');
            $table->foreignId('invited_by')->nullable()->constrained('users')->nullOnDelete()->after('accepted_at');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['invited_by']);
            $table->dropColumn(['invitation_token', 'invited_at', 'accepted_at', 'invited_by']);
        });
    }
};
