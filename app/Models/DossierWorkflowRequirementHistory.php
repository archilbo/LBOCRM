<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DossierWorkflowRequirementHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'dossier_id',
        'dossier_workflow_requirement_id',
        'step_key',
        'requirement_key',
        'old_is_done',
        'new_is_done',
        'old_notes',
        'new_notes',
        'changed_by',
        'changed_at',
    ];

    protected $casts = [
        'old_is_done' => 'boolean',
        'new_is_done' => 'boolean',
        'changed_at' => 'datetime',
    ];

    public function dossier(): BelongsTo
    {
        return $this->belongsTo(Dossier::class);
    }

    public function requirement(): BelongsTo
    {
        return $this->belongsTo(DossierWorkflowRequirement::class, 'dossier_workflow_requirement_id');
    }

    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
