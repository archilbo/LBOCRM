<?php

namespace App\Services;

use App\Models\Contract;
use App\Services\Dossiers\DossierPathBuilder;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;

class ContractPdfGenerator
{
    public function generate(Contract $contract): string
    {
        $contract->loadMissing(['dossier.client', 'dossier.city']);
        $dossier = $contract->dossier;
        $client = $dossier?->client;

        $feeRatePercent = (float) ($contract->fee_rate_percent ?? config('archilbo_templates.contracts.default_rate', 0.5));
        $unitPrice = (float) config('archilbo_templates.contracts.construction_unit_price', 900);
        $plancher = (float) ($contract->surface ?: $dossier?->floor_area ?: 0);
        $sup = (float) ($dossier?->land_surface ?: 0);
        $estimation = $plancher * $unitPrice;

        $data = [
            'date' => now()->format('d/m/Y'),
            'civility' => $client?->civility ?? 'M',
            'clientName' => $client?->full_name ?? '-',
            'cin' => $client?->cin ?? '-',
            'clientAddress' => $client?->address ?? '-',
            'projectObject' => $dossier?->project_object ?? '-',
            'projectAddress' => $dossier?->project_address ?? '-',
            'titre' => $dossier?->land_title_number ?? '-',
            'sup' => number_format($sup, 0, '.', ' '),
            'pref' => $dossier?->province ?? '-',
            'commune' => $dossier?->commune ?? '-',
            'plancher' => number_format($plancher, 0, '.', ' '),
            'estimation' => number_format($estimation, 2, '.', ' '),
            'ht' => number_format($contract->ht, 2, '.', ' '),
            'tva' => number_format($contract->tva, 2, '.', ' '),
            'ttc' => number_format($contract->ttc, 2, '.', ' '),
            'contractNumber' => $contract->contract_number,
            'rate' => $feeRatePercent,
            'dossierNumber' => $dossier?->dossier_number ?? '-',
        ];

        $html = view('pdfs.contract', $data)->render();

        $pdf = Pdf::loadHTML($html);
        $pdf->setPaper('A4', 'portrait');

        $pathBuilder = app(DossierPathBuilder::class);
        $relativePdfPath = $pathBuilder->contractPdfPath($contract, $dossier);

        Storage::disk('local')->put($relativePdfPath, $pdf->output());

        return $relativePdfPath;
    }
}
