<?php

namespace App\Http\Requests\Finance;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreFinancePaymentReminderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', Rule::in(['before_due', 'on_due', 'after_due', 'custom'])],
            'remind_at' => ['required', 'date'],
            'note' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
