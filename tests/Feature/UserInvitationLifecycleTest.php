<?php

namespace Tests\Feature;

use App\Mail\UserInvitation;
use App\Mail\UserPasswordReset;
use App\Models\Company;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class UserInvitationLifecycleTest extends TestCase
{
    use RefreshDatabase;

    public function test_new_user_is_pending_until_the_invitation_is_accepted(): void
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
            ])
            ->assertRedirect(route('admin.users.index'));

        $pending = User::query()->where('email', 'pending@example.test')->firstOrFail();
        $this->assertNull($pending->accepted_at);
        $this->assertNotNull($pending->invitation_token);
        $this->assertNotNull($pending->invitation_expires_at);
        $this->assertNotSame($pending->invitation_token, 'pending@example.test');

        $acceptUrl = null;
        Mail::assertSent(UserInvitation::class, function (UserInvitation $mail) use (&$acceptUrl): bool {
            $acceptUrl = $mail->acceptUrl;

            return true;
        });

        $token = basename((string) parse_url((string) $acceptUrl, PHP_URL_PATH));

        Auth::logout();

        $this->post(route('invitation.complete', ['token' => $token]), [
            'name' => 'Pending User',
            'password' => 'StrongPassword!2026',
            'password_confirmation' => 'StrongPassword!2026',
        ])->assertRedirect(route('dashboard'));

        $this->assertDatabaseHas('users', [
            'id' => $pending->id,
            'invitation_token' => null,
        ]);
        $this->assertNotNull($pending->fresh()->accepted_at);
    }

    public function test_only_admin_roles_can_send_a_password_reset_link(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);
        Mail::fake();

        $company = Company::factory()->create();
        $superAdmin = tap(User::factory()->create(['company_id' => $company->id]), fn (User $user) => $user->assignRole('super_admin'));
        $target = User::factory()->create(['company_id' => $company->id]);
        $delegatedRole = Role::findOrCreate('delegated_user_manager', 'web');
        $delegatedRole->syncPermissions([Permission::findByName('users.password.reset', 'web')]);
        $delegatedManager = tap(User::factory()->create(['company_id' => $company->id]), fn (User $user) => $user->assignRole($delegatedRole));

        $this->actingAs($delegatedManager)
            ->post(route('admin.users.password-reset', $target))
            ->assertForbidden();

        $this->actingAs($superAdmin)
            ->post(route('admin.users.password-reset', $target))
            ->assertRedirect();

        Mail::assertSent(UserPasswordReset::class, fn (UserPasswordReset $mail) => $mail->user->is($target));
    }

    /**
     * Create a pending invited user and return [user, plain invitation token].
     *
     * @return array{0: User, 1: string}
     */
    private function pendingInvitation(): array
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

        $acceptUrl = null;
        Mail::assertSent(UserInvitation::class, function (UserInvitation $mail) use (&$acceptUrl): bool {
            $acceptUrl = $mail->acceptUrl;

            return true;
        });

        $token = basename((string) parse_url((string) $acceptUrl, PHP_URL_PATH));

        Auth::logout();

        return [$user, $token];
    }

    public function test_matching_password_and_confirmation_activate_the_account(): void
    {
        [$user, $token] = $this->pendingInvitation();

        $this->post(route('invitation.complete', ['token' => $token]), [
            'name' => 'Pending User',
            'password' => 'StrongPassword!2026',
            'password_confirmation' => 'StrongPassword!2026',
        ])->assertRedirect(route('dashboard'));

        $this->assertAuthenticatedAs($user);
        $this->assertNotNull($user->fresh()->accepted_at);
        $this->assertNull($user->fresh()->invitation_token);
    }

    public function test_mismatched_password_confirmation_is_rejected_under_password(): void
    {
        [$user, $token] = $this->pendingInvitation();

        $this->post(route('invitation.complete', ['token' => $token]), [
            'name' => 'Pending User',
            'password' => 'StrongPassword!2026',
            'password_confirmation' => 'DifferentPassword!2026',
        ])->assertSessionHasErrors('password');

        $this->assertNull($user->fresh()->accepted_at);
        $this->assertNotNull($user->fresh()->invitation_token);
    }

    public function test_missing_password_confirmation_is_rejected(): void
    {
        [$user, $token] = $this->pendingInvitation();

        $this->post(route('invitation.complete', ['token' => $token]), [
            'name' => 'Pending User',
            'password' => 'StrongPassword!2026',
        ])->assertSessionHasErrors('password');

        $this->assertNull($user->fresh()->accepted_at);
    }

    public function test_camel_case_password_confirmation_does_not_satisfy_the_confirmed_rule(): void
    {
        [$user, $token] = $this->pendingInvitation();

        $this->post(route('invitation.complete', ['token' => $token]), [
            'name' => 'Pending User',
            'password' => 'StrongPassword!2026',
            'passwordConfirmation' => 'StrongPassword!2026',
        ])->assertSessionHasErrors('password');

        $this->assertNull($user->fresh()->accepted_at);
    }

    public function test_weak_matching_passwords_are_rejected(): void
    {
        [$user, $token] = $this->pendingInvitation();

        $this->post(route('invitation.complete', ['token' => $token]), [
            'name' => 'Pending User',
            'password' => 'weakpass',
            'password_confirmation' => 'weakpass',
        ])->assertSessionHasErrors('password');

        $this->assertNull($user->fresh()->accepted_at);
    }

    public function test_used_invitation_link_is_rejected_on_reuse(): void
    {
        [$user, $token] = $this->pendingInvitation();

        $this->post(route('invitation.complete', ['token' => $token]), [
            'name' => 'Pending User',
            'password' => 'StrongPassword!2026',
            'password_confirmation' => 'StrongPassword!2026',
        ])->assertRedirect(route('dashboard'));

        // The token has been consumed; reusing the same link is rejected safely.
        $this->post(route('invitation.complete', ['token' => $token]), [
            'name' => 'Pending User',
            'password' => 'AnotherStrong!2026',
            'password_confirmation' => 'AnotherStrong!2026',
        ])->assertRedirect(route('invitation.accept', ['token' => $token]));

        $fresh = $user->fresh();
        $this->assertNotNull($fresh->accepted_at);
        $this->assertTrue(Hash::check('StrongPassword!2026', $fresh->password));
    }
}
