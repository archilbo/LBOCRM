<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\Security\TwoFactorService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class TwoFactorChallengeController extends Controller
{
    public function create(Request $request): Response|RedirectResponse
    {
        return $request->session()->has('login.two_factor_user_id') ? Inertia::render('Auth/TwoFactorChallenge') : redirect()->route('login');
    }

    public function store(Request $request, TwoFactorService $twoFactor): RedirectResponse
    {
        $data = $request->validate(['code' => ['required', 'string', 'max:32']]);
        $user = User::find($request->session()->get('login.two_factor_user_id'));
        abort_unless($user?->two_factor_confirmed_at && $user->two_factor_secret, 403);
        $code = strtoupper(trim($data['code']));
        $valid = $twoFactor->verify($user->two_factor_secret, $code);
        if (! $valid && in_array($code, $user->two_factor_recovery_codes ?? [], true)) {
            $user->forceFill(['two_factor_recovery_codes' => array_values(array_diff($user->two_factor_recovery_codes, [$code]))])->save();
            $valid = true;
        }
        if (! $valid) return back()->withErrors(['code' => 'Invalid verification code.']);

        $remember = (bool) $request->session()->pull('login.two_factor_remember', false);
        $request->session()->forget('login.two_factor_user_id');
        Auth::login($user, $remember);
        $request->session()->regenerate();

        return redirect()->intended(route('dashboard'));
    }
}
