<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Contract extends Model
{
    use HasFactory;

    protected $fillable = [
        'dossier_id',
        'contract_number',
        'status',
        'surface',
        'price_per_square_meter',
        'fee_rate_percent',
        'calculation_mode',
        'forfait_ttc',
        'ht',
        'tva',
        'ttc',
        'generated_document_path',
        'pdf_path',
        'generated_at',
        'signed_at',
        'notes',
    ];

    protected $casts = [
        'surface' => 'decimal:2',
        'price_per_square_meter' => 'decimal:2',
        'fee_rate_percent' => 'decimal:2',
        'forfait_ttc' => 'decimal:2',
        'ht' => 'decimal:2',
        'tva' => 'decimal:2',
        'ttc' => 'decimal:2',
        'generated_at' => 'datetime',
        'signed_at' => 'datetime',
    ];

    public function dossier(): BelongsTo
    {
        return $this->belongsTo(Dossier::class);
    }
}
