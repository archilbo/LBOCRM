<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DossierDocument extends Model
{
    use HasFactory;

    public const SIDE_SINGLE = 'single';

    public const SIDE_FRONT = 'front';

    public const SIDE_BACK = 'back';

    protected $fillable = [
        'dossier_id',
        'document_template_id',
        'document_side',
        'document_number',
        'original_filename',
        'stored_path',
        'mime_type',
        'size_bytes',
        'status',
        'uploaded_at',
        'verified_at',
        'notes',
    ];

    protected $casts = [
        'size_bytes' => 'integer',
        'uploaded_at' => 'datetime',
        'verified_at' => 'datetime',
    ];

    public function dossier(): BelongsTo
    {
        return $this->belongsTo(Dossier::class);
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(
            DocumentTemplate::class,
            'document_template_id'
        );
    }

    public function isCinSide(): bool
    {
        return in_array(
            $this->document_side,
            [
                self::SIDE_FRONT,
                self::SIDE_BACK,
            ],
            true
        );
    }
}
