<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\StorePaymentRequest;
use App\Http\Requests\Finance\UpdatePaymentRequest;
use App\Http\Resources\PaymentResource;
use App\Models\FinanceDocument;
use App\Models\Payment;
use App\Services\Finance\FinanceCalculator;
use App\Services\Finance\FinanceNumberService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Payment::with(['document', 'client', 'dossier']);

        $paginator = $query->orderBy('created_at', 'desc')->paginate(20);
        $payments = $paginator->through(fn($p) => new PaymentResource($p));

        return Inertia::render('Finance/Payments/Index', [
            'payments' => $payments,
        ]);
    }

    public function store(StorePaymentRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $payment = DB::transaction(function () use ($data) {
            $document = FinanceDocument::findOrFail($data['finance_document_id']);

            if (!$document->canRecordPayment()) {
                throw new \Exception('Ce document ne peut pas recevoir de paiement.');
            }

            $payment = Payment::create([
                'finance_document_id' => $document->id,
                'client_id' => $document->client_id,
                'dossier_id' => $document->dossier_id,
                'payment_number' => FinanceNumberService::nextPaymentNumber(),
                'amount' => $data['amount'],
                'method' => $data['method'] ?? null,
                'reference' => $data['reference'] ?? null,
                'paid_at' => $data['paid_at'] ?? now(),
                'notes' => $data['notes'] ?? null,
                'created_by' => Auth::id(),
            ]);

            FinanceCalculator::updateInvoicePaymentTotals($document);
            $document->save();

            return $payment;
        });

        return back()->with('success', "Paiement {$payment->payment_number} enregistré avec succès !");
    }

    public function update(UpdatePaymentRequest $request, Payment $payment): RedirectResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($data, $payment) {
            $oldDoc = $payment->document;
            $newDocId = $data['finance_document_id'] ?? $payment->finance_document_id;
            $newDoc = FinanceDocument::findOrFail($newDocId);

            $payment->update([
                'finance_document_id' => $newDocId,
                'client_id' => $newDoc->client_id ?? $payment->client_id,
                'dossier_id' => $newDoc->dossier_id ?? $payment->dossier_id,
                'amount' => $data['amount'] ?? $payment->amount,
                'method' => $data['method'] ?? $payment->method,
                'reference' => $data['reference'] ?? $payment->reference,
                'paid_at' => $data['paid_at'] ?? $payment->paid_at,
                'notes' => $data['notes'] ?? $payment->notes,
            ]);

            if ($oldDoc && $oldDoc->id !== $newDocId) {
                FinanceCalculator::updateInvoicePaymentTotals($oldDoc);
                $oldDoc->save();
            }

            FinanceCalculator::updateInvoicePaymentTotals($newDoc);
            $newDoc->save();
        });

        return back()->with('success', "Paiement {$payment->payment_number} mis à jour !");
    }

    public function destroy(Payment $payment): RedirectResponse
    {
        $number = $payment->payment_number;
        $document = $payment->document;

        DB::transaction(function () use ($payment, $document) {
            $payment->delete();

            if ($document) {
                FinanceCalculator::updateInvoicePaymentTotals($document);
                $document->save();
            }
        });

        return back()->with('success', "Paiement {$number} supprimé !");
    }
}
