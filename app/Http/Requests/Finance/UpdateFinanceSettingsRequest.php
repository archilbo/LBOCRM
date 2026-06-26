<?php

namespace App\Http\Requests\Finance;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class UpdateFinanceSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) Auth::user();
    }

    public function rules(): array
    {
        return [
            'company_name' => 'nullable|string|max:255',
            'company_address' => 'nullable|string',
            'company_phone' => 'nullable|string|max:50',
            'company_email' => 'nullable|email|max:255',
            'company_ice' => 'nullable|string|max:50',
            'company_cin' => 'nullable|string|max:50',
            'quote_prefix' => 'nullable|string|max:20',
            'invoice_prefix' => 'nullable|string|max:20',
            'receipt_prefix' => 'nullable|string|max:20',
            'payment_prefix' => 'nullable|string|max:20',
            'tva_rate' => 'nullable|numeric|min:0|max:100',
            'currency' => 'nullable|string|max:10',
            'payment_terms' => 'nullable|string|max:500',
            'payment_days' => 'nullable|integer|min:0|max:365',
            'bank_name' => 'nullable|string|max:255',
            'bank_rib' => 'nullable|string|max:100',
            'bank_iban' => 'nullable|string|max:100',
            'bank_bic' => 'nullable|string|max:50',
        ];
    }
}
