<?php

namespace App\Services\Dossiers;

use App\Models\Dossier;
use Illuminate\Support\Collection;

class DossierLocationGroupingService
{
    public function groups(): array
    {
        $dossiers = Dossier::query()
            ->with(['client', 'documents', 'financeDocuments', 'payments'])
            ->latest()
            ->get();

        return $dossiers
            ->groupBy(fn (Dossier $dossier) => $this->locationLabel($dossier->province, 'Province non renseignee'))
            ->map(fn (Collection $provinceDossiers, string $province) => [
                'province' => $province,
                'stats' => $this->stats($provinceDossiers),
                'communes' => $provinceDossiers
                    ->groupBy(fn (Dossier $dossier) => $this->locationLabel($dossier->commune, 'Commune non renseignee'))
                    ->map(fn (Collection $communeDossiers, string $commune) => [
                        'commune' => $commune,
                        'stats' => $this->stats($communeDossiers),
                        'dossiers' => $communeDossiers->values()->map(fn (Dossier $dossier) => $this->row($dossier))->all(),
                    ])
                    ->values()
                    ->all(),
            ])
            ->values()
            ->all();
    }

    public function stats(Collection $dossiers): array
    {
        $financeDocuments = $dossiers->flatMap(fn (Dossier $dossier) => $dossier->financeDocuments);
        $invoices = $financeDocuments->where('type', 'invoice');
        $payments = $dossiers->flatMap(fn (Dossier $dossier) => $dossier->payments);

        return [
            'projectsCount' => $dossiers->count(),
            'openCount' => $dossiers->whereIn('status', ['active', 'opened'])->count(),
            'closedCount' => $dossiers->whereIn('status', ['closed', 'cloture'])->count(),
            'documentsCount' => $dossiers->sum(fn (Dossier $dossier) => $dossier->documents->count()),
            'financeDocumentsCount' => $financeDocuments->count(),
            'invoicesTotal' => (float) $invoices->sum('total_ttc'),
            'paidTotal' => (float) $payments->sum('amount'),
            'remainingTotal' => (float) $invoices->sum('remaining_total'),
        ];
    }

    private function row(Dossier $dossier): array
    {
        $financeDocuments = $dossier->financeDocuments;
        $invoices = $financeDocuments->where('type', 'invoice');

        return [
            'id' => $dossier->id,
            'clientId' => $dossier->client_id,
            'ownerName' => $dossier->client?->full_name,
            'clientNumber' => $dossier->client?->client_number,
            'dossierNumber' => $dossier->dossier_number,
            'projectObject' => $dossier->project_object,
            'projectAddress' => $dossier->project_address,
            'province' => $dossier->province,
            'commune' => $dossier->commune,
            'status' => $dossier->status,
            'workflowStep' => $dossier->workflow_step,
            'documentsCount' => $dossier->documents->count(),
            'financeDocumentsCount' => $financeDocuments->count(),
            'invoicesTotal' => (float) $invoices->sum('total_ttc'),
            'paidTotal' => (float) $dossier->payments->sum('amount'),
            'remainingTotal' => (float) $invoices->sum('remaining_total'),
        ];
    }

    private function locationLabel(?string $value, string $fallback): string
    {
        $label = trim((string) $value);

        return $label !== '' ? $label : $fallback;
    }
}
