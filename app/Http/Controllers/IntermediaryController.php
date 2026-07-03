<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreIntermediaryRequest;
use App\Http\Requests\UpdateIntermediaryRequest;
use App\Http\Resources\IntermediaryResource;
use App\Models\Intermediary;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class IntermediaryController extends Controller
{
    public function index(): Response
    {
        $intermediaries = Intermediary::query()
            ->withCount('clients')
            ->latest()
            ->get();

        $monthlyClients = \Illuminate\Support\Facades\DB::table('clients')
            ->whereNotNull('intermediary_id')
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month, count(*) as count")
            ->groupBy('month')
            ->orderBy('month')
            ->pluck('count', 'month')
            ->toArray();

        $clientsThisMonth = \App\Models\Client::whereNotNull('intermediary_id')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        $topIntermediaries = $intermediaries->sortByDesc('clients_count')->take(5)->values()
            ->map(fn ($i) => [
                'id' => $i->id,
                'name' => $i->name,
                'clientsCount' => $i->clients_count,
            ]);

        return Inertia::render('Intermediaries/Index', [
            'intermediaries' => IntermediaryResource::collection($intermediaries)->resolve(),
            'metrics' => [
                'total' => Intermediary::count(),
                'active' => Intermediary::where('is_active', true)->count(),
                'inactive' => Intermediary::where('is_active', false)->count(),
                'linkedClients' => Intermediary::query()->withCount('clients')->get()->sum('clients_count'),
                'clientsThisMonth' => $clientsThisMonth,
            ],
            'monthlyClients' => collect($monthlyClients)->map(fn ($count, $month) => ['month' => $month, 'count' => $count])->values(),
            'topIntermediaries' => $topIntermediaries,
        ]);
    }

    public function show(Intermediary $intermediary): Response
    {
        $intermediary->loadCount('clients');
        $intermediary->load(['clients']);

        $relatedDossiers = $intermediary->clients()
            ->with('dossiers')
            ->get()
            ->pluck('dossiers')
            ->flatten();

        $monthlyClients = $intermediary->clients()
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month, count(*) as count")
            ->groupBy('month')
            ->orderBy('month')
            ->pluck('count', 'month')
            ->toArray();

        $monthlyProjects = \App\Models\Dossier::whereIn('client_id', $intermediary->clients()->pluck('id'))
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month, count(*) as count")
            ->groupBy('month')
            ->orderBy('month')
            ->pluck('count', 'month')
            ->toArray();

        $activeClients = $intermediary->clients()->where('status', 'active')->count();
        $inactiveClients = $intermediary->clients()->where('status', 'inactive')->count();
        $archivedClients = $intermediary->clients()->where('status', 'archived')->count();

        $projectStatusBreakdown = \App\Models\Dossier::whereIn('client_id', $intermediary->clients()->pluck('id'))
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        $latestClient = $intermediary->clients()->latest()->first();

        $clientsList = $intermediary->clients()
            ->withCount('dossiers')
            ->latest()
            ->get()
            ->map(fn ($client) => [
                'id' => $client->id,
                'fullName' => $client->full_name,
                'clientNumber' => $client->client_number,
                'cin' => $client->cin,
                'phone' => $client->phone,
                'email' => $client->email,
                'status' => $client->status,
                'projectsCount' => $client->dossiers_count,
                'createdAt' => optional($client->created_at)->format('Y-m-d'),
                'updatedAt' => optional($client->updated_at)->diffForHumans(),
            ]);

        $projectsList = \App\Models\Dossier::whereIn('client_id', $intermediary->clients()->pluck('id'))
            ->with('client:id,full_name')
            ->latest()
            ->get()
            ->map(fn ($dossier) => [
                'id' => $dossier->id,
                'dossierNumber' => $dossier->dossier_number,
                'projectObject' => $dossier->project_object,
                'clientName' => $dossier->client?->full_name,
                'status' => $dossier->status,
                'workflowStep' => $dossier->workflow_step,
                'commune' => $dossier->commune,
                'createdAt' => optional($dossier->created_at)->format('Y-m-d'),
                'updatedAt' => optional($dossier->updated_at)->diffForHumans(),
            ]);

        return Inertia::render('Intermediaries/Show', [
            'intermediary' => IntermediaryResource::make($intermediary)->resolve(),
            'metrics' => [
                'totalClients' => $intermediary->clients_count,
                'activeClients' => $activeClients,
                'inactiveClients' => $inactiveClients,
                'archivedClients' => $archivedClients,
                'totalProjects' => $relatedDossiers->count(),
                'activeProjects' => $relatedDossiers->where('status', 'active')->count(),
                'archivedProjects' => $relatedDossiers->where('status', 'archived')->count(),
                'latestClientName' => $latestClient?->full_name,
                'latestClientDate' => optional($latestClient?->created_at)->diffForHumans(),
            ],
            'monthlyClients' => collect($monthlyClients)->map(fn ($count, $month) => ['month' => $month, 'count' => $count])->values(),
            'monthlyProjects' => collect($monthlyProjects)->map(fn ($count, $month) => ['month' => $month, 'count' => $count])->values(),
            'clientStatusBreakdown' => [
                ['status' => 'active', 'count' => $activeClients],
                ['status' => 'inactive', 'count' => $inactiveClients],
                ['status' => 'archived', 'count' => $archivedClients],
            ],
            'projectStatusBreakdown' => collect($projectStatusBreakdown)->map(fn ($count, $status) => ['status' => $status, 'count' => $count])->values(),
            'clients' => $clientsList,
            'projects' => $projectsList,
        ]);
    }

    public function store(StoreIntermediaryRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['code'] = $this->nextIntermediaryCode();
        $data['type'] = $data['type'] ?? 'person';
        $data['is_active'] = $data['is_active'] ?? true;

        Intermediary::create($data);

        return redirect()
            ->route('intermediaries.index')
            ->with('success', 'Intermediary created successfully.');
    }

    public function update(UpdateIntermediaryRequest $request, Intermediary $intermediary): RedirectResponse
    {
        $data = $request->validated();
        $data['type'] = $data['type'] ?? 'person';
        $data['is_active'] = $data['is_active'] ?? false;

        $intermediary->update($data);

        return redirect()
            ->route('intermediaries.index')
            ->with('success', 'Intermediary updated successfully.');
    }

    public function destroy(Intermediary $intermediary): RedirectResponse
    {
        $intermediary->delete();

        return redirect()
            ->route('intermediaries.index')
            ->with('success', 'Intermediary deleted successfully.');
    }

    private function nextIntermediaryCode(): string
    {
        $year = now()->format('Y');
        $next = Intermediary::count() + 1;

        do {
            $code = sprintf('INT-%s-%04d', $year, $next);
            $next++;
        } while (Intermediary::where('code', $code)->exists());

        return $code;
    }
}
