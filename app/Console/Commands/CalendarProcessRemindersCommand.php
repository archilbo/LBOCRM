<?php

namespace App\Console\Commands;

use App\Services\Calendar\CalendarReminderService;
use Illuminate\Console\Command;

class CalendarProcessRemindersCommand extends Command
{
    protected $signature = 'calendar:process-reminders';
    protected $description = 'Process due calendar reminders and send in-app notifications';

    public function handle(CalendarReminderService $service): int
    {
        $sent = $service->processDue();

        $this->info("Processed {$sent} reminders.");

        return Command::SUCCESS;
    }
}
