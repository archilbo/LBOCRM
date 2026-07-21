<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            $table->foreignId('company_id')->nullable()->after('id')->constrained()->nullOnDelete();
            $table->foreignId('branch_id')->nullable()->after('company_id')->constrained()->nullOnDelete();
            $table->string('direct_key')->nullable()->after('type');
            $table->index(['company_id', 'branch_id', 'last_message_at'], 'conversations_scope_last_message_idx');
            $table->index(['company_id', 'type', 'direct_key'], 'conversations_direct_lookup_idx');
        });

        Schema::table('conversation_participants', function (Blueprint $table) {
            $table->string('role')->default('member')->after('user_id');
            $table->foreignId('last_read_message_id')->nullable()->after('last_read_at')->constrained('messages')->nullOnDelete();
            $table->timestamp('pinned_at')->nullable()->after('archived_at');
            $table->timestamp('muted_at')->nullable()->after('pinned_at');
            $table->text('draft')->nullable()->after('muted_at');
            $table->index(['user_id', 'archived_at', 'pinned_at'], 'conversation_participant_inbox_idx');
        });

        Schema::table('message_attachments', function (Blueprint $table) {
            $table->string('storage_path')->nullable()->after('filename');
        });

        Schema::create('chat_activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('conversation_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('message_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('action');
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();
            $table->index(['company_id', 'conversation_id', 'created_at'], 'chat_activity_scope_idx');
        });

        $conversationIds = DB::table('conversations')->orderBy('id')->pluck('id');
        $claimedDirectKeys = [];

        foreach ($conversationIds as $conversationId) {
            $users = DB::table('conversation_participants')
                ->join('users', 'users.id', '=', 'conversation_participants.user_id')
                ->where('conversation_participants.conversation_id', $conversationId)
                ->orderBy('users.id')
                ->get(['users.id', 'users.company_id', 'users.branch_id']);

            $first = $users->first();
            $conversation = DB::table('conversations')->where('id', $conversationId)->first(['type']);
            $directKey = null;

            if ($conversation?->type === 'direct' && $users->count() === 2) {
                $candidate = $users->pluck('id')->implode(':');
                $scopeKey = ($first?->company_id ?? 0).':'.$candidate;
                if (! isset($claimedDirectKeys[$scopeKey])) {
                    $directKey = $candidate;
                    $claimedDirectKeys[$scopeKey] = true;
                }
            }

            DB::table('conversations')->where('id', $conversationId)->update([
                'company_id' => $first?->company_id,
                'branch_id' => $first?->branch_id,
                'direct_key' => $directKey,
            ]);
        }

        Schema::table('conversations', function (Blueprint $table) {
            $table->unique(['company_id', 'direct_key'], 'conversations_company_direct_key_unique');
        });

        DB::table('conversation_participants')
            ->whereIn('id', function ($query) {
                $query->selectRaw('MIN(id)')->from('conversation_participants')->groupBy('conversation_id');
            })
            ->update(['role' => 'owner']);
    }

    public function down(): void
    {
        Schema::dropIfExists('chat_activity_logs');

        Schema::table('message_attachments', function (Blueprint $table) {
            $table->dropColumn('storage_path');
        });

        Schema::table('conversation_participants', function (Blueprint $table) {
            $table->dropIndex('conversation_participant_inbox_idx');
            $table->dropForeign(['last_read_message_id']);
            $table->dropColumn(['role', 'last_read_message_id', 'pinned_at', 'muted_at', 'draft']);
        });

        Schema::table('conversations', function (Blueprint $table) {
            $table->dropUnique('conversations_company_direct_key_unique');
            $table->dropIndex('conversations_scope_last_message_idx');
            $table->dropIndex('conversations_direct_lookup_idx');
            $table->dropForeign(['company_id']);
            $table->dropForeign(['branch_id']);
            $table->dropColumn(['company_id', 'branch_id', 'direct_key']);
        });
    }
};
