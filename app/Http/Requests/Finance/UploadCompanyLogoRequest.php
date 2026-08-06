<?php

namespace App\Http\Requests\Finance;

use App\Services\PermissionRegistry;
use Illuminate\Foundation\Http\FormRequest;

class UploadCompanyLogoRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        if (! $user) {
            return false;
        }

        // The registry resolves the legacy `manage finance` alias and the
        // protected admin bypass; no raw Spatie/role fallbacks here.
        return app(PermissionRegistry::class)->allows($user, 'finance.settings.update');
    }

    public function rules(): array
    {
        return [
            'logo' => [
                'required',
                'file',
                'mimes:png,jpg,jpeg,webp,svg',
                'max:4096',
            ],
        ];
    }
}
