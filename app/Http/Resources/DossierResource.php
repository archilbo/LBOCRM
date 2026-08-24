<?php

namespace App\Http\Resources;

use App\Models\User;
use App\Services\PermissionRegistry;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DossierResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        /** @var User|null $user */
        $user = $request->user();
        $permissions = app(PermissionRegistry::class);

        $canViewDocuments = $user !== null && $permissions->allows($user, 'documents.view');
        $canViewFinance = $user !== null && $permissions->allows($user, 'finance.view');
        $canViewContracts = $user !== null && $permissions->allows($user, 'contracts.view');
        $canViewArchive = $user !== null && $permissions->allows($user, 'archive.view');

        $attributes = $this->resource->getAttributes();

        $documentsCount = $canViewDocuments && array_key_exists('documents_count', $attributes)
            ? (int) $attributes['documents_count']
            : 0;

        $financeDocumentsCount = $canViewFinance && array_key_exists('finance_documents_count', $attributes)
            ? (int) $attributes['finance_documents_count']
            : 0;

        // Primary client: prefer the eager-loaded primaryClient relation
        // (includes soft-deleted clients), fall back to the is_primary pivot
        // flag on the active members list.
        $primaryClient = ($this->relationLoaded('primaryClient') ? $this->primaryClient : null)
            ?? ($this->relationLoaded('clients')
                ? ($this->clients->firstWhere('pivot.is_primary', true) ?? $this->clients->first())
                : null)
            ?? ($this->relationLoaded('client') ? $this->client : null);

        $clients = $this->relationLoaded('clients') && $this->clients->isNotEmpty()
            ? $this->clients->map(fn ($client) => [
                'id' => (string) $client->id,
                'fullName' => $client->full_name,
                'clientNumber' => $client->client_number,
                'cin' => $client->cin,
                'phone' => $client->phone,
                'isPrimary' => (bool) $client->pivot->is_primary,
            ])->values()->all()
            : ($primaryClient ? [[
                'id' => (string) $primaryClient->id,
                'fullName' => $primaryClient->full_name,
                'clientNumber' => $primaryClient->client_number,
                'cin' => $primaryClient->cin,
                'phone' => $primaryClient->phone,
                'isPrimary' => true,
            ]] : []);

        return [
            'id' => $this->id,
            // Legacy single-client aliases (Phase A compatibility for the
            // current frontend); they resolve to the PRIMARY client and will
            // be removed once the UI consumes `clients` + `primaryClient`.
            'clientId' => $primaryClient?->id ? (string) $primaryClient->id : ($this->client_id ? (string) $this->client_id : ''),
            'clientName' => $primaryClient?->full_name ?? '-',
            'clientNumber' => $primaryClient?->client_number ?? '-',
            'clientCin' => $primaryClient?->cin ?? '-',
            'clientPhone' => $primaryClient?->phone ?? '-',

            'clients' => $clients,
            'primaryClientId' => $primaryClient?->id ? (string) $primaryClient->id : '',
            'intermediaryId' => $this->intermediary_id ? (string) $this->intermediary_id : '',
            'intermediaryName' => $this->intermediary?->name ?? null,
            'cityId' => $this->city_id ? (string) $this->city_id : '',
            'dossierNumber' => $this->dossier_number,
            'sequenceNumber' => $this->sequence_number,
            'period' => $this->period,
            'projectObject' => $this->project_object,
            'description' => $this->description,
            'projectAddress' => $this->project_address,
            'province' => $this->province,
            'commune' => $this->commune,
            'landTitleNumber' => $this->land_title_number,
            'landSurface' => $this->land_surface !== null ? (float) $this->land_surface : null,
            'floorArea' => $this->floor_area !== null ? (float) $this->floor_area : null,
            'status' => $this->status,
            'workflowStep' => $this->workflow_step,
            'openedAt' => optional($this->opened_at)->format('Y-m-d'),
            'closedAt' => optional($this->closed_at)->format('Y-m-d'),
            'updatedAt' => optional($this->updated_at)->diffForHumans(),
            'updatedAtSort' => optional($this->updated_at)->toIso8601String(),
            'createdAt' => optional($this->created_at)->format('Y-m-d'),
            'notes' => $this->notes,
            'documentsCount' => $documentsCount,
            'financeDocumentsCount' => $financeDocumentsCount,

            // Temporary compatibility alias for the existing Projects frontend.
            // It is removed in the frontend migration step.
            'financeRecordsCount' => $financeDocumentsCount,

            'hasContract' => $canViewContracts
                && (bool) ($attributes['contract_exists'] ?? false),
            'hasArchiveRecord' => $canViewArchive
                && (bool) ($attributes['archive_record_exists'] ?? false),
            'city' => $this->relationLoaded('city') && $this->city !== null
                ? [
                    'id' => $this->city->id,
                    'name' => $this->city->name,
                    'code' => $this->city->code,
                    'color' => $this->city->color,
                ]
                : null,
        ];
    }
}
