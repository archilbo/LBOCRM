<?php

namespace App\Console\Commands;

use App\Models\Dossier;
use Illuminate\Console\Command;

class NormalizeDossierLocationCaseCommand extends Command
{
    protected $signature = 'dossiers:normalize-location-case {--apply : Persist changes (default is a dry run)}';

    protected $description = 'Normalize project province and commune values to uppercase Unicode text.';

    public function handle(): int
    {
        $apply = (bool) $this->option('apply');
        $changed = 0;
        $unchanged = 0;

        Dossier::withTrashed()
            ->select(['id', 'province', 'commune'])
            ->orderBy('id')
            ->chunkById(200, function ($dossiers) use ($apply, &$changed, &$unchanged): void {
                foreach ($dossiers as $dossier) {
                    $updates = $this->normalizedUpdates($dossier);

                    if ($updates === []) {
                        $unchanged++;
                        continue;
                    }

                    $changed++;

                    if ($apply) {
                        Dossier::withTrashed()
                            ->whereKey($dossier->id)
                            ->update($updates);
                    }
                }
            });

        $mode = $apply ? 'applied' : 'dry run';
        $this->info("Location normalization {$mode}: {$changed} project(s) changed, {$unchanged} already normalized.");

        if (! $apply && $changed > 0) {
            $this->comment('Review the count, then run again with --apply to persist the changes.');
        }

        return self::SUCCESS;
    }

    /** @return array<string, string> */
    private function normalizedUpdates(Dossier $dossier): array
    {
        $updates = [];

        foreach (['province', 'commune'] as $field) {
            $current = $dossier->getAttribute($field);
            if (! is_string($current) || trim($current) === '') {
                continue;
            }

            $normalized = mb_strtoupper(trim($current), 'UTF-8');
            if ($normalized !== $current) {
                $updates[$field] = $normalized;
            }
        }

        return $updates;
    }
}
