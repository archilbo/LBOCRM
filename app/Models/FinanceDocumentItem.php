<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FinanceDocumentItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'finance_document_id',
        'position',
        'title',
        'description',
        'quantity',
        'unit',
        'unit_price',
        'discount_rate',
        'tva_rate',
        'total_ht',
        'total_tva',
        'total_ttc',
    ];

    protected $casts = [
        'position' => 'integer',
        'quantity' => 'decimal:3',
        'unit_price' => 'decimal:2',
        'discount_rate' => 'decimal:2',
        'tva_rate' => 'decimal:2',
        'total_ht' => 'decimal:2',
        'total_tva' => 'decimal:2',
        'total_ttc' => 'decimal:2',
    ];

    public function document(): BelongsTo
    {
        return $this->belongsTo(FinanceDocument::class, 'finance_document_id');
    }

    public function calculateTotals(bool $save = false): static
    {
        $ht = $this->quantity * $this->unit_price;
        $htAfterDiscount = $ht * (1 - $this->discount_rate / 100);
        $tva = $htAfterDiscount * ($this->tva_rate / 100);
        $ttc = $htAfterDiscount + $tva;

        $this->total_ht = $htAfterDiscount;
        $this->total_tva = $tva;
        $this->total_ttc = $ttc;

        if ($save) {
            $this->save();
        }

        return $this;
    }
}
