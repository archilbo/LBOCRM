<?php

namespace App\Services\Dossiers;

use App\Models\Dossier;
use App\Models\User;
use App\Services\CompanyContext;

final class DossierLocationOptionsService
{
    public function __construct(private readonly CompanyContext $companyContext)
    {
    }

    /**
     * @return array{provinces: list<string>, communes: list<string>}
     */
    public function forUser(User $user): array
    {
        $locations = $this->companyContext->applyTo(Dossier::query(), $user)
            ->select(['province', 'commune'])
            ->where(function ($query): void {
                $query
                    ->whereNotNull('province')
                    ->where('province', '<>', '')
                    ->orWhereNotNull('commune')
                    ->where('commune', '<>', '');
            })
            ->get();

        return [
            'provinces' => $locations
                ->pluck('province')
                ->filter(fn ($value): bool => is_string($value) && trim($value) !== '')
                ->map(fn (string $value): string => trim($value))
                ->unique(fn (string $value): string => mb_strtolower($value))
                ->sort(SORT_NATURAL | SORT_FLAG_CASE)
                ->values()
                ->all(),
            'communes' => $locations
                ->pluck('commune')
                ->filter(fn ($value): bool => is_string($value) && trim($value) !== '')
                ->map(fn (string $value): string => trim($value))
                ->unique(fn (string $value): string => mb_strtolower($value))
                ->sort(SORT_NATURAL | SORT_FLAG_CASE)
                ->values()
                ->all(),
        ];
    }
}
