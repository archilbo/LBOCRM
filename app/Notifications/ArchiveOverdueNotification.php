<?php

namespace App\Notifications;

use App\Models\ArchiveRecord;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ArchiveOverdueNotification extends Notification
{
    use Queueable;

    public function __construct(public ArchiveRecord $archiveRecord, public string $action, public string $description) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'archive_record_id' => $this->archiveRecord->id,
            'archive_number' => $this->archiveRecord->archive_number,
            'dossier_id' => $this->archiveRecord->dossier_id,
            'action' => $this->action,
            'description' => $this->description,
        ];
    }
}
