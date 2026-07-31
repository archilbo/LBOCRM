<?php

namespace App\Console\Commands;

use App\Models\Dossier;
use App\Services\Dossiers\DossierNumberService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class UpdateDossierNumberPattern extends Command
{
    protected $signature = 'dossiers:update-number-pattern';
    protected $description = 'Migrate existing dossier numbers from {CITY_CODE}{SEQ}-{PERIOD} to P{SEQ}-{PERIOD}';

    public function handle(DossierNumberService $numberService): int
    {
        $dossiers = Dossier::query()
            ->whereNotNull('sequence_number')
            ->whereNotNull('period')
            ->orderBy('created_at')
            ->get();

        if ($dossiers->isEmpty()) {
            $this->warn('No dossiers found with sequence_number and period.');
            return self::SUCCESS;
        }

        $this->info("Found {$dossiers->count()} dossiers to update.");

        // Track used numbers per period to detect conflicts
        $usedPerPeriod = []; // period => set of numbers
        $updated = 0;
        $conflicts = 0;

        foreach ($dossiers as $dossier) {
            $period = $dossier->period;
            $seq = $dossier->sequence_number;
            $newNumber = sprintf('P%s-%s', str_pad((string) $seq, 3, '0', STR_PAD_LEFT), $period);

            // Check for conflict with already-updated dossiers
            if (isset($usedPerPeriod[$period][$newNumber])) {
                // Assign next free sequence for this period
                $nextSeq = $this->getNextFreeSequence($period, $usedPerPeriod[$period], $numberService);
                $newNumber = sprintf('P%s-%s', str_pad((string) $nextSeq, 3, '0', STR_PAD_LEFT), $period);
                $dossier->sequence_number = $nextSeq;
                $conflicts++;
            }

            $usedPerPeriod[$period][$newNumber] = true;

            $dossier->dossier_number = $newNumber;
            $dossier->save();

            $this->line("  [{$dossier->id}] {$dossier->dossier_number}");
            $updated++;
        }

        $this->info("Done. {$updated} dossiers updated.");
        if ($conflicts > 0) {
            $this->warn("{$conflicts} dossiers had sequence conflicts and were re-numbered.");
        }

        return self::SUCCESS;
    }

    private function getNextFreeSequence(string $period, array $usedNumbers, DossierNumberService $numberService): int
    {
        // Extract all used sequence numbers for this period from the used numbers set
        $usedSeqs = [];
        foreach (array_keys($usedNumbers) as $num) {
            if (preg_match('/^P(\d+)-' . preg_quote($period, '/') . '$/', $num, $m)) {
                $usedSeqs[] = (int) $m[1];
            }
        }

        // Also check the database for any dossiers not in our current batch
        $dbSeqs = Dossier::query()
            ->where('period', $period)
            ->whereNotNull('sequence_number')
            ->pluck('sequence_number')
            ->toArray();

        $allSeqs = array_unique(array_merge($usedSeqs, $dbSeqs));

        // Find first gap starting from 1
        $seq = 1;
        while (in_array($seq, $allSeqs, true)) {
            $seq++;
        }

        return $seq;
    }
}
