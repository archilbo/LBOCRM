<?php

namespace App\Http\Requests\Settings;

use App\Services\PermissionRegistry;
use Illuminate\Foundation\Http\FormRequest;

class UpdateSystemIdentityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null
            && app(PermissionRegistry::class)->allows($this->user(), 'system.settings.update');
    }

    protected function prepareForValidation(): void
    {
        $description = $this->input('description');

        $this->merge([
            'app_name' => trim((string) $this->input('app_name')),
            'short_name' => trim((string) $this->input('short_name')),
            'description' => $description === null || trim((string) $description) === ''
                ? null
                : trim((string) $description),
        ]);
    }

    public function rules(): array
    {
        return [
            'app_name' => ['required', 'string', 'min:2', 'max:80'],
            'short_name' => ['required', 'string', 'min:1', 'max:30'],
            'description' => ['nullable', 'string', 'max:180'],
        ];
    }

    public function messages(): array
    {
        return [
            'app_name.required' => "Le nom de l'application est requis.",
            'app_name.min' => "Le nom de l'application doit contenir au moins 2 caractères.",
            'app_name.max' => "Le nom de l'application ne peut pas dépasser 80 caractères.",
            'short_name.required' => 'Le nom court est requis.',
            'short_name.max' => 'Le nom court ne peut pas dépasser 30 caractères.',
            'description.max' => 'La description ne peut pas dépasser 180 caractères.',
        ];
    }
}
