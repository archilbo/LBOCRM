<?php

namespace App\Services;

use App\Models\Contract;
use App\Services\Dossiers\DossierPathBuilder;
use App\Services\Documents\DocxPlaceholderReplacer;
use App\Services\Contracts\ContractTemplateNamingService;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

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

        // Shared safe engine: run-local replacement, template structure kept
        // 100% intact (no paragraph flattening, no run deletion).
        app(DocxPlaceholderReplacer::class)->replace($absoluteDocxPath, $values);

        return [
            'docx_path' => $relativeDocxPath,
            'pdf_path' => null,
        ];
    }

    private function templatePath(Contract $contract): string
    {
        $key = $contract->contract_template_key;

        if (! $key) {
            $rate = (float) ($contract->fee_rate_percent ?? config('archilbo_templates.contracts.default_rate', 0.5));
            $key = app(ContractTemplateNamingService::class)->keyFor($contract->calculation_mode ?? 'percentage', $rate);
        }

        $path = app(ContractTemplateNamingService::class)->pathForKey($key);

        if (! File::exists($path)) {
            throw new \RuntimeException("Modèle de contrat introuvable : contrat_architecte_{$key}.docx.");
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

    /**
     * Delegate kept for the existing unit test suite (reflection) — the real
     * work happens in the shared DocxPlaceholderReplacer.
     *
     * @param  array<string, string>  $values  [TOKEN => value]
     */
    private function replaceSquarePlaceholdersInDocx(string $docxPath, array $values): void
    {
        app(DocxPlaceholderReplacer::class)->replace($docxPath, $values);
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
}
