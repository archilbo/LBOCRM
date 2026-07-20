<?php

namespace App\Policies;

use App\Models\FinanceTemplate;
use App\Models\User;
use App\Policies\Concerns\HandlesFinanceAuthorization;

class FinanceTemplatePolicy
{
    use HandlesFinanceAuthorization;

    public function viewAny(User $user): bool { return $this->allowed($user, 'finance.templates.view'); }
    public function view(User $user, FinanceTemplate $template): bool { return $this->sameScope($user, $template) && $this->allowed($user, 'finance.templates.view'); }
    public function create(User $user): bool { return $this->allowed($user, 'finance.templates.manage'); }
    public function update(User $user, FinanceTemplate $template): bool { return $this->sameScope($user, $template) && $this->allowed($user, 'finance.templates.manage'); }
    public function delete(User $user, FinanceTemplate $template): bool { return $this->update($user, $template); }
}
