<?php

namespace App\Notifications;

use App\Models\Intermediary;
use App\Models\IntermediaryPaymentBatch;
use App\Services\Finance\FinanceSettingsService;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class IntermediaryPaymentNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Intermediary $intermediary,
        public IntermediaryPaymentBatch $batch,
        public string $action,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'intermediary_id' => $this->intermediary->id,
            'intermediary_name' => $this->intermediary->name,
            'batch_id' => $this->batch->id,
            'amount' => (float) $this->batch->amount,
            'currency' => FinanceSettingsService::getCurrency(),
            'action' => $this->action,
            'description' => $this->action === 'intermediary_payment_cancelled'
                ? 'Paiement intermédiaire annulé pour '.$this->intermediary->name
                : 'Paiement intermédiaire enregistré pour '.$this->intermediary->name,
        ];
    }
}
