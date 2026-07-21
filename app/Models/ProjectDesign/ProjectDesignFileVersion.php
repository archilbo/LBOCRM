<?php

namespace App\Models\ProjectDesign;

use App\Models\Company;
use App\Models\Dossier;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProjectDesignFileVersion extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'dossier_id',
        'file_id',
        'version_number',
        'source_version_id',
        'revision_code',
        'status',
        'upload_status',
        'preview_status',
        'review_status',
        'change_summary',
        'upload_note',
        'preview_error',
        'uploaded_by',
        'submitted_at',
        'submitted_by',
        'approved_at',
        'approved_by',
        'rejected_at',
        'rejected_by',
        'superseded_at',
        'metadata_json',
        'idempotency_key',
        'record_version',
    ];

    protected function casts(): array
    {
        return [
            'metadata_json' => 'array',
            'submitted_at' => 'datetime',
            'approved_at' => 'datetime',
            'rejected_at' => 'datetime',
            'superseded_at' => 'datetime',
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

    public function file(): BelongsTo
    {
        return $this->belongsTo(ProjectDesignFile::class, 'file_id');
    }

    public function sourceVersion(): BelongsTo
    {
        return $this->belongsTo(self::class, 'source_version_id');
    }

    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function submittedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function rejectedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rejected_by');
    }

    public function assets(): HasMany
    {
        return $this->hasMany(ProjectDesignAsset::class, 'version_id');
    }

    public function annotations(): HasMany
    {
        return $this->hasMany(ProjectDesignAnnotation::class, 'version_id');
    }

    public function remarks(): HasMany
    {
        return $this->hasMany(ProjectDesignRemark::class, 'version_id');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(ProjectDesignReview::class, 'version_id');
    }
}
