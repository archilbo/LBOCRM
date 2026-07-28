<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class LoginSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_response_has_security_and_no_store_headers(): void
    {
        $this->get(route('login'))
            ->assertOk()
            ->assertHeader('X-Content-Type-Options', 'nosniff')
            ->assertHeader('X-Frame-Options', 'DENY')
            ->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
            ->assertHeader('Cache-Control', 'max-age=0, no-store, private');
    }

    public function test_suspended_account_returns_the_generic_login_error_and_is_not_authenticated(): void
    {
        $user = User::factory()->create([
            'email' => 'suspended@example.test',
            'password' => Hash::make('correct-password'),
            'suspended_at' => now(),
        ]);

        $this->post(route('login.store'), [
            'email' => $user->email,
            'password' => 'correct-password',
        ])->assertSessionHasErrors([
            'email' => 'These credentials do not match our records.',
        ]);

        $this->assertGuest();
    }

    public function test_repeated_invalid_logins_are_throttled(): void
    {
        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->from(route('login'))
                ->post(route('login.store'), [
                    'email' => 'locked@example.test',
                    'password' => 'incorrect-password',
                ])
                ->assertRedirect(route('login'));
        }

        $this->from(route('login'))
            ->post(route('login.store'), [
                'email' => 'locked@example.test',
                'password' => 'incorrect-password',
            ])
            ->assertSessionHasErrors('email');
    }
}
