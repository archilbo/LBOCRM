<?php

namespace App\Http\Controllers\Api;

use App\Models\Client;
use App\Models\Dossier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class ClientController extends Controller
{
    public function search(Request $request): JsonResponse
    {
        $q = trim((string) $request->string('q', ''));
        $limit = max(1, min(100, $request->integer('limit', 20)));

        $clients = Client::query()
            ->when($q !== '', fn ($query) => $query
                ->where('full_name', 'like', "%{$q}%")
                ->orWhere('client_number', 'like', "%{$q}%")
            )
            ->orderBy('full_name')
            ->limit($limit)
            ->get(['id', 'full_name as name', 'client_number as code']);

        return response()->json(['data' => $clients]);
    }

    public function projects(Request $request, Client $client): JsonResponse
    {
        $q = trim((string) $request->string('q', ''));
        $limit = max(1, min(100, $request->integer('limit', 20)));

        $dossiers = Dossier::query()
            ->where('client_id', $client->id)
            ->when($q !== '', fn ($query) => $query
                ->where('project_object', 'like', "%{$q}%")
                ->orWhere('dossier_number', 'like', "%{$q}%")
            )
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get(['id', 'project_object as name', 'dossier_number as code', 'client_id']);

        return response()->json(['data' => $dossiers]);
    }
}
