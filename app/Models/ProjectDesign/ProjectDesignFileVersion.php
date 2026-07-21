<?php

namespace App\Models\ProjectDesign;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProjectDesignFileVersion extends Model
{
    use HasFactory;
    protected $fillable = [
        'file_id',
        'version_number',
        'status',
        'checksum',
        'file_size',
        'mime_type',
        'original_filename',
        'disk_path',
        'disk',
        'uploaded_by',
        'notes',
        'record_version',
    ];

    public function file(): BelongsTo
    {
        return $this->belongsTo(ProjectDesignFile::class, 'file_id');
    }

    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
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
