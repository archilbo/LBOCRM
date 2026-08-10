<?php

namespace App\Notifications;

use App\Models\FinancePaymentReminder;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class FinancePaymentReminderNotification extends Notification
{
    use Queueable;

    public function __construct(public readonly FinancePaymentReminder $reminder)
    {
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $invoice = $this->reminder->financeDocument;

        return [
            'finance_document_id' => $invoice?->id,
            'finance_reminder_id' => $this->reminder->id,
            'finance_number' => $invoice?->number,
            'dossier_id' => $this->reminder->dossier_id,
            'action' => 'payment_reminder_due',
            'description' => sprintf(
                'Paiement à relancer : %s à encaisser pour %s.',
                number_format((float) ($invoice?->remaining_total ?? 0), 2, '.', ' '),
                $invoice?->number ?? 'la facture'
            ),
        ];
    }
}
