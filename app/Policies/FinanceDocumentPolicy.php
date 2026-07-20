<?php

namespace App\Policies;

use App\Models\FinanceDocument;
use App\Models\User;
use App\Policies\Concerns\HandlesFinanceAuthorization;

class FinanceDocumentPolicy
{
    use HandlesFinanceAuthorization;

    public function viewAny(User $user): bool { return $this->allowed($user, 'finance.view'); }
    public function view(User $user, FinanceDocument $document): bool { return $this->sameScope($user, $document) && $this->allowed($user, 'finance.view'); }
    public function create(User $user): bool { return $this->allowed($user, 'finance.documents.create'); }
    public function update(User $user, FinanceDocument $document): bool { return $this->sameScope($user, $document) && $this->allowed($user, 'finance.documents.update'); }
    public function delete(User $user, FinanceDocument $document): bool { return $this->sameScope($user, $document) && $this->allowed($user, 'finance.documents.delete'); }
    public function issue(User $user, FinanceDocument $document): bool { return $this->sameScope($user, $document) && $this->allowed($user, 'finance.documents.issue'); }
    public function cancel(User $user, FinanceDocument $document): bool { return $this->sameScope($user, $document) && $this->allowed($user, 'finance.documents.cancel'); }
    public function convert(User $user, FinanceDocument $document): bool { return $this->sameScope($user, $document) && $this->allowed($user, 'finance.documents.create'); }
    public function download(User $user, FinanceDocument $document): bool { return $this->view($user, $document); }
}
