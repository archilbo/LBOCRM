<?php

namespace App\Http\Requests\Finance;

use App\Enums\PaymentMethod;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'finance_document_id' => ['nullable', 'exists:finance_documents,id'],
            'amount' => ['nullable', 'numeric', 'min:0.01'],
            'method' => ['nullable', Rule::enum(PaymentMethod::class)],
            'reference' => ['nullable', 'string', 'max:255'],
            'paid_at' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
            'receipt_items' => ['nullable', 'array', 'max:50'],
            'receipt_items.*.title' => ['required_with:receipt_items', 'string', 'max:255'],
            'receipt_items.*.description' => ['nullable', 'string', 'max:2000'],
            'receipt_items.*.quantity' => ['required_with:receipt_items', 'numeric', 'min:0.001', 'max:1000000'],
            'receipt_items.*.unit' => ['nullable', 'string', 'max:50'],
            'receipt_items.*.unit_price' => ['required_with:receipt_items', 'numeric', 'min:0', 'max:999999999.99'],
            'return_to' => ['nullable', 'string', 'max:2048', 'starts_with:/'],
        ];
    }
}
