<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class RememberSessionTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_with_remember_persists_a_remember_token(): void
    {
        $user = User::factory()->create([
            'email' => 'remember@example.test',
            'password' => Hash::make('remember-secret'),
            'remember_token' => null,
        ]);

        $this->post('/login', [
            'email' => $user->email,
            'password' => 'remember-secret',
            'remember' => true,
        ])->assertRedirect('/');

        $this->assertAuthenticatedAs($user);
        $this->assertNotNull($user->fresh()->remember_token);
    }
}
