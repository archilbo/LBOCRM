<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Company extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'legal_name', 'slug', 'address', 'city', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public function branches(): HasMany
    {
        return $this->hasMany(Branch::class);
    }

    public function financeDocuments(): HasMany
    {
        return $this->hasMany(FinanceDocument::class);
    }

    public function internalInvoices(): HasMany
    {
        return $this->financeDocuments()->where('type', 'internal_invoice');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }
}
