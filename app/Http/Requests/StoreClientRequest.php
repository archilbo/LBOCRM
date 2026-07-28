<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\HasClientPayloadRules;
use Illuminate\Foundation\Http\FormRequest;

class StoreClientRequest extends FormRequest
{
    use HasClientPayloadRules;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return $this->clientPayloadRules();
    }
}
