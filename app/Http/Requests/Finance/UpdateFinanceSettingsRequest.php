<?php

namespace App\Http\Requests\Finance;

use Illuminate\Foundation\Http\FormRequest;

class UpdateFinanceSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        if (!$user) {
            return false;
        }

        if (method_exists($user, 'can')) {
            return $user->can('manage finance') || $user->can('manage users') || $user->hasRole('admin');
        }

        return true;
    }

    public function rules(): array
    {
        return [
            'finance.default_tva_rate' => ['required', 'numeric', 'min:0', 'max:100'],
            'finance.default_currency' => ['required', 'string', 'max:10'],
            'finance.default_payment_terms_days' => ['required', 'integer', 'min:0', 'max:365'],
            'finance.default_quote_validity_days' => ['required', 'integer', 'min:0', 'max:365'],
            'finance.default_unit_price_m2' => ['required', 'numeric', 'min:0'],
            'finance.default_architect_rate' => ['required', 'numeric', 'min:0', 'max:100'],

            'company.company_name' => ['nullable', 'string', 'max:255'],
            'company.company_address' => ['nullable', 'string', 'max:1000'],
            'company.company_phone' => ['nullable', 'string', 'max:100'],
            'company.company_email' => ['nullable', 'email', 'max:255'],
            'company.company_ice' => ['nullable', 'string', 'max:100'],
            'company.company_tva' => ['nullable', 'string', 'max:100'],
            'company.company_patente' => ['nullable', 'string', 'max:100'],
            'company.company_cnss' => ['nullable', 'string', 'max:100'],
            'company.company_logo_path' => ['nullable', 'string', 'max:1000'],

            'bank.bank_name' => ['nullable', 'string', 'max:255'],
            'bank.bank_rib' => ['nullable', 'string', 'max:255'],
        ];
    }
}