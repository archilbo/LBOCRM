<?php

namespace App\Http\Requests\Finance;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateExpenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'dossier_id' => ['nullable', 'exists:dossiers,id'],
            'category' => ['sometimes', 'required', Rule::in(['administrative', 'travel', 'supplies', 'equipment', 'utilities', 'professional_fees', 'taxes', 'other'])],
            'vendor' => ['nullable', 'string', 'max:255'],
            'amount' => ['sometimes', 'required', 'numeric', 'min:0'],
            'currency' => ['nullable', 'string', 'max:10'],
            'expense_date' => ['sometimes', 'required', 'date'],
            'payment_method' => ['nullable', 'string', 'max:50'],
            'notes' => ['nullable', 'string'],
            'receipt_path' => ['nullable', 'string', 'max:255'],
        ];
    }
}
