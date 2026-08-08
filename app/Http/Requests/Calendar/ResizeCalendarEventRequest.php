<?php

namespace App\Http\Requests\Calendar;

use App\Models\CalendarEvent;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class ResizeCalendarEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        $event = $this->route('calendarEvent');

        return $event instanceof CalendarEvent && ($this->user()?->can('resize', $event) ?? false);
    }

    public function rules(): array
    {
        return ['ends_at' => ['required', 'date']];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $event = $this->route('calendarEvent');
            $end = $this->input('ends_at');

            if (! $event instanceof CalendarEvent || ! $end || $validator->errors()->has('ends_at')) {
                return;
            }

            if (CarbonImmutable::parse($end)->lessThan($event->starts_at)) {
                $validator->errors()->add('ends_at', 'La fin doit être postérieure ou égale au début de l’événement.');
            }
        });
    }
}
