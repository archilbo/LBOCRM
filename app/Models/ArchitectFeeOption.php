<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ArchitectFeeOption extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'calculation_type',
        'percentage_rate',
        'flat_amount',
        'contract_template_key',
        'is_default',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'percentage_rate' => 'decimal:4',
        'flat_amount' => 'decimal:2',
        'is_default' => 'boolean',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function contracts(): HasMany
    {
        return $this->hasMany(Contract::class);
    }
}
