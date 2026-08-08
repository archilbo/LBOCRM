<?php

namespace App\Http\Requests\Calendar;

use App\Models\CalendarEvent;
use App\Services\PermissionRegistry;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreCalendarEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', CalendarEvent::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', 'string', 'in:task,note,reminder,meeting,deadline,client_follow_up,finance_follow_up,contract_follow_up,archive_follow_up'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['nullable', 'string', 'in:scheduled,in_progress,completed,cancelled,overdue'],
            'priority' => ['nullable', 'string', 'in:low,medium,high,urgent'],
            'color' => ['nullable', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'starts_at' => ['required', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'all_day' => ['nullable', 'boolean'],
            'timezone' => ['nullable', 'timezone'],
            'visibility' => ['nullable', 'string', 'in:private,assigned_users,team,admins'],
            'owner_id' => ['nullable', 'exists:users,id'],
            'task_id' => ['nullable', 'exists:tasks,id'],
            'client_id' => ['nullable', 'exists:clients,id'],
            'dossier_id' => ['nullable', 'exists:dossiers,id'],
            'dossier_document_id' => ['nullable', 'exists:dossier_documents,id'],
            'finance_document_id' => ['nullable', 'exists:finance_documents,id'],
            'contract_id' => ['nullable', 'exists:contracts,id'],
            'archive_record_id' => ['nullable', 'exists:archive_records,id'],
            'participant_ids' => ['nullable', 'array'],
            'participant_ids.*' => ['integer', 'exists:users,id'],
            'reminder_offset' => ['nullable', 'integer', 'min:-1'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if ($this->input('visibility') === 'admins' && ! app(PermissionRegistry::class)->isProtected($this->user())) {
                $validator->errors()->add('visibility', 'Cette visibilité est réservée aux administrateurs.');
            }
        });
    }
}
