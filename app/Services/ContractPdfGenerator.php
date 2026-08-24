<?php

namespace App\Services;

use App\Models\Contract;
use App\Services\Dossiers\DossierPathBuilder;
use Illuminate\Support\Facades\Storage;

class ContractPdfGenerator
{
    public function generate(Contract $contract): string
    {
        $contract->loadMissing(['dossier.primaryClient', 'dossier.city']);
        $dossier = $contract->dossier;
        $docxPath = $contract->generated_document_path;

        if (! $docxPath || ! Storage::disk('local')->exists($docxPath)) {
            throw new \RuntimeException('Le document Word du contrat doit etre genere avant le PDF.');
        }

        $pathBuilder = app(DossierPathBuilder::class);
        $relativePdfPath = $pathBuilder->contractPdfPath($contract, $dossier);
        $converter = app(OfficeDocumentConverter::class);

        if (! $converter->isAvailable()) {
            throw new \RuntimeException(
                'La conversion PDF depuis le modele Word requiert LibreOffice sur le serveur.'
            );
        }

        $converter->convertDocxToPdf(
            Storage::disk('local')->path($docxPath),
            Storage::disk('local')->path($relativePdfPath),
        );

        return $relativePdfPath;
    }
}
