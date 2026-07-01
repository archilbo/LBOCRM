<?php

namespace App\Notifications;

use App\Models\Contract;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ContractNotification extends Notification
{
    use Queueable;

    public function __construct(public Contract $contract, public string $action, public string $description) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'contract_id' => $this->contract->id,
            'contract_number' => $this->contract->contract_number,
            'dossier_id' => $this->contract->dossier_id,
            'action' => $this->action,
            'description' => $this->description,
        ];
    }
}
