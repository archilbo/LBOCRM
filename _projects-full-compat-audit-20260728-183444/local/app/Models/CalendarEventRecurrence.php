<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CalendarEventRecurrence extends Model
{
    use HasFactory;

    protected $fillable = [
        'calendar_event_id',
        'frequency',
        'interval',
        'days_of_week',
        'ends_at',
        'count',
    ];

    protected function casts(): array
    {
        return [
            'days_of_week' => 'json',
            'ends_at' => 'date',
        ];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(CalendarEvent::class, 'calendar_event_id');
    }
}
