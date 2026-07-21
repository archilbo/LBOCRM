<?php

namespace App\Models\ProjectDesign;

use App\Models\Company;
use App\Models\Dossier;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\HasOne;

class ProjectDesignFile extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'branch_id',
        'dossier_id',
        'folder_id',
        'name',
        'code',
        'description',
        'discipline',
        'category',
        'responsible_user_id',
        'reviewer_id',
        'current_version_id',
        'latest_approved_version_id',
        'status',
        'requires_approval',
        'review_due_at',
        'created_by',
        'record_version',
        'archived_at',
    ];

    protected function casts(): array
    {
        return [
            'requires_approval' => 'boolean',
            'review_due_at' => 'datetime',
            'archived_at' => 'datetime',
            'record_version' => 'integer',
        ];
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function dossier(): BelongsTo
    {
        return $this->belongsTo(Dossier::class);
    }

    public function folder(): BelongsTo
    {
        return $this->belongsTo(ProjectDesignFolder::class, 'folder_id');
    }

    public function responsibleUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'responsible_user_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function versions(): HasMany
    {
        return $this->hasMany(ProjectDesignFileVersion::class, 'file_id');
    }

    public function latestVersion(): HasOne
    {
        return $this->hasOne(ProjectDesignFileVersion::class, 'file_id')
            ->ofMany('version_number', 'max');
    }

    public function currentVersion(): BelongsTo
    {
        return $this->belongsTo(ProjectDesignFileVersion::class, 'current_version_id');
    }

    public function latestApprovedVersion(): BelongsTo
    {
        return $this->belongsTo(ProjectDesignFileVersion::class, 'latest_approved_version_id');
    }

    public function openRemarks(): HasManyThrough
    {
        return $this->hasManyThrough(
            ProjectDesignRemark::class,
            ProjectDesignFileVersion::class,
            'file_id',
            'version_id',
            'id',
            'id'
        )->whereIn('project_design_remarks.status', ['open', 'assigned', 'in_progress']);
    }

    public function assets(): HasMany
    {
        return $this->hasMany(ProjectDesignAsset::class, 'design_file_id');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(ProjectDesignReview::class, 'file_id');
    }

    public function archiveFile(): void
    {
        $this->update(['status' => 'archived', 'archived_at' => now()]);
    }

    public function restoreFile(): void
    {
        $this->update(['status' => 'active', 'archived_at' => null]);
    }
}
