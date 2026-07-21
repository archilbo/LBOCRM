<?php

namespace App\Console\Commands;

use App\Services\Tus\TusServer;
use App\Models\ProjectDesign\ProjectDesignUploadSession;
use Illuminate\Console\Command;

class CleanExpiredTusUploads extends Command
{
    protected $signature = 'tus:clean';
    protected $description = 'Clean expired Tus upload files and database records';

    public function handle(TusServer $tus): int
    {
        $expired = ProjectDesignUploadSession::where('expires_at', '<', now())
            ->whereNotIn('status', ['completed', 'canceled', 'failed'])
            ->get();

        $count = 0;
        foreach ($expired as $session) {
            foreach ($session->files as $file) {
                if ($file->tus_upload_id) {
                    $tus->delete($file->tus_upload_id);
                }
            }
            $session->update(['status' => 'canceled', 'canceled_at' => now()]);
            $count++;
        }

        $this->info("Cleaned {$count} expired upload sessions.");
        return Command::SUCCESS;
    }
}
