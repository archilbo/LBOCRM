<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DossierWorkflowRequirement extends Model
{
    use HasFactory;

    protected $fillable = [
        'dossier_id',
        'step_key',
        'requirement_key',
        'is_done',
        'checked_at',
        'checked_by',
        'notes',
    ];

    protected $casts = [
        'is_done' => 'boolean',
        'checked_at' => 'datetime',
    ];

    public function dossier(): BelongsTo
    {
        return $this->belongsTo(Dossier::class);
    }

    public function checkedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'checked_by');
    }

    public function histories(): HasMany
    {
        return $this->hasMany(DossierWorkflowRequirementHistory::class);
    }
}
