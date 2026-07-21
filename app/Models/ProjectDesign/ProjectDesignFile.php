<?php

namespace App\Models\ProjectDesign;

use App\Models\Dossier;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProjectDesignFile extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'dossier_id',
        'folder_id',
        'name',
        'description',
        'type',
        'status',
        'sort_order',
        'record_version',
    ];

    public function dossier(): BelongsTo
    {
        return $this->belongsTo(Dossier::class);
    }

    public function folder(): BelongsTo
    {
        return $this->belongsTo(ProjectDesignFolder::class, 'folder_id');
    }

    public function versions(): HasMany
    {
        return $this->hasMany(ProjectDesignFileVersion::class, 'file_id');
    }

    public function latestVersion()
    {
        return $this->hasOne(ProjectDesignFileVersion::class, 'file_id')->latestOfMany('version_number');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(ProjectDesignReview::class, 'file_id');
    }
}
