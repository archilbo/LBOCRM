<?php

namespace App\Services\Finance;

use App\Enums\PaymentKind;
use App\Models\Dossier;
use App\Models\DossierNegotiatedPaymentLine;
use App\Models\FinanceDocument;
use App\Models\FinanceDocumentItem;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PaymentLedgerService
{
    public function __construct(
        private readonly DossierFinanceEligibilityService $eligibility,
        private readonly FinancePaymentReminderService $reminders,
        private readonly FinancePaymentPromiseService $promises,
        private readonly FinanceDocumentSequenceService $sequences,
    ) {
    }

    public function recordPayment(FinanceDocument $invoice, array $data): Payment
    {
        return DB::transaction(function () use ($invoice, $data) {
            $invoice = $invoice->fresh();

            $amount = $this->normalizeAmount($data['amount'] ?? 0);

            $this->assertCanReceivePayment($invoice);
            $this->assertPaymentAmountIsValid($invoice, $amount);
            $receiptItems = $this->receiptItems(
                $data['receipt_items'] ?? null,
                $amount,
                'Paiement recu - Facture ' . $invoice->number,
            );

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

            $invoice = $this->recalculateDocument($invoice);
            if ($invoice->isInvoice()) {
                $this->reminders->completeForInvoice($invoice);
                $this->promises->reconcileForInvoice($invoice);
            }

            $receipt = $this->createOrUpdateReceiptForPayment($invoice, $payment->fresh(), $receiptItems);

            $payment->forceFill([
                'receipt_document_id' => $receipt->id,
            ])->save();

            return $payment->fresh(['document', 'receiptDocument']);
        });
    }

    public function recordAdvancePayment(Dossier $dossier, array $scope, array $data): Payment
    {
        return DB::transaction(function () use ($dossier, $scope, $data) {
            $dossier = $dossier->fresh(['primaryClient']);
            $this->eligibility->assertCanRecordAdvance($scope, $dossier, isset($data['client_id']) ? (int) $data['client_id'] : null);

            $amount = $this->normalizeAmount($data['amount'] ?? 0);
            if ($amount <= 0) {
                throw ValidationException::withMessages([
                    'amount' => 'Le montant du paiement doit etre superieur a zero.',
                ]);
            }
            $receiptItems = $this->receiptItems(
                $data['receipt_items'] ?? null,
                $amount,
                'Avance recue - Dossier ' . $dossier->dossier_number,
            );

            // Finance records keep ONE explicit client: the submitted member
            // client, or the project's primary client as fallback.
            $paymentClientId = isset($data['client_id']) ? (int) $data['client_id'] : $dossier->client_id;

            $payment = Payment::create([
                'company_id' => $scope['company_id'],
                'branch_id' => $scope['branch_id'] ?? null,
                'finance_document_id' => null,
                'payment_kind' => PaymentKind::Advance,
                'client_id' => $paymentClientId,
                'dossier_id' => $dossier->id,
                'payment_number' => FinanceNumberService::nextPaymentNumber(),
                'amount' => $amount,
                'method' => $data['method'] ?? null,
                'reference' => $data['reference'] ?? null,
                'paid_at' => $data['paid_at'] ?? now(),
                'notes' => $data['notes'] ?? null,
                'created_by' => $data['created_by'] ?? null,
            ]);

            $receipt = $this->createReceiptForAdvance($dossier, $scope, $payment->fresh(), $receiptItems);
            $payment->forceFill(['receipt_document_id' => $receipt->id])->save();

            return $payment->fresh(['document', 'receiptDocument', 'dossier.primaryClient']);
        });
    }

    /**
     * Records one advance against a negotiated project line. The outstanding
     * amount is always calculated from the ledger while the line is locked.
     */
    public function recordNegotiatedPayment(Dossier $dossier, array $scope, array $data): Payment
    {
        return DB::transaction(function () use ($dossier, $scope, $data): Payment {
            $dossier = $dossier->fresh(['primaryClient']);
            $this->assertDossierClient($dossier, $scope, isset($data['client_id']) ? (int) $data['client_id'] : null);

            $line = $this->resolveNegotiatedLine($dossier, $scope, $data);
            $amount = $this->normalizeAmount($data['amount'] ?? 0);

            if ($amount <= 0) {
                throw ValidationException::withMessages([
                    'amount' => 'Le montant de l avance doit etre superieur a zero.',
                ]);
            }

            $paid = $this->normalizeAmount((float) $line->payments()
                ->lockForUpdate()
                ->sum('amount'));
            $remaining = $this->normalizeAmount((float) $line->negotiated_amount - $paid);

            if ($amount > $remaining) {
                throw ValidationException::withMessages([
                    'amount' => 'L avance depasse le reste negocie pour cette ligne.',
                ]);
            }

            $receiptItems = $this->receiptItems(
                $data['receipt_items'] ?? null,
                $amount,
                'Avance recue - ' . $line->designation,
            );

            $paymentClientId = isset($data['client_id']) ? (int) $data['client_id'] : $dossier->client_id;

            $payment = Payment::create([
                'company_id' => $scope['company_id'],
                'branch_id' => $scope['branch_id'] ?? null,
                'finance_document_id' => null,
                'payment_kind' => PaymentKind::NegotiatedAdvance,
                'client_id' => $paymentClientId,
                'dossier_id' => $dossier->id,
                'dossier_negotiated_payment_line_id' => $line->id,
                'payment_number' => FinanceNumberService::nextPaymentNumber(),
                'amount' => $amount,
                'method' => $data['method'] ?? null,
                'reference' => $data['reference'] ?? null,
                'paid_at' => $data['paid_at'] ?? now(),
                'notes' => $data['notes'] ?? null,
                'created_by' => $data['created_by'] ?? null,
            ]);

            $receipt = $this->createReceiptForNegotiatedPayment($dossier, $scope, $line, $payment->fresh(), $receiptItems);
            $payment->forceFill(['receipt_document_id' => $receipt->id])->save();

            return $payment->fresh(['document', 'receiptDocument', 'dossier.primaryClient', 'negotiatedPaymentLine']);
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
            $payment = $payment->fresh(['document', 'receiptDocument.items', 'negotiatedPaymentLine']);

            if ($payment->negotiatedPaymentLine) {
                throw ValidationException::withMessages([
                    'payment' => 'Une avance negociee ne peut pas etre modifiee. Annulez-la puis enregistrez une nouvelle avance.',
                ]);
            }

            $oldInvoice = $payment->document;
            $newInvoiceId = $data['finance_document_id'] ?? $payment->finance_document_id;
            $newInvoice = FinanceDocument::query()
                ->where('company_id', $payment->company_id)
                ->when($payment->branch_id, fn ($query, $branchId) => $query->where('branch_id', $branchId), fn ($query) => $query->whereNull('branch_id'))
                ->findOrFail($newInvoiceId);
            $amount = $this->normalizeAmount($data['amount'] ?? $payment->amount);

            $this->assertCanReceivePayment($newInvoice);
            $this->assertPaymentAmountIsValid($newInvoice, $amount, $payment);
            $receiptItems = $this->receiptItems(
                $data['receipt_items'] ?? null,
                $amount,
                'Paiement recu - Facture ' . $newInvoice->number,
                $payment->receiptDocument?->items,
            );

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

            $receipt = $this->createOrUpdateReceiptForPayment($newInvoice, $payment->fresh(), $receiptItems);

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

    public function recalculateDocument(FinanceDocument $invoice): FinanceDocument
    {
        FinanceCalculator::updateInvoicePaymentTotals($invoice);
        $invoice->save();

        return $invoice->fresh();
    }

    public function recalculateInvoice(FinanceDocument $invoice): FinanceDocument
    {
        return $this->recalculateDocument($invoice);
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

    private function createOrUpdateReceiptForPayment(FinanceDocument $invoice, Payment $payment, array $receiptItems): FinanceDocument
    {
        $receipt = $payment->receipt_document_id
            ? FinanceDocument::find($payment->receipt_document_id)
            : null;

        $amount = (float) $payment->amount;
        $paymentDate = $payment->paid_at ?: now();

        if (! $receipt) {
            $receipt = new FinanceDocument();
            $receipt->type = 'receipt';
            $receipt->number = $this->sequences->allocate('receipt', (int) $invoice->company_id, $paymentDate);
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

        $this->syncReceiptItems($receipt, $receiptItems);

        return $receipt->fresh();
    }

    private function createReceiptForAdvance(Dossier $dossier, array $scope, Payment $payment, array $receiptItems): FinanceDocument
    {
        $receipt = new FinanceDocument();
        $receipt->forceFill([
            'company_id' => $scope['company_id'],
            'branch_id' => $scope['branch_id'] ?? null,
            'type' => 'receipt',
            'number' => $this->sequences->allocate('receipt', (int) $scope['company_id'], $payment->paid_at ?: now()),
            'status' => 'issued',
            'client_id' => $payment->client_id,
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

        $this->syncReceiptItems($receipt, $receiptItems);

        return $receipt->fresh();
    }

    private function createReceiptForNegotiatedPayment(
        Dossier $dossier,
        array $scope,
        DossierNegotiatedPaymentLine $line,
        Payment $payment,
        array $receiptItems,
    ): FinanceDocument {
        $receipt = new FinanceDocument();
        $receipt->forceFill([
            'company_id' => $scope['company_id'],
            'branch_id' => $scope['branch_id'] ?? null,
            'type' => 'receipt',
            'number' => $this->sequences->allocate('receipt', (int) $scope['company_id'], $payment->paid_at ?: now()),
            'status' => 'issued',
            'client_id' => $payment->client_id,
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
                'Recu d avance negociee pour ' . $line->designation . '.',
                'Montant negocie: ' . number_format((float) $line->negotiated_amount, 2, '.', ' ') . ' ' . FinanceSettingsService::getCurrency() . '.',
                'Avance recue: ' . number_format((float) $payment->amount, 2, '.', ' ') . ' ' . FinanceSettingsService::getCurrency() . '.',
                $payment->notes,
            ])),
            'terms' => $this->receiptTerms($payment),
            'created_by' => $payment->created_by,
        ])->save();

        $this->syncReceiptItems($receipt, $receiptItems);

        return $receipt->fresh();
    }

    /** @param array<int, array{title: string, description: ?string, quantity: float, unit: ?string, unit_price: float}> $receiptItems */
    private function syncReceiptItems(FinanceDocument $receipt, array $receiptItems): void
    {
        $receipt->items()->delete();

        foreach ($receiptItems as $position => $receiptItem) {
            $item = new FinanceDocumentItem([
                'position' => $position + 1,
                'title' => $receiptItem['title'],
                'description' => $receiptItem['description'],
                'quantity' => $receiptItem['quantity'],
                'unit' => $receiptItem['unit'],
                'unit_price' => $receiptItem['unit_price'],
            ]);
            $item->calculateTotals();
            $receipt->items()->save($item);
        }
    }

    /**
     * @param array<int, array<string, mixed>>|null $input
     * @param \Illuminate\Support\Collection<int, FinanceDocumentItem>|null $existingItems
     * @return array<int, array{title: string, description: ?string, quantity: float, unit: ?string, unit_price: float}>
     */
    private function receiptItems(?array $input, float $amount, string $fallbackTitle, $existingItems = null): array
    {
        if ($input === null && $existingItems?->isNotEmpty()) {
            $input = $existingItems->map(fn (FinanceDocumentItem $item) => [
                'title' => $item->title,
                'description' => $item->description,
                'quantity' => $item->quantity,
                'unit' => $item->unit,
                'unit_price' => $item->unit_price,
            ])->all();
        }

        if (empty($input)) {
            return [[
                'title' => $fallbackTitle,
                'description' => null,
                'quantity' => 1.0,
                'unit' => 'payment',
                'unit_price' => $amount,
            ]];
        }

        $items = array_map(function (array $item): array {
            $quantity = round((float) ($item['quantity'] ?? 0), 3);
            $unitPrice = $this->normalizeAmount($item['unit_price'] ?? 0);

            return [
                'title' => trim((string) ($item['title'] ?? '')),
                'description' => filled($item['description'] ?? null) ? trim((string) $item['description']) : null,
                'quantity' => $quantity,
                'unit' => filled($item['unit'] ?? null) ? trim((string) $item['unit']) : null,
                'unit_price' => $unitPrice,
            ];
        }, $input);

        foreach ($items as $item) {
            if ($item['title'] === '' || $item['quantity'] <= 0 || $item['unit_price'] < 0) {
                throw ValidationException::withMessages([
                    'receipt_items' => 'Chaque ligne du recu doit comporter un titre, une quantite positive et un prix valide.',
                ]);
            }
        }

        $linesTotal = $this->normalizeAmount(array_sum(array_map(
            fn (array $item): float => $item['quantity'] * $item['unit_price'],
            $items,
        )));

        if (abs($linesTotal - $amount) > 0.01) {
            throw ValidationException::withMessages([
                'receipt_items' => 'Le total des lignes du reçu doit être égal au montant du paiement.',
            ]);
        }

        return $items;
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

    private function normalizeAmount(mixed $amount): float
    {
        return round((float) $amount, 2);
    }

    private function assertDossierClient(Dossier $dossier, array $scope, ?int $requestedClientId): void
    {
        if ((int) $dossier->company_id !== (int) $scope['company_id']
            || $dossier->branch_id !== ($scope['branch_id'] ?? null)) {
            abort(404);
        }

        if ($requestedClientId && ! $dossier->hasClientMembership($requestedClientId)) {
            throw ValidationException::withMessages([
                'client_id' => 'Le client selectionne ne correspond pas au projet.',
            ]);
        }
    }

    private function resolveNegotiatedLine(Dossier $dossier, array $scope, array $data): DossierNegotiatedPaymentLine
    {
        if (! empty($data['dossier_negotiated_payment_line_id'])) {
            return DossierNegotiatedPaymentLine::query()
                ->whereKey($data['dossier_negotiated_payment_line_id'])
                ->where('company_id', $scope['company_id'])
                ->when($scope['branch_id'] ?? null, fn ($query, $branchId) => $query->where('branch_id', $branchId), fn ($query) => $query->whereNull('branch_id'))
                ->where('dossier_id', $dossier->id)
                ->lockForUpdate()
                ->firstOrFail();
        }

        $line = $data['negotiated_line'] ?? [];
        $designation = trim((string) ($line['designation'] ?? ''));
        $negotiatedAmount = $this->normalizeAmount($line['negotiated_amount'] ?? 0);

        if ($designation === '' || $negotiatedAmount <= 0) {
            throw ValidationException::withMessages([
                'negotiated_line' => 'Renseignez l objet et le montant negocie de la nouvelle ligne.',
            ]);
        }

        $position = (int) DossierNegotiatedPaymentLine::query()
            ->where('company_id', $scope['company_id'])
            ->when($scope['branch_id'] ?? null, fn ($query, $branchId) => $query->where('branch_id', $branchId), fn ($query) => $query->whereNull('branch_id'))
            ->where('dossier_id', $dossier->id)
            ->lockForUpdate()
            ->max('position') + 1;

        return DossierNegotiatedPaymentLine::create([
            'company_id' => $scope['company_id'],
            'branch_id' => $scope['branch_id'] ?? null,
            'client_id' => isset($data['client_id']) ? (int) $data['client_id'] : $dossier->client_id,
            'dossier_id' => $dossier->id,
            'designation' => $designation,
            'negotiated_amount' => $negotiatedAmount,
            'position' => $position,
            'notes' => filled($line['notes'] ?? null) ? trim((string) $line['notes']) : null,
            'created_by' => $data['created_by'] ?? null,
        ]);
    }
}
