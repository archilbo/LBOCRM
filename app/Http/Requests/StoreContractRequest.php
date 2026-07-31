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

    /**
     * Normalize French-formatted decimal values before validation.
     *
     * Handles "1 500,50" → "1500.50" so that the 'numeric' rule
     * and subsequent (float) casts work correctly.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'forfait_ttc' => $this->normalizeDecimal($this->input('forfait_ttc')),
            'surface' => $this->normalizeDecimal($this->input('surface')),
            'price_per_square_meter' => $this->normalizeDecimal($this->input('price_per_square_meter')),
            'fee_rate_percent' => $this->normalizeDecimal($this->input('fee_rate_percent')),
        ]);
    }

    public function rules(): array
    {
        return [
            'dossier_id' => [
                'required',
                'exists:dossiers,id',
                Rule::unique('contracts', 'dossier_id'),
            ],
            'contract_number' => ['nullable', 'string', 'max:50', 'unique:contracts,contract_number'],
            'status' => ['nullable', 'string', 'max:50'],
            'surface' => ['nullable', 'numeric', 'min:0'],
            'price_per_square_meter' => ['nullable', 'numeric', 'min:0'],
            'calculation_mode' => ['nullable', 'string', Rule::in(['percentage', 'forfait'])],
            'fee_rate_percent' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'forfait_ttc' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:5000'],
            'return_to' => ['nullable', 'string', 'max:2000', 'starts_with:/'],
        ];
    }

    /**
     * Remove spaces (French thousands separator) and replace comma
     * with period so PHP's numeric functions work correctly.
     */
    private function normalizeDecimal(?string $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        return str_replace(["\xc2\xa0", ' ', ','], ['', '', '.'], $value);
    }
}
