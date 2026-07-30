<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use ZipArchive;

class AuditContractTemplates extends Command
{
    protected $signature = 'archilbo:audit-templates {--output=}';
    protected $description = 'Audit contract DOCX templates for static HTML/XML entities';

    public function handle(): int
    {
        $templates = [
            '0_5' => storage_path('app/private/archi-templates/contracts/contrat_architecte_0_5.docx'),
            '2' => storage_path('app/private/archi-templates/contracts/contrat_architecte_2.docx'),
            'forfait' => storage_path('app/private/archi-templates/contracts/CONTRAT_DARCHITECT _FORFAITAIRES.docx'),
        ];

        $outputPath = $this->option('output');
        $lines = [];

        $entityPatterns = [
            '&apos;' => 0,
            '&amp;apos;' => 0,
            '&#039;' => 0,
            '&amp;#039;' => 0,
            '&ccedil;' => 0,
            '&eacute;' => 0,
            '&egrave;' => 0,
        ];

        foreach ($templates as $key => $path) {
            $lines[] = "Template: $key ($path)";
            $lines[] = str_repeat('-', 60);

            if (!file_exists($path)) {
                $lines[] = "  MISSING";
                $lines[] = '';
                continue;
            }

            $zip = new ZipArchive();
            if ($zip->open($path) !== true) {
                $lines[] = "  FAILED to open ZIP";
                $lines[] = '';
                continue;
            }

            $totalEncoded = 0;
            $partsInspected = 0;

            for ($i = 0; $i < $zip->numFiles; $i++) {
                $name = $zip->getNameIndex($i);
                if (!$name || !str_starts_with($name, 'word/') || !str_ends_with($name, '.xml')) {
                    continue;
                }

                $partsInspected++;
                $xml = $zip->getFromName($name);
                $dom = new \DOMDocument();
                $dom->loadXML($xml, LIBXML_NOERROR);
                $xpath = new \DOMXPath($dom);
                $xpath->registerNamespace('w', 'http://schemas.openxmlformats.org/wordprocessingml/2006/main');

                $textNodes = $xpath->query('//w:t');
                $foundInPart = 0;

                foreach ($textNodes as $tNode) {
                    $text = $tNode->textContent;

                    foreach ($entityPatterns as $entity => &$count) {
                        if (str_contains($text, $entity)) {
                            if ($foundInPart === 0) {
                                $lines[] = "  File: $name";
                                $foundInPart++;
                            }
                            $lines[] = "    Entity '$entity' found in text: " . substr($text, 0, 120);
                            $count++;
                            $totalEncoded++;
                        }
                    }
                }
            }

            $zip->close();
            $lines[] = "  Parts inspected: $partsInspected";
            $lines[] = "  Total encoded entities found: $totalEncoded";
            $lines[] = '';
        }

        $lines[] = str_repeat('=', 60);
        $lines[] = 'Summary:';
        foreach ($entityPatterns as $entity => $count) {
            $lines[] = "  $entity: $count occurrences";
        }

        $report = implode(PHP_EOL, $lines);
        $this->line($report);

        if ($outputPath) {
            file_put_contents($outputPath, $report);
            $this->info("Report written to: $outputPath");
        }

        return self::SUCCESS;
    }
}
