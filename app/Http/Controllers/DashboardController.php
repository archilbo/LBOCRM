<?php

namespace App\Http\Controllers;

use App\Services\Dashboard\DashboardCommandCenterService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request, DashboardCommandCenterService $dashboard): Response
    {
        return Inertia::render('Dashboard', [
            'commandCenter' => $dashboard->data($request->user()),
        ]);
    }
}
