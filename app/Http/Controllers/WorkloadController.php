<?php

namespace App\Http\Controllers;

use App\Services\Task\WorkloadService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WorkloadController extends Controller
{
    public function index(Request $request, WorkloadService $workload): Response
    {
        abort_unless($request->user()->can('view workload') || $request->user()->hasRole('admin'), 403);

        return Inertia::render('Workload/Index', [
            'workload' => $workload->summary(),
        ]);
    }
}
