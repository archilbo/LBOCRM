<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Carbon;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->timestamp('invitation_expires_at')->nullable()->after('invited_at');
        });

        DB::table('users')
            ->whereNotNull('invitation_token')
            ->orderBy('id')
            ->each(function (object $user): void {
                DB::table('users')->where('id', $user->id)->update([
                    'invitation_token' => hash('sha256', (string) $user->invitation_token),
                    'invitation_expires_at' => $user->invited_at
                        ? Carbon::parse($user->invited_at)->addHours(72)
                        : now()->addHours(72),
                ]);
            });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn('invitation_expires_at');
        });
    }
};
