<?php

namespace App\Services\Finance;

use App\Models\FinanceDocument;
use App\Models\FinancePaymentPromise;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class FinancePaymentPromiseService
{
    public function __construct(
        private readonly FinanceReceivablesService $receivables,
        private readonly FinanceActivityService $activity,
    ) {
    }

    public function create(FinanceDocument $invoice, User $user, array $data): FinancePaymentPromise
    {
        $summary = $this->receivables->forInvoice($invoice);
        $amount = round((float) $data['amount'], 2);
        if (! $invoice->isInvoice() || $summary['outstanding'] <= 0 || $amount > $summary['outstanding']) {
            throw ValidationException::withMessages(['amount' => 'La promesse doit concerner un montant restant à encaisser.']);
        }

        return DB::transaction(function () use ($invoice, $user, $data, $summary, $amount): FinancePaymentPromise {
            $promise = FinancePaymentPromise::create([
                'company_id' => $invoice->company_id,
                'branch_id' => $invoice->branch_id,
                'finance_document_id' => $invoice->id,
                'client_id' => $invoice->client_id,
                'dossier_id' => $invoice->dossier_id,
                'amount' => $amount,
                'baseline_paid_total' => $summary['paid'],
                'promised_for' => $data['promised_for'],
                'note' => $data['note'] ?? null,
                'created_by' => $user->id,
            ]);

            $this->activity->log($promise, $user, 'finance.promise.created', [], [
                'finance_document_id' => $invoice->id,
                'amount' => $amount,
                'promised_for' => $promise->promised_for->toDateString(),
            ]);

            return $promise;
        });
    }

    public function reconcileForInvoice(FinanceDocument $invoice): int
    {
        $summary = $this->receivables->forInvoice($invoice);
        $now = now();

        return FinancePaymentPromise::query()
            ->where('finance_document_id', $invoice->id)
            ->whereIn('status', ['active', 'fulfilled', 'broken'])
            ->get()
            ->sum(function (FinancePaymentPromise $promise) use ($summary, $now): int {
                $paidSincePromise = max(0, $summary['paid'] - (float) $promise->baseline_paid_total);
                if ($paidSincePromise >= (float) $promise->amount || $summary['outstanding'] <= 0) {
                    if ($promise->status !== 'fulfilled') {
                        $promise->update(['status' => 'fulfilled', 'fulfilled_at' => $now, 'broken_at' => null]);
                        return 1;
                    }
                    return 0;
                }

                if ($promise->promised_for->lt($now->startOfDay())) {
                    if ($promise->status !== 'broken') {
                        $promise->update(['status' => 'broken', 'broken_at' => $now, 'fulfilled_at' => null]);
                        return 1;
                    }
                    return 0;
                }

                if ($promise->status !== 'active') {
                    $promise->update(['status' => 'active', 'fulfilled_at' => null, 'broken_at' => null]);
                    return 1;
                }

                return 0;
            });
    }

    public function reconcileDue(): int
    {
        $updated = 0;
        FinancePaymentPromise::query()
            ->with('financeDocument.payments')
            ->whereIn('status', ['active', 'fulfilled', 'broken'])
            ->whereDate('promised_for', '<=', today())
            ->chunkById(50, function ($promises) use (&$updated): void {
                foreach ($promises as $promise) {
                    if ($promise->financeDocument) {
                        $updated += $this->reconcileForInvoice($promise->financeDocument);
                    }
                }
            });

        return $updated;
    }
}
