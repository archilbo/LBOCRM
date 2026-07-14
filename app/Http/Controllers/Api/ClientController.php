<?php

namespace App\Http\Controllers\Api;

use App\Models\Client;
use App\Models\Dossier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class ClientController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $q = $request->string('q', '');
        $limit = max(1, min(100, $request->integer('limit', 20)));

        $clients = Client::query()
            ->when($q->isNotEmpty(), fn ($query) => $query->where('full_name', 'ilike', "%{$q}%"))
            ->orderBy('full_name')
            ->limit($limit)
            ->get(['id', 'full_name as name', 'client_number as code']);

        return response()->json(['data' => $clients]);
    }

    public function projects(Request $request, Client $client): JsonResponse
    {
        $q = $request->string('q', '');
        $limit = max(1, min(100, $request->integer('limit', 20)));

        $dossiers = Dossier::query()
            ->where('client_id', $client->id)
            ->when($q->isNotEmpty(), fn ($query) => $query->where('project_object', 'ilike', "%{$q}%"))
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get(['id', 'project_object as name', 'dossier_number as code', 'client_id']);

        return response()->json(['data' => $dossiers]);
    }
}
