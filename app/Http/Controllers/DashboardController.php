<?php

namespace App\Http\Controllers;

use App\Services\Dashboard\DashboardCommandCenterService;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(DashboardCommandCenterService $dashboard): Response
    {
        return Inertia::render('Dashboard', [
            'commandCenter' => $dashboard->data(),
        ]);
    }
}