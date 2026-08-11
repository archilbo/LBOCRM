<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\HasClientPayloadRules;
use Illuminate\Foundation\Http\FormRequest;

class StoreClientRequest extends FormRequest
{
    use HasClientPayloadRules;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return $this->clientPayloadRules(requirePersonalCniExpiry: true);
    }

    public function messages(): array
    {
        return [
            'cni_expiration_date.required' => 'La date d’expiration de la CNI est obligatoire pour une personne.',
            'cni_expiration_date.after' => 'La date d’expiration de la CNI doit être supérieure à trois mois à compter d’aujourd’hui.',
        ];
    }
}
