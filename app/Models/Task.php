<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Task extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'task_number', 'title', 'description', 'type', 'status', 'priority', 'impact', 'progress',
        'category', 'start_date', 'due_date', 'completed_at',
        'reviewed_at', 'blocked_reason', 'estimated_minutes', 'actual_minutes', 'recurrence_rule',
        'created_by', 'assigned_by',
        'dossier_id', 'client_id', 'dossier_document_id',
        'finance_document_id', 'contract_id', 'archive_record_id', 'conversation_id',
        'metadata',
    ];

    protected $casts = [
        'progress' => 'integer',
        'start_date' => 'date',
        'due_date' => 'date',
        'completed_at' => 'datetime',
        'reviewed_at' => 'datetime',
        'estimated_minutes' => 'integer',
        'actual_minutes' => 'integer',
        'metadata' => 'json',
    ];

    public function creator(): BelongsTo { return $this->belongsTo(User::class, 'created_by'); }
    public function assigner(): BelongsTo { return $this->belongsTo(User::class, 'assigned_by'); }
    public function assignees(): BelongsToMany { return $this->belongsToMany(User::class, 'task_assignees'); }
    public function watchers(): BelongsToMany { return $this->belongsToMany(User::class, 'task_watchers'); }
    public function checklistItems(): HasMany { return $this->hasMany(TaskChecklistItem::class); }
    public function comments(): HasMany { return $this->hasMany(TaskComment::class); }
    public function attachments(): HasMany { return $this->hasMany(TaskAttachment::class); }
    public function activityLogs(): HasMany { return $this->hasMany(TaskActivityLog::class); }
    public function dossier(): BelongsTo { return $this->belongsTo(Dossier::class); }
    public function client(): BelongsTo { return $this->belongsTo(Client::class); }
    public function document(): BelongsTo { return $this->belongsTo(DossierDocument::class, 'dossier_document_id'); }
    public function financeDocument(): BelongsTo { return $this->belongsTo(FinanceDocument::class); }
    public function contract(): BelongsTo { return $this->belongsTo(Contract::class); }
    public function archiveRecord(): BelongsTo { return $this->belongsTo(ArchiveRecord::class); }
    public function conversation(): BelongsTo { return $this->belongsTo(Conversation::class); }

    public function belongsToScope(User $user): bool
    {
        $this->loadMissing('creator');

        return $this->creator !== null
            && (int) $this->creator->company_id === (int) $user->company_id
            && (! $user->branch_id || (int) $this->creator->branch_id === (int) $user->branch_id);
    }
}
