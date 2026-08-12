<?php

namespace App\Services\Finance;

use App\Models\FinanceDocument;
use App\Models\Dossier;
use App\Models\Intermediary;
use App\Models\IntermediaryPaymentAllocation;
use App\Models\IntermediaryPaymentBatch;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class IntermediaryPaymentService
{
    public function __construct(
        private readonly FinanceContextService $context,
        private readonly PaymentLedgerService $ledger,
        private readonly FinanceActivityService $activity,
    ) {}

    public function record(Intermediary $intermediary, User $user, array $data): IntermediaryPaymentBatch
    {
        return DB::transaction(function () use ($intermediary, $user, $data) {
            abort_unless($this->context->apply(Intermediary::query(), $user)->whereKey($intermediary->id)->lockForUpdate()->exists(), 404);
            $invoices = $this->invoices($intermediary, $user, true);
            $available = round((float) $invoices->sum(fn (FinanceDocument $invoice) => (float) $invoice->remaining_total), 2);
            $amount = round((float) $data['amount'], 2);

            if ($amount > $available) {
                throw ValidationException::withMessages(['amount' => 'Le montant depasse le reste a payer des projets de cet intermediaire.']);
            }

            $batch = IntermediaryPaymentBatch::create([
                ...$this->context->payload($user), 'intermediary_id' => $intermediary->id, 'amount' => $amount,
                'paid_at' => $data['paid_at'], 'method' => $data['method'] ?? null, 'reference' => $data['reference'] ?? null,
                'notes' => $data['notes'] ?? null, 'created_by' => $user->id,
            ]);

            $unallocated = $amount;
            foreach ($invoices as $invoice) {
                if ($unallocated <= 0) break;
                $allocation = min($unallocated, round((float) $invoice->remaining_total, 2));
                if ($allocation <= 0) continue;
                $payment = $this->ledger->recordPayment($invoice, [
                    'amount' => $allocation, 'paid_at' => $data['paid_at'], 'method' => $data['method'] ?? null,
                    'reference' => $data['reference'] ?? null, 'notes' => $data['notes'] ?? null, 'created_by' => $user->id,
                ]);
                IntermediaryPaymentAllocation::create([
                    'intermediary_payment_batch_id' => $batch->id, 'dossier_id' => $invoice->dossier_id,
                    'finance_document_id' => $invoice->id, 'payment_id' => $payment->id, 'amount' => $allocation,
                ]);
                $unallocated = round($unallocated - $allocation, 2);
            }

            $this->activity->log($batch, $user, 'finance.intermediary_payment.recorded', [], [
                'intermediary_id' => $intermediary->id,
                'amount' => $batch->amount,
                'allocations_count' => $batch->allocations()->count(),
            ]);

            return $batch->fresh(['allocations']);
        });
    }

    public function cancel(IntermediaryPaymentBatch $batch, Intermediary $intermediary, User $user, ?string $reason): bool
    {
        return DB::transaction(function () use ($batch, $intermediary, $user, $reason) {
            $batch = $this->context->apply(IntermediaryPaymentBatch::query(), $user)
                ->where('intermediary_id', $intermediary->id)->with('allocations.payment')->lockForUpdate()->findOrFail($batch->id);
            if ($batch->cancelled_at) return false;
            $old = $batch->only(['cancelled_at', 'cancelled_by', 'cancellation_reason']);
            foreach ($batch->allocations as $allocation) {
                if ($allocation->payment) $this->ledger->deletePayment($allocation->payment, $user, $reason);
            }
            $batch->update(['cancelled_at' => now(), 'cancelled_by' => $user->id, 'cancellation_reason' => $reason]);
            $this->activity->log($batch, $user, 'finance.intermediary_payment.cancelled', $old, [
                ...$batch->only(['cancelled_at', 'cancelled_by', 'cancellation_reason']),
                'intermediary_id' => $intermediary->id,
                'amount' => $batch->amount,
            ]);

            return true;
        });
    }

    public function data(Intermediary $intermediary, User $user): array
    {
        $projects = $this->context->apply(Dossier::query(), $user)
            ->where('intermediary_id', $intermediary->id)
            ->with(['client:id,full_name'])
            ->latest()
            ->get();
        $invoices = $this->allInvoices($intermediary, $user)->groupBy('dossier_id');
        $batches = $this->context->apply(IntermediaryPaymentBatch::query(), $user)->where('intermediary_id', $intermediary->id)
            ->with(['allocations.dossier:id,dossier_number,project_object', 'allocations.document:id,number', 'allocations.payment.receiptDocument:id,number', 'creator:id,name'])->latest('paid_at')->latest('id')->get();
        return [
            'currency' => FinanceSettingsService::getCurrency(),
            'summary' => ['invoiced' => (float) $invoices->flatten()->sum('total_ttc'), 'paid' => (float) $invoices->flatten()->sum('paid_total'), 'remaining' => (float) $invoices->flatten()->sum('remaining_total'), 'projectsCount' => $projects->count()],
            'projects' => $projects->map(function (Dossier $project) use ($invoices): array {
                $projectInvoices = $invoices->get($project->id, collect());
                $total = (float) $projectInvoices->sum('total_ttc');
                $paid = (float) $projectInvoices->sum('paid_total');
                $remaining = (float) $projectInvoices->sum('remaining_total');
                return ['id' => $project->id, 'number' => $project->dossier_number, 'name' => $project->project_object, 'clientName' => $project->client?->full_name, 'invoicesCount' => $projectInvoices->count(), 'total' => $total, 'paid' => $paid, 'remaining' => $remaining, 'status' => $projectInvoices->isEmpty() ? 'no_invoice' : ($remaining <= 0 ? 'paid' : ($paid > 0 ? 'partial' : 'unpaid'))];
            })->values(),
            'batches' => $batches->map(fn (IntermediaryPaymentBatch $b) => ['id' => $b->id, 'amount' => (float) $b->amount, 'paidAt' => $b->paid_at?->format('Y-m-d'), 'method' => $b->method, 'reference' => $b->reference, 'cancelledAt' => $b->cancelled_at?->toIso8601String(), 'canCancel' => ! $b->cancelled_at, 'allocations' => $b->allocations->map(fn ($a) => ['id' => $a->id, 'amount' => (float) $a->amount, 'invoiceNumber' => $a->document?->number, 'projectName' => $a->dossier?->project_object ?: $a->dossier?->dossier_number, 'receiptUrl' => $a->payment?->receiptDocument ? route('finance.documents.view', $a->payment->receiptDocument) : null])->values()])->values(),
        ];
    }

    private function invoices(Intermediary $intermediary, User $user, bool $lock = false)
    {
        $query = $this->context->apply(FinanceDocument::query(), $user)->where('type', 'invoice')->whereNotIn('status', ['cancelled'])
            ->where('remaining_total', '>', 0)->whereHas('dossier', fn ($q) => $q->where('intermediary_id', $intermediary->id))
            ->with('dossier:id,dossier_number,project_object')->orderByRaw('COALESCE(issue_date, created_at)')->orderBy('id');
        if ($lock) $query->lockForUpdate();
        return $query->get();
    }

    private function allInvoices(Intermediary $intermediary, User $user)
    {
        return $this->context->apply(FinanceDocument::query(), $user)
            ->where('type', 'invoice')->whereNotIn('status', ['cancelled'])
            ->whereHas('dossier', fn ($query) => $query->where('intermediary_id', $intermediary->id))
            ->orderByRaw('COALESCE(issue_date, created_at)')->orderBy('id')->get();
    }
}
