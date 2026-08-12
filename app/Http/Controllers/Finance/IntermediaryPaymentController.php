<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\CancelIntermediaryPaymentRequest;
use App\Http\Requests\Finance\StoreIntermediaryPaymentRequest;
use App\Models\Intermediary;
use App\Models\IntermediaryPaymentBatch;
use App\Notifications\IntermediaryPaymentNotification;
use App\Services\Finance\IntermediaryPaymentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;

class IntermediaryPaymentController extends Controller
{
    public function store(StoreIntermediaryPaymentRequest $request, Intermediary $intermediary, IntermediaryPaymentService $payments): RedirectResponse
    {
        $this->authorize('view', $intermediary);
        $this->authorize('create', \App\Models\Payment::class);
        $batch = $payments->record($intermediary, $request->user(), $request->validated());
        DB::afterCommit(fn () => $request->user()->notify(new IntermediaryPaymentNotification($intermediary, $batch, 'intermediary_payment_recorded')));
        return back()->with('success', 'Paiement intermediaire enregistre et reparti entre les projets.');
    }

    public function destroy(CancelIntermediaryPaymentRequest $request, Intermediary $intermediary, IntermediaryPaymentBatch $batch, IntermediaryPaymentService $payments): RedirectResponse
    {
        $this->authorize('view', $intermediary);
        $this->authorize('delete', \App\Models\Payment::class);
        $wasCancelled = $payments->cancel($batch, $intermediary, $request->user(), $request->validated('cancellation_reason'));
        if ($wasCancelled) {
            $batch->refresh();
            DB::afterCommit(fn () => $request->user()->notify(new IntermediaryPaymentNotification($intermediary, $batch, 'intermediary_payment_cancelled')));
        }
        return back()->with('success', 'Paiement intermediaire annule et montants restaures sur les factures.');
    }
}
