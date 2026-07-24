<?php

namespace App\Events\ProjectDesign;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ProjectDesignChanged implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly string $eventId,
        public readonly int $dossierId,
        public readonly string $action,
        public readonly string $entityType,
        public readonly int $entityId,
        public readonly ?int $fileId,
        public readonly ?int $versionId,
        public readonly ?int $annotationId,
        public readonly ?array $payload,
        public readonly ?array $actor,
        public readonly string $occurredAt,
    ) {
    }

    public function broadcastOn(): array
    {
        return [new PrivateChannel("project-design.dossier.{$this->dossierId}")];
    }
}
