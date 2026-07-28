<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreIntermediaryRequest;
use App\Http\Requests\UpdateIntermediaryRequest;
use App\Http\Resources\IntermediaryResource;
use App\Models\Client;
use App\Models\Dossier;
use App\Models\Intermediary;
use App\Services\CompanyContext;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class IntermediaryController extends Controller
{
    public function index(Request $request, CompanyContext $companyContext): Response
    {
        $this->authorize('viewAny', Intermediary::class);

        $intermediaries = $companyContext->applyTo(Intermediary::query(), $request->user())
            ->withCount(['clients' => fn (Builder $query) => $companyContext->applyTo($query, $request->user())])
            ->latest()
            ->get();

        $monthlyClients = $companyContext->applyTo(Client::query(), $request->user())
            ->whereNotNull('intermediary_id')
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month, count(*) as count")
            ->groupBy('month')
            ->orderBy('month')
            ->pluck('count', 'month')
            ->toArray();

        $clientsThisMonth = $companyContext->applyTo(Client::query(), $request->user())
            ->whereNotNull('intermediary_id')
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
                'total' => $intermediaries->count(),
                'active' => $intermediaries->where('is_active', true)->count(),
                'inactive' => $intermediaries->where('is_active', false)->count(),
                'linkedClients' => $intermediaries->sum('clients_count'),
                'clientsThisMonth' => $clientsThisMonth,
            ],
            'monthlyClients' => collect($monthlyClients)->map(fn ($count, $month) => ['month' => $month, 'count' => $count])->values(),
            'topIntermediaries' => $topIntermediaries,
        ]);
    }

    public function show(Request $request, Intermediary $intermediary, CompanyContext $companyContext): Response
    {
        $this->authorize('view', $intermediary);

        $clientsQuery = $this->clientsQuery($intermediary, $request, $companyContext);
        $clientsCount = (clone $clientsQuery)->count();
        $intermediary->setAttribute('clients_count', $clientsCount);

        $relatedDossiers = $companyContext->applyTo(Dossier::query(), $request->user())
            ->whereIn('client_id', (clone $clientsQuery)->select('id'))
            ->get();

        $monthlyClients = (clone $clientsQuery)
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month, count(*) as count")
            ->groupBy('month')
            ->orderBy('month')
            ->pluck('count', 'month')
            ->toArray();

        $monthlyProjects = $companyContext->applyTo(Dossier::query(), $request->user())
            ->whereIn('client_id', (clone $clientsQuery)->select('id'))
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month, count(*) as count")
            ->groupBy('month')
            ->orderBy('month')
            ->pluck('count', 'month')
            ->toArray();

        $activeClients = (clone $clientsQuery)->where('status', 'active')->count();
        $inactiveClients = (clone $clientsQuery)->where('status', 'inactive')->count();
        $archivedClients = (clone $clientsQuery)->where('status', 'archived')->count();

        $projectStatusBreakdown = $companyContext->applyTo(Dossier::query(), $request->user())
            ->whereIn('client_id', (clone $clientsQuery)->select('id'))
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        $latestClient = (clone $clientsQuery)->latest()->first();

        $clientsList = (clone $clientsQuery)
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

        $projectsList = $companyContext->applyTo(Dossier::query(), $request->user())
            ->whereIn('client_id', (clone $clientsQuery)->select('id'))
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

    public function store(StoreIntermediaryRequest $request, CompanyContext $companyContext): RedirectResponse
    {
        $this->authorize('create', Intermediary::class);

        $data = $request->validated();
        $data = [...$companyContext->payload($request->user()), ...$data];
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
        $this->authorize('update', $intermediary);

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
        $this->authorize('delete', $intermediary);

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

    private function clientsQuery(
        Intermediary $intermediary,
        Request $request,
        CompanyContext $companyContext,
    ): Builder {
        return $companyContext->applyTo(Client::query(), $request->user())
            ->where('intermediary_id', $intermediary->id);
    }
}
