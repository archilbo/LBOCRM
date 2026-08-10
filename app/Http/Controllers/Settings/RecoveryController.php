<?php

namespace App\Http\Controllers\Settings;

use App\Models\RecoveryRecord;
use App\Services\Recovery\RecoveryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class RecoveryController
{
    public function restore(Request $request, RecoveryRecord $recoveryRecord, RecoveryService $recovery): RedirectResponse
    {
        $recovery->restore($recoveryRecord, $request->user());

        return back()->with('success', 'Élément restauré.');
    }

    public function purge(Request $request, RecoveryRecord $recoveryRecord, RecoveryService $recovery): RedirectResponse
    {
        $recovery->purge($recoveryRecord, $request->user());

        return back()->with('success', 'Élément supprimé définitivement.');
    }
}
