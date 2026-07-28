<?php

namespace App\Http\Requests\Finance;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateFinanceDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
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
            'return_to' => ['nullable', 'string', 'max:2048'],
            'items' => ['nullable', 'array', 'min:1'],
            'items.*.title' => ['nullable', 'string', 'max:255'],
            'items.*.description' => ['nullable', 'string'],
            'items.*.quantity' => ['nullable', 'numeric', 'min:0'],
            'items.*.unit' => ['nullable', 'string', 'max:50'],
            'items.*.unit_price' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
