<?php

namespace App\Http\Middleware;

use App\Services\PermissionRegistry;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRoutePermission
{
    public function handle(Request $request, Closure $next): Response
    {
        $registry = app(PermissionRegistry::class);
        $permission = $registry->routePermission($request->route()?->getName());

        if ($permission && (! $request->user() || ! $registry->allows($request->user(), $permission))) {
            abort(403);
        }

        return $next($request);
    }
}
