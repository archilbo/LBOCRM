<?php

namespace App\Services;

use App\Models\Company;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class CompanyContext
{
    public function company(?User $user): Company
    {
        return Company::query()->findOrFail($this->id($user));
    }

    public function id(?User $user): int
    {
        $companyId = $user?->company_id;

        if (! $companyId) {
            throw new AccessDeniedHttpException('Aucune société associée à cet utilisateur.');
        }

        return $companyId;
    }

    public function payload(?User $user): array
    {
        return [
            'company_id' => $this->id($user),
            'branch_id' => $user->branch_id,
        ];
    }

    /**
     * Apply the standard tenant boundary to a model query.
     * Users assigned to a branch are limited to that branch; company users can
     * work across the company's branches.
     */
    public function applyTo(Builder $query, ?User $user): Builder
    {
        $table = $query->getModel()->getTable();

        return $query
            ->where("{$table}.company_id", $this->id($user))
            ->when($user?->branch_id, fn (Builder $builder, int $branchId) => $builder->where("{$table}.branch_id", $branchId));
    }

    public function owns(?User $user, Model $model): bool
    {
        if ((int) $model->getAttribute('company_id') !== $this->id($user)) {
            return false;
        }

        return ! $user?->branch_id || (int) $model->getAttribute('branch_id') === (int) $user->branch_id;
    }
}
