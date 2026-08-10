<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RecoveryRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id', 'branch_id', 'entity_type', 'entity_id', 'display_label',
        'deleted_by', 'deleted_at', 'restored_by', 'restored_at',
        'purged_by', 'purged_at', 'metadata',
    ];

    protected $casts = [
        'deleted_at' => 'datetime',
        'restored_at' => 'datetime',
        'purged_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function deletedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'deleted_by');
    }
}
