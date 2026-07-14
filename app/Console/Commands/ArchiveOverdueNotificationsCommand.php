<?php

namespace App\Console\Commands;

use App\Models\ArchiveRecord;
use App\Services\Archive\ArchiveNotificationService;
use Carbon\Carbon;
use Illuminate\Console\Command;

class ArchiveOverdueNotificationsCommand extends Command
{
    protected $signature = 'app:archive-overdue-notify';
    protected $description = 'Send notifications for overdue archives';

    public function handle(ArchiveNotificationService $notifier): int
    {
        $overdue = ArchiveRecord::overdue()
            ->with('dossier')
            ->get();

        foreach ($overdue as $archive) {
            $notifier->notifyOverdue($archive);
            $this->line("Overdue: {$archive->archive_number}");
        }

        $this->info("Sent {$overdue->count()} overdue notifications.");
        return Command::SUCCESS;
    }
}
