<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Client extends Model
{
    use HasFactory;

    protected $fillable = [
        'intermediary_id',
        'client_number',
        'civility',
        'first_name',
        'last_name',
        'full_name',
        'cin',
        'phone',
        'email',
        'address',
        'father_name',
        'mother_name',
        'cni_expiration_date',
        'status',
        'notes',
    ];

    protected $casts = [
        'cni_expiration_date' => 'date',
    ];

    public function intermediary(): BelongsTo
    {
        return $this->belongsTo(Intermediary::class);
    }

    public function dossiers(): HasMany
    {
        return $this->hasMany(Dossier::class);
    }

    public function financeRecords(): HasMany
    {
        return $this->hasMany(FinanceRecord::class);
    }

    public function financeDocuments(): HasMany
    {
        return $this->hasMany(FinanceDocument::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }
}
