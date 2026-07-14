<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ArchiveRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'dossier_id',
        'archive_number',
        'status',
        'room',
        'shelf',
        'box',
        'folder',
        'in_date',
        'out_date',
        'returned_at',
        'requested_by',
        'requester_id',
        'due_at',
        'checked_out_at',
        'is_lost',
        'lost_reason',
        'qr_path',
        'location_changed_from',
        'moved_at',
        'notes',
    ];

    protected $casts = [
        'in_date' => 'date',
        'out_date' => 'date',
        'returned_at' => 'date',
        'due_at' => 'datetime',
        'checked_out_at' => 'datetime',
        'is_lost' => 'boolean',
        'location_changed_from' => 'array',
        'moved_at' => 'datetime',
    ];

    public function dossier(): BelongsTo
    {
        return $this->belongsTo(Dossier::class);
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requester_id');
    }

    public function events(): HasMany
    {
        return $this->hasMany(ArchiveEvent::class, 'archive_record_id');
    }

    public function scopeStored($query)
    {
        return $query->where('status', 'stored');
    }

    public function scopeCheckedOut($query)
    {
        return $query->where('status', 'checked_out');
    }

    public function scopeReady($query)
    {
        return $query->where('status', 'ready_to_archive');
    }

    public function scopeReturned($query)
    {
        return $query->where('status', 'returned');
    }

    public function scopeLost($query)
    {
        return $query->where('is_lost', true);
    }

    public function scopeOverdue($query)
    {
        return $query->where('status', 'checked_out')
            ->where('due_at', '<', now())
            ->where('is_lost', false);
    }

    public function scopeNotLost($query)
    {
        return $query->where('is_lost', false);
    }
}
