<?php

namespace App\Http\Requests\Chat;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;

class StoreMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'body' => ['nullable', 'string', 'max:10000', 'required_without:files'],
            'files' => ['nullable', 'array', 'max:'.config('chat.max_attachments', 10), 'required_without:body'],
            'files.*' => ['file', 'mimes:jpg,jpeg,png,webp,pdf,doc,docx,xls,xlsx,csv,zip', 'max:'.config('chat.max_attachment_kilobytes', 15360)],
            'images' => ['nullable', 'array', 'max:'.config('chat.max_attachments', 10)],
            'images.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:'.config('chat.max_attachment_kilobytes', 15360)],
            'reply_to_message_id' => ['nullable', 'integer', 'exists:messages,id'],
            'client_message_id' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'files.*.mimes' => 'Formats autorisés : images, PDF, Word et Excel.',
            'files.*.max' => 'Chaque fichier doit faire '.round(config('chat.max_attachment_kilobytes', 15360) / 1024).' Mo maximum.',
            'body.required_without' => 'Un message ou un fichier est obligatoire.',
            'files.required_without' => 'Un message ou un fichier est obligatoire.',
        ];
    }

    protected function failedValidation(Validator $validator): void
    {
        logger()->warning('Inbox message validation failed', [
            'user_id' => $this->user()?->id,
            'conversation_id' => $this->route('conversation')?->id,
            'fields' => array_keys($this->all()),
            'file_count' => count($this->file('files', [])),
            'errors' => $validator->errors()->toArray(),
        ]);

        parent::failedValidation($validator);
    }
}
