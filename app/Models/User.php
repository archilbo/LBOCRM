<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

#[Fillable(['name', 'email', 'password', 'invitation_token', 'invited_at', 'accepted_at', 'invited_by'])]
#[Hidden(['password', 'remember_token', 'invitation_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasRoles, Notifiable;

    public function invitedBy(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(__CLASS__, 'invited_by');
    }

    public function tasksAssigned(): BelongsToMany
    {
        return $this->belongsToMany(Task::class, 'task_assignees');
    }

    public function tasksWatching(): BelongsToMany
    {
        return $this->belongsToMany(Task::class, 'task_watchers');
    }

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'invited_at' => 'datetime',
            'accepted_at' => 'datetime',
        ];
    }
}
