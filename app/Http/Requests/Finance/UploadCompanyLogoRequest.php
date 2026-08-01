<?php

namespace App\Http\Requests\Finance;

use Illuminate\Foundation\Http\FormRequest;

class UploadCompanyLogoRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        if (!$user) {
            return false;
        }

        if (method_exists($user, 'can')) {
            return $user->can('finance.settings.update')
                || $user->can('manage finance')
                || $user->can('manage users')
                || $user->hasRole('admin');
        }

        return true;
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
