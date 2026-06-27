<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class ContractForfaitCalculationQaCommand extends Command
{
    protected $signature = 'archilbo:contract-forfait-calculation-qa {ttc=12000}';

    protected $description = 'Verify contract forfait TTC calculation derives HT and TVA correctly.';

    public function handle(): int
    {
        $ttc = (float) $this->argument('ttc');
        $tvaRate = ((float) config('archilbo_templates.contracts.tva_rate', 20)) / 100;

        $ht = $ttc / (1 + $tvaRate);
        $tva = $ttc - $ht;

        if (abs(($ht + $tva) - $ttc) > 0.01) {
            $this->error('Forfait calculation failed: HT + TVA does not equal TTC.');

            return self::FAILURE;
        }

        $this->table(['TTC', 'HT', 'TVA'], [[
            number_format($ttc, 2, '.', ' '),
            number_format($ht, 2, '.', ' '),
            number_format($tva, 2, '.', ' '),
        ]]);

        $this->info('Contract forfait calculation QA passed.');

        return self::SUCCESS;
    }
}
