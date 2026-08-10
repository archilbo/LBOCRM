<?php

namespace App\Policies;

use App\Models\FinancePaymentPromise;
use App\Models\User;
use App\Policies\Concerns\HandlesFinanceAuthorization;

class FinancePaymentPromisePolicy
{
    use HandlesFinanceAuthorization;

    public function create(User $user): bool { return $this->allowed($user, 'finance.promises.manage'); }
    public function update(User $user, FinancePaymentPromise $promise): bool { return $this->sameScope($user, $promise) && $this->allowed($user, 'finance.promises.manage'); }
}
