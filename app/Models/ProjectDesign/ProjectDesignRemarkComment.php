<?php

namespace App\Models\ProjectDesign;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectDesignRemarkComment extends Model
{
    protected $fillable = [
        'remark_id',
        'user_id',
        'content',
    ];

    public function remark(): BelongsTo
    {
        return $this->belongsTo(ProjectDesignRemark::class, 'remark_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
