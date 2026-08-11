<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\CancelIntermediaryPaymentRequest;
use App\Http\Requests\Finance\StoreIntermediaryPaymentRequest;
use App\Models\Intermediary;
use App\Models\IntermediaryPaymentBatch;
use App\Services\Finance\IntermediaryPaymentService;
use Illuminate\Http\RedirectResponse;

class IntermediaryPaymentController extends Controller
{
    public function store(StoreIntermediaryPaymentRequest $request, Intermediary $intermediary, IntermediaryPaymentService $payments): RedirectResponse
    {
        $this->authorize('view', $intermediary);
        $this->authorize('create', \App\Models\Payment::class);
        $payments->record($intermediary, $request->user(), $request->validated());
        return back()->with('success', 'Paiement intermediaire enregistre et reparti entre les projets.');
    }

    public function destroy(CancelIntermediaryPaymentRequest $request, Intermediary $intermediary, IntermediaryPaymentBatch $batch, IntermediaryPaymentService $payments): RedirectResponse
    {
        $this->authorize('view', $intermediary);
        $this->authorize('delete', \App\Models\Payment::class);
        $payments->cancel($batch, $intermediary, $request->user(), $request->validated('cancellation_reason'));
        return back()->with('success', 'Paiement intermediaire annule et montants restaures sur les factures.');
    }
}
