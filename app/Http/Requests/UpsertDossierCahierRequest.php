<?php

namespace App\Http\Requests;

use App\Models\DossierCahier;
use Illuminate\Foundation\Http\FormRequest;

class UpsertDossierCahierRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    protected function prepareForValidation(): void
    {
        $this->merge(['cahier_number' => DossierCahier::normalizeNumber((string) $this->input('cahier_number', ''))]);
    }

    public function rules(): array
    {
        return [
            'cahier_number' => ['required', 'string', 'max:32', 'regex:/^\d+$/'],
            'received_at' => ['required', 'date'],
            'delivered_at' => ['nullable', 'date', 'after_or_equal:received_at'],
        ];
    }
}
