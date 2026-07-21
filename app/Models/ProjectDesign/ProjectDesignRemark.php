<?php

namespace App\Models\ProjectDesign;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProjectDesignRemark extends Model
{
    use HasFactory;
    protected $fillable = [
        'version_id',
        'annotation_id',
        'severity',
        'status',
        'title',
        'description',
        'assigned_to',
        'due_date',
        'created_by',
        'record_version',
    ];

    protected function casts(): array
    {
        return [
            'due_date' => 'date',
        ];
    }

    public function version(): BelongsTo
    {
        return $this->belongsTo(ProjectDesignFileVersion::class, 'version_id');
    }

    public function annotation(): BelongsTo
    {
        return $this->belongsTo(ProjectDesignAnnotation::class, 'annotation_id');
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(ProjectDesignRemarkComment::class, 'remark_id');
    }
}
