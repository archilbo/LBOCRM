<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE messages MODIFY body TEXT NULL');

        Schema::table('messages', function (Blueprint $table) {
            $table->foreignId('reply_to_message_id')->nullable()->after('user_id')->constrained('messages')->nullOnDelete();
            $table->boolean('is_forwarded')->default(false)->after('is_edited');
        });

        Schema::table('message_attachments', function (Blueprint $table) {
            $table->string('disk')->default('public')->after('mime_type');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('last_seen_at')->nullable()->after('remember_token');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('last_seen_at');
        });

        Schema::table('message_attachments', function (Blueprint $table) {
            $table->dropColumn('disk');
        });

        Schema::table('messages', function (Blueprint $table) {
            $table->dropColumn(['reply_to_message_id', 'is_forwarded']);
        });

        DB::statement('ALTER TABLE messages MODIFY body TEXT NOT NULL');
    }
};
