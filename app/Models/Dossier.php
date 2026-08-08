<?php

namespace App\Models;

use App\Models\ProjectDesign\ProjectDesignFile;
use App\Models\ProjectDesign\ProjectDesignFolder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Dossier extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'branch_id',
        'client_id',
        'city_id',
        'dossier_number',
        'sequence_number',
        'period',
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

    public function getProjectLabelAttribute(): string
    {
        return 'P' . $this->id;
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(DossierDocument::class);
    }

    public function contract(): HasOne
    {
        return $this->hasOne(Contract::class);
    }

    public function efficiencySheet(): HasOne
    {
        return $this->hasOne(ProjectEfficiencySheet::class);
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

    public function designFolders(): HasMany
    {
        return $this->hasMany(ProjectDesignFolder::class, 'dossier_id');
    }

    public function designFiles(): HasMany
    {
        return $this->hasMany(ProjectDesignFile::class, 'dossier_id');
    }
}
