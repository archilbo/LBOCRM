<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\ReplaceFinancePaymentScheduleRequest;
use App\Models\FinanceDocument;
use App\Models\FinancePaymentScheduleItem;
use App\Services\Finance\FinancePaymentScheduleService;
use Illuminate\Http\RedirectResponse;

class FinancePaymentScheduleController extends Controller
{
    public function replace(ReplaceFinancePaymentScheduleRequest $request, FinanceDocument $financeDocument, FinancePaymentScheduleService $service): RedirectResponse
    {
        $this->authorize('view', $financeDocument);
        $this->authorize('create', FinancePaymentScheduleItem::class);
        $service->replace($financeDocument, $request->user(), $request->validated('items'));

        return back()->with('success', 'Échéancier mis à jour.');
    }
}
