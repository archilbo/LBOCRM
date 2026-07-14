<?php

namespace App\Services\Archive;

use App\Models\ArchiveRecord;
use App\Models\User;
use App\Notifications\ArchiveOverdueNotification;

class ArchiveNotificationService
{
    public function notifyOverdue(ArchiveRecord $archiveRecord): void
    {
        $desc = 'Archive ' . $archiveRecord->archive_number . ' is overdue (due: ' . ($archiveRecord->due_at?->format('Y-m-d') ?? 'N/A') . ')';

        $users = User::whereHas('roles', fn ($q) => $q->whereIn('name', ['admin', 'manager']))->get();
        foreach ($users as $user) {
            $user->notify(new ArchiveOverdueNotification($archiveRecord, 'overdue', $desc));
        }
    }

    public function notifyCheckedOut(ArchiveRecord $archiveRecord, string $requestedBy): void
    {
        $desc = 'Archive ' . $archiveRecord->archive_number . ' was checked out by ' . $requestedBy;

        $users = User::whereHas('roles', fn ($q) => $q->whereIn('name', ['admin', 'manager']))->get();
        foreach ($users as $user) {
            $user->notify(new ArchiveOverdueNotification($archiveRecord, 'checked_out', $desc));
        }
    }

    public function notifyReturned(ArchiveRecord $archiveRecord): void
    {
        $desc = 'Archive ' . $archiveRecord->archive_number . ' has been returned';

        $users = User::whereHas('roles', fn ($q) => $q->whereIn('name', ['admin', 'manager']))->get();
        foreach ($users as $user) {
            $user->notify(new ArchiveOverdueNotification($archiveRecord, 'returned', $desc));
        }
    }
}
