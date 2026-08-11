<?php

namespace App\Http\Requests\Concerns;

use App\Enums\ClientStatus;
use Carbon\CarbonImmutable;
use Illuminate\Validation\Rule;

trait HasClientPayloadRules
{
    protected function clientPayloadRules(
        ?int $clientId = null,
        bool $requirePersonalCniExpiry = false,
    ): array
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
        $iceRule = Rule::unique('clients', 'ice');

        if ($clientId) {
            $cinRule->ignore($clientId);
            $iceRule->ignore($clientId);
        }

        return [
            'client_type' => ['nullable', Rule::in(['person', 'company'])],
            'intermediary_id' => ['nullable', 'integer', $intermediaryRule],
            'civility' => ['nullable', 'string', 'max:30'],
            'first_name' => ['nullable', 'string', 'max:120'],
            'last_name' => ['nullable', 'string', 'max:120'],
            'cin' => ['nullable', 'string', 'max:80', $cinRule],
            'company_name' => ['nullable', 'string', 'max:190', 'required_if:client_type,company'],
            'ice' => ['nullable', 'string', 'max:40', 'required_if:client_type,company', $iceRule],
            'managers' => ['nullable', 'array', 'max:20', 'required_if:client_type,company'],
            'managers.*' => ['required_with:managers', 'string', 'max:190', 'distinct'],
            'phone' => ['nullable', 'string', 'max:80'],
            'email' => ['nullable', 'email', 'max:190'],
            'address' => ['nullable', 'string', 'max:2000'],
            'father_name' => ['nullable', 'string', 'max:190'],
            'mother_name' => ['nullable', 'string', 'max:190'],
            'cni_expiration_date' => array_filter([
                'nullable',
                'date_format:Y-m-d',
                $requirePersonalCniExpiry
                    ? Rule::requiredIf(fn (): bool => $this->input('client_type', 'person') !== 'company')
                    : null,
                $requirePersonalCniExpiry
                    ? 'after:'.CarbonImmutable::today()->addMonths(3)->toDateString()
                    : null,
            ]),
            'status' => ['nullable', Rule::enum(ClientStatus::class)],
            'notes' => ['nullable', 'string', 'max:5000'],
            'return_to' => ['nullable', 'string', 'max:2048', 'starts_with:/'],
        ];
    }
}
