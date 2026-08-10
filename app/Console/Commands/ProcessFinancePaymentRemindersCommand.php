<?php

namespace App\Console\Commands;

use App\Services\Finance\FinancePaymentReminderService;
use App\Services\Finance\FinancePaymentPromiseService;
use Illuminate\Console\Command;

class ProcessFinancePaymentRemindersCommand extends Command
{
    protected $signature = 'finance:process-payment-reminders';
    protected $description = 'Process due finance payment reminders without duplicate notifications';

    public function handle(FinancePaymentReminderService $service, FinancePaymentPromiseService $promises): int
    {
        $processed = $service->processDue();
        $reconciled = $promises->reconcileDue();
        $this->info("Processed {$processed} finance payment reminders and reconciled {$reconciled} promises.");

        return self::SUCCESS;
    }
}
