<?php

namespace App\Services;

use App\Models\ArchitectFeeOption;
use App\Services\Contracts\ContractTemplateNamingService;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ArchitectFeeOptionService
{
    public function save(array $attributes, ?ArchitectFeeOption $option = null): ArchitectFeeOption
    {
        return DB::transaction(function () use ($attributes, $option) {
            $defaultRequested = (bool) ($attributes['is_default'] ?? $option?->is_default ?? false);
            $active = (bool) ($attributes['is_active'] ?? true);

            if ($option?->is_default && ! $active) {
                throw ValidationException::withMessages([
                    'is_active' => 'Ce taux est actuellement défini par défaut. Sélectionnez d’abord un autre taux par défaut.',
                ]);
            }

            if ($defaultRequested && ! $active) {
                throw ValidationException::withMessages([
                    'is_default' => 'Le taux par défaut doit être actif.',
                ]);
            }

            if ($defaultRequested) {
                ArchitectFeeOption::query()
                    ->lockForUpdate()
                    ->where('is_default', true)
                    ->update(['is_default' => false]);
            }

            $attributes['is_default'] = $defaultRequested;
            $attributes['is_active'] = $active;
            $attributes['percentage_rate'] = $attributes['calculation_type'] === 'percentage'
                ? $attributes['percentage_rate']
                : null;
            $attributes['flat_amount'] = null;
            $attributes['contract_template_key'] = app(ContractTemplateNamingService::class)->keyFor(
                $attributes['calculation_type'],
                $attributes['percentage_rate'],
            );

            if ($active && $attributes['calculation_type'] === 'percentage') {
                $duplicate = ArchitectFeeOption::query()
                    ->lockForUpdate()
                    ->where('is_active', true)
                    ->where('calculation_type', 'percentage')
                    ->where('percentage_rate', $attributes['percentage_rate'])
                    ->when($option, fn ($query) => $query->whereKeyNot($option->id))
                    ->exists();

                if ($duplicate) {
                    throw ValidationException::withMessages([
                        'percentage_rate' => 'Un taux actif avec cette valeur existe déjà.',
                    ]);
                }
            }

            return $option ? tap($option)->update($attributes) : ArchitectFeeOption::create($attributes);
        });
    }
}
