<?php

namespace App\Http\Requests\Finance;

use App\Enums\PaymentMethod;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreExpenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'dossier_id' => ['nullable', 'exists:dossiers,id'],
            'category' => ['required', Rule::in(['administrative', 'travel', 'supplies', 'equipment', 'utilities', 'professional_fees', 'taxes', 'other'])],
            'vendor' => ['nullable', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0'],
            'currency' => ['nullable', 'string', 'max:10'],
            'expense_date' => ['required', 'date'],
            'payment_method' => ['nullable', Rule::enum(PaymentMethod::class)],
            'notes' => ['nullable', 'string'],
            'receipt_path' => ['nullable', 'string', 'max:255'],
        ];
    }
}
