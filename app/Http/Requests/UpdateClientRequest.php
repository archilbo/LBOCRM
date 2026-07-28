<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\HasClientPayloadRules;
use Illuminate\Foundation\Http\FormRequest;

class UpdateClientRequest extends FormRequest
{
    use HasClientPayloadRules;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $clientId = $this->route('client')?->id ?? $this->route('client');

        return $this->clientPayloadRules((int) $clientId);
    }
}
