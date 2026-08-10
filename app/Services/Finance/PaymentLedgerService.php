<?php

namespace App\Services\Finance;

use App\Enums\PaymentKind;
use App\Models\Dossier;
use App\Models\FinanceDocument;
use App\Models\FinanceDocumentItem;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Throwable;

class PaymentLedgerService
{
    public function __construct(
        private readonly DossierFinanceEligibilityService $eligibility,
        private readonly FinancePaymentReminderService $reminders,
        private readonly FinancePaymentPromiseService $promises,
    ) {
    }

    public function recordPayment(FinanceDocument $invoice, array $data): Payment
    {
        return DB::transaction(function () use ($invoice, $data) {
            $invoice = $invoice->fresh();

            $amount = $this->normalizeAmount($data['amount'] ?? 0);

            $this->assertCanReceivePayment($invoice);
            $this->assertPaymentAmountIsValid($invoice, $amount);

            $payment = Payment::create([
                'company_id' => $invoice->company_id,
                'branch_id' => $invoice->branch_id,
                'finance_document_id' => $invoice->id,
                'payment_kind' => PaymentKind::Invoice,
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
            $this->reminders->completeForInvoice($invoice);
            $this->promises->reconcileForInvoice($invoice);

            $receipt = $this->createOrUpdateReceiptForPayment($invoice, $payment->fresh());

            $payment->forceFill([
                'receipt_document_id' => $receipt->id,
            ])->save();

            return $payment->fresh(['document', 'receiptDocument']);
        });
    }

    public function recordAdvancePayment(Dossier $dossier, array $scope, array $data): Payment
    {
        return DB::transaction(function () use ($dossier, $scope, $data) {
            $dossier = $dossier->fresh(['client']);
            $this->eligibility->assertCanRecordAdvance($scope, $dossier, isset($data['client_id']) ? (int) $data['client_id'] : null);

            $amount = $this->normalizeAmount($data['amount'] ?? 0);
            if ($amount <= 0) {
                throw ValidationException::withMessages([
                    'amount' => 'Le montant du paiement doit etre superieur a zero.',
                ]);
            }

            $payment = Payment::create([
                'company_id' => $scope['company_id'],
                'branch_id' => $scope['branch_id'] ?? null,
                'finance_document_id' => null,
                'payment_kind' => PaymentKind::Advance,
                'client_id' => $dossier->client_id,
                'dossier_id' => $dossier->id,
                'payment_number' => FinanceNumberService::nextPaymentNumber(),
                'amount' => $amount,
                'method' => $data['method'] ?? null,
                'reference' => $data['reference'] ?? null,
                'paid_at' => $data['paid_at'] ?? now(),
                'notes' => $data['notes'] ?? null,
                'created_by' => $data['created_by'] ?? null,
            ]);

            $receipt = $this->createReceiptForAdvance($dossier, $scope, $payment->fresh());
            $payment->forceFill(['receipt_document_id' => $receipt->id])->save();

            return $payment->fresh(['document', 'receiptDocument', 'dossier.client']);
        });
    }

    public function applyPendingAdvancesToInvoice(FinanceDocument $invoice): int
    {
        if (! $invoice->isInvoice() || ! $invoice->dossier_id) {
            return 0;
        }

        $advances = Payment::query()
            ->where('company_id', $invoice->company_id)
            ->when($invoice->branch_id, fn ($query, $branchId) => $query->where('branch_id', $branchId), fn ($query) => $query->whereNull('branch_id'))
            ->where('dossier_id', $invoice->dossier_id)
            ->where('client_id', $invoice->client_id)
            ->where('payment_kind', PaymentKind::Advance->value)
            ->whereNull('finance_document_id')
            ->lockForUpdate()
            ->orderBy('paid_at')
            ->orderBy('id')
            ->get();

        $advanceTotal = (float) $advances->sum('amount');
        if ($advanceTotal <= 0) {
            return 0;
        }

        if ($advanceTotal > (float) $invoice->total_ttc) {
            throw ValidationException::withMessages([
                'total_ttc' => 'Le total des avances depasse le montant TTC de la facture. Corrigez la facture avant de la creer.',
            ]);
        }

        foreach ($advances as $advance) {
            $advance->update(['finance_document_id' => $invoice->id]);

            if ($advance->receipt_document_id) {
                FinanceDocument::query()->whereKey($advance->receipt_document_id)->update([
                    'source_document_id' => $invoice->id,
                ]);
            }
        }

        $this->recalculateInvoice($invoice->fresh());

        return $advances->count();
    }

    public function releaseAdvancesFromInvoice(FinanceDocument $invoice): int
    {
        if (! $invoice->isInvoice()) {
            return 0;
        }

        $advances = Payment::query()
            ->where('finance_document_id', $invoice->id)
            ->where('payment_kind', PaymentKind::Advance->value)
            ->lockForUpdate()
            ->get();

        foreach ($advances as $advance) {
            $advance->update(['finance_document_id' => null]);

            if ($advance->receipt_document_id) {
                FinanceDocument::query()->whereKey($advance->receipt_document_id)->update([
                    'source_document_id' => null,
                ]);
            }
        }

        if ($advances->isNotEmpty()) {
            $this->recalculateInvoice($invoice->fresh());
        }

        return $advances->count();
    }

    public function updatePayment(Payment $payment, array $data): Payment
    {
        return DB::transaction(function () use ($payment, $data) {
            $payment = $payment->fresh(['document']);

            $oldInvoice = $payment->document;
            $newInvoiceId = $data['finance_document_id'] ?? $payment->finance_document_id;
            $newInvoice = FinanceDocument::query()
                ->where('company_id', $payment->company_id)
                ->when($payment->branch_id, fn ($query, $branchId) => $query->where('branch_id', $branchId))
                ->findOrFail($newInvoiceId);
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
            $this->reminders->completeForInvoice($newInvoice);
            $this->promises->reconcileForInvoice($newInvoice);

            $receipt = $this->createOrUpdateReceiptForPayment($newInvoice, $payment->fresh());

            $payment->forceFill([
                'receipt_document_id' => $receipt->id,
            ])->save();

            return $payment->fresh(['document', 'receiptDocument']);
        });
    }

    public function deletePayment(Payment $payment, ?User $cancelledBy = null, ?string $cancellationReason = null): void
    {
        DB::transaction(function () use ($payment, $cancelledBy, $cancellationReason) {
            $payment = $payment->fresh(['document', 'receiptDocument']);

            $invoice = $payment->document;
            $receipt = $payment->receiptDocument;

            if ($receipt) {
                $receipt->forceFill([
                    'status' => 'cancelled',
                    'notes' => trim(($receipt->notes ?? '') . PHP_EOL . 'Recu annule car le paiement lie a ete supprime.'),
                ])->save();
            }

            $payment->forceFill([
                'cancelled_at' => now(),
                'cancelled_by' => $cancelledBy?->id,
                'cancellation_reason' => $cancellationReason,
            ])->save();
            $payment->delete();

            if ($invoice) {
                $invoice = $this->recalculateInvoice($invoice->fresh());
                $this->promises->reconcileForInvoice($invoice);
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
            'company_id' => $invoice->company_id,
            'branch_id' => $invoice->branch_id,
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

    private function createReceiptForAdvance(Dossier $dossier, array $scope, Payment $payment): FinanceDocument
    {
        $receipt = new FinanceDocument();
        $receipt->forceFill([
            'company_id' => $scope['company_id'],
            'branch_id' => $scope['branch_id'] ?? null,
            'type' => 'receipt',
            'number' => $this->nextReceiptNumber(),
            'status' => 'issued',
            'client_id' => $dossier->client_id,
            'dossier_id' => $dossier->id,
            'source_document_id' => null,
            'issue_date' => $payment->paid_at ?: now(),
            'currency' => FinanceSettingsService::getCurrency(),
            'tva_rate' => 0,
            'subtotal_ht' => $payment->amount,
            'discount_total' => 0,
            'tax_total' => 0,
            'total_ttc' => $payment->amount,
            'paid_total' => $payment->amount,
            'remaining_total' => 0,
            'notes' => implode(PHP_EOL, array_filter([
                'Recu d avance pour le dossier ' . $dossier->dossier_number . '.',
                'Montant recu: ' . number_format((float) $payment->amount, 2, '.', ' ') . ' ' . FinanceSettingsService::getCurrency() . '.',
                $payment->notes,
            ])),
            'terms' => $this->receiptTerms($payment),
            'created_by' => $payment->created_by,
        ])->save();

        $item = new FinanceDocumentItem([
            'position' => 1,
            'title' => 'Avance recue - Dossier ' . $dossier->dossier_number,
            'quantity' => 1,
            'unit' => 'payment',
            'unit_price' => (float) $payment->amount,
        ]);
        $item->calculateTotals();
        $receipt->items()->save($item);

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
            $next = FinanceDocument::withTrashed()
                ->where('type', 'receipt')
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
