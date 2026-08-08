<?php

namespace App\Http\Requests\Finance;

use App\Enums\FinanceDocumentType;
use App\Http\Requests\Concerns\ValidatesTemplatePlaceholders;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDocumentTemplateRequest extends FormRequest
{
    use ValidatesTemplatePlaceholders;

    public function authorize(): bool
    {
        return true;
    }

    public function withValidator(\Illuminate\Validation\Validator $validator): void
    {
        $this->validateTemplatePlaceholders($validator);
    }

    public function rules(): array
    {
        $id = $this->route('documentTemplate')?->id;

        return [
            'type' => ['nullable', Rule::enum(FinanceDocumentType::class)],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('finance_templates', 'slug')->ignore($id)],
            'paper_size' => ['nullable', Rule::in(['A4', 'A5', 'Letter'])],
            'orientation' => ['nullable', Rule::in(['portrait', 'landscape'])],
            'header_html' => ['nullable', 'string', $this->safeHtmlRule()],
            'body_html' => ['nullable', 'string', $this->safeHtmlRule()],
            'footer_html' => ['nullable', 'string', $this->safeHtmlRule()],
            'css' => ['nullable', 'string', $this->safeHtmlRule()],
            'logo_path' => ['nullable', 'string', 'max:255', $this->safeHtmlRule()],
            'settings' => ['nullable', 'array'],
            'is_default' => ['nullable', 'boolean'],
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
