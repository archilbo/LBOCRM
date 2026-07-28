<?php

namespace App\Models\ProjectDesign;

use App\Models\Company;
use App\Models\Dossier;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProjectDesignUploadSession extends Model
{
    protected $fillable = [
        'uuid', 'client_upload_id', 'company_id', 'dossier_id',
        'design_file_id', 'version_id', 'user_id', 'operation',
        'submission_intent', 'status', 'total_files', 'completed_files',
        'total_bytes', 'uploaded_bytes', 'processing_progress',
        'tus_upload_ids_json', 'metadata_json', 'error_code', 'error_message',
        'expires_at', 'started_at', 'transferred_at', 'finalized_at',
        'completed_at', 'canceled_at', 'record_version',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'started_at' => 'datetime',
            'transferred_at' => 'datetime',
            'finalized_at' => 'datetime',
            'completed_at' => 'datetime',
            'canceled_at' => 'datetime',
            'total_bytes' => 'integer',
            'uploaded_bytes' => 'integer',
        ];
    }

    public function company(): BelongsTo { return $this->belongsTo(Company::class); }
    public function dossier(): BelongsTo { return $this->belongsTo(Dossier::class); }
    public function designFile(): BelongsTo { return $this->belongsTo(ProjectDesignFile::class); }
    public function version(): BelongsTo { return $this->belongsTo(ProjectDesignFileVersion::class); }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function files(): HasMany { return $this->hasMany(ProjectDesignUploadSessionFile::class, 'upload_session_id'); }
}
