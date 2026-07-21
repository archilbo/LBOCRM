<?php

namespace App\Http\Requests\Chat;

use Illuminate\Foundation\Http\FormRequest;

class StoreConversationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_ids' => ['required', 'array', 'min:1'],
            'user_ids.*' => [
                'integer',
                'distinct',
                \Illuminate\Validation\Rule::exists('users', 'id')->where(fn ($query) => $query
                    ->where('company_id', $this->user()?->company_id)
                    ->when($this->user()?->branch_id, fn ($scope) => $scope->where(fn ($branch) => $branch
                        ->whereNull('branch_id')->orWhere('branch_id', $this->user()->branch_id)))),
            ],
            'subject' => ['nullable', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:80'],
            'custom_category' => ['nullable', 'string', 'max:80'],
            'type' => ['required', 'in:direct,group'],
        ];
    }

    public function after(): array
    {
        return [function (\Illuminate\Validation\Validator $validator): void {
            $count = count($this->input('user_ids', []));
            if ($this->input('type') === 'direct' && $count !== 1) {
                $validator->errors()->add('user_ids', 'Une conversation directe doit contenir un seul destinataire.');
            }
            if ($this->input('type') === 'group' && $count < 2) {
                $validator->errors()->add('user_ids', 'Un groupe doit contenir au moins deux destinataires.');
            }
        }];
    }
}
