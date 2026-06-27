<?php

namespace App\Http\Requests\Finance;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDocumentTemplateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', Rule::in(['quote', 'invoice', 'receipt'])],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:finance_templates,slug'],
            'paper_size' => ['nullable', Rule::in(['A4', 'A5', 'Letter'])],
            'orientation' => ['nullable', Rule::in(['portrait', 'landscape'])],
            'header_html' => ['nullable', 'string', $this->safeHtmlRule()],
            'body_html' => ['nullable', 'string', $this->safeHtmlRule()],
            'footer_html' => ['nullable', 'string', $this->safeHtmlRule()],
            'css' => ['nullable', 'string', $this->safeHtmlRule()],
            'logo_path' => ['nullable', 'string', 'max:255', $this->safeHtmlRule()],
            'settings' => ['nullable', 'array'],
            'is_default' => ['nullable', 'boolean'],
            'copy_from_id' => ['nullable', 'exists:finance_templates,id'],
        ];
    }

    private function safeHtmlRule(): \Closure
    {
        return function (string $attribute, mixed $value, \Closure $fail): void {
            $text = strtolower((string) $value);

            if (preg_match('/<\s*script\b/i', $text) || preg_match('/\son[a-z]+\s*=/i', $text)) {
                $fail('Les scripts et attributs JavaScript ne sont pas autorises.');
            }
        };
    }
}
