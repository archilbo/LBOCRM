<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class TaskSuggestion extends Model
{
    protected $fillable = [
        'type', 'description', 'context',
        'dossier_id', 'client_id',
        'related_entity_id', 'related_entity_type',
        'is_dismissed', 'dismissed_at', 'created_task_id',
    ];

    protected $casts = ['context' => 'json', 'is_dismissed' => 'boolean', 'dismissed_at' => 'datetime'];

    public function dossier(): BelongsTo { return $this->belongsTo(Dossier::class); }
    public function client(): BelongsTo { return $this->belongsTo(Client::class); }
    public function relatedEntity(): MorphTo { return $this->morphTo(); }
    public function createdTask(): BelongsTo { return $this->belongsTo(Task::class, 'created_task_id'); }
}
