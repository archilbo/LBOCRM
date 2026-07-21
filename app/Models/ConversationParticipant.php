<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConversationParticipant extends Model
{
    protected $fillable = [
        'conversation_id', 'user_id', 'role', 'last_read_at', 'last_read_message_id',
        'typing_at', 'archived_at', 'pinned_at', 'muted_at', 'draft',
    ];

    protected $casts = [
        'joined_at' => 'datetime', 'last_read_at' => 'datetime', 'typing_at' => 'datetime',
        'archived_at' => 'datetime', 'pinned_at' => 'datetime', 'muted_at' => 'datetime',
    ];

    public function conversation(): BelongsTo { return $this->belongsTo(Conversation::class); }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
}
