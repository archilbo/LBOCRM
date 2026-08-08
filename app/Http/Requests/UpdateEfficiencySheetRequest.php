<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Draft update for the fiche efficacité.
 *
 * Same contract as the store request: only the manual fields are editable;
 * automatic values remain backend-authoritative.
 */
class UpdateEfficiencySheetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'usage_du_batiment' => ['required', 'string', 'max:255'],
            'owner_name' => ['required', 'string', 'max:255'],
        ];
    }
}
