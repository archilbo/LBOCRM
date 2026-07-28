<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FinanceRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'dossier_id',
        'client_id',
        'record_number',
        'type',
        'status',
        'ht',
        'tva',
        'total_ttc',
        'paid',
        'remaining',
        'issued_at',
        'due_date',
        'paid_at',
        'notes',
        'generated_file_path',
        'generated_pdf_path',
        'generated_at',
    ];

    protected $casts = [
        'ht' => 'decimal:2',
        'tva' => 'decimal:2',
        'total_ttc' => 'decimal:2',
        'paid' => 'decimal:2',
        'remaining' => 'decimal:2',
        'issued_at' => 'date',
        'due_date' => 'date',
        'paid_at' => 'date',
        'generated_at' => 'datetime',
    ];

    public function dossier(): BelongsTo
    {
        return $this->belongsTo(Dossier::class);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }
}
