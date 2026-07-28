<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TaskChecklistItem extends Model
{
    protected $fillable = ['task_id', 'label', 'is_done', 'position', 'completed_by', 'completed_at'];

    protected $casts = ['is_done' => 'boolean', 'completed_at' => 'datetime'];

    public function task(): BelongsTo { return $this->belongsTo(Task::class); }
    public function completedBy(): BelongsTo { return $this->belongsTo(User::class, 'completed_by'); }
}
