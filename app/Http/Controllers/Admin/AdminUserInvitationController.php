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
            ->with('success', $message);
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

        return back()->with('success', "A new invitation link was sent to {$user->email}.");
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

    public function accept(string $token): Response|RedirectResponse
    {
        $user = $this->invitations->findPending($token);

        if (! $user) {
            return redirect()->route('login')->with('error', 'This invitation link is invalid or has already been used.');
        }

        return Inertia::render('Auth/AcceptInvitation', [
            'token' => $token,
            'name' => $user->name,
            'email' => $user->email,
        ]);
    }

    public function complete(Request $request, string $token): RedirectResponse
    {
        $user = $this->invitations->findPending($token);

        if (! $user) {
            return redirect()->route('login')->with('error', 'This invitation link is invalid or has already been used.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'password' => ['required', 'confirmed', \Illuminate\Validation\Rules\Password::min(12)->mixedCase()->numbers()->symbols()],
        ]);

        $user->fill([
            'name' => $validated['name'],
            'password' => bcrypt($validated['password']),
            'invitation_token' => null,
            'invitation_expires_at' => null,
            'accepted_at' => now(),
        ])->save();

        auth()->login($user);

        return redirect()->route('dashboard');
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
