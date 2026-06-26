<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreClientRequest;
use App\Http\Requests\UpdateClientRequest;
use App\Http\Resources\ClientResource;
use App\Models\Client;
use App\Models\Intermediary;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ClientController extends Controller
{
    public function index(): Response
    {
        $clients = Client::query()
            ->with('intermediary')
            ->withCount('dossiers')
            ->latest()
            ->get();

        return Inertia::render('Clients/Index', [
            'clients' => ClientResource::collection($clients)->resolve(),
            'intermediaries' => $this->intermediaryOptions(),
            'metrics' => [
                'total' => Client::count(),
                'active' => Client::where('status', 'active')->count(),
                'inactive' => Client::where('status', 'inactive')->count(),
                'archived' => Client::where('status', 'archived')->count(),
            ],
        ]);
    }

    public function show(Client $client): Response
    {
        $client->load(['intermediary', 'dossiers'])->loadCount('dossiers');

        return Inertia::render('Clients/Show', [
            'client' => ClientResource::make($client)->resolve(),
            'dossiers' => $client->dossiers()
                ->latest()
                ->get()
                ->map(fn ($dossier) => [
                    'id' => $dossier->id,
                    'dossierNumber' => $dossier->dossier_number,
                    'projectObject' => $dossier->project_object,
                    'status' => $dossier->status,
                    'workflowStep' => $dossier->workflow_step,
                    'updatedAt' => optional($dossier->updated_at)->diffForHumans(),
                ])
                ->values(),
        ]);
    }

    public function store(StoreClientRequest $request): RedirectResponse
    {
        $data = $this->prepareClientData($request->validated());
        $data['client_number'] = $this->nextClientNumber();

        Client::create($data);

        return redirect()
            ->route('clients.index')
            ->with('success', 'Client created successfully.');
    }

    public function update(UpdateClientRequest $request, Client $client): RedirectResponse
    {
        $client->update($this->prepareClientData($request->validated()));

        return redirect()
            ->route('clients.index')
            ->with('success', 'Client updated successfully.');
    }

    public function destroy(Client $client): RedirectResponse
    {
        $client->delete();

        return redirect()
            ->route('clients.index')
            ->with('success', 'Client deleted successfully.');
    }

    private function prepareClientData(array $data): array
    {
        $firstName = trim((string) ($data['first_name'] ?? ''));
        $lastName = trim((string) ($data['last_name'] ?? ''));

        $data['full_name'] = trim($firstName . ' ' . $lastName);

        if ($data['full_name'] === '') {
            $data['full_name'] = 'Unnamed client';
        }

        $data['status'] = $data['status'] ?? 'active';

        if (($data['intermediary_id'] ?? null) === '') {
            $data['intermediary_id'] = null;
        }

        return $data;
    }

    private function nextClientNumber(): string
    {
        $year = now()->format('Y');
        $next = Client::count() + 1;

        do {
            $number = sprintf('CL-%s-%04d', $year, $next);
            $next++;
        } while (Client::where('client_number', $number)->exists());

        return $number;
    }

    private function intermediaryOptions(): array
    {
        return Intermediary::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(fn (Intermediary $intermediary) => [
                'id' => (string) $intermediary->id,
                'label' => $intermediary->name,
            ])
            ->values()
            ->all();
    }
}