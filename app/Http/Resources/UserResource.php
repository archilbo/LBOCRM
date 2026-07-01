<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'roles' => $this->getRoleNames()->values(),
            'permissions' => $this->getAllPermissions()->pluck('name')->values(),
            'lastSeenAt' => optional($this->last_seen_at)->toISOString(),
            'isOnline' => $this->last_seen_at ? $this->last_seen_at->gt(now()->subMinutes(5)) : false,
            'createdAt' => optional($this->created_at)->format('Y-m-d'),
            'updatedAt' => optional($this->updated_at)->diffForHumans(),
        ];
    }
}
