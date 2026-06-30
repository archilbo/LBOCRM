<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Dossier extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id',
        'dossier_number',
        'project_object',
        'description',
        'project_address',
        'province',
        'commune',
        'land_title_number',
        'land_surface',
        'floor_area',
        'status',
        'workflow_step',
        'opened_at',
        'closed_at',
        'notes',
    ];

    protected $casts = [
        'land_surface' => 'decimal:2',
        'floor_area' => 'decimal:2',
        'opened_at' => 'date',
        'closed_at' => 'date',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(DossierDocument::class);
    }

    public function contract(): HasOne
    {
        return $this->hasOne(Contract::class);
    }

    public function authorization(): HasOne
    {
        return $this->hasOne(Authorization::class);
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

    public function archiveRecord(): HasOne
    {
        return $this->hasOne(ArchiveRecord::class);
    }

    public function workflowRequirements(): HasMany
    {
        return $this->hasMany(DossierWorkflowRequirement::class);
    }

    public function workflowRequirementHistories(): HasMany
    {
        return $this->hasMany(DossierWorkflowRequirementHistory::class);
    }
}
