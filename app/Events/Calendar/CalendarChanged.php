<?php

namespace App\Events\Calendar;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;

class CalendarChanged implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets;

    public function __construct(
        public readonly int $recipientId,
        public readonly string $eventKey,
        public readonly string $action,
    ) {}

    public function broadcastOn(): array
    {
        return [new PrivateChannel("user.{$this->recipientId}.calendar")];
    }

    public function broadcastAs(): string
    {
        return 'calendar.changed';
    }

    /** @return array{eventKey: string, action: string} */
    public function broadcastWith(): array
    {
        return [
            'eventKey' => $this->eventKey,
            'action' => $this->action,
        ];
    }
}
