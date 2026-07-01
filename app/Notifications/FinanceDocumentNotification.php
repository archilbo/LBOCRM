<?php

namespace App\Notifications;

use App\Models\FinanceDocument;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class FinanceDocumentNotification extends Notification
{
    use Queueable;

    public function __construct(public FinanceDocument $document, public string $action, public string $description) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'finance_document_id' => $this->document->id,
            'finance_number' => $this->document->number,
            'type' => $this->document->type,
            'dossier_id' => $this->document->dossier_id,
            'action' => $this->action,
            'description' => $this->description,
        ];
    }
}
