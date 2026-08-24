<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\HasIntermediaryPayloadRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDossierRequest extends FormRequest
{
    use HasIntermediaryPayloadRule;

    public function authorize(): bool
    {
        return true;
    }

    /**
     * Phase A compatibility: the legacy single client_id payload is
     * normalized into the many-to-many client_ids + primary_client_id shape.
     * Tenant-scoped resolution happens in DossierClientService (foreign ids
     * never succeed).
     */
    protected function prepareForValidation(): void
    {
        if (! $this->has('client_ids') && $this->filled('client_id')) {
            $clientId = (int) $this->input('client_id');
            $this->merge([
                'client_ids' => [$clientId],
                'primary_client_id' => $clientId,
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'client_ids' => ['required', 'array', 'min:1', 'max:100'],
            'client_ids.*' => ['required', 'integer', 'distinct'],
            'primary_client_id' => ['required', 'integer', Rule::in((array) $this->input('client_ids', []))],
            'client_id' => ['sometimes', 'nullable', 'integer', 'exists:clients,id'],
            'intermediary_id' => $this->intermediaryPayloadRule(),
            'city_id' => ['sometimes', 'nullable', 'integer', 'exists:cities,id'],
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