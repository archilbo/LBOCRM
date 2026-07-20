<?php

namespace App\Policies;

use App\Models\Payment;
use App\Models\User;
use App\Policies\Concerns\HandlesFinanceAuthorization;

class PaymentPolicy
{
    use HandlesFinanceAuthorization;

    public function viewAny(User $user): bool { return $this->allowed($user, 'finance.payments.view'); }
    public function view(User $user, Payment $payment): bool { return $this->sameScope($user, $payment) && $this->allowed($user, 'finance.payments.view'); }
    public function create(User $user): bool { return $this->allowed($user, 'finance.payments.create'); }
    public function update(User $user, Payment $payment): bool { return $this->sameScope($user, $payment) && $this->allowed($user, 'finance.payments.update'); }
    public function delete(User $user, Payment $payment): bool { return $this->sameScope($user, $payment) && $this->allowed($user, 'finance.payments.reverse'); }
}
