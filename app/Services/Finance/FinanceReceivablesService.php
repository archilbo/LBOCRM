<?php

namespace App\Services\Finance;

use App\Models\FinanceDocument;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;

/**
 * The single source for derived receivable values.
 *
 * Invoice payment columns are maintained by PaymentLedgerService for fast
 * filtering, while this service always derives the value exposed to callers
 * from valid (non-soft-deleted) payments when they are available.
 */
class FinanceReceivablesService
{
    public const AGING_CURRENT = 'current';
    public const AGING_1_7 = '1_7';
    public const AGING_8_30 = '8_30';
    public const AGING_31_60 = '31_60';
    public const AGING_61_PLUS = '61_plus';

    /**
     * Adds an aggregate that can be reused by resources without one query per
     * invoice. The payments relation already excludes reversed soft-deleted
     * records through Eloquent's global scope.
     */
    public function withValidPaymentTotal(Builder $query): Builder
    {
        return $query->withSum('payments as valid_payments_total', 'amount');
    }

    /** @return array{total: float, paid: float, outstanding: float, dueState: string, daysOverdue: int, agingBucket: string, nextPaymentDue: ?string} */
    public function forInvoice(FinanceDocument $invoice, ?CarbonInterface $today = null): array
    {
        $today = CarbonImmutable::instance($today ?? now())->startOfDay();
        $total = $this->amount($invoice->total_ttc);
        $paid = min($total, $this->validPaymentsTotal($invoice));
        $outstanding = (float) max(0, round($total - $paid, 2));
        $dueDate = $invoice->due_date?->toDateString();

        $daysOverdue = 0;
        if ($outstanding > 0 && $dueDate !== null) {
            $due = CarbonImmutable::parse($dueDate)->startOfDay();
            if ($due->lt($today)) {
                $daysOverdue = (int) $due->diffInDays($today);
            }
        }

        return [
            'total' => $total,
            'paid' => $paid,
            'outstanding' => $outstanding,
            'dueState' => $this->dueState($outstanding, $dueDate, $today),
            'daysOverdue' => $daysOverdue,
            'agingBucket' => $this->agingBucket($daysOverdue),
            'nextPaymentDue' => $outstanding > 0 ? $dueDate : null,
        ];
    }

    public function validPaymentsTotal(FinanceDocument $invoice): float
    {
        $aggregate = $invoice->getAttribute('valid_payments_total');
        if ($aggregate !== null) {
            return $this->amount($aggregate);
        }

        if ($invoice->relationLoaded('payments')) {
            return $this->amount($invoice->payments->sum('amount'));
        }

        return $this->amount($invoice->payments()->sum('amount'));
    }

    public function dueState(float $outstanding, ?string $dueDate, CarbonInterface $today): string
    {
        if ($outstanding <= 0) {
            return 'paid';
        }

        if ($dueDate === null) {
            return 'upcoming';
        }

        $due = CarbonImmutable::parse($dueDate)->startOfDay();
        if ($due->isSameDay($today)) {
            return 'due_today';
        }

        return $due->lt($today) ? 'overdue' : 'upcoming';
    }

    public function agingBucket(int $daysOverdue): string
    {
        return match (true) {
            $daysOverdue >= 61 => self::AGING_61_PLUS,
            $daysOverdue >= 31 => self::AGING_31_60,
            $daysOverdue >= 8 => self::AGING_8_30,
            $daysOverdue >= 1 => self::AGING_1_7,
            default => self::AGING_CURRENT,
        };
    }

    private function amount(mixed $amount): float
    {
        return (float) round((float) $amount, 2);
    }
}
