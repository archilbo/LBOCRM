<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class MessageAttachment extends Model
{
    protected $fillable = ['message_id', 'user_id', 'filename', 'original_filename', 'mime_type', 'size', 'disk'];

    protected $casts = ['disk' => 'string'];

    public function message(): BelongsTo { return $this->belongsTo(Message::class); }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }

    public function getUrlAttribute(): ?string
    {
        $path = 'message-attachments/' . $this->message_id . '/' . $this->filename;
        if ($this->disk === 'public') {
            return Storage::disk('public')->exists($path) ? Storage::disk('public')->url($path) : null;
        }
        return Storage::disk($this->disk ?? 'public')->exists($path) ? Storage::disk($this->disk ?? 'public')->url($path) : null;
    }

    public function getThumbnailUrlAttribute(): ?string
    {
        return $this->url;
    }
}
