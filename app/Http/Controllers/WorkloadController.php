<?php

namespace App\Http\Controllers;

use App\Services\Task\WorkloadService;
use App\Services\PermissionRegistry;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WorkloadController extends Controller
{
    public function index(Request $request, WorkloadService $workload, PermissionRegistry $permissions): Response
    {
        abort_unless($permissions->allows($request->user(), 'reports.workload.view'), 403);

        return Inertia::render('Workload/Index', [
            'workload' => $workload->summary($request->user()),
        ]);
    }
}
