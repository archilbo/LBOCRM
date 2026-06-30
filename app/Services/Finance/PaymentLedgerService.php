<?php

namespace App\Services\Finance;

use App\Models\FinanceDocument;
use App\Models\FinanceDocumentItem;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Throwable;

class PaymentLedgerService
{
    public function recordPayment(FinanceDocument $invoice, array $data): Payment
    {
        return DB::transaction(function () use ($invoice, $data) {
            $invoice = $invoice->fresh();

            $amount = $this->normalizeAmount($data['amount'] ?? 0);

            $this->assertCanReceivePayment($invoice);
            $this->assertPaymentAmountIsValid($invoice, $amount);

            $payment = Payment::create([
                'finance_document_id' => $invoice->id,
                'client_id' => $invoice->client_id,
                'dossier_id' => $invoice->dossier_id,
                'payment_number' => FinanceNumberService::nextPaymentNumber(),
                'amount' => $amount,
                'method' => $data['method'] ?? null,
                'reference' => $data['reference'] ?? null,
                'paid_at' => $data['paid_at'] ?? now(),
                'notes' => $data['notes'] ?? null,
                'created_by' => $data['created_by'] ?? null,
            ]);

            $invoice = $this->recalculateInvoice($invoice);

            $receipt = $this->createOrUpdateReceiptForPayment($invoice, $payment->fresh());

            $payment->forceFill([
                'receipt_document_id' => $receipt->id,
            ])->save();

            return $payment->fresh(['document', 'receiptDocument']);
        });
    }

    public function updatePayment(Payment $payment, array $data): Payment
    {
        return DB::transaction(function () use ($payment, $data) {
            $payment = $payment->fresh(['document']);

            $oldInvoice = $payment->document;
            $newInvoiceId = $data['finance_document_id'] ?? $payment->finance_document_id;
            $newInvoice = FinanceDocument::findOrFail($newInvoiceId);
            $amount = $this->normalizeAmount($data['amount'] ?? $payment->amount);

            $this->assertCanReceivePayment($newInvoice);
            $this->assertPaymentAmountIsValid($newInvoice, $amount, $payment);

            $payment->update([
                'finance_document_id' => $newInvoice->id,
                'client_id' => $newInvoice->client_id,
                'dossier_id' => $newInvoice->dossier_id,
                'amount' => $amount,
                'method' => $data['method'] ?? $payment->method,
                'reference' => $data['reference'] ?? $payment->reference,
                'paid_at' => $data['paid_at'] ?? $payment->paid_at,
                'notes' => $data['notes'] ?? $payment->notes,
            ]);

            if ($oldInvoice && $oldInvoice->id !== $newInvoice->id) {
                $this->recalculateInvoice($oldInvoice->fresh());
            }

            $newInvoice = $this->recalculateInvoice($newInvoice->fresh());

            $receipt = $this->createOrUpdateReceiptForPayment($newInvoice, $payment->fresh());

            $payment->forceFill([
                'receipt_document_id' => $receipt->id,
            ])->save();

            return $payment->fresh(['document', 'receiptDocument']);
        });
    }

    public function deletePayment(Payment $payment): void
    {
        DB::transaction(function () use ($payment) {
            $payment = $payment->fresh(['document', 'receiptDocument']);

            $invoice = $payment->document;
            $receipt = $payment->receiptDocument;

            if ($receipt) {
                $receipt->forceFill([
                    'status' => 'cancelled',
                    'notes' => trim(($receipt->notes ?? '') . PHP_EOL . 'Recu annule car le paiement lie a ete supprime.'),
                ])->save();
            }

            $payment->delete();

            if ($invoice) {
                $this->recalculateInvoice($invoice->fresh());
            }
        });
    }

    public function recalculateInvoice(FinanceDocument $invoice): FinanceDocument
    {
        FinanceCalculator::updateInvoicePaymentTotals($invoice);
        $invoice->save();

        return $invoice->fresh();
    }

    private function assertCanReceivePayment(FinanceDocument $invoice): void
    {
        if (! $invoice->canRecordPayment()) {
            throw ValidationException::withMessages([
                'finance_document_id' => 'This document cannot receive payments.',
            ]);
        }
    }

    private function assertPaymentAmountIsValid(FinanceDocument $invoice, float $amount, ?Payment $existingPayment = null): void
    {
        if ($amount <= 0) {
            throw ValidationException::withMessages([
                'amount' => 'Payment amount must be greater than zero.',
            ]);
        }

        $available = (float) $invoice->remaining_total;

        if ($existingPayment && (int) $existingPayment->finance_document_id === (int) $invoice->id) {
            $available += (float) $existingPayment->amount;
        }

        if ($amount > round($available, 2)) {
            throw ValidationException::withMessages([
                'amount' => 'Payment amount cannot be greater than the remaining invoice amount.',
            ]);
        }
    }

    private function createOrUpdateReceiptForPayment(FinanceDocument $invoice, Payment $payment): FinanceDocument
    {
        $receipt = $payment->receipt_document_id
            ? FinanceDocument::find($payment->receipt_document_id)
            : null;

        $amount = (float) $payment->amount;
        $paymentDate = $payment->paid_at ?: now();

        if (! $receipt) {
            $receipt = new FinanceDocument();
            $receipt->type = 'receipt';
            $receipt->number = $this->nextReceiptNumber();
            $receipt->status = 'issued';
            $receipt->created_by = $payment->created_by;
        }

        $receipt->forceFill([
            'client_id' => $invoice->client_id,
            'dossier_id' => $invoice->dossier_id,
            'source_document_id' => $invoice->id,
            'issue_date' => $paymentDate,
            'currency' => $invoice->currency,
            'tva_rate' => 0,
            'subtotal_ht' => $amount,
            'discount_total' => 0,
            'tax_total' => 0,
            'total_ttc' => $amount,
            'paid_total' => $amount,
            'remaining_total' => 0,
            'notes' => $this->receiptNotes($invoice, $payment),
            'terms' => $this->receiptTerms($payment),
        ])->save();

        $this->syncReceiptItem($receipt, $invoice, $payment);

        return $receipt->fresh();
    }

    private function syncReceiptItem(FinanceDocument $receipt, FinanceDocument $invoice, Payment $payment): void
    {
        $receipt->items()->delete();

        $item = new FinanceDocumentItem([
            'position' => 1,
            'title' => 'Paiement recu - Facture ' . $invoice->number,
            'quantity' => 1,
            'unit' => 'payment',
            'unit_price' => (float) $payment->amount,
            'tva_rate' => 0,
        ]);

        $item->calculateTotals();
        $receipt->items()->save($item);
    }

    private function receiptNotes(FinanceDocument $invoice, Payment $payment): string
    {
        return implode(PHP_EOL, array_filter([
            'Recu de paiement pour facture ' . $invoice->number . '.',
            'Montant recu: ' . number_format((float) $payment->amount, 2, '.', ' ') . ' ' . $invoice->currency . '.',
            'Total facture TTC: ' . number_format((float) $invoice->total_ttc, 2, '.', ' ') . ' ' . $invoice->currency . '.',
            'Total paye facture: ' . number_format((float) $invoice->paid_total, 2, '.', ' ') . ' ' . $invoice->currency . '.',
            'Reste a payer: ' . number_format((float) $invoice->remaining_total, 2, '.', ' ') . ' ' . $invoice->currency . '.',
            $payment->notes,
        ]));
    }

    private function receiptTerms(Payment $payment): string
    {
        return implode(PHP_EOL, array_filter([
            'Date de paiement: ' . optional($payment->paid_at)->format('Y-m-d'),
            'Mode de paiement: ' . ($payment->method ?: 'Non precise'),
            'Reference: ' . ($payment->reference ?: null),
            'Numero paiement: ' . $payment->payment_number,
        ]));
    }

    private function nextReceiptNumber(): string
    {
        try {
            return FinanceNumberService::nextDocumentNumber('receipt');
        } catch (Throwable) {
            $year = now()->format('Y');
            $next = FinanceDocument::where('type', 'receipt')
                ->whereYear('created_at', now()->year)
                ->count() + 1;

            return 'REC-' . $year . '-' . str_pad((string) $next, 4, '0', STR_PAD_LEFT);
        }
    }

    private function normalizeAmount(mixed $amount): float
    {
        return round((float) $amount, 2);
    }
}