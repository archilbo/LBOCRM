<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\UserPasswordReset;
use App\Mail\VerifyRecoveryEmail;
use App\Models\User;
use App\Models\UserRecoveryEmail;
use App\Services\Security\TwoFactorService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PasswordRule;

class AccountSecurityController extends Controller
{
    public function forgot(Request $request): RedirectResponse
    {
        $data = $request->validate(['email' => ['required', 'email']]);
        $email = Str::lower(trim($data['email']));
        $user = User::query()->where('email', $email)->first()
            ?? UserRecoveryEmail::query()->where('email', $email)->whereNotNull('verified_at')->with('user')->first()?->user;

        if ($user) {
            $token = Password::broker()->createToken($user);
            $url = route('password.reset', ['token' => $token, 'email' => $user->email]);
            Mail::to($email)->queue(new UserPasswordReset($user, $url));
        }

        return back()->with('status', 'If an account matches this address, a reset link has been sent.');
    }

    public function changePassword(Request $request): RedirectResponse
    {
        $this->ensureSuperAdmin($request);
        $data = $request->validate([
            'current_password' => ['required', 'current_password:web'],
            'password' => ['required', 'confirmed', PasswordRule::min(12)->mixedCase()->numbers()->symbols()],
        ]);
        $user = $request->user();
        $user->forceFill(['password' => Hash::make($data['password']), 'remember_token' => Str::random(60)])->save();
        $request->session()->regenerate();

        return back()->with('success', 'Password updated.');
    }

    public function addRecoveryEmail(Request $request): RedirectResponse
    {
        $this->ensureSuperAdmin($request);
        $data = $request->validate(['email' => ['required', 'email'], 'current_password' => ['required', 'current_password:web']]);
        $user = $request->user();
        $email = Str::lower(trim($data['email']));
        abort_if($email === Str::lower($user->email), 422, 'Use a different address from your sign-in email.');
        abort_if($user->recoveryEmails()->count() >= 4, 422, 'You can add a maximum of four backup email addresses.');

        $plainToken = Str::random(64);
        $record = $user->recoveryEmails()->updateOrCreate(['email' => $email], [
            'verification_token' => hash('sha256', $plainToken),
            'verification_expires_at' => now()->addDay(),
            'verified_at' => null,
        ]);
        Mail::to($record->email)->queue(new VerifyRecoveryEmail($user, URL::temporarySignedRoute('security.recovery-email.verify', now()->addDay(), ['recoveryEmail' => $record->id, 'token' => $plainToken])));

        return back()->with('success', 'Verification link sent to the backup email address.');
    }

    public function removeRecoveryEmail(Request $request, UserRecoveryEmail $recoveryEmail): RedirectResponse
    {
        $this->ensureSuperAdmin($request);
        abort_unless($recoveryEmail->user_id === $request->user()->id, 404);
        $request->validate(['current_password' => ['required', 'current_password:web']]);
        $recoveryEmail->delete();

        return back()->with('success', 'Backup email removed.');
    }

    public function verifyRecoveryEmail(UserRecoveryEmail $recoveryEmail, string $token): RedirectResponse
    {
        abort_unless($recoveryEmail->verification_expires_at?->isFuture() && hash_equals((string) $recoveryEmail->verification_token, hash('sha256', $token)), 404);
        $recoveryEmail->update(['verified_at' => now(), 'verification_token' => null, 'verification_expires_at' => null]);

        return redirect()->route('login')->with('status', 'Backup email verified. You can use it to receive password reset links.');
    }

    public function startTwoFactor(Request $request, TwoFactorService $twoFactor): RedirectResponse
    {
        $this->ensureSuperAdmin($request);
        $request->validate(['current_password' => ['required', 'current_password:web']]);
        $secret = $twoFactor->generateSecret();
        $request->user()->forceFill(['two_factor_secret' => $secret, 'two_factor_confirmed_at' => null])->save();
        session(['two_factor_setup_secret' => $secret]);

        return back()->with('success', 'Authenticator setup started. Enter the displayed setup key in your authenticator app, then confirm it.');
    }

    public function confirmTwoFactor(Request $request, TwoFactorService $twoFactor): RedirectResponse
    {
        $this->ensureSuperAdmin($request);
        $data = $request->validate(['code' => ['required', 'digits:6']]);
        $user = $request->user();
        if (! $user->two_factor_secret || ! $twoFactor->verify($user->two_factor_secret, $data['code'])) {
            return back()->withErrors(['code' => 'The verification code is invalid.']);
        }
        $recoveryCodes = $twoFactor->recoveryCodes();
        $user->forceFill(['two_factor_confirmed_at' => now(), 'two_factor_recovery_codes' => $recoveryCodes])->save();
        session()->forget('two_factor_setup_secret');
        session(['two_factor_recovery_codes' => $recoveryCodes]);

        return back()->with('success', 'Two-step verification is active. Save your recovery codes now.');
    }

    public function disableTwoFactor(Request $request): RedirectResponse
    {
        $this->ensureSuperAdmin($request);
        $request->validate(['current_password' => ['required', 'current_password:web']]);
        $request->user()->forceFill(['two_factor_secret' => null, 'two_factor_confirmed_at' => null, 'two_factor_recovery_codes' => null])->save();

        return back()->with('success', 'Two-step verification disabled.');
    }
    private function ensureSuperAdmin(Request $request): void
    {
        abort_unless($request->user()?->hasRole(config('archilbo_roles.super_admin_role')), 403);
    }
}
