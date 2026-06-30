<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TaskActivityLog extends Model
{
    protected $fillable = ['task_id', 'user_id', 'action', 'description', 'old_values', 'new_values'];

    protected $casts = ['old_values' => 'json', 'new_values' => 'json'];

    public function task(): BelongsTo { return $this->belongsTo(Task::class); }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
}
