<?php

namespace App\Notifications;

use App\Models\CalendarEvent;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class CalendarEventNotification extends Notification
{
    use Queueable;

    public function __construct(
        protected CalendarEvent $event,
        protected string $action,
        protected string $description,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'calendar_event_id' => $this->event->id,
            'event_number' => $this->event->event_number,
            'title' => $this->event->title,
            'action' => $this->action,
            'description' => $this->description,
            'type' => $this->event->type,
            'starts_at' => $this->event->starts_at?->format('Y-m-d H:i:s'),
        ];
    }
}
