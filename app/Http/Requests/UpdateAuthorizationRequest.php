<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAuthorizationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $authorizationId = $this->route('authorization')?->id ?? $this->route('authorization');

        return [
            'dossier_id' => [
                'required',
                'exists:dossiers,id',
                Rule::unique('authorizations', 'dossier_id')->ignore($authorizationId),
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