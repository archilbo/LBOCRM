<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class SuggestionNotification extends Notification
{
    use Queueable;

    public function __construct(public string $description) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'suggestion' => true,
            'description' => $this->description,
        ];
    }
}
