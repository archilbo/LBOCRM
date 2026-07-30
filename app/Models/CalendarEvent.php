<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class CalendarEvent extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'event_number',
        'type',
        'title',
        'description',
        'status',
        'priority',
        'color',
        'starts_at',
        'ends_at',
        'all_day',
        'timezone',
        'visibility',
        'created_by',
        'owner_id',
        'task_id',
        'client_id',
        'dossier_id',
        'dossier_document_id',
        'finance_document_id',
        'contract_id',
        'archive_record_id',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'all_day' => 'boolean',
            'metadata' => 'json',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function dossier(): BelongsTo
    {
        return $this->belongsTo(Dossier::class);
    }

    public function dossierDocument(): BelongsTo
    {
        return $this->belongsTo(DossierDocument::class);
    }

    public function financeDocument(): BelongsTo
    {
        return $this->belongsTo(FinanceDocument::class);
    }

    public function contract(): BelongsTo
    {
        return $this->belongsTo(Contract::class);
    }

    public function archiveRecord(): BelongsTo
    {
        return $this->belongsTo(ArchiveRecord::class);
    }

    public function participants(): HasMany
    {
        return $this->hasMany(CalendarEventParticipant::class);
    }

    public function reminders(): HasMany
    {
        return $this->hasMany(CalendarEventReminder::class);
    }

    public function activityLogs(): HasMany
    {
        return $this->hasMany(CalendarEventActivityLog::class);
    }

    public function recurrences(): HasMany
    {
        return $this->hasMany(CalendarEventRecurrence::class);
    }

    public function belongsToScope(User $user): bool
    {
        $this->loadMissing('creator');

        return $this->creator !== null
            && (int) $this->creator->company_id === (int) $user->company_id
            && (! $user->branch_id || (int) $this->creator->branch_id === (int) $user->branch_id);
    }
}
