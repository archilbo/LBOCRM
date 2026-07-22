<?php

namespace App\Services;

use App\Models\Company;
use App\Models\User;
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
}
