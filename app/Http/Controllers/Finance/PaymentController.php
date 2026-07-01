<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\StorePaymentRequest;
use App\Http\Requests\Finance\UpdatePaymentRequest;
use App\Http\Resources\PaymentResource;
use App\Models\FinanceDocument;
use App\Models\Payment;
use App\Notifications\FinanceDocumentNotification;
use App\Services\Finance\PaymentLedgerService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Payment::with(['document', 'client', 'dossier', 'receiptDocument']);

        $paginator = $query->orderBy('created_at', 'desc')->paginate(20);
        $payments = $paginator->through(fn ($payment) => new PaymentResource($payment));

        return Inertia::render('Finance/Payments/Index', [
            'payments' => $payments,
        ]);
    }

    public function store(StorePaymentRequest $request, PaymentLedgerService $ledger): RedirectResponse
    {
        $data = $request->validated();
        $data['created_by'] = Auth::id();

        $financeDocument = FinanceDocument::findOrFail($data['finance_document_id']);
        $payment = $ledger->recordPayment($financeDocument, $data);

        $request->user()->notify(new FinanceDocumentNotification($financeDocument, 'payment_received', 'Payment received: ' . number_format((float) ($data['amount'] ?? 0), 2) . ' for ' . $financeDocument->number));

        $receiptNumber = $payment->receiptDocument?->number;

        return back()
            ->with('success', "Paiement {$payment->payment_number} enregistre avec succes. Recu: {$receiptNumber}")
            ->with('receipt', $this->receiptFlashPayload($payment));
    }

    public function update(UpdatePaymentRequest $request, Payment $payment, PaymentLedgerService $ledger): RedirectResponse
    {
        $payment = $ledger->updatePayment($payment, $request->validated());

        $receiptNumber = $payment->receiptDocument?->number;

        return back()->with(
            'success',
            "Paiement {$payment->payment_number} mis a jour. Recu: {$receiptNumber}"
        );
    }

    public function destroy(Payment $payment, PaymentLedgerService $ledger): RedirectResponse
    {
        $number = $payment->payment_number;

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
