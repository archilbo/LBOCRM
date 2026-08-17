<?php

namespace Tests\Feature;

use App\Services\PermissionRegistry;
use Tests\TestCase;

class RoutePermissionCoverageTest extends TestCase
{
    public function test_every_permission_route_has_a_registered_permission(): void
    {
        $registry = app(PermissionRegistry::class);

        $missing = collect(app('router')->getRoutes())
            ->filter(fn ($route) => in_array('permission.route', $route->gatherMiddleware(), true))
            ->filter(fn ($route) => $registry->routePermission($route->getName()) === null)
            ->map(fn ($route) => $route->getName())
            ->filter()
            ->sort()
            ->values()
            ->all();

        $this->assertSame([], $missing, 'Every permission.route route must be mapped in PermissionRegistry.');
    }
}
