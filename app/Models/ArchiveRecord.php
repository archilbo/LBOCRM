<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
        'notes',
    ];

    protected $casts = [
        'in_date' => 'date',
        'out_date' => 'date',
        'returned_at' => 'date',
    ];

    public function dossier(): BelongsTo
    {
        return $this->belongsTo(Dossier::class);
    }
}
