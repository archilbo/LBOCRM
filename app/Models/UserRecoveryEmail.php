<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserRecoveryEmail extends Model
{
    protected $fillable = ['email', 'verification_token', 'verification_expires_at', 'verified_at'];

    protected function casts(): array
    {
        return ['verification_expires_at' => 'datetime', 'verified_at' => 'datetime'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
