# ==========================================================
# STEP 32 - Use original ARCHI LBO contract templates
# Path: D:\ARCHI LBO\LBOSM\LBOCRM
# ==========================================================

$ErrorActionPreference = "Stop"

$ProjectPath = "D:\ARCHI LBO\LBOSM\LBOCRM"
Set-Location $ProjectPath

Write-Host "STEP 32: Use original contract templates" -ForegroundColor Cyan

$Utf8NoBom = New-Object System.Text.UTF8Encoding($false)

function Write-NoBom {
    param (
        [string] $Path,
        [string] $Content
    )

    $Directory = Split-Path $Path -Parent
    if ($Directory -and !(Test-Path $Directory)) {
        New-Item -ItemType Directory -Force -Path $Directory | Out-Null
    }

    [System.IO.File]::WriteAllText($Path, $Content, $Utf8NoBom)
}

# ----------------------------------------------------------
# 1. Verify templates exist
# ----------------------------------------------------------
$Contract05 = "storage\app\private\archi-templates\contracts\contrat_architecte_0_5.docx"
$Contract2 = "storage\app\private\archi-templates\contracts\contrat_architecte_2.docx"

if (!(Test-Path $Contract05)) {
    Write-Host "Missing template: $Contract05" -ForegroundColor Red
    exit 1
}

if (!(Test-Path $Contract2)) {
    Write-Host "Missing template: $Contract2" -ForegroundColor Red
    exit 1
}

# ----------------------------------------------------------
# 2. Add config
# ----------------------------------------------------------
Write-NoBom "config\archilbo_templates.php" @'
<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Original ARCHI LBO templates
    |--------------------------------------------------------------------------
    |
    | These templates are stored privately and copied only when generating
    | documents. Do not edit generated files. Edit only the source templates.
    |
    */

    'contracts' => [
        'default_rate' => env('ARCHI_LBO_DEFAULT_CONTRACT_RATE', '0.5'),
        'construction_unit_price' => env('ARCHI_LBO_CONSTRUCTION_UNIT_PRICE', 900),

        'templates' => [
            '0.5' => storage_path('app/private/archi-templates/contracts/contrat_architecte_0_5.docx'),
            '2' => storage_path('app/private/archi-templates/contracts/contrat_architecte_2.docx'),
        ],
    ],

    'finance' => [
        'devis' => storage_path('app/private/archi-templates/finance/devis_archi_lbo.xlsx'),
        'facture' => storage_path('app/private/archi-templates/finance/facture.xlsx'),
        'recu' => storage_path('app/private/archi-templates/finance/recu_archi_lbo.xlsx'),
    ],
];
'@

# ----------------------------------------------------------
# 3. Replace ContractDocumentGenerator
# ----------------------------------------------------------
Write-NoBom "app\Services\ContractDocumentGenerator.php" @'
<?php

namespace App\Services;

use App\Models\Contract;
use Illuminate\Support\Facades\File;
use PhpOffice\PhpWord\TemplateProcessor;
use ZipArchive;

class ContractDocumentGenerator
{
    public function generate(Contract $contract): array
    {
        $contract->loadMissing(['dossier.client']);

        $templatePath = $this->templatePath($contract);

        $relativeDirectory = 'contracts/' . $contract->contract_number;
        $absoluteDirectory = storage_path('app/public/' . $relativeDirectory);

        File::ensureDirectoryExists($absoluteDirectory);

        $relativeDocxPath = $relativeDirectory . '/' . $contract->contract_number . '-contract.docx';
        $absoluteDocxPath = storage_path('app/public/' . $relativeDocxPath);

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
        $rate = $this->contractRate($contract);

        $key = abs($rate - 2.0) < 0.001 ? '2' : '0.5';

        $path = config("archilbo_templates.contracts.templates.$key");

        if (!$path || !File::exists($path)) {
            throw new \RuntimeException("Contract template not found for rate $key.");
        }

        return $path;
    }

    private function contractRate(Contract $contract): float
    {
        /*
         * Current database may not yet have fee_rate_percent.
         * For now:
         * - If notes contain "2%" or "rate:2", use 2%.
         * - If notes contain "0.5%" or "0,5", use 0.5%.
         * - Otherwise use ARCHI_LBO_DEFAULT_CONTRACT_RATE from .env.
         */

        $notes = mb_strtolower((string) $contract->notes);

        if (str_contains($notes, '2%') || str_contains($notes, 'rate:2')) {
            return 2.0;
        }

        if (str_contains($notes, '0.5%') || str_contains($notes, '0,5') || str_contains($notes, 'rate:0.5')) {
            return 0.5;
        }

        return (float) config('archilbo_templates.contracts.default_rate', 0.5);
    }

    private function values(Contract $contract): array
    {
        $dossier = $contract->dossier;
        $client = $dossier?->client;

        $rate = $this->contractRate($contract);
        $unitPrice = (float) config('archilbo_templates.contracts.construction_unit_price', 900);

        $plancher = (float) ($contract->surface ?: $dossier?->floor_area ?: 0);
        $sup = (float) ($dossier?->land_surface ?: 0);

        $estimation = $plancher * $unitPrice;
        $ht = $estimation * ($rate / 100);
        $tva = $ht * 0.20;
        $ttc = $ht + $tva;

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
         * Opens DOCX as ZIP and replaces [KEY] inside XML files.
         */

        $zip = new ZipArchive();

        if ($zip->open($docxPath) !== true) {
            throw new \RuntimeException('Could not open generated DOCX file.');
        }

        $replace = [];

        foreach ($values as $key => $value) {
            $replace['[' . $key . ']'] = $this->xmlValue($value);
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

            $updatedXml = str_replace(array_keys($replace), array_values($replace), $xml);

            if ($updatedXml !== $xml) {
                $zip->addFromString($name, $updatedXml);
            }
        }

        $zip->close();
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
'@

# ----------------------------------------------------------
# 4. Clear cache and autoload
# ----------------------------------------------------------
php artisan optimize:clear
composer dump-autoload

Write-Host "Checking templates..." -ForegroundColor Cyan
php artisan tinker --execute="dump(config('archilbo_templates.contracts.templates'));"

Write-Host ""
Write-Host "STEP 32 DONE" -ForegroundColor Green
Write-Host "Now open /contracts, generate, then download DOCX."