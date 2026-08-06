<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\InviteUserRequest;
use App\Models\User;
use App\Services\CompanyContext;
use App\Traits\AuditsActions;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Services\PermissionRegistry;
use App\Services\Users\UserInvitationService;
use Inertia\Inertia;
use Inertia\Response;

class AdminUserInvitationController extends Controller
{
    use AuditsActions;

    public function __construct(
        private readonly PermissionRegistry $permissions,
        private readonly CompanyContext $companyContext,
        private readonly UserInvitationService $invitations,
    )
    {
    }
    public function store(InviteUserRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $user = $this->invitations->create($request->user(), $validated);
        $message = 'Invitation sent to '.$user->email;

        $this->audit($request, 'user.invited', $message, [
            'user_id' => $user->id,
            'email' => $user->email,
            'role' => $validated['role'],
        ]);

        return redirect()->route('admin.users.index')
            ->with('success', ['key' => 'users.invitations.toast.sent', 'values' => ['email' => $user->email]]);
    }

    public function resend(Request $request, User $user): RedirectResponse
    {
        abort_unless(
            $this->permissions->allows($request->user(), 'users.create')
            && $this->permissions->allows($request->user(), 'users.roles.manage'),
            403,
        );
        abort_unless($this->companyContext->owns($request->user(), $user), 404);

        if ($user->hasRole(config('archilbo_roles.super_admin_role')) && ! $request->user()->hasRole(config('archilbo_roles.super_admin_role'))) {
            abort(403);
        }

        if ($user->accepted_at) {
            return back()->with('error', 'Only pending accounts can receive a new invitation.');
        }

        $this->invitations->reissue($user, $request->user());

        $this->audit($request, 'user.invitation.resent', "Resent invitation to {$user->email}", [
            'user_id' => $user->id,
            'email' => $user->email,
        ]);

        return back()->with('success', ['key' => 'users.invitations.toast.resent', 'values' => ['email' => $user->email]]);
    }

    public function bulkValidate(Request $request): JsonResponse
    {
        abort_unless($request->user()
            && $this->permissions->allows($request->user(), 'users.create')
            && $this->permissions->allows($request->user(), 'users.roles.manage'), 403);

        $data = $request->validate([
            'emails' => 'required|array',
            'emails.*' => 'email',
        ]);

        $existing = User::query()
            ->where('company_id', $request->user()->company_id)
            ->whereIn('email', $data['emails'])
            ->pluck('email');

        return response()->json(['existing' => $existing]);
    }

    public function bulkStore(Request $request): RedirectResponse
    {
        abort_unless($request->user()
            && $this->permissions->allows($request->user(), 'users.create')
            && $this->permissions->allows($request->user(), 'users.roles.manage'), 403);

        $data = $request->validate([
            'users' => 'required|array',
            'users.*.name' => 'required|string|max:255',
            'users.*.email' => 'required|email|max:255',
            'users.*.role' => ['required', 'string', \Illuminate\Validation\Rule::in($this->assignableRoles($request))],
            'overrides' => 'nullable|array',
            'overrides.*' => 'boolean',
        ]);

        $overrides = $data['overrides'] ?? [];
        $created = 0;
        $updated = 0;
        $skipped = 0;
        $errors = [];

        DB::beginTransaction();
        try {
            foreach ($data['users'] as $entry) {
                try {
                    $existing = User::query()
                        ->where('company_id', $request->user()->company_id)
                        ->where('email', $entry['email'])
                        ->first();

                    if ($existing) {
                        if (!empty($overrides[$entry['email']])) {
                            $existing->update(['name' => $entry['name']]);
                            $existing->syncRoles([$entry['role']]);
                            $updated++;
                        } else {
                            $skipped++;
                        }
                        continue;
                    }

                    if (User::where('email', $entry['email'])->exists()) {
                        $errors[] = $entry['email'] . ': unable to create this account.';
                        continue;
                    }

                    $this->invitations->create($request->user(), $entry);
                    $created++;
                } catch (\Exception $e) {
                    $errors[] = $entry['email'] . ': ' . $e->getMessage();
                }
            }
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->route('admin.users.index')
                ->with('error', 'Bulk import failed: ' . $e->getMessage());
        }

        $parts = [];
        if ($created > 0) $parts[] = "{$created} invited";
        if ($updated > 0) $parts[] = "{$updated} updated";
        if ($skipped > 0) $parts[] = "{$skipped} skipped";
        $message = implode(', ', $parts) . '.';
        if (!empty($errors)) {
            $message .= ' Errors: ' . implode('; ', $errors);
        }

        $this->audit($request, 'bulk.invited', "CSV import: {$message}", [
            'created' => $created,
            'updated' => $updated,
            'skipped' => $skipped,
            'errors' => $errors,
        ]);

        return redirect()->route('admin.users.index')
            ->with('success', $message);
    }

    public function accept(Request $request, string $token): Response|RedirectResponse
    {
        $resolution = $this->invitations->resolveStatus($token);

        if ($resolution['status'] !== 'valid') {
            return Inertia::render('Auth/InvitationStatus', [
                'status' => $resolution['status'],
            ]);
        }

        /** @var User $user */
        $user = $resolution['user'];

        if ($request->user()) {
            return Inertia::render('Auth/InvitationStatus', [
                'status' => 'conflict',
                'token' => $token,
                'currentEmail' => $request->user()->email,
                'invitedEmail' => $user->email,
            ]);
        }

        return Inertia::render('Auth/AcceptInvitation', [
            'token' => $token,
            'name' => $user->name,
            'email' => $user->email,
        ]);
    }

    public function complete(Request $request, string $token): RedirectResponse
    {
        if (! $this->invitations->findPending($token)) {
            return redirect()->route('invitation.accept', ['token' => $token]);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'password' => ['required', 'confirmed', \Illuminate\Validation\Rules\Password::min(12)->mixedCase()->numbers()->symbols()],
        ]);

        // Consumes the token inside a transaction (single-use, atomic).
        $user = $this->invitations->consume($token, $validated);

        if (! $user) {
            return redirect()->route('invitation.accept', ['token' => $token]);
        }

        auth()->login($user);
        $request->session()->regenerate();

        return redirect()->route('dashboard')
            ->with('success', ['key' => 'auth.acceptInvitation.activatedSuccess', 'values' => []]);
    }

    public function continueSession(Request $request, string $token): RedirectResponse
    {
        $resolution = $this->invitations->resolveStatus($token);

        if ($resolution['status'] !== 'valid') {
            return redirect()->route('invitation.accept', ['token' => $token]);
        }

        auth()->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('invitation.accept', ['token' => $token]);
    }

    private function assignableRoles(Request $request): array
    {
        $roles = config('archilbo_roles.assignable');

        if (! $request->user()->hasRole(config('archilbo_roles.super_admin_role'))) {
            $roles = array_values(array_diff($roles, [config('archilbo_roles.super_admin_role')]));
        }

        return $roles;
    }
}
