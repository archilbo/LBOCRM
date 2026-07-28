<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class MessageAttachment extends Model
{
    protected $fillable = ['message_id', 'user_id', 'filename', 'storage_path', 'original_filename', 'mime_type', 'size', 'disk'];

    protected $casts = ['disk' => 'string'];

    public function message(): BelongsTo { return $this->belongsTo(Message::class); }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }

    public function getUrlAttribute(): ?string
    {
        return route('inbox.attachments.view', $this);
    }

    public function getThumbnailUrlAttribute(): ?string
    {
        return str_starts_with((string) $this->mime_type, 'image/') ? $this->url : null;
    }

    public function storagePath(): string
    {
        return $this->storage_path ?: 'message-attachments/'.$this->message_id.'/'.$this->filename;
    }
}
