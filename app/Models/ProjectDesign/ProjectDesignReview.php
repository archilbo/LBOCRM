<?php

namespace App\Models\ProjectDesign;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectDesignReview extends Model
{
    protected $fillable = [
        'file_id',
        'version_id',
        'requested_by',
        'reviewer_id',
        'status',
        'notes',
    ];

    public function file(): BelongsTo
    {
        return $this->belongsTo(ProjectDesignFile::class, 'file_id');
    }

    public function version(): BelongsTo
    {
        return $this->belongsTo(ProjectDesignFileVersion::class, 'version_id');
    }

    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }
}
