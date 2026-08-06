<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ArchiveNumberSequence extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'city_id',
        'year',
        'last_sequence',
    ];

    protected $casts = [
        'year' => 'integer',
        'last_sequence' => 'integer',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }
}
