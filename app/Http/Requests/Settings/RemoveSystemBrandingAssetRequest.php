<?php

namespace App\Http\Requests\Settings;

use App\Services\PermissionRegistry;
use App\Services\SystemBrandingAssetService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RemoveSystemBrandingAssetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null
            && app(PermissionRegistry::class)->allows($this->user(), 'system.branding.update');
    }

    public function rules(): array
    {
        return [
            'asset_type' => ['required', 'string', Rule::in(array_keys(SystemBrandingAssetService::ASSET_TYPES))],
        ];
    }

    public function messages(): array
    {
        return [
            'asset_type.required' => "Le type d'image de marque est requis.",
            'asset_type.in' => "Le type d'image de marque est invalide.",
        ];
    }
}
