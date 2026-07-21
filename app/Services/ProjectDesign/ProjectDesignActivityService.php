<?php

namespace App\Services\ProjectDesign;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Request;

class ProjectDesignActivityService
{
    public function record(int $dossierId, string $action, array $metadata = []): AuditLog
    {
        return AuditLog::create([
            'user_id' => Request::user()?->id,
            'action' => $action,
            'auditable_type' => 'project_design',
            'auditable_id' => $dossierId,
            'metadata' => $metadata,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
        ]);
    }

    public function countForProject($dossier): int
    {
        return AuditLog::query()
            ->where('auditable_type', 'project_design')
            ->where('auditable_id', $dossier->id)
            ->count();
    }

    public function getForProject($dossier, int $perPage = 20)
    {
        return AuditLog::query()
            ->where('auditable_type', 'project_design')
            ->where('auditable_id', $dossier->id)
            ->with('user')
            ->latest()
            ->cursorPaginate($perPage);
    }
}
