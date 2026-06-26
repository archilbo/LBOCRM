<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreContractRequest extends FormRequest
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
                Rule::unique('contracts', 'dossier_id'),
            ],
            'status' => ['nullable', 'string', 'max:50'],
            'surface' => ['nullable', 'numeric', 'min:0'],
            'price_per_square_meter' => ['nullable', 'numeric', 'min:0'],
            'fee_rate_percent' => ['nullable', 'numeric', 'in:0.5,2,0.50,2.00'],
            'notes' => ['nullable', 'string', 'max:5000'],
        ];
    }
}