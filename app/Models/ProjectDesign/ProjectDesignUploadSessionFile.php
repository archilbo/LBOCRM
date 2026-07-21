<?php

namespace App\Models\ProjectDesign;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectDesignUploadSessionFile extends Model
{
    protected $fillable = [
        'upload_session_id', 'client_file_upload_id', 'tus_upload_id',
        'asset_type', 'original_filename', 'mime_type', 'extension',
        'size_bytes', 'uploaded_bytes', 'status', 'temporary_path',
        'asset_id', 'error_code', 'error_message', 'record_version',
    ];

    protected function casts(): array
    {
        return [
            'size_bytes' => 'integer',
            'uploaded_bytes' => 'integer',
        ];
    }

    public function session(): BelongsTo { return $this->belongsTo(ProjectDesignUploadSession::class, 'upload_session_id'); }
    public function asset(): BelongsTo { return $this->belongsTo(ProjectDesignAsset::class); }
}
