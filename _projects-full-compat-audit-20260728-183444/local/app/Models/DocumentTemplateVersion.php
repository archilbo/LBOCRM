<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentTemplateVersion extends Model
{
    protected $fillable = [
        'document_template_id',
        'version_number',
        'name',
        'slug',
        'type',
        'is_default',
        'paper_size',
        'orientation',
        'header_html',
        'body_html',
        'footer_html',
        'css',
        'settings',
        'logo_path',
        'snapshot_reason',
        'created_by',
    ];

    protected $casts = [
        'is_default' => 'boolean',
        'settings' => 'array',
    ];

    public function template(): BelongsTo
    {
        return $this->belongsTo(DocumentTemplate::class, 'document_template_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}