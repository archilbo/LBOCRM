<?php

namespace App\Policies;

use App\Models\FinancePaymentScheduleItem;
use App\Models\User;
use App\Policies\Concerns\HandlesFinanceAuthorization;

class FinancePaymentScheduleItemPolicy
{
    use HandlesFinanceAuthorization;

    public function create(User $user): bool { return $this->allowed($user, 'finance.schedules.manage'); }
    public function update(User $user, FinancePaymentScheduleItem $item): bool { return $this->sameScope($user, $item) && $this->allowed($user, 'finance.schedules.manage'); }
}
