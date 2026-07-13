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
        return [
            'front_image' => ['required', 'image', 'mimes:jpg,jpeg,png', 'max:10240'],
            'back_image' => ['required', 'image', 'mimes:jpg,jpeg,png', 'max:10240'],
        ];
    }

    public function messages(): array
    {
        return [
            'front_image.required' => 'The front image of the CIN is required.',
            'front_image.image' => 'The front image must be an image file.',
            'front_image.mimes' => 'The front image must be a JPG or PNG file.',
            'front_image.max' => 'The front image must not exceed 10 MB.',
            'back_image.required' => 'The back image of the CIN is required.',
            'back_image.image' => 'The back image must be an image file.',
            'back_image.mimes' => 'The back image must be a JPG or PNG file.',
            'back_image.max' => 'The back image must not exceed 10 MB.',
        ];
    }
}
