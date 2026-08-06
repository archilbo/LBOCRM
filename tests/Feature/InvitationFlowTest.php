<?php

namespace Tests\Feature;

use App\Mail\UserInvitation;
use App\Models\Company;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class InvitationFlowTest extends TestCase
{
    use RefreshDatabase;

    private const STRONG_PASSWORD = 'StrongPassword!2026';

    /**
     * Create an admin and an invited pending user; return [admin, user, plain token].
     *
     * @return array{0: User, 1: User, 2: string}
     */
    private function makeInvitation(): array
    {
        $this->seed(RolesAndPermissionsSeeder::class);
        Mail::fake();

        $company = Company::factory()->create();
        $admin = tap(User::factory()->create(['company_id' => $company->id]), fn (User $user) => $user->assignRole('super_admin'));

        $this->actingAs($admin)
            ->post(route('admin.users.invite'), [
                'name' => 'Pending User',
                'email' => 'pending@example.test',
                'role' => 'staff',
            ]);

        $user = User::query()->where('email', 'pending@example.test')->firstOrFail();
        $token = $this->captureLatestToken();

        Auth::logout();

        return [$admin, $user, $token];
    }

    private function captureLatestToken(): string
    {
        $acceptUrl = null;
        Mail::assertSent(UserInvitation::class, function (UserInvitation $mail) use (&$acceptUrl): bool {
            $acceptUrl = $mail->acceptUrl;

            return true;
        });

        return basename((string) parse_url((string) $acceptUrl, PHP_URL_PATH));
    }

    public function test_newest_invitation_token_opens_the_activation_form(): void
    {
        [, $user, $token] = $this->makeInvitation();

        $this->get(route('invitation.accept', ['token' => $token]))
            ->assertInertia(fn (Assert $page) => $page
                ->component('Auth/AcceptInvitation')
                ->where('email', $user->email));
    }

    public function test_previous_token_becomes_invalid_after_resend(): void
    {
        [$admin, $user, $tokenA] = $this->makeInvitation();

        $this->actingAs($admin)
            ->post(route('admin.users.invite.resend', $user))
            ->assertRedirect();

        $tokenB = $this->captureLatestToken();
        $this->assertNotSame($tokenA, $tokenB);

        // Old link: safe invalid/replaced state, never a silent redirect to Login.
        $this->get(route('invitation.accept', ['token' => $tokenA]))
            ->assertInertia(fn (Assert $page) => $page
                ->component('Auth/InvitationStatus')
                ->where('status', 'invalid'));
    }

    public function test_resend_email_contains_the_valid_token(): void
    {
        [$admin, $user] = $this->makeInvitation();

        $this->actingAs($admin)
            ->post(route('admin.users.invite.resend', $user))
            ->assertRedirect();

        $tokenB = $this->captureLatestToken();

        // The recipient opens the link as a guest.
        Auth::logout();

        $this->get(route('invitation.accept', ['token' => $tokenB]))
            ->assertInertia(fn (Assert $page) => $page->component('Auth/AcceptInvitation'));

        // The stored value is the hash, and the user is still pending.
        $fresh = $user->fresh();
        $this->assertNotSame($tokenB, $fresh->invitation_token);
        $this->assertNull($fresh->accepted_at);
    }

    public function test_expired_invitation_shows_the_expired_state(): void
    {
        [, $user, $token] = $this->makeInvitation();
        $user->update(['invitation_expires_at' => now()->subHour()]);

        $this->get(route('invitation.accept', ['token' => $token]))
            ->assertInertia(fn (Assert $page) => $page
                ->component('Auth/InvitationStatus')
                ->where('status', 'expired'));
    }

    public function test_already_used_invitation_shows_the_accepted_state(): void
    {
        [, $user, $token] = $this->makeInvitation();

        $this->post(route('invitation.complete', ['token' => $token]), [
            'name' => 'Pending User',
            'password' => self::STRONG_PASSWORD,
            'password_confirmation' => self::STRONG_PASSWORD,
        ])->assertRedirect(route('dashboard'));

        $this->get(route('invitation.accept', ['token' => $token]))
            ->assertInertia(fn (Assert $page) => $page
                ->component('Auth/InvitationStatus')
                ->where('status', 'accepted'));
    }

    public function test_suspended_invitation_is_rejected(): void
    {
        [, $user, $token] = $this->makeInvitation();
        $user->update(['suspended_at' => now()]);

        $this->get(route('invitation.accept', ['token' => $token]))
            ->assertInertia(fn (Assert $page) => $page
                ->component('Auth/InvitationStatus')
                ->where('status', 'suspended'));
    }

    public function test_authenticated_administrator_sees_the_session_conflict_page(): void
    {
        [$admin, $user, $token] = $this->makeInvitation();

        $this->actingAs($admin)
            ->get(route('invitation.accept', ['token' => $token]))
            ->assertInertia(fn (Assert $page) => $page
                ->component('Auth/InvitationStatus')
                ->where('status', 'conflict')
                ->where('currentEmail', $admin->email)
                ->where('invitedEmail', $user->email));
    }

    public function test_sign_out_and_continue_logs_out_and_reopens_the_invitation(): void
    {
        [$admin, , $token] = $this->makeInvitation();

        $this->actingAs($admin)
            ->post(route('invitation.continue', ['token' => $token]))
            ->assertRedirect(route('invitation.accept', ['token' => $token]));

        $this->assertGuest();

        $this->get(route('invitation.accept', ['token' => $token]))
            ->assertInertia(fn (Assert $page) => $page->component('Auth/AcceptInvitation'));
    }

    public function test_logged_out_recipient_sees_the_activation_form(): void
    {
        [, , $token] = $this->makeInvitation();

        $this->get(route('invitation.accept', ['token' => $token]))
            ->assertInertia(fn (Assert $page) => $page->component('Auth/AcceptInvitation'));
    }

    public function test_get_never_marks_the_invitation_accepted(): void
    {
        [, $user, $token] = $this->makeInvitation();

        $this->get(route('invitation.accept', ['token' => $token]));

        $this->assertNull($user->fresh()->accepted_at);
        $this->assertNotNull($user->fresh()->invitation_token);
    }

    public function test_matching_password_confirmation_activates_the_account(): void
    {
        [, , $token] = $this->makeInvitation();

        $this->post(route('invitation.complete', ['token' => $token]), [
            'name' => 'Pending User',
            'password' => self::STRONG_PASSWORD,
            'password_confirmation' => self::STRONG_PASSWORD,
        ])->assertRedirect(route('dashboard'));
    }

    public function test_successful_activation_sets_accepted_at(): void
    {
        [, $user, $token] = $this->makeInvitation();

        $this->post(route('invitation.complete', ['token' => $token]), [
            'name' => 'Pending User',
            'password' => self::STRONG_PASSWORD,
            'password_confirmation' => self::STRONG_PASSWORD,
        ]);

        $this->assertNotNull($user->fresh()->accepted_at);
    }

    public function test_successful_activation_clears_token_and_expiry(): void
    {
        [, $user, $token] = $this->makeInvitation();

        $this->post(route('invitation.complete', ['token' => $token]), [
            'name' => 'Pending User',
            'password' => self::STRONG_PASSWORD,
            'password_confirmation' => self::STRONG_PASSWORD,
        ]);

        $this->assertNull($user->fresh()->invitation_token);
        $this->assertNull($user->fresh()->invitation_expires_at);
    }

    public function test_invitation_is_single_use(): void
    {
        [, $user, $token] = $this->makeInvitation();

        $this->post(route('invitation.complete', ['token' => $token]), [
            'name' => 'Pending User',
            'password' => self::STRONG_PASSWORD,
            'password_confirmation' => self::STRONG_PASSWORD,
        ])->assertRedirect(route('dashboard'));

        // A second attempt is bounced back to the status page, which reports the
        // invitation as already used.
        $this->post(route('invitation.complete', ['token' => $token]), [
            'name' => 'Pending User',
            'password' => self::STRONG_PASSWORD,
            'password_confirmation' => self::STRONG_PASSWORD,
        ])->assertRedirect(route('invitation.accept', ['token' => $token]));

        $this->get(route('invitation.accept', ['token' => $token]))
            ->assertInertia(fn (Assert $page) => $page
                ->component('Auth/InvitationStatus')
                ->where('status', 'accepted'));
    }

    public function test_company_and_role_are_preserved_after_activation(): void
    {
        [, $user, $token] = $this->makeInvitation();

        $companyId = $user->company_id;
        $branchId = $user->branch_id;

        $this->post(route('invitation.complete', ['token' => $token]), [
            'name' => 'Pending User',
            'password' => self::STRONG_PASSWORD,
            'password_confirmation' => self::STRONG_PASSWORD,
        ]);

        $fresh = $user->fresh();
        $this->assertSame($companyId, $fresh->company_id);
        $this->assertSame($branchId, $fresh->branch_id);
        $this->assertTrue($fresh->hasRole('staff'));
    }

    public function test_one_resend_sends_exactly_one_email(): void
    {
        [$admin, $user] = $this->makeInvitation();

        Mail::assertSent(UserInvitation::class, 1);

        $this->actingAs($admin)
            ->post(route('admin.users.invite.resend', $user))
            ->assertRedirect();

        Mail::assertSent(UserInvitation::class, 2);
        $this->assertNull($user->fresh()->accepted_at);
    }

    public function test_plain_invitation_token_is_never_stored(): void
    {
        [, $user, $token] = $this->makeInvitation();

        $stored = (string) $user->fresh()->invitation_token;

        $this->assertNotSame($token, $stored);
        $this->assertMatchesRegularExpression('/^[a-f0-9]{64}$/', $stored);
    }

    public function test_invited_user_receives_the_seeded_role_and_its_runtime_access(): void
    {
        [, $user] = $this->makeInvitation();

        $fresh = $user->fresh(['roles']);
        $this->assertTrue($fresh->hasRole('staff'));
        $this->assertNull($fresh->module_permissions);

        // The role must be live at runtime, not just recorded: the registry
        // grants the staff finance read set through the seeded role.
        $registry = app(\App\Services\PermissionRegistry::class);
        $this->assertTrue($registry->allows($fresh, 'finance.view'));
        $this->assertTrue($registry->allows($fresh, 'finance.settings.view'));
        $this->assertFalse($registry->allows($fresh, 'finance.documents.delete'));
        $this->assertTrue($registry->allows($fresh, 'clients.view'));
        // Staff carries the legacy `manage clients` alias: full client CRUD is
        // the intended seeded behavior for that role.
        $this->assertTrue($registry->allows($fresh, 'clients.delete'));
    }

    public function test_backend_reports_the_actual_failing_password_requirement(): void
    {
        [, $user, $token] = $this->makeInvitation();
        $this->withHeader('accept-language', 'fr-FR,fr;q=0.9,en;q=0.8');

        // 14 chars, lowercase + numbers only: fails uppercase and symbol checks.
        $this->post(route('invitation.complete', ['token' => $token]), [
            'name' => 'Pending User',
            'password' => '1234567891234aze',
            'password_confirmation' => '1234567891234aze',
        ])->assertSessionHasErrors(['password' => 'Le champ mot de passe doit contenir au moins une majuscule et une minuscule.']);

        $this->assertNull($user->fresh()->accepted_at);
    }

    public function test_backend_reports_minimum_length_when_actually_too_short(): void
    {
        [, $user, $token] = $this->makeInvitation();
        $this->withHeader('accept-language', 'fr-FR,fr;q=0.9,en;q=0.8');

        $this->post(route('invitation.complete', ['token' => $token]), [
            'name' => 'Pending User',
            'password' => 'Aze123!',
            'password_confirmation' => 'Aze123!',
        ])->assertSessionHasErrors(['password' => 'Le champ mot de passe doit contenir au moins 12 caractères.']);

        $this->assertNull($user->fresh()->accepted_at);
    }

    public function test_backend_reports_confirmation_mismatch_without_length_error(): void
    {
        [, $user, $token] = $this->makeInvitation();
        $this->withHeader('accept-language', 'fr-FR,fr;q=0.9,en;q=0.8');

        $this->post(route('invitation.complete', ['token' => $token]), [
            'name' => 'Pending User',
            'password' => 'ArchiLbo@2026!',
            'password_confirmation' => 'ArchiLbo@2027!',
        ])->assertSessionHasErrors(['password' => 'Le champ mot de passe de confirmation ne correspond pas.']);

        $this->assertNull($user->fresh()->accepted_at);
    }

    public function test_backend_reports_missing_number_requirement(): void
    {
        [, $user, $token] = $this->makeInvitation();
        $this->withHeader('accept-language', 'fr-FR,fr;q=0.9,en;q=0.8');

        $this->post(route('invitation.complete', ['token' => $token]), [
            'name' => 'Pending User',
            'password' => 'Azeazeazeaze!',
            'password_confirmation' => 'Azeazeazeaze!',
        ])->assertSessionHasErrors(['password' => 'Le champ mot de passe doit contenir au moins un chiffre.']);

        $this->assertNull($user->fresh()->accepted_at);
    }

    public function test_backend_reports_missing_symbol_requirement(): void
    {
        [, $user, $token] = $this->makeInvitation();
        $this->withHeader('accept-language', 'fr-FR,fr;q=0.9,en;q=0.8');

        $this->post(route('invitation.complete', ['token' => $token]), [
            'name' => 'Pending User',
            'password' => 'Azeazeazeaze1',
            'password_confirmation' => 'Azeazeazeaze1',
        ])->assertSessionHasErrors(['password' => 'Le champ mot de passe doit contenir au moins un symbole.']);

        $this->assertNull($user->fresh()->accepted_at);
    }

    public function test_backend_messages_follow_the_accept_language_header(): void
    {
        [, , $token] = $this->makeInvitation();

        $this->withHeader('accept-language', 'en-US,en;q=0.9,fr;q=0.8')
            ->post(route('invitation.complete', ['token' => $token]), [
                'name' => 'Pending User',
                'password' => 'Aze123!',
                'password_confirmation' => 'Aze123!',
            ])->assertSessionHasErrors(['password' => 'The password field must be at least 12 characters.']);
    }
}
