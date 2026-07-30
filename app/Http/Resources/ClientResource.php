<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClientResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'clientNumber' => $this->client_number,
            'civility' => $this->civility,
            'firstName' => $this->first_name,
            'lastName' => $this->last_name,
            'fullName' => $this->full_name,
            'cin' => $this->cin,
            'phone' => $this->phone,
            'email' => $this->email,
            'address' => $this->address,
            'fatherName' => $this->father_name,
            'motherName' => $this->mother_name,
            'cniExpirationDate' => optional($this->cni_expiration_date)->format('Y-m-d'),
            'intermediaryId' => $this->intermediary_id ? (string) $this->intermediary_id : '',
            'intermediaryName' => $this->intermediary?->name ?? 'None',
            'status' => $this->status,
            'projectsCount' => $this->dossiers_count ?? $this->dossiers()->count(),
            'updatedAt' => optional($this->updated_at)->diffForHumans(),
            'createdAt' => optional($this->created_at)->format('Y-m-d'),
            'notes' => $this->notes,
            'capabilities' => [
                'view' => $request->user()?->can('view', $this->resource) ?? false,
                'update' => $request->user()?->can('update', $this->resource) ?? false,
                'delete' => $request->user()?->can('delete', $this->resource) ?? false,
                'updateStatus' => $request->user()?->can('updateStatus', $this->resource) ?? false,
            ],
        ];
    }
}
