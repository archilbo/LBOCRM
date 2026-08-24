<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Branch extends Model
{
    protected $fillable = ['company_id', 'name', 'code', 'address', 'city', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
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
