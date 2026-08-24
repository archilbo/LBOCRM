<?php

namespace App\Models;

use App\Models\ProjectDesign\ProjectDesignFile;
use App\Models\ProjectDesign\ProjectDesignFolder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;
use Illuminate\Database\Eloquent\SoftDeletes;

class Dossier extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'company_id',
        'branch_id',
        'client_id',
        'intermediary_id',
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

    /**
     * Legacy single-owner column, kept during PHASE A for backward
     * compatibility. It mirrors the primary client of the many-to-many
     * membership and will be removed after the migration completes.
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function clients(): BelongsToMany
    {
        return $this->belongsToMany(Client::class, 'client_dossier')
            ->withPivot(['is_primary', 'role'])
            ->withTimestamps()
            ->using(ClientDossier::class);
    }

    /**
     * Transitional membership guard for rows created before the pivot was
     * introduced. Production rows are backfilled by the migration; this
     * fallback keeps legacy imports and historical test fixtures safe while
     * still accepting only the dossier's recorded primary client.
     */
    public function hasClientMembership(int $clientId): bool
    {
        return $this->clients()->whereKey($clientId)->exists()
            || (int) $this->client_id === $clientId;
    }

    /**
     * Queryable, eager-loadable primary client. Enforced by
     * DossierClientService so that exactly one attached client is primary.
     * withTrashed(): a soft-deleted client must still resolve as primary so
     * historical projects never lose their owner in the UI.
     */
    public function primaryClient(): HasOneThrough
    {
        return $this->hasOneThrough(
            Client::class,
            ClientDossier::class,
            'dossier_id',
            'id',
            'id',
            'client_id',
        )
            ->where('client_dossier.is_primary', true)
            ->withTrashed();
    }

    public function intermediary(): BelongsTo
    {
        return $this->belongsTo(Intermediary::class);
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

    public function negotiatedPaymentLines(): HasMany
    {
        return $this->hasMany(DossierNegotiatedPaymentLine::class)->orderBy('position')->orderBy('id');
    }

    public function archiveRecord(): HasOne
    {
        return $this->hasOne(ArchiveRecord::class);
    }

    public function workflowRequirements(): HasMany
    {
        return $this->hasMany(DossierWorkflowRequirement::class);
    }

    public function cahier(): HasOne
    {
        return $this->hasOne(DossierCahier::class);
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
