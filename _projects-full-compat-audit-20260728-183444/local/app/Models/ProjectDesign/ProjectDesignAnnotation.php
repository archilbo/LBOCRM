<?php

namespace App\Models\ProjectDesign;

use App\Models\Company;
use App\Models\Dossier;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProjectDesignAnnotation extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'company_id',
        'dossier_id',
        'file_id',
        'version_id',
        'asset_id',
        'remark_id',
        'page_number',
        'type',
        'coordinate_space',
        'geometry',
        'style_json',
        'viewport_json',
        'reference_width',
        'reference_height',
        'source_rotation',
        'authored_by',
        'created_by',
        'record_version',
    ];

    protected function casts(): array
    {
        return [
            'geometry' => 'array',
            'style_json' => 'array',
            'viewport_json' => 'array',
            'reference_width' => 'integer',
            'reference_height' => 'integer',
            'source_rotation' => 'integer',
            'page_number' => 'integer',
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

    public function version(): BelongsTo
    {
        return $this->belongsTo(ProjectDesignFileVersion::class, 'version_id');
    }

    public function asset(): BelongsTo
    {
        return $this->belongsTo(ProjectDesignAsset::class, 'asset_id');
    }

    public function remark(): BelongsTo
    {
        return $this->belongsTo(ProjectDesignRemark::class, 'remark_id');
    }

    public function authoredBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'authored_by');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function remarks(): HasMany
    {
        return $this->hasMany(ProjectDesignRemark::class, 'annotation_id');
    }
}
