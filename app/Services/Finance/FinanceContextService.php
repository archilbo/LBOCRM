<?php

namespace App\Services\Finance;

use App\Models\Company;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class FinanceContextService
{
    public function payload(User $user): array
    {
        if (! $user->company_id) {
            throw new AccessDeniedHttpException('Aucune societe finance n est affectee a cet utilisateur.');
        }

        return ['company_id' => $user->company_id, 'branch_id' => $user->branch_id];
    }

    public function apply(Builder $query, User $user): Builder
    {
        $query->where($query->qualifyColumn('company_id'), $user->company_id);

        if ($user->branch_id) {
            $query->where($query->qualifyColumn('branch_id'), $user->branch_id);
        }

        return $query;
    }

    public function company(User $user): Company
    {
        return Company::query()->findOrFail($this->payload($user)['company_id']);
    }
}
