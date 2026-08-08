<?php

namespace App\Http\Requests\Settings;

use App\Services\PermissionRegistry;
use Illuminate\Foundation\Http\FormRequest;

class UpdateSystemAppearanceColorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null
            && app(PermissionRegistry::class)->allows($this->user(), 'system.settings.update');
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'accent_color' => strtoupper(trim((string) $this->input('accent_color'))),
        ]);
    }

    public function rules(): array
    {
        return [
            'accent_color' => ['required', 'string', 'size:7', 'regex:/^#[0-9A-F]{6}$/'],
        ];
    }

    public function messages(): array
    {
        return [
            'accent_color.required' => 'La couleur de marque est requise.',
            'accent_color.size' => 'La couleur de marque doit être un code hexadécimal à 6 chiffres (ex. #C9A227).',
            'accent_color.regex' => 'La couleur de marque doit être un code hexadécimal à 6 chiffres (ex. #C9A227).',
        ];
    }
}
