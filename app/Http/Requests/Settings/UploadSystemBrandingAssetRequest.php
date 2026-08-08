<?php

namespace App\Http\Requests\Settings;

use App\Services\PermissionRegistry;
use App\Services\SystemBrandingAssetService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UploadSystemBrandingAssetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null
            && app(PermissionRegistry::class)->allows($this->user(), 'system.branding.update');
    }

    public function rules(): array
    {
        $type = $this->input('asset_type');

        $dimensions = in_array($type, ['logo_light', 'logo_dark'], true)
            ? 'min_width=32,min_height=32,max_width=4096,max_height=4096'
            : 'min_width=32,min_height=32,max_width=2048,max_height=2048';

        $mimes = $type === 'favicon' ? 'png,webp' : 'png,jpg,jpeg,webp';

        return [
            'asset_type' => ['required', 'string', Rule::in(array_keys(SystemBrandingAssetService::ASSET_TYPES))],
            'file' => ['required', 'file', 'image', "mimes:{$mimes}", 'max:2048', "dimensions:{$dimensions}"],
        ];
    }

    public function messages(): array
    {
        return [
            'asset_type.required' => "Le type d'image de marque est requis.",
            'asset_type.in' => "Le type d'image de marque est invalide.",
            'file.required' => 'Une image est requise.',
            'file.image' => 'Le fichier doit être une image.',
            'file.mimes' => 'Le fichier doit être au format PNG, JPEG ou WEBP.',
            'file.max' => "L'image ne peut pas dépasser 2 Mo.",
            'file.dimensions' => 'Les dimensions de l’image ne sont pas valides (voir les limites indiquées).',
        ];
    }
}
