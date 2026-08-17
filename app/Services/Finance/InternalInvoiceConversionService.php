<?php

namespace App\Services\Finance;

use App\Enums\PaymentKind;
use App\Models\FinanceDocument;
use App\Models\Payment;
use App\Models\PaymentDocumentTransfer;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class InternalInvoiceConversionService
{
    public function __construct(
        private readonly DossierFinanceEligibilityService $eligibility,
        private readonly FinanceDocumentSequenceService $sequences,
        private readonly PaymentLedgerService $ledger,
    ) {
    }

    public function convert(FinanceDocument $internalInvoice, User $user, array $data): FinanceDocument
    {
        return DB::transaction(function () use ($internalInvoice, $user, $data): FinanceDocument {
            $internalInvoice = FinanceDocument::query()
                ->with('items')
                ->lockForUpdate()
                ->findOrFail($internalInvoice->id);

            if (! $internalInvoice->isInternalInvoice() || ! $internalInvoice->canConvertToInvoice()) {
                throw ValidationException::withMessages([
                    'finance_document' => 'Cette facture interne ne peut pas etre convertie.',
                ]);
            }

            $scope = ['company_id' => $user->company_id, 'branch_id' => $user->branch_id];
            if ((int) $internalInvoice->company_id !== (int) $scope['company_id']
                || $internalInvoice->branch_id !== $scope['branch_id']) {
                abort(403);
            }

            $this->eligibility->assertCanCreateDocument(
                $scope,
                'invoice',
                $internalInvoice->dossier_id,
                null,
                $internalInvoice->client_id,
            );

            $issueDate = $data['issue_date'] ?? now();
            $invoice = FinanceDocument::create([
                ...$scope,
                'type' => 'invoice',
                'number' => $this->sequences->allocate('invoice', (int) $scope['company_id'], $issueDate),
                'status' => 'issued',
                'client_id' => $internalInvoice->client_id,
                'dossier_id' => $internalInvoice->dossier_id,
                'active_invoice_dossier_key' => $this->eligibility->invoiceGuardKey($scope, 'invoice', $internalInvoice->dossier_id, 'issued'),
                'source_document_id' => $internalInvoice->id,
                'issue_date' => $issueDate,
                'due_date' => $data['due_date'] ?? now()->addDays(FinanceSettingsService::getDefaultPaymentDays()),
                'valid_until' => $internalInvoice->valid_until,
                'currency' => $internalInvoice->currency,
                'tva_rate' => $internalInvoice->tva_rate,
                'subtotal_ht' => $internalInvoice->subtotal_ht,
                'discount_total' => $internalInvoice->discount_total,
                'tax_total' => $internalInvoice->tax_total,
                'total_ttc' => $internalInvoice->total_ttc,
                'paid_total' => 0,
                'remaining_total' => $internalInvoice->total_ttc,
                'notes' => $data['notes'] ?? $internalInvoice->notes,
                'terms' => $internalInvoice->terms,
                'template_id' => $internalInvoice->template_id,
                'created_by' => $user->id,
            ]);

            foreach ($internalInvoice->items as $item) {
                $newItem = $item->replicate();
                $newItem->finance_document_id = $invoice->id;
                $newItem->save();
            }

            $payments = Payment::query()
                ->where('finance_document_id', $internalInvoice->id)
                ->lockForUpdate()
                ->get();

            foreach ($payments as $payment) {
                PaymentDocumentTransfer::create([
                    'company_id' => $invoice->company_id,
                    'branch_id' => $invoice->branch_id,
                    'payment_id' => $payment->id,
                    'from_finance_document_id' => $internalInvoice->id,
                    'to_finance_document_id' => $invoice->id,
                    'amount' => $payment->amount,
                    'reason' => 'internal_invoice_conversion',
                    'created_by' => $user->id,
                ]);

                $payment->forceFill([
                    'finance_document_id' => $invoice->id,
                    'payment_kind' => PaymentKind::Invoice,
                    'client_id' => $invoice->client_id,
                    'dossier_id' => $invoice->dossier_id,
                ])->save();
            }

            $internalInvoice->forceFill([
                'status' => 'converted',
                'converted_to_document_id' => $invoice->id,
            ])->save();

            return $this->ledger->recalculateDocument($invoice->fresh());
        });
    }
}
