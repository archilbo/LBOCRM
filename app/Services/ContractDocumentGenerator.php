<?php

namespace App\Services;

use App\Models\Contract;
use App\Services\Dossiers\DossierPathBuilder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpWord\TemplateProcessor;
use ZipArchive;

class ContractDocumentGenerator
{
    public function generate(Contract $contract): array
    {
        $contract->loadMissing(['dossier.client', 'dossier.city']);

        $templatePath = $this->templatePath($contract);

        $pathBuilder = app(DossierPathBuilder::class);
        $relativeDocxPath = $pathBuilder->contractDocxPath($contract, $contract->dossier);
        $absoluteDocxPath = Storage::disk('local')->path($relativeDocxPath);

        File::ensureDirectoryExists(dirname($absoluteDocxPath));

        File::copy($templatePath, $absoluteDocxPath);

        $values = $this->values($contract);

        $this->replaceWithTemplateProcessor($absoluteDocxPath, $values);
        $this->replaceSquarePlaceholdersInDocx($absoluteDocxPath, $values);

        return [
            'docx_path' => $relativeDocxPath,
            'pdf_path' => null,
        ];
    }

    private function templatePath(Contract $contract): string
    {
        if ($contract->calculation_mode === 'forfait') {
            $key = 'forfait';
        } else {
            $rate = (float) ($contract->fee_rate_percent ?? config('archilbo_templates.contracts.default_rate', 0.5));
            $key = abs($rate - 2.0) < 0.001 ? '2' : '0_5';
        }

        $templates = (array) config('archilbo_templates.contracts.templates');
        $path = $templates[$key] ?? null;

        if (!$path || !File::exists($path)) {
            throw new \RuntimeException("Contract template not found for type $key.");
        }

        return $path;
    }

    private function values(Contract $contract): array
    {
        $dossier = $contract->dossier;
        $client = $dossier?->client;

        $rate = (float) ($contract->fee_rate_percent ?? config('archilbo_templates.contracts.default_rate', 0.5));
        $unitPrice = (float) ($contract->price_per_square_meter ?: config('archilbo_templates.contracts.construction_unit_price', 900));

        $plancher = (float) ($contract->surface ?: $dossier?->floor_area ?: 0);
        $sup = (float) ($dossier?->land_surface ?: 0);

        $estimation = $plancher * $unitPrice;
        $ht = (float) $contract->ht;
        $tva = (float) $contract->tva;
        $ttc = (float) $contract->ttc;

        if ($ht <= 0 && $ttc <= 0) {
            $tvaRate = ((float) config('archilbo_templates.contracts.tva_rate', 20)) / 100;
            $ht = $estimation * ($rate / 100);
            $tva = $ht * $tvaRate;
            $ttc = $ht + $tva;
        }

        return [
            'DATE' => now()->format('d/m/Y'),
            'CIVILITY' => $client?->civility ?? 'M',
            'CLIENT_NAME' => $client?->full_name ?? '-',
            'CIN' => $client?->cin ?? '-',
            'CLIENT_ADD' => $client?->address ?? '-',

            'PROJECT_OBJECT' => $dossier?->project_object ?? '-',
            'PROJECT_ADD' => $dossier?->project_address ?? '-',
            'TITRE' => $dossier?->land_title_number ?? '-',
            'SUP' => $this->number($sup),
            'PREF' => $dossier?->province ?? '-',
            'COMMUNE' => $dossier?->commune ?? '-',

            'PLANCHER' => $this->number($plancher),
            'ESTIMATION' => $this->money($estimation),
            'HT' => $this->money($ht),
            'TVA' => $this->money($tva),
            'TTC' => $this->money($ttc),
        ];
    }

    private function replaceWithTemplateProcessor(string $docxPath, array $values): void
    {
        /*
         * PHPWord normally uses ${KEY}.
         * Our real templates use [KEY].
         * Newer PHPWord versions allow custom macro delimiters.
         */

        try {
            $template = new TemplateProcessor($docxPath);

            if (method_exists($template, 'setMacroOpeningChars')) {
                $template->setMacroOpeningChars('[');
            }

            if (method_exists($template, 'setMacroClosingChars')) {
                $template->setMacroClosingChars(']');
            }

            foreach ($values as $key => $value) {
                $template->setValue($key, $this->cleanValue($value));
            }

            $template->saveAs($docxPath);
        } catch (\Throwable) {
            /*
             * Fallback below will still try direct XML replacement.
             */
        }
    }

    private function replaceSquarePlaceholdersInDocx(string $docxPath, array $values): void
    {
        /*
         * Keeps the original DOCX template 100%.
         * Handles placeholders split across multiple <w:t> runs
         * (e.g. [CLIENT_ADD] broken into <w:t>[</w:t><w:t>CLIENT_</w:t><w:t>ADD]</w:t>).
         */

        $zip = new ZipArchive();

        if ($zip->open($docxPath) !== true) {
            throw new \RuntimeException('Could not open generated DOCX file.');
        }

        $search = [];
        $replace = [];

        foreach ($values as $key => $value) {
            $search[$key] = '[' . $key . ']';
            $replace[$key] = $this->xmlValue($value);
        }

        for ($index = 0; $index < $zip->numFiles; $index++) {
            $name = $zip->getNameIndex($index);

            if (!$name || !str_starts_with($name, 'word/') || !str_ends_with($name, '.xml')) {
                continue;
            }

            $xml = $zip->getFromName($name);

            if ($xml === false) {
                continue;
            }

            $updatedXml = $this->replaceInXmlString($xml, $search, $replace);

            if ($updatedXml !== $xml) {
                $zip->addFromString($name, $updatedXml);
            }
        }

        $zip->close();
    }

    private function replaceInXmlString(string $xml, array $search, array $replace): string
    {
        $directSearch = [];
        foreach ($search as $key => $tag) {
            $directSearch[$tag] = $replace[$key];
        }

        libxml_use_internal_errors(true);

        $dom = new \DOMDocument();
        $dom->loadXML($xml, LIBXML_PARSEHUGE);
        $xpath = new \DOMXPath($dom);
        $xpath->registerNamespace('w', 'http://schemas.openxmlformats.org/wordprocessingml/2006/main');

        $paragraphs = $xpath->query('//w:p');

        foreach ($paragraphs as $p) {
            $textNodes = [];
            $fullText = '';

            foreach ($xpath->query('.//w:t', $p) as $t) {
                $textNodes[] = $t;
                $fullText .= $t->textContent;
            }

            if (empty($textNodes)) {
                continue;
            }

            $hasPlaceholder = false;
            foreach ($directSearch as $tag => $replacement) {
                if (str_contains($fullText, $tag)) {
                    $hasPlaceholder = true;
                    break;
                }
            }

            if (!$hasPlaceholder) {
                continue;
            }

            $newText = str_replace(
                array_keys($directSearch),
                array_values($directSearch),
                $fullText
            );
            $newText = htmlspecialchars($newText, ENT_XML1 | ENT_QUOTES, 'UTF-8');

            $textNodes[0]->nodeValue = $newText;

            for ($i = count($textNodes) - 1; $i >= 1; $i--) {
                $run = $textNodes[$i]->parentNode;
                $p->removeChild($run);
            }
        }

        $decl = '';
        if (str_starts_with($xml, '<?xml')) {
            $end = strpos($xml, '?>');
            if ($end !== false) {
                $decl = substr($xml, 0, $end + 2) . "\n";
            }
        }

        return $decl . $dom->saveXML($dom->documentElement);
    }

    private function money(float|int|string|null $value): string
    {
        return number_format((float) $value, 2, '.', ' ');
    }

    private function number(float|int|string|null $value): string
    {
        $number = (float) $value;

        if (floor($number) === $number) {
            return number_format($number, 0, '.', ' ');
        }

        return number_format($number, 2, '.', ' ');
    }

    private function cleanValue(mixed $value): string
    {
        return str_replace(
            ['&', '<', '>'],
            ['and', '', ''],
            (string) ($value ?? '-')
        );
    }

    private function xmlValue(mixed $value): string
    {
        return htmlspecialchars((string) ($value ?? '-'), ENT_XML1 | ENT_QUOTES, 'UTF-8');
    }
}
