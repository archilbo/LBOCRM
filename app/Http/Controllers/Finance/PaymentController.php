<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\StorePaymentRequest;
use App\Http\Requests\Finance\UpdatePaymentRequest;
use App\Models\FinanceDocument;
use App\Models\Payment;
use App\Notifications\FinanceDocumentNotification;
use App\Services\Finance\PaymentLedgerService;
use App\Services\Finance\FinanceActivityService;
use App\Services\Finance\FinanceContextService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PaymentController extends Controller
{
    public function index(Request $request): RedirectResponse
    {
        $this->authorize('viewAny', Payment::class);

        return redirect()->route('finance.documents.index', ['tab' => 'payments']);
    }

    public function store(StorePaymentRequest $request, PaymentLedgerService $ledger): RedirectResponse
    {
        $this->authorize('create', Payment::class);
        $data = $request->validated();
        $data['created_by'] = Auth::id();

        $financeDocument = app(FinanceContextService::class)
            ->apply(FinanceDocument::query(), $request->user())
            ->findOrFail($data['finance_document_id']);
        $payment = $ledger->recordPayment($financeDocument, $data);
        app(FinanceActivityService::class)->log($payment, $request->user(), 'finance.payment.created', [], [
            'payment_number' => $payment->payment_number,
            'amount' => $payment->amount,
            'finance_document_id' => $financeDocument->id,
        ]);

        $request->user()->notify(new FinanceDocumentNotification($financeDocument, 'payment_received', 'Payment received: ' . number_format((float) ($data['amount'] ?? 0), 2) . ' for ' . $financeDocument->number));

        $receiptNumber = $payment->receiptDocument?->number;

        return back()
            ->with('success', "Paiement {$payment->payment_number} enregistre avec succes. Recu: {$receiptNumber}")
            ->with('receipt', $this->receiptFlashPayload($payment));
    }

    public function update(UpdatePaymentRequest $request, Payment $payment, PaymentLedgerService $ledger): RedirectResponse
    {
        $this->authorize('update', $payment);
        $old = $payment->only(['finance_document_id', 'amount', 'method', 'reference', 'paid_at']);
        $payment = $ledger->updatePayment($payment, $request->validated());
        app(FinanceActivityService::class)->log($payment, $request->user(), 'finance.payment.updated', $old, $payment->only(array_keys($old)));

        $receiptNumber = $payment->receiptDocument?->number;

        return back()->with(
            'success',
            "Paiement {$payment->payment_number} mis a jour. Recu: {$receiptNumber}"
        );
    }

    public function destroy(Payment $payment, PaymentLedgerService $ledger): RedirectResponse
    {
        $this->authorize('delete', $payment);
        $number = $payment->payment_number;
        app(FinanceActivityService::class)->log($payment, request()->user(), 'finance.payment.reversed', $payment->toArray());

        $ledger->deletePayment($payment);

        return back()->with('success', "Paiement {$number} supprime. Le recu lie a ete annule.");
    }

    private function receiptFlashPayload(Payment $payment): ?array
    {
        $payment->loadMissing('receiptDocument');
        $receipt = $payment->receiptDocument;

        if (! $receipt) {
            return null;
        }

        return [
            'paymentNumber' => $payment->payment_number,
            'number' => $receipt->number,
            'showUrl' => route('finance.documents.show', $receipt),
            'generatePdfUrl' => route('finance.documents.generate-pdf', $receipt),
            'generateExcelUrl' => route('finance.documents.generate-excel', $receipt),
            'pdfDownloadUrl' => $receipt->pdf_path ? route('finance.documents.download-pdf', $receipt) : null,
            'excelDownloadUrl' => $receipt->excel_path ? route('finance.documents.download-excel', $receipt) : null,
        ];
    }
}
