<?php

namespace App\Http\Requests\Concerns;

use App\Enums\ClientStatus;
use Illuminate\Validation\Rule;

trait HasClientPayloadRules
{
    protected function clientPayloadRules(?int $clientId = null): array
    {
        $intermediaryRule = Rule::exists('intermediaries', 'id')
            ->where('company_id', $this->user()?->company_id)
            ->where('is_active', true);

        if ($branchId = $this->user()?->branch_id) {
            $intermediaryRule->where(fn ($query) => $query
                ->where('branch_id', $branchId)
                ->orWhereNull('branch_id'));
        }

        $cinRule = Rule::unique('clients', 'cin');

        if ($clientId) {
            $cinRule->ignore($clientId);
        }

        return [
            'intermediary_id' => ['nullable', 'integer', $intermediaryRule],
            'civility' => ['nullable', 'string', 'max:30'],
            'first_name' => ['nullable', 'string', 'max:120'],
            'last_name' => ['nullable', 'string', 'max:120'],
            'cin' => ['nullable', 'string', 'max:80', $cinRule],
            'phone' => ['nullable', 'string', 'max:80'],
            'email' => ['nullable', 'email', 'max:190'],
            'address' => ['nullable', 'string', 'max:2000'],
            'father_name' => ['nullable', 'string', 'max:190'],
            'mother_name' => ['nullable', 'string', 'max:190'],
            'cni_expiration_date' => ['nullable', 'date_format:Y-m-d'],
            'status' => ['nullable', Rule::enum(ClientStatus::class)],
            'notes' => ['nullable', 'string', 'max:5000'],
            'return_to' => ['nullable', 'string', 'max:2048', 'starts_with:/'],
        ];
    }
}
