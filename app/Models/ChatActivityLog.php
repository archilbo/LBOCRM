<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatActivityLog extends Model
{
    protected $fillable = [
        'company_id', 'branch_id', 'conversation_id', 'message_id', 'user_id',
        'action', 'old_values', 'new_values', 'ip_address', 'user_agent',
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
    ];
}
