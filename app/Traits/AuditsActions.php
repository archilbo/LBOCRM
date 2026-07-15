<?php

namespace App\Traits;

use App\Models\AuditLog;
use Illuminate\Http\Request;

trait AuditsActions
{
    protected function audit(Request $request, string $action, string $description, ?array $metadata = null): void
    {
        AuditLog::create([
            'user_id' => $request->user()?->id,
            'action' => $action,
            'description' => $description,
            'metadata' => $metadata,
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);
    }
}
