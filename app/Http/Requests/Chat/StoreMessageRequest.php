<?php

namespace App\Http\Requests\Chat;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'body' => ['nullable', 'string', 'max:10000'],
            'images' => ['nullable', 'array', 'max:10'],
            'images.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:8192'],
            'reply_to_message_id' => ['nullable', 'integer', 'exists:messages,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'images.*.image' => 'Each file must be a valid image.',
            'images.*.mimes' => 'Only JPG, JPEG, PNG, and WebP images are allowed.',
            'images.*.max' => 'Each image must be 8MB or smaller.',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if (! $this->filled('body') && ! $this->hasFile('images')) {
                $validator->errors()->add('body', 'Message text or at least one image is required.');
            }
        });
    }
}
