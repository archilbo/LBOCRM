<?php

namespace App\Http\Requests\Finance;

use Illuminate\Foundation\Http\FormRequest;

class CancelIntermediaryPaymentRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array { return ['cancellation_reason' => ['required', 'string', 'min:3', 'max:1000']]; }
}
