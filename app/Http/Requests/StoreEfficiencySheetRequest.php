<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Draft creation for the fiche efficacité.
 *
 * Only the two manual fields are accepted from the client. Automatic values
 * (project/client/entreprise) are never submitted by the drawer and stay
 * read from trusted sources at generation time.
 */
class StoreEfficiencySheetRequest extends FormRequest
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
