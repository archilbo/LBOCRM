<?php

namespace App\Http\Requests\Calendar;

use App\Models\CalendarEvent;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class CalendarIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('viewAny', CalendarEvent::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'type' => ['nullable', 'string', 'in:task,note,reminder,meeting,deadline,client_follow_up,finance_follow_up,contract_follow_up,archive_follow_up'],
            'status' => ['nullable', 'string', 'in:scheduled,in_progress,completed,cancelled,overdue'],
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'start' => ['nullable', 'date_format:Y-m-d', 'required_with:end'],
            'end' => ['nullable', 'date_format:Y-m-d', 'required_with:start', 'after_or_equal:start'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $start = $this->input('start');
            $end = $this->input('end');

            if (! $start || ! $end || $validator->errors()->hasAny(['start', 'end'])) {
                return;
            }

            if (CarbonImmutable::parse($start)->diffInDays(CarbonImmutable::parse($end)) > 93) {
                $validator->errors()->add('end', 'La plage du calendrier ne peut pas dépasser 93 jours.');
            }
        });
    }
}
