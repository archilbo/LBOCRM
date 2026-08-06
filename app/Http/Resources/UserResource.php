<?php

namespace App\Http\Resources;

use App\Services\PermissionRegistry;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $customConfiguration = is_array($this->module_permissions) && ($this->module_permissions['is_custom'] ?? false)
            ? $this->module_permissions
            : null;
        $accountStatus = $this->suspended_at
            ? 'blocked'
            : ($this->invitation_token && ! $this->accepted_at ? 'pending' : 'accepted');

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'roles' => $this->getRoleNames()->values(),
            'displayRole' => $customConfiguration['base_role'] ?? $this->getRoleNames()->first(),
            'permissionConfiguration' => $customConfiguration,
            'permissions' => app(PermissionRegistry::class)->effectiveNames($this->resource),
            'lastSeenAt' => optional($this->last_seen_at)->toISOString(),
            'isOnline' => is_null($this->suspended_at) && $this->last_seen_at ? $this->last_seen_at->gt(now()->subMinutes(5)) : false,
            'createdAt' => optional($this->created_at)->format('Y-m-d'),
            'updatedAt' => optional($this->updated_at)->diffForHumans(),
            'isSuspended' => !is_null($this->suspended_at),
            'accountStatus' => $accountStatus,
            'invitationExpiresAt' => optional($this->invitation_expires_at)->toISOString(),
        ];
    }
}
