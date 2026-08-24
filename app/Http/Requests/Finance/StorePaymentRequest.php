<?php

namespace App\Http\Requests\Finance;

use App\Enums\PaymentMethod;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'payment_mode' => ['nullable', Rule::in(['invoice', 'negotiated'])],
            'finance_document_id' => [Rule::requiredIf(fn (): bool => $this->input('payment_mode') === 'invoice'), 'nullable', 'exists:finance_documents,id'],
            'client_id' => ['nullable', 'required_without:finance_document_id', 'exists:clients,id'],
            'dossier_id' => ['nullable', 'required_without:finance_document_id', 'exists:dossiers,id'],
            'dossier_negotiated_payment_line_id' => ['nullable', 'exists:dossier_negotiated_payment_lines,id'],
            'negotiated_line' => ['nullable', 'array'],
            'negotiated_line.designation' => [Rule::requiredIf(fn (): bool => $this->input('payment_mode') === 'negotiated' && ! $this->filled('dossier_negotiated_payment_line_id')), 'nullable', 'string', 'max:255'],
            'negotiated_line.negotiated_amount' => [Rule::requiredIf(fn (): bool => $this->input('payment_mode') === 'negotiated' && ! $this->filled('dossier_negotiated_payment_line_id')), 'nullable', 'numeric', 'min:0.01', 'max:999999999.99'],
            'negotiated_line.notes' => ['nullable', 'string', 'max:2000'],
            'amount' => ['required', 'numeric', 'min:0.01'],
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
