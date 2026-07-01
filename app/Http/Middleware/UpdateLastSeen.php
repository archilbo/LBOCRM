<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class UpdateLastSeen
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($user = $request->user()) {
            $lastSeen = session('last_seen_updated_at');
            if (! $lastSeen || now()->diffInMinutes($lastSeen) >= 1) {
                $user->update(['last_seen_at' => now()]);
                session(['last_seen_updated_at' => now()]);
            }
        }

        return $next($request);
    }
}
