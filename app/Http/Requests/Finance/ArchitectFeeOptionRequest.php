<?php

namespace App\Http\Requests\Finance;

use App\Services\PermissionRegistry;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ArchitectFeeOptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null
            && app(PermissionRegistry::class)->allows($this->user(), 'finance.settings.update');
    }

    protected function prepareForValidation(): void
    {
        foreach (['percentage_rate', 'flat_amount'] as $field) {
            if ($this->has($field)) {
                $value = $this->input($field);
                $this->merge([$field => is_string($value) ? str_replace(["\xc2\xa0", ' ', ','], ['', '', '.'], $value) : $value]);
            }
        }
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'calculation_type' => ['required', Rule::in(['percentage', 'forfait'])],
            'percentage_rate' => ['nullable', 'numeric', 'min:0', 'max:100', 'required_if:calculation_type,percentage'],
            'contract_template_key' => ['nullable', 'string', 'max:50'],
            'is_default' => ['sometimes', 'boolean'],
            'is_active' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
        ];
    }
}
