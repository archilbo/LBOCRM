<?php

namespace App\Actions\Clients;

use App\Enums\ClientStatus;
use App\Models\AuditLog;
use App\Models\Client;
use App\Models\User;

class UpdateClientStatusAction
{
    public function execute(
        Client $client,
        ClientStatus $status,
        ?User $actor,
        ?string $ipAddress = null,
        ?string $userAgent = null,
    ): Client {
        $previousStatus = $client->status;

        if ($previousStatus === $status->value) {
            return $client;
        }

        $client->update(['status' => $status->value]);

        AuditLog::create([
            'user_id' => $actor?->id,
            'action' => 'client.status_updated',
            'description' => "Updated client {$client->full_name} status to {$status->value}",
            'metadata' => [
                'old_status' => $previousStatus,
                'new_status' => $status->value,
            ],
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
            'auditable_type' => Client::class,
            'auditable_id' => $client->id,
            'created_at' => now(),
        ]);

        return $client->refresh();
    }
}
