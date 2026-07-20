<?php

namespace App\Policies;

use App\Models\Expense;
use App\Models\User;
use App\Policies\Concerns\HandlesFinanceAuthorization;

class ExpensePolicy
{
    use HandlesFinanceAuthorization;

    public function viewAny(User $user): bool { return $this->allowed($user, 'finance.expenses.view'); }
    public function view(User $user, Expense $expense): bool { return $this->sameScope($user, $expense) && $this->allowed($user, 'finance.expenses.view'); }
    public function create(User $user): bool { return $this->allowed($user, 'finance.expenses.create'); }
    public function update(User $user, Expense $expense): bool { return $this->sameScope($user, $expense) && $this->allowed($user, 'finance.expenses.update'); }
    public function delete(User $user, Expense $expense): bool { return $this->sameScope($user, $expense) && $this->allowed($user, 'finance.expenses.delete'); }
}
