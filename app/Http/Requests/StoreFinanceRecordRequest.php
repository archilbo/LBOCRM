<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreFinanceRecordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'dossier_id' => ['required', 'exists:dossiers,id'],
            'type' => ['required', 'string', 'max:50'],
            'status' => ['nullable', 'string', 'max:50'],

            'ht' => ['nullable', 'numeric', 'min:0'],
            'tva' => ['nullable', 'numeric', 'min:0'],
            'total_ttc' => ['required', 'numeric', 'min:0'],
            'paid' => ['nullable', 'numeric', 'min:0'],

            'issued_at' => ['nullable', 'date'],
            'due_date' => ['nullable', 'date'],
            'paid_at' => ['nullable', 'date'],

            'notes' => ['nullable', 'string', 'max:5000'],
        ];
    }
}