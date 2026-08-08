<?php

namespace Tests\Unit;

use App\Services\Contracts\ContractTemplateNamingService;
use PHPUnit\Framework\TestCase;

class ContractTemplateNamingServiceTest extends TestCase
{
    public function test_it_generates_canonical_keys_and_filenames_for_any_percentage(): void
    {
        $service = new ContractTemplateNamingService();

        foreach ([
            '0.25' => '0_25', '0.5000' => '0_5', '1' => '1', '1.25' => '1_25',
            '2.5' => '2_5', '3.75' => '3_75', '10' => '10',
        ] as $rate => $key) {
            $this->assertSame($key, $service->keyFor('percentage', $rate));
            $this->assertSame("contrat_architecte_{$key}.docx", $service->filenameFor('percentage', $rate));
        }

        $this->assertSame('forfait', $service->keyFor('forfait'));
        $this->assertSame('contrat_architecte_forfait.docx', $service->filenameFor('forfait'));
    }

    public function test_it_parses_only_strict_contract_template_filenames(): void
    {
        $service = new ContractTemplateNamingService();

        $this->assertSame(['type' => 'percentage', 'rate' => '0.5000', 'key' => '0_5', 'filename' => 'contrat_architecte_0_5.docx'], $service->parseFilename('contrat_architecte_0_5.docx'));
        $this->assertSame(['type' => 'percentage', 'rate' => '2.0000', 'key' => '2', 'filename' => 'contrat_architecte_2.docx'], $service->parseFilename('contrat_architecte_2.docx'));
        $this->assertSame(['type' => 'forfait', 'rate' => null, 'key' => 'forfait', 'filename' => 'contrat_architecte_forfait.docx'], $service->parseFilename('contrat_architecte_forfait.docx'));

        foreach (['contrat_architecte_test.docx', 'contrat_architecte_0,5.docx', 'contrat_architecte_0.5.docx', 'foo_0_5.docx'] as $filename) {
            $this->assertNull($service->parseFilename($filename));
        }
    }
}
