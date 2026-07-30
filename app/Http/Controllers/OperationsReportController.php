<?php

namespace App\Http\Controllers;

use App\Services\Task\OperationsReportService;
use App\Services\PermissionRegistry;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OperationsReportController extends Controller
{
    public function index(Request $request, OperationsReportService $reports, PermissionRegistry $permissions): Response
    {
        abort_unless($permissions->allows($request->user(), 'reports.operations.view'), 403);

        return Inertia::render('Operations/Reports', [
            'report' => $reports->summary($request->user()),
        ]);
    }
}
