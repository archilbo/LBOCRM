<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\SnoozeFinancePaymentReminderRequest;
use App\Http\Requests\Finance\StoreFinancePaymentReminderRequest;
use App\Models\FinanceDocument;
use App\Models\FinancePaymentReminder;
use App\Services\Finance\FinanceActivityService;
use App\Services\Finance\FinancePaymentReminderService;
use Illuminate\Http\RedirectResponse;

class FinancePaymentReminderController extends Controller
{
    public function store(StoreFinancePaymentReminderRequest $request, FinanceDocument $financeDocument, FinancePaymentReminderService $service): RedirectResponse
    {
        $this->authorize('view', $financeDocument);
        $this->authorize('create', FinancePaymentReminder::class);

        $service->create($financeDocument, $request->user(), $request->validated());

        return back()->with('success', 'Rappel de paiement programmé.');
    }

    public function snooze(SnoozeFinancePaymentReminderRequest $request, FinancePaymentReminder $financePaymentReminder, FinancePaymentReminderService $service): RedirectResponse
    {
        $this->authorize('update', $financePaymentReminder);
        $service->snooze($financePaymentReminder, $request->user(), $request->validated());

        return back()->with('success', 'Rappel reporté.');
    }

    public function destroy(FinancePaymentReminder $financePaymentReminder, FinanceActivityService $activity): RedirectResponse
    {
        $this->authorize('delete', $financePaymentReminder);
        $old = $financePaymentReminder->only(['status', 'cancelled_at']);
        $financePaymentReminder->update(['status' => 'cancelled', 'cancelled_at' => now()]);
        $activity->log($financePaymentReminder, request()->user(), 'finance.reminder.cancelled', $old, $financePaymentReminder->only(array_keys($old)));

        return back()->with('success', 'Rappel annulé.');
    }
}
