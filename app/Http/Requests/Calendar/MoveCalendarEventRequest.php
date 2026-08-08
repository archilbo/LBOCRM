<?php

namespace App\Http\Requests\Calendar;

use App\Models\CalendarEvent;
use Illuminate\Foundation\Http\FormRequest;

class MoveCalendarEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        $event = $this->route('calendarEvent');

        return $event instanceof CalendarEvent && ($this->user()?->can('move', $event) ?? false);
    }

    public function rules(): array
    {
        return [
            'starts_at' => ['required', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
        ];
    }
}
