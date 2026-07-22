<?php

namespace App\Models\ProjectDesign;

use App\Models\Company;
use App\Models\Dossier;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectDesignAsset extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'design_file_id',
        'version_id',
        'asset_type',
        'source_application',
        'disk',
        'path',
        'original_filename',
        'stored_filename',
        'mime_type',
        'extension',
        'size_bytes',
        'checksum_sha256',
        'scan_status',
        'conversion_status',
        'scan_error',
        'previewable',
        'sort_order',
        'metadata_json',
        'uploaded_by',
    ];

    protected function casts(): array
    {
        return [
            'previewable' => 'boolean',
            'metadata_json' => 'array',
            'size_bytes' => 'integer',
        ];
    }

    public function isSource(): bool
    {
        return in_array($this->asset_type, ['source'], true);
    }

    public function isReview(): bool
    {
        return in_array($this->asset_type, ['review_pdf', 'image', 'ifc', 'viewer_derivative'], true);
    }

    public function formatCapability(): ?array
    {
        return \App\Support\DesignFormats::find($this->extension);
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function designFile(): BelongsTo
    {
        return $this->belongsTo(ProjectDesignFile::class, 'design_file_id');
    }

    public function version(): BelongsTo
    {
        return $this->belongsTo(ProjectDesignFileVersion::class, 'version_id');
    }

    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
