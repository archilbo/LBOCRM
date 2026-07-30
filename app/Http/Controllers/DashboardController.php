<?php

namespace App\Http\Controllers;

use App\Services\Dashboard\DashboardCommandCenterService;
use App\Services\PermissionRegistry;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request, DashboardCommandCenterService $dashboard, PermissionRegistry $permissions): Response
    {
        abort_unless($permissions->allows($request->user(), 'dashboard.view'), 403);

        return Inertia::render('Dashboard', [
            'commandCenter' => $dashboard->data($request->user()),
        ]);
    }
}
