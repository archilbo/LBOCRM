<?php

namespace App\Notifications;

use App\Models\DossierDocument;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class DocumentNotification extends Notification
{
    use Queueable;

    public function __construct(public DossierDocument $document, public string $action, public string $description) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'document_id' => $this->document->id,
            'document_number' => $this->document->document_number,
            'dossier_id' => $this->document->dossier_id,
            'original_filename' => $this->document->original_filename,
            'action' => $this->action,
            'description' => $this->description,
        ];
    }
}
