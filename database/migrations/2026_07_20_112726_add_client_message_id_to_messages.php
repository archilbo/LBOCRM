<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->string('client_message_id')->nullable()->after('id');
            $table->unique(['conversation_id', 'user_id', 'client_message_id'], 'messages_conv_user_client_unique');
        });
    }

    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropUnique('messages_conv_user_client_unique');
            $table->dropColumn('client_message_id');
        });
    }
};
