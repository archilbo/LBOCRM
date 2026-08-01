<?php

namespace App\Http\Controllers;

use App\Services\PermissionRegistry;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;

class OperationsReportController extends Controller
{
    public function index(Request $request, PermissionRegistry $permissions): RedirectResponse
    {
        abort_unless($permissions->allows($request->user(), 'reports.operations.view'), 403);

        return redirect()->route('admin.users.index', ['tab' => 'reports']);
    }
}
