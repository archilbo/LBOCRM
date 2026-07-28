<?php

namespace App\Models\ProjectDesign;

use App\Models\Company;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectDesignRemarkComment extends Model
{
    protected $fillable = [
        'company_id',
        'remark_id',
        'user_id',
        'content',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function remark(): BelongsTo
    {
        return $this->belongsTo(ProjectDesignRemark::class, 'remark_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
