<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\Pivot;

class ClientDossier extends Pivot
{
    public $incrementing = true;

    protected $table = 'client_dossier';

    protected $fillable = [
        'client_id',
        'dossier_id',
        'is_primary',
        'role',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function dossier(): BelongsTo
    {
        return $this->belongsTo(Dossier::class);
    }
}