<?php

namespace App\Services\Finance;

use App\Models\FinanceDocument;
use App\Models\FinancePaymentReminder;
use App\Models\User;
use App\Notifications\FinancePaymentReminderNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class FinancePaymentReminderService
{
    public function __construct(
        private readonly FinanceReceivablesService $receivables,
        private readonly FinanceActivityService $activity,
    ) {
    }

    public function create(FinanceDocument $invoice, User $user, array $data): FinancePaymentReminder
    {
        $summary = $this->receivables->forInvoice($invoice);
        if (! $invoice->isInvoice() || $summary['outstanding'] <= 0) {
            throw ValidationException::withMessages([
                'finance_document_id' => 'Un rappel ne peut être créé que pour une facture restant à encaisser.',
            ]);
        }

        return DB::transaction(function () use ($invoice, $user, $data): FinancePaymentReminder {
            $reminder = FinancePaymentReminder::create([
                'company_id' => $invoice->company_id,
                'branch_id' => $invoice->branch_id,
                'finance_document_id' => $invoice->id,
                'client_id' => $invoice->client_id,
                'dossier_id' => $invoice->dossier_id,
                'type' => $data['type'] ?? 'custom',
                'remind_at' => $data['remind_at'],
                'status' => 'pending',
                'note' => $data['note'] ?? null,
                'created_by' => $user->id,
            ]);

            $this->activity->log($reminder, $user, 'finance.reminder.created', [], [
                'finance_document_id' => $invoice->id,
                'remind_at' => $reminder->remind_at?->toISOString(),
                'type' => $reminder->type,
            ]);

            return $reminder;
        });
    }

    public function snooze(FinancePaymentReminder $reminder, User $user, array $data): FinancePaymentReminder
    {
        $old = $reminder->only(['status', 'remind_at', 'snoozed_until', 'note']);
        $reminder->update([
            'status' => 'snoozed',
            'remind_at' => $data['remind_at'],
            'snoozed_until' => $data['remind_at'],
            'note' => $data['note'] ?? $reminder->note,
        ]);

        $this->activity->log($reminder, $user, 'finance.reminder.snoozed', $old, $reminder->only(array_keys($old)));

        return $reminder->fresh();
    }

    public function completeForInvoice(FinanceDocument $invoice): int
    {
        if ($this->receivables->forInvoice($invoice)['outstanding'] > 0) {
            return 0;
        }

        return FinancePaymentReminder::query()
            ->where('finance_document_id', $invoice->id)
            ->whereIn('status', ['pending', 'snoozed'])
            ->update(['status' => 'completed', 'completed_at' => now(), 'updated_at' => now()]);
    }

    public function processDue(): int
    {
        $processed = 0;

        FinancePaymentReminder::query()
            ->with(['financeDocument.payments', 'creator'])
            ->whereIn('status', ['pending', 'snoozed'])
            ->where('remind_at', '<=', now())
            ->orderBy('id')
            ->chunkById(50, function ($reminders) use (&$processed): void {
                foreach ($reminders as $reminder) {
                    $invoice = $reminder->financeDocument;
                    if (! $invoice || $this->receivables->forInvoice($invoice)['outstanding'] <= 0) {
                        FinancePaymentReminder::query()
                            ->whereKey($reminder->id)
                            ->whereIn('status', ['pending', 'snoozed'])
                            ->update(['status' => 'completed', 'completed_at' => now(), 'updated_at' => now()]);
                        continue;
                    }

                    $claimed = FinancePaymentReminder::query()
                        ->whereKey($reminder->id)
                        ->whereIn('status', ['pending', 'snoozed'])
                        ->update(['status' => 'triggered', 'triggered_at' => now(), 'updated_at' => now()]);

                    if ($claimed !== 1) {
                        continue;
                    }

                    $reminder->refresh()->loadMissing('financeDocument');
                    if ($reminder->creator) {
                        $reminder->creator->notify(new FinancePaymentReminderNotification($reminder));
                    }
                    $processed++;
                }
            });

        return $processed;
    }
}
