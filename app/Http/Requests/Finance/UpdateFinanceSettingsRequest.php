<?php

namespace App\Http\Requests\Finance;

use App\Services\PermissionRegistry;
use Illuminate\Foundation\Http\FormRequest;

class UpdateFinanceSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        if (! $user) {
            return false;
        }

        // The registry resolves the legacy `manage finance` alias and the
        // protected admin bypass; no raw Spatie/role fallbacks here.
        return app(PermissionRegistry::class)->allows($user, 'finance.settings.update');
    }

    public function rules(): array
    {
        return [
            'finance.default_tva_rate' => ['required', 'numeric', 'min:0', 'max:100'],
            'finance.default_currency' => ['required', 'string', 'size:3', 'regex:/^[A-Z]{3}$/'],
            'finance.default_payment_terms_days' => ['required', 'integer', 'min:0', 'max:365'],
            'finance.default_quote_validity_days' => ['required', 'integer', 'min:0', 'max:365'],
            'finance.default_unit_price_m2' => ['required', 'numeric', 'min:0'],
            'finance.default_architect_rate' => ['required', 'numeric', 'min:0', 'max:100'],

            'company.company_name' => ['nullable', 'string', 'max:255'],
            'company.company_address' => ['nullable', 'string', 'max:1000'],
            'company.company_phone' => ['nullable', 'string', 'regex:/^\+?[0-9][0-9\s().-]{6,24}$/', 'max:25'],
            'company.company_email' => ['nullable', 'email', 'max:255'],
            'company.company_ice' => ['nullable', 'string', 'max:100'],
            'company.company_tva' => ['nullable', 'string', 'max:100'],
            'company.company_patente' => ['nullable', 'string', 'max:100'],
            'company.company_cnss' => ['nullable', 'string', 'max:100'],
            'bank.bank_name' => ['nullable', 'string', 'max:255'],
            'bank.bank_rib' => ['nullable', 'string', 'regex:/^[A-Za-z0-9][A-Za-z0-9\s-]{5,254}$/', 'max:255'],
        ];
    }
}
