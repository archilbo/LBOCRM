<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateArchiveRecordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $archiveId = $this->route('archiveRecord')?->id ?? $this->route('archiveRecord');

        return [
            'dossier_id' => [
                'required',
                'exists:dossiers,id',
                Rule::unique('archive_records', 'dossier_id')->ignore($archiveId),
            ],
            'status' => ['nullable', 'string', 'max:50'],

            'room' => ['nullable', 'string', 'max:120'],
            'shelf' => ['nullable', 'string', 'max:120'],
            'box' => ['nullable', 'string', 'max:120'],
            'folder' => ['nullable', 'string', 'max:120'],

            'in_date' => ['nullable', 'date'],
            'out_date' => ['nullable', 'date'],
            'returned_at' => ['nullable', 'date'],
            'requested_by' => ['nullable', 'string', 'max:190'],

            'notes' => ['nullable', 'string', 'max:5000'],
        ];
    }
}