<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Dossier;
use App\Services\CompanyContext;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    public function search(Request $request, CompanyContext $companyContext): JsonResponse
    {
        $this->authorize('viewAny', Client::class);

        $q = trim((string) $request->string('q', ''));
        $limit = max(1, min(100, $request->integer('limit', 20)));

        $clients = $companyContext->applyTo(Client::query(), $request->user())
            ->when($q !== '', fn (Builder $query) => $query->where(fn (Builder $search) => $search
                ->where('full_name', 'like', "%{$q}%")
                ->orWhere('client_number', 'like', "%{$q}%")))
            ->orderBy('full_name')
            ->limit($limit)
            ->get(['id', 'full_name as name', 'client_number as code']);

        return response()->json(['data' => $clients]);
    }

    public function projects(Request $request, Client $client, CompanyContext $companyContext): JsonResponse
    {
        $this->authorize('view', $client);

        $q = trim((string) $request->string('q', ''));
        $limit = max(1, min(100, $request->integer('limit', 20)));

        $dossiers = $companyContext->applyTo(Dossier::query(), $request->user())
            ->whereHas('clients', fn (Builder $query) => $query->whereKey($client->id))
            ->when($q !== '', fn (Builder $query) => $query->where(fn (Builder $search) => $search
                ->where('project_object', 'like', "%{$q}%")
                ->orWhere('dossier_number', 'like', "%{$q}%")))
            ->orderByDesc('created_at')
            ->limit($limit)
            ->with('primaryClient:clients.id,clients.full_name')
            ->get(['id', 'project_object as name', 'dossier_number as code', 'client_id'])
            ->map(fn (Dossier $dossier) => [
                'id' => $dossier->id,
                'name' => $dossier->name,
                'code' => $dossier->code,
                'client_id' => $dossier->client_id,
                'primary_client_name' => $dossier->primaryClient?->full_name,
            ])
            ->values();

        return response()->json(['data' => $dossiers]);
    }
}
