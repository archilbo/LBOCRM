<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDossierRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'client_id' => ['required', 'exists:clients,id'],
            'city_id' => ['required', 'exists:cities,id'],
            'project_object' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'project_address' => ['nullable', 'string', 'max:2000'],
            'province' => ['nullable', 'string', 'max:120'],
            'commune' => ['nullable', 'string', 'max:120'],
            'land_title_number' => ['nullable', 'string', 'max:120'],
            'land_surface' => ['nullable', 'numeric', 'min:0'],
            'floor_area' => ['nullable', 'numeric', 'min:0'],
            'status' => ['nullable', 'string', 'max:50'],
            'workflow_step' => ['nullable', 'string', 'max:50'],
            'opened_at' => ['nullable', 'date'],
            'closed_at' => ['nullable', 'date'],
            'notes' => ['nullable', 'string', 'max:5000'],
            'return_to' => ['nullable', 'string', 'max:2000', 'starts_with:/'],
        ];
    }
}
