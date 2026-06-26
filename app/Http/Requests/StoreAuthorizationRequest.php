<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAuthorizationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'dossier_id' => [
                'required',
                'exists:dossiers,id',
                Rule::unique('authorizations', 'dossier_id'),
            ],
            'authorization_number' => ['nullable', 'string', 'max:120'],
            'submission_number' => ['nullable', 'string', 'max:120'],
            'authority_name' => ['nullable', 'string', 'max:190'],
            'authority_type' => ['nullable', 'string', 'max:120'],
            'status' => ['nullable', 'string', 'max:50'],
            'submitted_at' => ['nullable', 'date'],
            'approved_at' => ['nullable', 'date'],
            'received_at' => ['nullable', 'date'],
            'observations_text' => ['nullable', 'string', 'max:5000'],
            'notes' => ['nullable', 'string', 'max:5000'],
        ];
    }
}