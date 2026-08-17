<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FinanceDocumentSequence extends Model
{
    protected $fillable = [
        'company_id',
        'document_type',
        'sequence_year',
        'next_number',
    ];

    protected $casts = [
        'sequence_year' => 'integer',
        'next_number' => 'integer',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
}
