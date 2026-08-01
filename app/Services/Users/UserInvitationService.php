<?php

namespace App\Services\Users;

use App\Mail\UserInvitation;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class UserInvitationService
{
    public function create(User $inviter, array $attributes): User
    {
        return DB::transaction(function () use ($inviter, $attributes): User {
            $user = User::query()->create([
                'company_id' => $inviter->company_id,
                'branch_id' => $inviter->branch_id,
                'name' => $attributes['name'],
                'email' => Str::lower(trim($attributes['email'])),
                // The recipient always chooses their own password from the invitation link.
                'password' => Hash::make(Str::password(64)),
                'invited_by' => $inviter->id,
            ]);

            $user->assignRole($attributes['role']);
            $this->issue($user, $inviter);

            return $user->fresh(['roles']);
        });
    }

    public function reissue(User $user, User $inviter): void
    {
        $this->issue($user, $inviter);
    }

    public function findPending(string $token): ?User
    {
        return User::query()
            ->where('invitation_token', $this->hashToken($token))
            ->whereNull('accepted_at')
            ->whereNull('suspended_at')
            ->where('invitation_expires_at', '>', now())
            ->first();
    }

    private function issue(User $user, User $inviter): void
    {
        $plainToken = Str::random(64);

        $user->update([
            'invitation_token' => $this->hashToken($plainToken),
            'invited_at' => now(),
            'invitation_expires_at' => now()->addHours($this->expirationHours()),
            'invited_by' => $inviter->id,
        ]);

        Mail::to($user)->send(new UserInvitation(
            $user,
            route('invitation.accept', ['token' => $plainToken]),
        ));
    }

    private function expirationHours(): int
    {
        return max(1, (int) config('auth_security.invitation.expiration_hours', 72));
    }

    private function hashToken(string $token): string
    {
        return hash('sha256', $token);
    }
}
