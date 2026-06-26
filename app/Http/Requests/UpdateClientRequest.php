<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateClientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $clientId = $this->route('client')?->id ?? $this->route('client');

        return [
            'intermediary_id' => ['nullable', 'exists:intermediaries,id'],
            'civility' => ['nullable', 'string', 'max:30'],
            'first_name' => ['nullable', 'string', 'max:120'],
            'last_name' => ['nullable', 'string', 'max:120'],
            'cin' => ['nullable', 'string', 'max:80', Rule::unique('clients', 'cin')->ignore($clientId)],
            'phone' => ['nullable', 'string', 'max:80'],
            'email' => ['nullable', 'email', 'max:190'],
            'address' => ['nullable', 'string', 'max:2000'],
            'father_name' => ['nullable', 'string', 'max:190'],
            'mother_name' => ['nullable', 'string', 'max:190'],
            'cni_expiration_date' => ['nullable', 'date'],
            'status' => ['nullable', 'string', 'max:50'],
            'notes' => ['nullable', 'string', 'max:5000'],
        ];
    }
}