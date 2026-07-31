<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ScanCinRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $imageRules = [
            'required',
            'file',
            'image',
            'mimetypes:image/jpeg,image/png,image/webp',
            'mimes:jpg,jpeg,png,webp',
            'max:15360',
        ];

        return [
            'front_image' => $imageRules,
            'back_image' => $imageRules,
        ];
    }

    public function messages(): array
    {
        return [
            'front_image.required' => 'L\'image recto de la CNI est obligatoire.',
            'front_image.image' => 'Le recto doit être une image valide.',
            'front_image.mimetypes' => 'Le recto doit être au format JPEG, PNG ou WEBP.',
            'front_image.mimes' => 'Le recto doit être au format JPEG, PNG ou WEBP.',
            'front_image.max' => 'Le recto ne doit pas dépasser 15 Mo.',
            'back_image.required' => 'L\'image verso de la CNI est obligatoire.',
            'back_image.image' => 'Le verso doit être une image valide.',
            'back_image.mimetypes' => 'Le verso doit être au format JPEG, PNG ou WEBP.',
            'back_image.mimes' => 'Le verso doit être au format JPEG, PNG ou WEBP.',
            'back_image.max' => 'Le verso ne doit pas dépasser 15 Mo.',
        ];
    }
}
