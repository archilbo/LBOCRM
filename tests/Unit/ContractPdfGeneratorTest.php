<?php

namespace Tests\Unit;

use App\Models\City;
use App\Models\Client;
use App\Models\Contract;
use App\Models\Dossier;
use App\Services\ContractPdfGenerator;
use App\Services\OfficeDocumentConverter;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Mockery\MockInterface;
use Tests\TestCase;

class ContractPdfGeneratorTest extends TestCase
{
    public function test_it_converts_the_generated_word_document_instead_of_rebuilding_a_pdf_layout(): void
    {
        $sourcePath = 'test-contract-pdf/' . Str::uuid() . '/source.docx';
        Storage::disk('local')->put($sourcePath, 'word-template-output');

        $client = new Client(['civility' => 'Mr', 'full_name' => 'AAMER LAHCEN']);
        $dossier = new Dossier(['dossier_number' => 'P399-2026-08', 'project_object' => 'R+3']);
        $dossier->setRelation('primaryClient', $client);
        $dossier->setRelation('city', $this->city());

        $contract = new Contract([
            'contract_number' => 'CTR-2026-0004',
            'generated_document_path' => $sourcePath,
        ]);
        $contract->setRelation('dossier', $dossier);

        $this->mock(OfficeDocumentConverter::class, function (MockInterface $mock): void {
            $mock->shouldReceive('isAvailable')->once()->andReturnTrue();
            $mock->shouldReceive('convertDocxToPdf')
                ->once()
                ->andReturnUsing(function (string $sourceDocx, string $targetPdf): void {
                    $this->assertSame('word-template-output', file_get_contents($sourceDocx));
                    File::ensureDirectoryExists(dirname($targetPdf));
                    file_put_contents($targetPdf, '%PDF-1.7 template-rendered');
                });
        });

        try {
            $pdfPath = app(ContractPdfGenerator::class)->generate($contract);

            $this->assertTrue(Storage::disk('local')->exists($pdfPath));
            $this->assertStringStartsWith('%PDF-', Storage::disk('local')->get($pdfPath));
        } finally {
            File::deleteDirectory(dirname(Storage::disk('local')->path($sourcePath)));
        }
    }

    public function test_it_refuses_to_build_a_pdf_without_the_generated_word_document(): void
    {
        $dossier = new Dossier(['dossier_number' => 'P399-2026-08']);
        $dossier->setRelation('primaryClient', new Client(['full_name' => 'AAMER LAHCEN']));
        $dossier->setRelation('city', $this->city());

        $contract = new Contract(['contract_number' => 'CTR-2026-0004']);
        $contract->setRelation('dossier', $dossier);

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('document Word du contrat');

        app(ContractPdfGenerator::class)->generate($contract);
    }

    private function city(): City
    {
        $city = new City;
        // Avoid the model's schema-aware mutator: unit tests run without the
        // optional SQLite PDO extension in this checkout.
        $city->setRawAttributes(['name' => 'BEN GUERIR']);

        return $city;
    }
}
