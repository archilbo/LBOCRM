<?php

namespace App\Services\Dossiers;

use App\Models\Contract;
use App\Models\Dossier;
use App\Models\DocumentTemplate;
use Illuminate\Support\Str;

class DossierPathBuilder
{
    public function dossierBasePath(Dossier $dossier): string
    {
        return implode('/', array_filter([
            'archilbo',
            $this->sanitize($dossier->city?->name ?? 'inconnu'),
            $this->sanitize($dossier->commune ?? 'inconnu'),
            $this->sanitize($dossier->client?->full_name ?? 'inconnu'),
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

        return $this->dossierBasePath($dossier) . '/' . $typeFolder . '/' . $filename;
    }

    public function contractDocxPath(Contract $contract, Dossier $dossier): string
    {
        return $this->contractPath($contract, $dossier, 'docx');
    }

    public function contractPdfPath(Contract $contract, Dossier $dossier): string
    {
        return $this->contractPath($contract, $dossier, 'pdf');
    }

    private function contractPath(Contract $contract, Dossier $dossier, string $ext): string
    {
        return $this->dossierBasePath($dossier)
            . '/Contrat/'
            . $this->sanitize($contract->contract_number ?? 'contrat-' . $contract->id)
            . '-contrat.' . $ext;
    }

    private function dossierFolderName(Dossier $dossier): string
    {
        $number = $this->sanitize($dossier->dossier_number ?? 'dossier-' . $dossier->id);
        $projectName = $this->sanitize($dossier->project_object ?? null);

        return $projectName === 'inconnu' ? $number : $number . '_' . $projectName;
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
}
