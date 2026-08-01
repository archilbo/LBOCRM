<?php

namespace Tests\Feature;

use App\Mail\UserInvitation;
use App\Mail\UserPasswordReset;
use App\Models\Company;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
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
}
