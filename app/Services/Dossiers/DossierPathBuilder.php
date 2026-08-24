<?php

namespace App\Services\Dossiers;

use App\Models\Contract;
use App\Models\Dossier;
use App\Models\DocumentTemplate;
use App\Models\ProjectEfficiencySheet;
use Illuminate\Support\Str;

class DossierPathBuilder
{
    public function dossierBasePath(Dossier $dossier): string
    {
        return implode('/', array_filter([
            'archilbo',
            'DATA',
            static::folderSafe($dossier->city?->name ?? 'INCONNU'),
            static::folderSafe($dossier->commune ?? 'INCONNU'),
            static::folderSafe($dossier->primaryClient?->full_name ?? 'INCONNU'),
            $this->dossierFolderName($dossier),
        ]));
    }

    public function financeDocumentDirectory(Dossier $dossier, string $type, string $number): string
    {
        $typeFolder = match ($type) {
            'quote' => 'devis',
            'invoice' => 'factures',
            'receipt' => 'recus',
            default => 'documents',
        };

        return $this->dossierBasePath($dossier)
            . '/finance/' . $typeFolder . '/' . $this->sanitize($number);
    }

    public function documentPath(Dossier $dossier, ?DocumentTemplate $template, string $originalFilename): string
    {
        $typeFolder = match ($template?->document_type) {
            'contract' => 'Contrat',
            'cahier_chantier' => 'Cahier_Chantier',
            'rokhas' => 'Rokhas',
            'bureau_etude' => 'Bureau_Etude',
            'permis_habiter' => 'Permis_Habiter',
            'archive' => 'Archive',
            default => 'Documents',
        };

        $filename = $template
            ? $this->sanitize($template->code) . '_' . $this->sanitize($originalFilename ?: 'document')
            : $this->sanitize($originalFilename ?: 'document');

        return $this->dossierBasePath($dossier) . '/documents/' . $typeFolder . '/' . $filename;
    }

    public function designPath(Dossier $dossier): string
    {
        return $this->dossierBasePath($dossier) . '/DESIGNS';
    }

    public function contractDocxPath(Contract $contract, Dossier $dossier): string
    {
        return $this->contractPath($contract, $dossier, 'docx');
    }

    public function contractPdfPath(Contract $contract, Dossier $dossier): string
    {
        return $this->contractPath($contract, $dossier, 'pdf');
    }

    /**
     * Relative storage path for a generated fiche efficacité DOCX.
     *
     * Each version gets its own file (fiche-efficacite-{dossier}-v{n}.docx);
     * regeneration never overwrites or deletes previous version files, and
     * only relative paths are ever stored on the fiche row.
     */
    public function efficiencySheetDocxPath(ProjectEfficiencySheet $sheet, Dossier $dossier, int $version): string
    {
        $code = $this->sanitize($dossier->dossier_number ?: 'projet');

        return $this->dossierBasePath($dossier)
            . '/Fiche_Efficacite/'
            . 'fiche-efficacite-' . $code . '-v' . $version . '.docx';
    }

    private function contractPath(Contract $contract, Dossier $dossier, string $ext): string
    {
        $client = $dossier->primaryClient;
        $civility = $client?->civility ?? 'M';
        $name = $client?->full_name ?? 'contrat';

        $filename = 'CONTRAT D\'ARCHITECT ' . $civility . ' ' . $name;

        // Remove only truly dangerous filesystem characters, keep uppercase and spaces
        $safe = preg_replace('/[\/\\\\:*?"<>|]/', '_', $filename);

        return $this->dossierBasePath($dossier)
            . '/Contrat/'
            . $safe
            . '.' . $ext;
    }

    private function dossierFolderName(Dossier $dossier): string
    {
        $projectName = $dossier->project_object ?? 'PROJET';

        return static::folderSafe($dossier->project_label . ' ' . $projectName);
    }

    public function sanitize(?string $value): string
    {
        if ($value === null || $value === '') {
            return 'inconnu';
        }

        return Str::of($value)
            ->ascii()
            ->lower()
            ->replace(['_', '-'], ' ')
            ->squish()
            ->replace([' ', '/', '\\', ':', '*', '?', '"', '<', '>', '|', '\''], '_')
            ->replaceMatches('/_{2,}/', '_')
            ->trim('_')
            ->toString();
    }

    public static function folderSafe(?string $value): string
    {
        if ($value === null || $value === '') {
            return 'INCONNU';
        }

        return Str::of($value)
            ->ascii()
            ->upper()
            ->replace(['/', '\\', ':', '*', '?', '"', '<', '>', '|'], '_')
            ->squish()
            ->toString();
    }
}
