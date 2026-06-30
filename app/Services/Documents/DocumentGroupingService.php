<?php

namespace App\Services\Documents;

use App\Models\DossierDocument;
use Illuminate\Support\Collection;

class DocumentGroupingService
{
    public function groups(): array
    {
        $documents = DossierDocument::query()
            ->with(['dossier.client', 'template'])
            ->latest()
            ->get();

        return $documents
            ->groupBy(fn (DossierDocument $document) => $this->locationLabel($document->dossier?->province, 'Province non renseignee'))
            ->map(fn (Collection $provinceDocuments, string $province) => [
                'province' => $province,
                'stats' => $this->stats($provinceDocuments),
                'communes' => $provinceDocuments
                    ->groupBy(fn (DossierDocument $document) => $this->locationLabel($document->dossier?->commune, 'Commune non renseignee'))
                    ->map(fn (Collection $communeDocuments, string $commune) => [
                        'commune' => $commune,
                        'stats' => $this->stats($communeDocuments),
                        'clients' => $communeDocuments
                            ->groupBy(fn (DossierDocument $document) => $document->dossier?->client?->full_name ?: 'Client non renseigne')
                            ->map(fn (Collection $clientDocuments, string $clientName) => [
                                'clientName' => $clientName,
                                'stats' => $this->stats($clientDocuments),
                                'projects' => $clientDocuments
                                    ->groupBy(fn (DossierDocument $document) => $document->dossier?->dossier_number ?: 'Dossier non renseigne')
                                    ->map(fn (Collection $projectDocuments, string $dossierNumber) => [
                                        'dossierNumber' => $dossierNumber,
                                        'projectObject' => $projectDocuments->first()?->dossier?->project_object,
                                        'stats' => $this->stats($projectDocuments),
                                        'types' => $projectDocuments
                                            ->groupBy(fn (DossierDocument $document) => $document->template?->document_type ?: 'Document')
                                            ->map(fn (Collection $typeDocuments, string $type) => [
                                                'type' => $type,
                                                'stats' => $this->stats($typeDocuments),
                                                'documents' => $typeDocuments->values()->map(fn (DossierDocument $document) => $this->row($document))->all(),
                                            ])
                                            ->values()
                                            ->all(),
                                    ])
                                    ->values()
                                    ->all(),
                            ])
                            ->values()
                            ->all(),
                    ])
                    ->values()
                    ->all(),
            ])
            ->values()
            ->all();
    }

    private function stats(Collection $documents): array
    {
        return [
            'documentsCount' => $documents->count(),
            'uploadedCount' => $documents->whereIn('status', ['uploaded', 'verified'])->count(),
            'verifiedCount' => $documents->where('status', 'verified')->count(),
            'missingCount' => $documents->where('status', 'missing')->count(),
            'rejectedCount' => $documents->where('status', 'rejected')->count(),
        ];
    }

    private function row(DossierDocument $document): array
    {
        return [
            'id' => $document->id,
            'dossierId' => $document->dossier_id,
            'dossierNumber' => $document->dossier?->dossier_number,
            'projectObject' => $document->dossier?->project_object,
            'clientName' => $document->dossier?->client?->full_name,
            'templateName' => $document->template?->name,
            'documentType' => $document->template?->document_type,
            'documentNumber' => $document->document_number,
            'status' => $document->status,
            'originalFilename' => $document->original_filename,
            'uploadedAt' => optional($document->uploaded_at)->toDateString(),
        ];
    }

    private function locationLabel(?string $value, string $fallback): string
    {
        $label = trim((string) $value);

        return $label !== '' ? $label : $fallback;
    }
}
