<?php

namespace App\Http\Requests\Concerns;

use Illuminate\Validation\Rule;

trait HasIntermediaryPayloadRule
{
    protected function intermediaryPayloadRule(): array
    {
        $rule = Rule::exists('intermediaries', 'id')
            ->where('company_id', $this->user()?->company_id)
            ->where('is_active', true);

        if ($branchId = $this->user()?->branch_id) {
            $rule->where(fn ($query) => $query
                ->where('branch_id', $branchId)
                ->orWhereNull('branch_id'));
        }

        return ['nullable', 'integer', $rule];
    }
}
