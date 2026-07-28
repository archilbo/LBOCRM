<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class LogoutSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_logout_requires_an_authenticated_post_request(): void
    {
        $this->get(route('logout'))->assertMethodNotAllowed();
        $this->post(route('logout'))->assertRedirect(route('login'));
    }

    public function test_logout_invalidates_the_session_and_rotates_the_remember_token(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('correct-password'),
            'remember_token' => 'existing-remember-token',
        ]);
        $this->actingAs($user);
        $sessionId = $this->app['session']->getId();

        $this->post(route('logout'))
            ->assertRedirect(route('login'))
            ->assertHeader('Cache-Control', 'max-age=0, no-store, private')
            ->assertHeader('X-Content-Type-Options', 'nosniff');

        $this->assertGuest();
        $this->assertNotSame($sessionId, $this->app['session']->getId());
        $this->assertNotSame('existing-remember-token', $user->fresh()->remember_token);
    }
}
