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
            'finance_document_id' => ['nullable', 'exists:finance_documents,id'],
            'client_id' => ['nullable', 'required_without:finance_document_id', 'exists:clients,id'],
            'dossier_id' => ['nullable', 'required_without:finance_document_id', 'exists:dossiers,id'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'method' => ['nullable', Rule::enum(PaymentMethod::class)],
            'reference' => ['nullable', 'string', 'max:255'],
            'paid_at' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
            'return_to' => ['nullable', 'string', 'max:2048', 'starts_with:/'],
        ];
    }
}
