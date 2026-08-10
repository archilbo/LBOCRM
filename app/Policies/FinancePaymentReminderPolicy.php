<?php

namespace App\Policies;

use App\Models\FinancePaymentReminder;
use App\Models\User;
use App\Policies\Concerns\HandlesFinanceAuthorization;

class FinancePaymentReminderPolicy
{
    use HandlesFinanceAuthorization;

    public function viewAny(User $user): bool { return $this->allowed($user, 'finance.view'); }
    public function view(User $user, FinancePaymentReminder $reminder): bool { return $this->sameScope($user, $reminder) && $this->allowed($user, 'finance.view'); }
    public function create(User $user): bool { return $this->allowed($user, 'finance.reminders.manage'); }
    public function update(User $user, FinancePaymentReminder $reminder): bool { return $this->sameScope($user, $reminder) && $this->allowed($user, 'finance.reminders.manage'); }
    public function delete(User $user, FinancePaymentReminder $reminder): bool { return $this->sameScope($user, $reminder) && $this->allowed($user, 'finance.reminders.manage'); }
}
