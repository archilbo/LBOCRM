<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class FinanceTemplate extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'finance_templates';

    protected $fillable = [
        'type',
        'name',
        'slug',
        'is_default',
        'paper_size',
        'orientation',
        'header_html',
        'body_html',
        'footer_html',
        'css',
        'settings',
        'logo_path',
        'created_by',
    ];

    protected $casts = [
        'is_default' => 'boolean',
        'settings' => 'array',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }

    public function scopeType($query, string $type)
    {
        return $query->where('type', $type);
    }
}
