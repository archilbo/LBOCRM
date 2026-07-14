<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\InviteUserRequest;
use App\Http\Resources\UserResource;
use App\Mail\UserInvitation;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AdminUserInvitationController extends Controller
{
    public function store(InviteUserRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => bcrypt(Str::password(16)),
            'invitation_token' => Str::random(60),
            'invited_at' => now(),
            'invited_by' => $request->user()->id,
        ]);

        $user->assignRole($validated['role']);

        $acceptUrl = route('invitation.accept', ['token' => $user->invitation_token]);
        Mail::to($user)->send(new UserInvitation($user, $acceptUrl));

        return redirect()->route('admin.users.index')
            ->with('success', 'Invitation sent to ' . $user->email);
    }

    public function bulkValidate(Request $request): JsonResponse
    {
        abort_unless($request->user()?->can('manage users'), 403);

        $data = $request->validate([
            'emails' => 'required|array',
            'emails.*' => 'email',
        ]);

        $existing = User::whereIn('email', $data['emails'])->pluck('email');

        return response()->json(['existing' => $existing]);
    }

    public function bulkStore(Request $request): RedirectResponse
    {
        abort_unless($request->user()?->can('manage users'), 403);

        $data = $request->validate([
            'users' => 'required|array',
            'users.*.name' => 'required|string|max:255',
            'users.*.email' => 'required|email|max:255',
            'users.*.role' => 'required|string|in:admin,manager,staff,viewer',
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
                    $existing = User::where('email', $entry['email'])->first();

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

                    $user = User::create([
                        'name' => $entry['name'],
                        'email' => $entry['email'],
                        'password' => bcrypt(Str::password(16)),
                        'invitation_token' => Str::random(60),
                        'invited_at' => now(),
                        'invited_by' => $request->user()->id,
                    ]);
                    $user->assignRole($entry['role']);

                    $acceptUrl = route('invitation.accept', ['token' => $user->invitation_token]);
                    Mail::to($user)->send(new UserInvitation($user, $acceptUrl));
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

        return redirect()->route('admin.users.index')
            ->with('success', $message);
    }

    public function accept(string $token): Response|RedirectResponse
    {
        $user = User::where('invitation_token', $token)->whereNull('accepted_at')->first();

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
        $user = User::where('invitation_token', $token)->whereNull('accepted_at')->first();

        if (! $user) {
            return redirect()->route('login')->with('error', 'This invitation link is invalid or has already been used.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user->fill([
            'name' => $validated['name'],
            'password' => bcrypt($validated['password']),
            'invitation_token' => null,
            'accepted_at' => now(),
        ])->save();

        auth()->login($user);

        return redirect()->route('dashboard');
    }
}
