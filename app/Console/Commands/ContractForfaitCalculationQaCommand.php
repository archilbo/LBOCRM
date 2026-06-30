<?php

namespace App\Console\Commands;

use App\Models\Contract;
use App\Services\ContractDocumentGenerator;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use ReflectionMethod;

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

        $expectedTemplate = config('archilbo_templates.contracts.templates.forfait');

        if (!$expectedTemplate || !File::exists($expectedTemplate)) {
            $this->error('Forfait template is missing from private storage.');

            return self::FAILURE;
        }

        $contract = new Contract([
            'calculation_mode' => 'forfait',
            'fee_rate_percent' => 0.5,
        ]);

        $templatePath = $this->resolveTemplatePath($contract);

        if ($templatePath !== $expectedTemplate) {
            $this->error('Forfait template selection failed.');
            $this->line("Expected: {$expectedTemplate}");
            $this->line("Actual: {$templatePath}");

            return self::FAILURE;
        }

        $this->table(['TTC', 'HT', 'TVA'], [[
            number_format($ttc, 2, '.', ' '),
            number_format($ht, 2, '.', ' '),
            number_format($tva, 2, '.', ' '),
        ]]);

        $this->line("Forfait template: {$templatePath}");
        $this->info('Contract forfait calculation QA passed.');

        return self::SUCCESS;
    }

    private function resolveTemplatePath(Contract $contract): string
    {
        $method = new ReflectionMethod(ContractDocumentGenerator::class, 'templatePath');
        $method->setAccessible(true);

        return $method->invoke(app(ContractDocumentGenerator::class), $contract);
    }
}
