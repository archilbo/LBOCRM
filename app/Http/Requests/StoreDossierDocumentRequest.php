<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDossierDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'dossier_id' => ['required', 'exists:dossiers,id'],
            'document_template_id' => ['nullable', 'exists:document_templates,id'],
            'status' => ['nullable', 'string', 'max:50'],
            'notes' => ['nullable', 'string', 'max:5000'],
            'file' => ['nullable', 'file', 'max:20480'],
            'return_to' => ['nullable', 'string', 'max:2000', 'starts_with:/'],
        ];
    }
}
