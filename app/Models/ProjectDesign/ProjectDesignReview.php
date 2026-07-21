<?php

namespace App\Models\ProjectDesign;

use App\Models\Company;
use App\Models\Dossier;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectDesignReview extends Model
{
    protected $fillable = [
        'company_id',
        'file_id',
        'version_id',
        'requested_by',
        'reviewer_id',
        'status',
        'decision',
        'notes',
        'general_note',
        'requested_at',
        'started_at',
        'due_at',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'requested_at' => 'datetime',
            'started_at' => 'datetime',
            'due_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

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
