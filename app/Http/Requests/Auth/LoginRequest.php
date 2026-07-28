<?php

namespace App\Http\Requests\Auth;

use App\Models\User;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
            'remember' => ['nullable', 'boolean'],
        ];
    }

    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        $credentials = [
            'email' => Str::lower(trim((string) $this->input('email'))),
            'password' => (string) $this->input('password'),
        ];
        $remember = (bool) $this->boolean('remember');

        if (!Auth::attempt($credentials, $remember)) {
            $this->rejectLogin();
        }

        $user = Auth::user();

        if (! $user instanceof User || $user->suspended_at || ($user->invitation_token && ! $user->accepted_at)) {
            Auth::logout();

            $this->rejectLogin();
        }

        RateLimiter::clear($this->throttleKey());
        $this->session()->regenerate();
    }

    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), $this->maxAttempts())) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'email' => "Too many login attempts. Please try again in {$seconds} seconds.",
        ]);
    }

    private function rejectLogin(): never
    {
        RateLimiter::increment($this->throttleKey(), $this->decaySeconds());

        throw ValidationException::withMessages([
            'email' => 'These credentials do not match our records.',
        ]);
    }

    private function throttleKey(): string
    {
        return 'login:'.hash('sha256', Str::lower(trim((string) $this->input('email'))).'|'.$this->ip());
    }

    private function maxAttempts(): int
    {
        return max(1, (int) config('auth_security.login.max_attempts', 5));
    }

    private function decaySeconds(): int
    {
        return max(1, (int) config('auth_security.login.decay_seconds', 60));
    }
}
