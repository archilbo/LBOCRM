<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Fiche efficacité.
 *
 * Contract-like single-row document record: one logical fiche per Project
 * (Dossier), regenerations bump the version counter and update the generated
 * file paths in place. Automatic data (project/client/entreprise) is NOT
 * persisted here — it is read from trusted sources at generation time and
 * frozen inside the generated DOCX/PDF, exactly like Contract behaves.
 */
class ProjectEfficiencySheet extends Model
{
    use HasFactory;

    protected $fillable = [
        'dossier_id',
        'usage_du_batiment',
        'owner_name',
        'status',
        'version',
        'template_key',
        'docx_path',
        'pdf_path',
        'generated_by',
        'generated_at',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'version' => 'integer',
        'generated_at' => 'datetime',
    ];

    public function dossier(): BelongsTo
    {
        return $this->belongsTo(Dossier::class);
    }

    public function generatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'generated_by');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
