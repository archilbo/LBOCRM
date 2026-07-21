<?php

namespace App\Models\ProjectDesign;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectDesignAnnotation extends Model
{
    protected $fillable = [
        'version_id',
        'type',
        'geometry',
        'authored_by',
        'record_version',
    ];

    protected function casts(): array
    {
        return [
            'geometry' => 'array',
        ];
    }

    public function version(): BelongsTo
    {
        return $this->belongsTo(ProjectDesignFileVersion::class, 'version_id');
    }

    public function authoredBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'authored_by');
    }

    public function remarks()
    {
        return $this->hasMany(ProjectDesignRemark::class, 'annotation_id');
    }
}
