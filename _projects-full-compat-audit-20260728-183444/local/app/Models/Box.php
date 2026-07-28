<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Box extends Model
{
    use HasFactory;

    protected $fillable = [
        'shelf_id',
        'name',
        'code',
        'capacity',
        'description',
    ];

    protected $casts = [
        'capacity' => 'integer',
    ];

    public function shelf(): BelongsTo
    {
        return $this->belongsTo(Shelf::class);
    }
}
