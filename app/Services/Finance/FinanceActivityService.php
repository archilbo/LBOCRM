<?php

namespace App\Services\Finance;

use App\Models\FinanceActivityLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class FinanceActivityService
{
    public function log(Model $subject, User $user, string $action, array $old = [], array $new = []): FinanceActivityLog
    {
        return FinanceActivityLog::create([
            'company_id' => $subject->getAttribute('company_id') ?: $user->company_id,
            'branch_id' => $subject->getAttribute('branch_id') ?: $user->branch_id,
            'user_id' => $user->id,
            'subject_type' => $subject->getMorphClass(),
            'subject_id' => $subject->getKey(),
            'action' => $action,
            'old_values' => $old ?: null,
            'new_values' => $new ?: null,
            'ip_address' => request()?->ip(),
            'user_agent' => request()?->userAgent(),
        ]);
    }
}
