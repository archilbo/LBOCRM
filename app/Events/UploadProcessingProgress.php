<?php

namespace App\Events;

use App\Models\ProjectDesign\ProjectDesignUploadSession;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;

class UploadProcessingProgress implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets;

    public function __construct(
        public ProjectDesignUploadSession $session,
        public string $stage,
        public int $progress,
        public ?string $message = null,
        public ?string $assetId = null,
        public ?string $versionId = null,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new Channel("dossier.{$this->session->dossier_id}"),
            new Channel("user.{$this->session->user_id}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'upload.processing-progress';
    }

    public function broadcastWith(): array
    {
        return [
            'eventId' => (string) \Illuminate\Support\Str::uuid(),
            'uploadSessionId' => $this->session->id,
            'projectId' => $this->session->dossier_id,
            'stage' => $this->stage,
            'progress' => $this->progress,
            'message' => $this->message,
            'assetId' => $this->assetId,
            'versionId' => $this->versionId,
            'occurredAt' => now()->toIso8601String(),
        ];
    }
}
