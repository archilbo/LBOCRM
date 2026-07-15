<?php

namespace App\Http\Requests\Auth;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
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
        $user = User::where('email', $this->input('email'))->first();

        if ($user && $user->suspended_at) {
            throw ValidationException::withMessages([
                'email' => 'Your account has been suspended.',
            ]);
        }

        if ($user && $user->invitation_token && !$user->accepted_at) {
            throw ValidationException::withMessages([
                'email' => 'This account has not accepted its invitation yet.',
            ]);
        }

        $credentials = $this->only('email', 'password');
        $remember = (bool) $this->boolean('remember');

        if (!Auth::attempt($credentials, $remember)) {
            throw ValidationException::withMessages([
                'email' => 'These credentials do not match our records.',
            ]);
        }

        $this->session()->regenerate();
    }
}