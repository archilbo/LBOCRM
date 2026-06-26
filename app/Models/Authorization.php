<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Authorization extends Model
{
    use HasFactory;

    protected $fillable = [
        'dossier_id',
        'authorization_number',
        'submission_number',
        'authority_name',
        'authority_type',
        'status',
        'submitted_at',
        'approved_at',
        'received_at',
        'receipt_path',
        'final_file_path',
        'observations',
        'notes',
    ];

    protected $casts = [
        'submitted_at' => 'date',
        'approved_at' => 'date',
        'received_at' => 'date',
        'observations' => 'array',
    ];

    public function dossier(): BelongsTo
    {
        return $this->belongsTo(Dossier::class);
    }
}
