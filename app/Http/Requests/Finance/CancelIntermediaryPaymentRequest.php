<?php

namespace App\Http\Requests\Finance;

use Illuminate\Foundation\Http\FormRequest;

class CancelIntermediaryPaymentRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array { return ['cancellation_reason' => ['nullable', 'string', 'max:1000']]; }
}
