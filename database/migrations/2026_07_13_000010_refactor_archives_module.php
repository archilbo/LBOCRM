<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Rooms
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // 2. Shelves
        Schema::create('shelves', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('code');
            $table->text('description')->nullable();
            $table->timestamps();

            $table->unique(['room_id', 'code']);
        });

        // 3. Boxes
        Schema::create('boxes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shelf_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('code');
            $table->integer('capacity')->default(12);
            $table->text('description')->nullable();
            $table->timestamps();

            $table->unique(['shelf_id', 'code']);
        });

        // 4. Archive events (audit trail)
        Schema::create('archive_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('archive_record_id')->constrained()->cascadeOnDelete();
            $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('type'); // ready, stored, checked_out, returned, moved, lost, restored, note
            $table->json('payload')->nullable();
            $table->timestamps();

            $table->index(['archive_record_id', 'created_at']);
            $table->index('type');
        });

        // 5. Alter archive_records
        Schema::table('archive_records', function (Blueprint $table) {
            $table->foreignId('requester_id')->nullable()->constrained('users')->nullOnDelete()->after('requested_by');
            $table->dateTime('due_at')->nullable()->after('returned_at');
            $table->dateTime('checked_out_at')->nullable()->after('due_at');
            $table->boolean('is_lost')->default(false)->after('checked_out_at');
            $table->text('lost_reason')->nullable()->after('is_lost');
            $table->string('qr_path')->nullable()->after('lost_reason');
            $table->json('location_changed_from')->nullable()->after('qr_path');
            $table->timestamp('moved_at')->nullable()->after('location_changed_from');

            $table->index('requester_id');
            $table->index('is_lost');
            $table->index('due_at');
        });
    }

    public function down(): void
    {
        Schema::table('archive_records', function (Blueprint $table) {
            $table->dropIndex(['requester_id']);
            $table->dropIndex(['is_lost']);
            $table->dropIndex(['due_at']);
            $table->dropForeign(['requester_id']);
            $table->dropColumn([
                'requester_id',
                'due_at',
                'checked_out_at',
                'is_lost',
                'lost_reason',
                'qr_path',
                'location_changed_from',
                'moved_at',
            ]);
        });

        Schema::dropIfExists('archive_events');
        Schema::dropIfExists('boxes');
        Schema::dropIfExists('shelves');
        Schema::dropIfExists('rooms');
    }
};
