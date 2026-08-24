<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DossierNegotiatedPaymentLine extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'branch_id',
        'client_id',
        'dossier_id',
        'designation',
        'negotiated_amount',
        'position',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'negotiated_amount' => 'decimal:2',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function dossier(): BelongsTo
    {
        return $this->belongsTo(Dossier::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'dossier_negotiated_payment_line_id');
    }
}
