<?php

namespace App\Services\Finance;

use App\Models\FinanceDocument;
use App\Models\FinancePaymentScheduleItem;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class FinancePaymentScheduleService
{
    public function __construct(
        private readonly FinanceReceivablesService $receivables,
        private readonly FinanceActivityService $activity,
    ) {
    }

    /** @return Collection<int, array<string, mixed>> */
    public function itemsForInvoice(FinanceDocument $invoice): Collection
    {
        $remainingPayment = $this->receivables->forInvoice($invoice)['paid'];
        $today = CarbonImmutable::today();

        $items = $invoice->relationLoaded('paymentScheduleItems')
            ? $invoice->paymentScheduleItems->sortBy('position')
            : $invoice->paymentScheduleItems()->orderBy('position')->get();

        return $items
            ->map(function (FinancePaymentScheduleItem $item) use (&$remainingPayment, $today): array {
                $amount = round((float) $item->amount, 2);
                $paid = min($amount, $remainingPayment);
                $remainingPayment = max(0, $remainingPayment - $paid);
                $outstanding = round($amount - $paid, 2);
                $daysOverdue = $outstanding > 0 && $item->due_date->lt($today) ? (int) $item->due_date->diffInDays($today) : 0;

                return [
                    'id' => $item->id,
                    'label' => $item->label,
                    'amount' => $amount,
                    'paid' => $paid,
                    'outstanding' => $outstanding,
                    'dueDate' => $item->due_date->toDateString(),
                    'position' => $item->position,
                    'status' => $outstanding <= 0 ? 'paid' : ($daysOverdue > 0 ? 'overdue' : 'upcoming'),
                    'daysOverdue' => $daysOverdue,
                ];
            });
    }

    /** @param array<int, array{label: string, amount: numeric, due_date: string}> $items */
    public function replace(FinanceDocument $invoice, User $user, array $items): Collection
    {
        if (! $invoice->isInvoice()) {
            throw ValidationException::withMessages(['items' => 'Un échéancier doit être rattaché à une facture.']);
        }

        $scheduledTotal = round((float) collect($items)->sum(fn (array $item) => (float) $item['amount']), 2);
        if ($scheduledTotal > round((float) $invoice->total_ttc, 2)) {
            throw ValidationException::withMessages(['items' => 'Le total de l’échéancier ne peut pas dépasser le total TTC de la facture.']);
        }

        return DB::transaction(function () use ($invoice, $user, $items, $scheduledTotal): Collection {
            $old = $invoice->paymentScheduleItems()->get(['label', 'amount', 'due_date', 'position'])->map->toArray()->all();
            $invoice->paymentScheduleItems()->delete();

            foreach (array_values($items) as $index => $item) {
                $invoice->paymentScheduleItems()->create([
                    'company_id' => $invoice->company_id,
                    'branch_id' => $invoice->branch_id,
                    'label' => $item['label'],
                    'amount' => round((float) $item['amount'], 2),
                    'due_date' => $item['due_date'],
                    'position' => $index + 1,
                    'created_by' => $user->id,
                ]);
            }

            $this->activity->log($invoice, $user, 'finance.schedule.updated', ['items' => $old], ['items_count' => count($items), 'scheduled_total' => $scheduledTotal]);

            return $this->itemsForInvoice($invoice);
        });
    }
}
