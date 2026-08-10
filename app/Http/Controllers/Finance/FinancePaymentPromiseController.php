<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\StoreFinancePaymentPromiseRequest;
use App\Models\FinanceDocument;
use App\Models\FinancePaymentPromise;
use App\Services\Finance\FinanceActivityService;
use App\Services\Finance\FinancePaymentPromiseService;
use Illuminate\Http\RedirectResponse;

class FinancePaymentPromiseController extends Controller
{
    public function store(StoreFinancePaymentPromiseRequest $request, FinanceDocument $financeDocument, FinancePaymentPromiseService $service): RedirectResponse
    {
        $this->authorize('view', $financeDocument);
        $this->authorize('create', FinancePaymentPromise::class);
        $service->create($financeDocument, $request->user(), $request->validated());

        return back()->with('success', 'Promesse de paiement enregistrée.');
    }

    public function destroy(FinancePaymentPromise $financePaymentPromise, FinanceActivityService $activity): RedirectResponse
    {
        $this->authorize('update', $financePaymentPromise);
        $old = $financePaymentPromise->only(['status', 'cancelled_at']);
        $financePaymentPromise->update(['status' => 'cancelled', 'cancelled_at' => now()]);
        $activity->log($financePaymentPromise, request()->user(), 'finance.promise.cancelled', $old, $financePaymentPromise->only(array_keys($old)));

        return back()->with('success', 'Promesse annulée.');
    }
}
