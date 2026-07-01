<?php

namespace App\Http\Controllers;

use App\Services\Task\OperationsReportService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OperationsReportController extends Controller
{
    public function index(Request $request, OperationsReportService $reports): Response
    {
        abort_unless($request->user()->can('view operations reports') || $request->user()->hasRole('admin'), 403);

        return Inertia::render('Operations/Reports', [
            'report' => $reports->summary(),
        ]);
    }
}
