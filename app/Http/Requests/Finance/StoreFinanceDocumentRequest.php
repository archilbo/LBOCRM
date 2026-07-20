<?php

namespace App\Http\Requests\Finance;

use App\Enums\FinanceDocumentType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreFinanceDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', Rule::enum(FinanceDocumentType::class)],
            'client_id' => ['nullable', 'exists:clients,id'],
            'dossier_id' => ['nullable', 'exists:dossiers,id'],
            'source_document_id' => ['nullable', 'exists:finance_documents,id'],
            'issue_date' => ['nullable', 'date'],
            'due_date' => ['nullable', 'date'],
            'valid_until' => ['nullable', 'date'],
            'currency' => ['nullable', 'string', 'max:10'],
            'tva_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'discount_total' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
            'terms' => ['nullable', 'string'],
            'template_id' => ['nullable', 'exists:finance_templates,id'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.title' => ['nullable', 'string', 'max:255'],
            'items.*.description' => ['nullable', 'string'],
            'items.*.quantity' => ['required', 'numeric', 'min:0'],
            'items.*.unit' => ['nullable', 'string', 'max:50'],
            'items.*.unit_price' => ['required', 'numeric', 'min:0'],
        ];
    }
}
