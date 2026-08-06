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

    /**
     * Resolve the safe state of an invitation token.
     *
     * Only the latest token hash is stored, so an old (rotated) token is
     * indistinguishable from one that never existed; both resolve to "invalid".
     * A consumed token is remembered by its hash so an already-used link can be
     * reported safely without ever storing a plain token.
     *
     * @return array{status: 'valid'|'invalid'|'expired'|'accepted'|'suspended', user: ?User}
     */
    public function resolveStatus(string $token): array
    {
        $hash = $this->hashToken($token);

        $user = User::query()
            ->where('invitation_token', $hash)
            ->first();

        if (! $user) {
            $consumed = User::query()
                ->where('consumed_invitation_token', $hash)
                ->whereNotNull('accepted_at')
                ->first();

            return $consumed
                ? ['status' => 'accepted', 'user' => $consumed]
                : ['status' => 'invalid', 'user' => null];
        }

        if ($user->suspended_at !== null) {
            return ['status' => 'suspended', 'user' => $user];
        }

        if ($user->accepted_at !== null) {
            return ['status' => 'accepted', 'user' => $user];
        }

        if ($user->invitation_expires_at === null || $user->invitation_expires_at->isPast()) {
            return ['status' => 'expired', 'user' => $user];
        }

        return ['status' => 'valid', 'user' => $user];
    }

    /**
     * Accept the invitation inside a transaction and consume the token.
     *
     * The token hash is revalidated inside the transaction so the invitation
     * stays strictly single-use. The consumed hash is kept (never the plain
     * token) so reusing the link can report "already accepted".
     *
     * @param  array{name: string, password: string}  $attributes
     */
    public function consume(string $token, array $attributes): ?User
    {
        return DB::transaction(function () use ($token, $attributes): ?User {
            $user = $this->findPending($token);

            if (! $user) {
                return null;
            }

            $tokenHash = $user->invitation_token;

            $user->update([
                'name' => $attributes['name'],
                'password' => Hash::make($attributes['password']),
                'accepted_at' => now(),
                'invitation_token' => null,
                'invitation_expires_at' => null,
                'consumed_invitation_token' => $tokenHash,
            ]);

            return $user;
        });
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
