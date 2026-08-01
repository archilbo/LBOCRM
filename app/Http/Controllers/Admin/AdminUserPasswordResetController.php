<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\UserPasswordReset;
use App\Models\User;
use App\Services\CompanyContext;
use App\Traits\AuditsActions;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;

class AdminUserPasswordResetController extends Controller
{
    use AuditsActions;

    public function __construct(private readonly CompanyContext $companyContext)
    {
    }

    public function store(Request $request, User $user): RedirectResponse
    {
        abort_unless($this->companyContext->owns($request->user(), $user), 404);
        abort_unless($this->canResetPasswords($request->user()), 403);

        if ($user->hasRole(config('archilbo_roles.super_admin_role')) && ! $request->user()->hasRole(config('archilbo_roles.super_admin_role'))) {
            abort(403);
        }

        $token = Password::broker()->createToken($user);
        $url = route('password.reset', ['token' => $token, 'email' => $user->email]);

        Mail::to($user)->send(new UserPasswordReset($user, $url));

        $this->audit($request, 'user.password_reset.sent', "Sent a password reset link to {$user->email}", [
            'user_id' => $user->id,
            'email' => $user->email,
        ]);

        return back()->with('success', "A secure password reset link was sent to {$user->email}.");
    }

    private function canResetPasswords(User $user): bool
    {
        return $user->hasAnyRole(['admin', config('archilbo_roles.super_admin_role')]);
    }
}
