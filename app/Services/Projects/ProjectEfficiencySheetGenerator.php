<?php

namespace App\Services\Projects;

use App\Models\ProjectEfficiencySheet;
use App\Services\Dossiers\DossierPathBuilder;
use App\Services\Documents\DocxPlaceholderReplacer;
use App\Services\Finance\FinanceSettingsService;
use App\Services\WordDocumentConverter;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use ZipArchive;

/**
 * DOCX generation for the fiche efficacité (Step 5).
 *
 * Contract-like mechanics, replicated from ContractDocumentGenerator: the
 * master template (storage/app/private/archi-templates/fiche_efficacite/
 * fiche_efficacite.docx) is NEVER edited — it is copied into the project
 * folder, then [TOKEN] placeholders are replaced with live trusted values.
 *
 * Automatic values (project/client/entreprise) are read at generation time
 * and frozen inside the generated DOCX; they are deliberately NOT persisted
 * in the fiche row (Contract-like single-row architecture from Step 2). The
 * generated file itself is the historical snapshot: regeneration writes a
 * new vN file and never deletes previous versions.
 */
class ProjectEfficiencySheetGenerator
{
    public const TEMPLATE_KEY = 'fiche_efficacite';

    /**
     * Central placeholder map — the single source of truth for the DOCX.
     *
     * Every token present in the master template must be mapped here.
     * Inventory (verified against word/document.xml, runs merged per
     * paragraph — several tokens are fragmented across <w:t> runs and only
     * show up once runs are concatenated): USAGE_DU_BATIMENT, NOM_PROJET,
     * PROJET_ADDRESS, NOM_PRENOM_DOUVRAGE, CLIENT_ADDRESS, ENTREPRISE_PHONE,
     * ENTREPRISE_FAX, ENTREPRISE_CEO, ENTREPRISE_ADDRESS, ENTREPRISE_MAIL.
     * Manual tokens read the fiche row; automatic tokens read
     * Dossier/Client/CompanySettings live.
     */
    public function placeholderMap(ProjectEfficiencySheet $sheet): array
    {
        $sheet->loadMissing(['dossier.primaryClient']);
        $company = app(FinanceSettingsService::class)->companyInfo();

        return [
            'USAGE_DU_BATIMENT' => (string) ($sheet->usage_du_batiment ?? ''),
            'NOM_PROJET' => (string) ($sheet->dossier?->project_object ?? ''),
            'PROJET_ADDRESS' => (string) ($sheet->dossier?->project_address ?? ''),
            'NOM_PRENOM_DOUVRAGE' => (string) ($sheet->owner_name ?? ''),
            'CLIENT_ADDRESS' => (string) ($sheet->dossier?->primaryClient?->address ?? ''),
            'ENTREPRISE_PHONE' => (string) ($company['companyPhone'] ?? ''),
            'ENTREPRISE_FAX' => (string) ($company['companyFax'] ?? ''),
            'ENTREPRISE_CEO' => (string) ($company['companyLegalRepresentative'] ?? ''),
            'ENTREPRISE_ADDRESS' => (string) ($company['companyAddress'] ?? ''),
            'ENTREPRISE_MAIL' => (string) ($company['companyEmail'] ?? ''),
        ];
    }

    /**
     * @return list<string> placeholder tokens whose source is currently empty
     */
    public function missingPlaceholderCodes(ProjectEfficiencySheet $sheet): array
    {
        $missing = [];

        foreach ($this->placeholderMap($sheet) as $token => $value) {
            if (trim((string) $value) === '') {
                $missing[] = $token;
            }
        }

        return $missing;
    }

    /**
     * Copy the master template, replace every placeholder and save the DOCX
     * into the project folder. On any failure the partial file is removed so
     * the fiche never points at a broken artifact.
     *
     * @return array{docx_path: string, version: int}
     *
     * @throws ProjectEfficiencySheetGenerationException when a value is missing
     * @throws RuntimeException when the template is missing or processing fails
     */
    public function generate(ProjectEfficiencySheet $sheet): array
    {
        $dossier = $sheet->dossier;

        if (! $dossier) {
            throw new RuntimeException('Fiche efficacité: projet introuvable.');
        }

        $values = $this->placeholderMap($sheet);

        $missing = $this->missingPlaceholderCodes($sheet);

        if ($missing !== []) {
            throw new ProjectEfficiencySheetGenerationException($missing);
        }

        $templatePath = (string) config('archilbo_templates.fiche_efficacite.template');

        if ($templatePath === '' || ! File::exists($templatePath)) {
            throw new RuntimeException('Fiche efficacité: modèle introuvable.');
        }

        $version = $sheet->status === 'generated' ? ((int) $sheet->version) + 1 : 1;

        $relativeDocxPath = app(DossierPathBuilder::class)
            ->efficiencySheetDocxPath($sheet, $dossier, $version);
        $absoluteDocxPath = Storage::disk('local')->path($relativeDocxPath);

        File::ensureDirectoryExists(dirname($absoluteDocxPath));
        File::copy($templatePath, $absoluteDocxPath);

        try {
            // Template is the ground truth: any token found inside it (runs
            // merged) MUST be covered by the map. An unmapped token would
            // silently ship unresolved — fail loud instead of shipping a
            // broken document (this is how the fragmented ENTREPRISE_MAIL /
            // ENTREPRISE_CEO / ENTREPRISE_ADDRESS tokens used to slip by).
            $unmappedTokens = array_values(array_diff(
                $this->detectTemplateTokens($absoluteDocxPath),
                array_keys($values)
            ));

            if ($unmappedTokens !== []) {
                throw new ProjectEfficiencySheetGenerationException($unmappedTokens);
            }

            // The shared safe engine: run-local replacement that keeps the
            // copied template 100% intact outside the replaced text nodes
            // (no paragraph flattening, no run deletion, no bold bleed).
            app(DocxPlaceholderReplacer::class)->replace($absoluteDocxPath, $values);
            $this->assertNoPlaceholderRemains($absoluteDocxPath);
        } catch (\Throwable $e) {
            if (File::exists($absoluteDocxPath)) {
                File::delete($absoluteDocxPath);
            }

            throw $e;
        }

        return [
            'docx_path' => $relativeDocxPath,
            'version' => $version,
        ];
    }

    /**
     * Convert the generated DOCX into a PDF using the existing Contract
     * converter (Word COM — no second PDF engine).
     *
     * Preconditions: a valid generated DOCX must exist (never regenerate it
     * silently). The PDF is written next to its DOCX with the same version
     * name (fiche-efficacite-{code}-v{n}.pdf) and the version is NOT bumped.
     *
     * Atomic replacement: conversion targets a ".part" file, which is
     * validated (exists, non-zero) before being copied over the final path.
     * The previous valid PDF stays untouched until the new one is ready, and
     * the fiche row is only updated by the caller after success.
     *
     * @return array{pdf_path: string}
     *
     * @throws ProjectEfficiencySheetDocxMissingException no generated DOCX
     * @throws ProjectEfficiencySheetFileException invalid/missing stored file
     * @throws RuntimeException conversion or validation failure
     */
    public function generatePdf(ProjectEfficiencySheet $sheet): array
    {
        if (! $sheet->dossier) {
            throw new RuntimeException('Fiche efficacité: projet introuvable.');
        }

        if (! filled($sheet->docx_path) || $sheet->status !== 'generated') {
            throw new ProjectEfficiencySheetDocxMissingException;
        }

        $absoluteDocxPath = $this->resolveGeneratedFile($sheet, 'docx');

        // §14: a PDF must never be created from a DOCX containing unresolved
        // required variables — including legacy files generated before the
        // full token map existed. The DOCX must be regenerated first.
        if ($this->detectTemplateTokens($absoluteDocxPath) !== []) {
            throw new ProjectEfficiencySheetDocxMissingException;
        }

        $relativePdfPath = $this->pdfPathFor($sheet->docx_path);
        $absolutePdfPath = Storage::disk('local')->path($relativePdfPath);
        $temporaryPdfPath = $absolutePdfPath.'.part';

        File::ensureDirectoryExists(dirname($absolutePdfPath));

        try {
            app(WordDocumentConverter::class)->convertDocxToPdf($absoluteDocxPath, $temporaryPdfPath);

            $this->assertValidPdf($temporaryPdfPath);

            File::copy($temporaryPdfPath, $absolutePdfPath);

            $this->assertValidPdf($absolutePdfPath);
        } catch (\Throwable $e) {
            if (File::exists($temporaryPdfPath)) {
                File::delete($temporaryPdfPath);
            }

            throw $e;
        }

        File::delete($temporaryPdfPath);

        return [
            'pdf_path' => $relativePdfPath,
        ];
    }

    /**
     * Resolve a stored generated-file path (docx|pdf) to an absolute path,
     * enforcing the project-storage guard. Only DB-stored relative paths
     * inside the Project storage root may be served — never the master
     * template, never arbitrary private files.
     *
     * @throws ProjectEfficiencySheetFileException
     */
    public function resolveGeneratedFile(ProjectEfficiencySheet $sheet, string $type): string
    {
        $relative = $type === 'docx' ? $sheet->docx_path : $sheet->pdf_path;

        if (! self::isSafeProjectPath($relative, $type)) {
            throw new ProjectEfficiencySheetFileException;
        }

        $absolute = Storage::disk('local')->path($relative);

        // Defense in depth: resolved path must stay inside the private disk root.
        $storageRoot = realpath(Storage::disk('local')->path(''));
        $realFile = realpath($absolute);

        if (! $storageRoot || ! $realFile || ! str_starts_with($realFile, $storageRoot)) {
            throw new ProjectEfficiencySheetFileException;
        }

        if (! is_file($absolute)) {
            throw new ProjectEfficiencySheetFileException;
        }

        return $absolute;
    }

    /**
     * Path guard for generated fiche files. Rejects absolute paths (C:\, /etc),
     * traversal segments, backslashes, non-project locations, the master
     * template folder and unexpected extensions. The request never supplies a
     * path — only DB-stored relative paths reach this check.
     */
    public static function isSafeProjectPath(?string $relative, string $extension): bool
    {
        if (! is_string($relative) || trim($relative) === '') {
            return false;
        }

        if (str_starts_with($relative, '/') || str_starts_with($relative, '\\')) {
            return false;
        }

        if (preg_match('/^[A-Za-z]:/', $relative) === 1) {
            return false;
        }

        if (str_contains($relative, '\\')) {
            return false;
        }

        $segments = explode('/', $relative);

        if (in_array('..', $segments, true)) {
            return false;
        }

        // Generated files live under the Project storage root only.
        if (($segments[0] ?? null) !== 'archilbo' || ($segments[1] ?? null) !== 'DATA') {
            return false;
        }

        // Never serve the protected master template as a project document.
        if (str_contains($relative, 'archi-templates')) {
            return false;
        }

        return str_ends_with(strtolower($relative), '.'.$extension);
    }

    /**
     * PDF sits next to its DOCX with the same versioned name.
     */
    private function pdfPathFor(string $docxPath): string
    {
        return substr($docxPath, 0, -5).'.pdf';
    }

    private function assertValidPdf(string $absolutePdfPath): void
    {
        if (! is_file($absolutePdfPath)) {
            throw new RuntimeException('Fiche efficacité: le PDF n\'a pas été créé.');
        }

        if (filesize($absolutePdfPath) === 0) {
            throw new RuntimeException('Fiche efficacité: le PDF généré est vide.');
        }
    }

    /**
     * Fails generation if any placeholder survived both replacement passes —
     * a generated fiche must never ship raw tokens.
     *
     * Detection merges every <w:t> run per paragraph BEFORE matching: tokens
     * fragmented across runs (e.g. "[", "ENTREPRISE_", "CEO]") are invisible
     * to a raw-XML substring scan and must be concatenated first. Matching is
     * pattern-based ([UPPER_CASE...]) so even tokens unknown to the map can
     * never pass through silently.
     */
    private function assertNoPlaceholderRemains(string $docxPath): void
    {
        $remaining = [];

        foreach ($this->mergedParagraphTexts($docxPath) as $text) {
            preg_match_all('/\[[A-Z][A-Z0-9_]+\]/', $text, $matches);

            foreach ($matches[0] as $match) {
                $remaining[] = trim($match, '[]');
            }
        }

        $remaining = array_values(array_unique($remaining));

        if ($remaining !== []) {
            throw new RuntimeException(
                'Fiche efficacité: placeholders non remplacés ('.implode(', ', $remaining).').'
            );
        }
    }

    /**
     * Ground-truth inventory of every [TOKEN] present in a DOCX, with runs
     * merged per paragraph so fragmented placeholders are detected.
     *
     * @return list<string> unique token names, e.g. ["USAGE_DU_BATIMENT"]
     */
    private function detectTemplateTokens(string $docxPath): array
    {
        $tokens = [];

        foreach ($this->mergedParagraphTexts($docxPath) as $text) {
            preg_match_all('/\[[A-Z][A-Z0-9_]+\]/', $text, $matches);

            foreach ($matches[0] as $match) {
                $tokens[] = trim($match, '[]');
            }
        }

        return array_values(array_unique($tokens));
    }

    /**
     * Concatenated plain text of every paragraph across word/*.xml files.
     * This is exactly what the replacement passes operate on: the raw XML
     * may split a token across several <w:t> runs, so all matching must
     * happen on the merged text.
     *
     * @return list<string>
     */
    private function mergedParagraphTexts(string $docxPath): array
    {
        $zip = new ZipArchive;

        if ($zip->open($docxPath) !== true) {
            throw new RuntimeException('Fiche efficacité: impossible de relire le fichier généré.');
        }

        $texts = [];

        for ($index = 0; $index < $zip->numFiles; $index++) {
            $name = $zip->getNameIndex($index);

            if (! $name || ! str_starts_with($name, 'word/') || ! str_ends_with($name, '.xml')) {
                continue;
            }

            $xml = $zip->getFromName($name);

            if ($xml === false) {
                continue;
            }

            libxml_use_internal_errors(true);

            $dom = new \DOMDocument;
            $dom->loadXML($xml, LIBXML_PARSEHUGE);
            $xpath = new \DOMXPath($dom);
            $xpath->registerNamespace('w', 'http://schemas.openxmlformats.org/wordprocessingml/2006/main');

            foreach ($xpath->query('//w:p') as $p) {
                $text = '';

                foreach ($xpath->query('.//w:t', $p) as $t) {
                    $text .= $t->textContent;
                }

                $texts[] = $text;
            }
        }

        $zip->close();

        return $texts;
    }
}
