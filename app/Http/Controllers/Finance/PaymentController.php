<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\StorePaymentRequest;
use App\Http\Requests\Finance\CancelPaymentRequest;
use App\Http\Requests\Finance\UpdatePaymentRequest;
use App\Models\Dossier;
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
        $returnTo = $data['return_to'] ?? null;
        unset($data['return_to']);
        $data['created_by'] = Auth::id();

        $context = app(FinanceContextService::class);
        $scope = $context->payload($request->user());
        $financeDocument = null;

        if (! empty($data['finance_document_id'])) {
            $financeDocument = $context
                ->apply(FinanceDocument::query(), $request->user())
                ->findOrFail($data['finance_document_id']);
            $payment = $ledger->recordPayment($financeDocument, $data);
        } else {
            $dossier = $context
                ->apply(Dossier::query(), $request->user())
                ->with('client')
                ->findOrFail($data['dossier_id']);
            $payment = $ledger->recordAdvancePayment($dossier, $scope, $data);
        }

        app(FinanceActivityService::class)->log($payment, $request->user(), $financeDocument ? 'finance.payment.created' : 'finance.payment.advance_created', [], [
            'payment_number' => $payment->payment_number,
            'amount' => $payment->amount,
            'finance_document_id' => $financeDocument?->id,
            'dossier_id' => $payment->dossier_id,
        ]);

        $notificationDocument = $financeDocument ?? $payment->receiptDocument;
        if ($notificationDocument) {
            $request->user()->notify(new FinanceDocumentNotification(
                $notificationDocument,
                'payment_received',
                $financeDocument
                    ? 'Payment received: ' . number_format((float) ($data['amount'] ?? 0), 2) . ' for ' . $financeDocument->number
                    : 'Advance payment received: ' . number_format((float) ($data['amount'] ?? 0), 2)
            ));
        }

        $receiptNumber = $payment->receiptDocument?->number;

        return $this->redirectToReturnPath($request, $returnTo, "Paiement {$payment->payment_number} enregistre avec succes. Recu: {$receiptNumber}")
            ->with('receipt', $this->receiptFlashPayload($payment));
    }

    public function update(UpdatePaymentRequest $request, Payment $payment, PaymentLedgerService $ledger): RedirectResponse
    {
        $this->authorize('update', $payment);
        $old = $payment->only(['finance_document_id', 'amount', 'method', 'reference', 'paid_at']);
        $data = $request->validated();
        $returnTo = $data['return_to'] ?? null;
        unset($data['return_to']);
        $payment = $ledger->updatePayment($payment, $data);
        app(FinanceActivityService::class)->log($payment, $request->user(), 'finance.payment.updated', $old, $payment->only(array_keys($old)));

        $receiptNumber = $payment->receiptDocument?->number;

        return $this->redirectToReturnPath($request, $returnTo, "Paiement {$payment->payment_number} mis a jour. Recu: {$receiptNumber}");
    }

    public function destroy(CancelPaymentRequest $request, Payment $payment, PaymentLedgerService $ledger): RedirectResponse
    {
        $this->authorize('delete', $payment);
        $number = $payment->payment_number;
        app(FinanceActivityService::class)->log($payment, $request->user(), 'finance.payment.reversed', $payment->toArray());

        $ledger->deletePayment($payment, $request->user(), $request->validated('cancellation_reason'));

        return $this->redirectToReturnPath($request, $request->input('return_to'), "Paiement {$number} supprime. Le recu lie a ete annule.");
    }

    private function redirectToReturnPath(Request $request, mixed $returnTo, string $message): RedirectResponse
    {
        if (is_string($returnTo)
            && str_starts_with($returnTo, '/')
            && ! str_starts_with($returnTo, '//')
            && parse_url($returnTo, PHP_URL_HOST) === null) {
            return redirect()->to($returnTo)->with('success', $message);
        }

        return back()->with('success', $message);
    }

    private function receiptFlashPayload(Payment $payment): ?array
    {
        $payment->loadMissing(['document.client', 'receiptDocument']);
        $receipt = $payment->receiptDocument;

        if (! $receipt) {
            return null;
        }

        return [
            'paymentNumber' => $payment->payment_number,
            'number' => $receipt->number,
            'clientName' => $payment->document?->client?->full_name,
            'amount' => (float) $payment->amount,
            'currency' => $payment->document?->currency ?? $receipt->currency,
            'remainingTotal' => (float) ($payment->document?->remaining_total ?? 0),
            'showUrl' => route('finance.documents.show', $receipt),
            'printUrl' => route('finance.documents.print', $receipt),
            'generatePdfUrl' => route('finance.documents.generate-pdf', $receipt),
            'generateExcelUrl' => route('finance.documents.generate-excel', $receipt),
            'pdfDownloadUrl' => $receipt->pdf_path ? route('finance.documents.download-pdf', $receipt) : null,
            'excelDownloadUrl' => $receipt->excel_path ? route('finance.documents.download-excel', $receipt) : null,
        ];
    }
}
