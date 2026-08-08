<?php

namespace App\Http\Requests\Calendar;

use App\Models\CalendarEvent;
use App\Services\PermissionRegistry;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateCalendarEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        $event = $this->route('calendarEvent');

        return $event instanceof CalendarEvent && ($this->user()?->can('update', $event) ?? false);
    }

    public function rules(): array
    {
        return [
            'type' => ['nullable', 'string', 'in:task,note,reminder,meeting,deadline,client_follow_up,finance_follow_up,contract_follow_up,archive_follow_up'],
            'title' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['nullable', 'string', 'in:scheduled,in_progress,completed,cancelled,overdue'],
            'priority' => ['nullable', 'string', 'in:low,medium,high,urgent'],
            'color' => ['nullable', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'all_day' => ['nullable', 'boolean'],
            'timezone' => ['nullable', 'timezone'],
            'visibility' => ['nullable', 'string', 'in:private,assigned_users,team,admins'],
            'owner_id' => ['nullable', 'exists:users,id'],
            'client_id' => ['nullable', 'exists:clients,id'],
            'dossier_id' => ['nullable', 'exists:dossiers,id'],
            'dossier_document_id' => ['nullable', 'exists:dossier_documents,id'],
            'finance_document_id' => ['nullable', 'exists:finance_documents,id'],
            'contract_id' => ['nullable', 'exists:contracts,id'],
            'archive_record_id' => ['nullable', 'exists:archive_records,id'],
            'participant_ids' => ['nullable', 'array'],
            'participant_ids.*' => ['integer', 'exists:users,id'],
            'reminder_offset' => ['nullable', 'integer'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $event = $this->route('calendarEvent');

            if ($this->has('visibility') && $this->input('visibility') === 'admins' && ! app(PermissionRegistry::class)->isProtected($this->user())) {
                $validator->errors()->add('visibility', 'Cette visibilité est réservée aux administrateurs.');
            }

            if (! $event instanceof CalendarEvent || ! $this->input('ends_at') || $validator->errors()->has('ends_at')) {
                return;
            }

            $start = $this->input('starts_at') ?: $event->starts_at;

            if (CarbonImmutable::parse($this->input('ends_at'))->lessThan(CarbonImmutable::parse($start))) {
                $validator->errors()->add('ends_at', 'La fin doit être postérieure ou égale au début de l’événement.');
            }
        });
    }
}
