<?php

namespace App\Services\Security;

use App\Models\User;
use Illuminate\Support\Str;

class TwoFactorService
{
    public function generateSecret(): string
    {
        $alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

        return collect(range(1, 32))
            ->map(fn () => $alphabet[random_int(0, strlen($alphabet) - 1)])
            ->implode('');
    }

    public function provisioningUri(User $user, string $secret): string
    {
        $label = rawurlencode(config('app.name').' : '.$user->email);

        return "otpauth://totp/{$label}?secret={$secret}&issuer=".rawurlencode((string) config('app.name')).'&algorithm=SHA1&digits=6&period=30';
    }

    public function verify(string $secret, string $code): bool
    {
        $code = preg_replace('/\s+/', '', $code) ?? '';
        if (! preg_match('/^\d{6}$/', $code)) {
            return false;
        }

        $counter = intdiv(time(), 30);
        foreach ([-1, 0, 1] as $offset) {
            if (hash_equals($this->code($secret, $counter + $offset), $code)) {
                return true;
            }
        }

        return false;
    }

    public function recoveryCodes(): array
    {
        return collect(range(1, 8))->map(fn () => Str::upper(Str::random(4)).'-'.Str::upper(Str::random(4)))->all();
    }

    public function codeForCounter(string $secret, int $counter): string
    {
        return $this->code($secret, $counter);
    }

    private function code(string $secret, int $counter): string
    {
        $key = $this->decodeBase32($secret);
        $hash = hash_hmac('sha1', pack('N*', 0, $counter), $key, true);
        $offset = ord($hash[19]) & 0x0f;
        $value = ((ord($hash[$offset]) & 0x7f) << 24) | (ord($hash[$offset + 1]) << 16) | (ord($hash[$offset + 2]) << 8) | ord($hash[$offset + 3]);

        return str_pad((string) ($value % 1_000_000), 6, '0', STR_PAD_LEFT);
    }

    private function decodeBase32(string $value): string
    {
        $alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        $bits = '';
        foreach (str_split(strtoupper($value)) as $character) {
            $position = strpos($alphabet, $character);
            if ($position !== false) {
                $bits .= str_pad(decbin($position), 5, '0', STR_PAD_LEFT);
            }
        }

        return implode('', array_map(
            fn (string $chunk) => chr(bindec($chunk)),
            str_split(substr($bits, 0, intdiv(strlen($bits), 8) * 8), 8),
        ));
    }
}
