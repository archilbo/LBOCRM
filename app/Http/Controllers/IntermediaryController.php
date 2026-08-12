<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreIntermediaryRequest;
use App\Http\Requests\UpdateIntermediaryRequest;
use App\Http\Resources\IntermediaryResource;
use App\Models\AuditLog;
use App\Models\Client;
use App\Models\Dossier;
use App\Models\FinanceActivityLog;
use App\Models\Intermediary;
use App\Models\IntermediaryPaymentBatch;
use App\Services\CompanyContext;
use App\Services\Finance\IntermediaryPaymentService;
use App\Services\PermissionRegistry;
use App\Services\Recovery\RecoveryService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class IntermediaryController extends Controller
{
    public function index(Request $request, CompanyContext $companyContext): Response
    {
        $this->authorize('viewAny', Intermediary::class);

        $intermediaries = $companyContext->applyTo(Intermediary::query(), $request->user())
            ->withCount(['dossiers' => fn (Builder $query) => $companyContext->applyTo($query, $request->user())])
            ->latest()
            ->get();

        $monthlyProjects = $companyContext->applyTo(Dossier::query(), $request->user())
            ->whereNotNull('intermediary_id')
            ->selectRaw($this->monthExpression().' as month, count(*) as count')
            ->groupBy('month')
            ->orderBy('month')
            ->pluck('count', 'month')
            ->toArray();

        $projectsThisMonth = $companyContext->applyTo(Dossier::query(), $request->user())
            ->whereNotNull('intermediary_id')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        $topIntermediaries = $intermediaries->sortByDesc('dossiers_count')->take(5)->values()
            ->map(fn ($intermediary) => [
                'id' => $intermediary->id,
                'name' => $intermediary->name,
                'projectsCount' => $intermediary->dossiers_count,
            ]);

        return Inertia::render('Intermediaries/Index', [
            'intermediaries' => IntermediaryResource::collection($intermediaries)->resolve(),
            'metrics' => [
                'total' => $intermediaries->count(),
                'active' => $intermediaries->where('is_active', true)->count(),
                'inactive' => $intermediaries->where('is_active', false)->count(),
                'linkedProjects' => $intermediaries->sum('dossiers_count'),
                'projectsThisMonth' => $projectsThisMonth,
            ],
            'monthlyProjects' => collect($monthlyProjects)
                ->map(fn ($count, $month) => ['month' => $month, 'count' => $count])
                ->values(),
            'topIntermediaries' => $topIntermediaries,
        ]);
    }

    public function show(Request $request, Intermediary $intermediary, CompanyContext $companyContext, IntermediaryPaymentService $intermediaryPayments, PermissionRegistry $permissions): Response
    {
        $this->authorize('view', $intermediary);

        $projects = $companyContext->applyTo(Dossier::query(), $request->user())
            ->where('intermediary_id', $intermediary->id)
            ->with('client:id,full_name')
            ->latest()
            ->get();

        $clients = $companyContext->applyTo(Client::query(), $request->user())
            ->whereIn('id', $projects->pluck('client_id')->filter()->unique())
            ->withCount('dossiers')
            ->latest()
            ->get();

        $activeClients = $clients->where('status', 'active')->count();
        $inactiveClients = $clients->where('status', 'inactive')->count();
        $archivedClients = $clients->where('status', 'archived')->count();
        $activeProjects = $projects->whereNotIn('status', ['archived', 'closed'])->count();
        $archivedProjects = $projects->where('status', 'archived')->count();
        $blockedProjects = $projects->where('status', 'blocked')->count();
        $latestClient = $clients->first();

        $monthlyClients = $this->monthlyCounts($clients);
        $monthlyProjects = $this->monthlyCounts($projects);
        $projectStatusBreakdown = $projects
            ->groupBy(fn (Dossier $dossier) => $dossier->status ?: 'unknown')
            ->map(fn (Collection $items, string $status) => [
                'status' => $status,
                'count' => $items->count(),
            ])
            ->values();

        $clientsList = $clients->map(fn (Client $client) => [
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
        ])->values();

        $projectsList = $projects->map(fn (Dossier $dossier) => [
            'id' => $dossier->id,
            'dossierNumber' => $dossier->dossier_number,
            'projectObject' => $dossier->project_object,
            'clientName' => $dossier->client?->full_name,
            'status' => $dossier->status,
            'workflowStep' => $dossier->workflow_step,
            'commune' => $dossier->commune,
            'createdAt' => optional($dossier->created_at)->format('Y-m-d'),
            'updatedAt' => optional($dossier->updated_at)->diffForHumans(),
        ])->values();

        $canViewFinance = $permissions->allows($request->user(), 'finance.payments.view');

        return Inertia::render('Intermediaries/Show', [
            'intermediary' => IntermediaryResource::make(
                $intermediary->setAttribute('dossiers_count', $projects->count()),
            )->resolve(),
            'metrics' => [
                'totalClients' => $clients->count(),
                'activeClients' => $activeClients,
                'inactiveClients' => $inactiveClients,
                'archivedClients' => $archivedClients,
                'totalProjects' => $projects->count(),
                'activeProjects' => $activeProjects,
                'archivedProjects' => $archivedProjects,
                'blockedProjects' => $blockedProjects,
                'latestClientName' => $latestClient?->full_name,
                'latestClientDate' => optional($latestClient?->created_at)->diffForHumans(),
            ],
            'monthlyClients' => $monthlyClients,
            'monthlyProjects' => $monthlyProjects,
            'clientStatusBreakdown' => collect([
                ['status' => 'active', 'count' => $activeClients],
                ['status' => 'inactive', 'count' => $inactiveClients],
                ['status' => 'archived', 'count' => $archivedClients],
            ]),
            'projectStatusBreakdown' => $projectStatusBreakdown,
            'clients' => $clientsList,
            'projects' => $projectsList,
            'activity' => $this->relationshipActivity($intermediary, $clients, $projects, $request->user(), $canViewFinance),
            'finance' => $canViewFinance ? $intermediaryPayments->data($intermediary, $request->user()) : [
                'currency' => 'MAD',
                'summary' => ['invoiced' => 0, 'paid' => 0, 'remaining' => 0, 'projectsCount' => 0],
                'projects' => [],
                'batches' => [],
            ],
            'financeCapabilities' => [
                'view' => $canViewFinance,
                'create' => $permissions->allows($request->user(), 'finance.payments.create'),
                'reverse' => $permissions->allows($request->user(), 'finance.payments.reverse'),
            ],
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

        $intermediary = Intermediary::create($data);

        AuditLog::create([
            'user_id' => $request->user()?->id,
            'action' => 'intermediary.created',
            'description' => "Created intermediary {$intermediary->name}",
            'auditable_type' => Intermediary::class,
            'auditable_id' => $intermediary->id,
            'created_at' => now(),
        ]);

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

        AuditLog::create([
            'user_id' => $request->user()?->id,
            'action' => 'intermediary.updated',
            'description' => "Updated intermediary {$intermediary->name}",
            'auditable_type' => Intermediary::class,
            'auditable_id' => $intermediary->id,
            'created_at' => now(),
        ]);

        return redirect()
            ->route('intermediaries.index')
            ->with('success', 'Intermediary updated successfully.');
    }

    public function destroy(Request $request, Intermediary $intermediary, RecoveryService $recovery): RedirectResponse
    {
        $this->authorize('delete', $intermediary);
        DB::transaction(function () use ($intermediary, $request, $recovery): void {
            $recovery->moveToTrash($intermediary, $request->user());
            $intermediary->delete();
        });

        return redirect()
            ->route('intermediaries.index')
            ->with('success', 'Intermediary deleted successfully.');
    }

    public function bulkDestroy(Request $request, CompanyContext $companyContext, RecoveryService $recovery): RedirectResponse
    {
        $data = $request->validate([
            'intermediary_ids' => ['required', 'array', 'min:1', 'max:100'],
            'intermediary_ids.*' => ['integer', 'distinct'],
        ]);

        $intermediaries = $companyContext->applyTo(Intermediary::query(), $request->user())
            ->whereKey($data['intermediary_ids'])
            ->get();

        abort_unless($intermediaries->count() === count($data['intermediary_ids']), 404);

        foreach ($intermediaries as $intermediary) {
            $this->authorize('delete', $intermediary);
        }

        DB::transaction(function () use ($intermediaries, $request, $recovery): void {
            $intermediaries->each(function (Intermediary $intermediary) use ($request, $recovery): void {
                $recovery->moveToTrash($intermediary, $request->user());
                $intermediary->delete();
            });
        });

        return redirect()->route('intermediaries.index')
            ->with('success', "{$intermediaries->count()} intermediary(s) deleted successfully.");
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

    private function monthlyCounts(Collection $items): Collection
    {
        return $items
            ->filter(fn ($item) => $item->created_at !== null)
            ->groupBy(fn ($item) => $item->created_at->format('Y-m'))
            ->map(fn (Collection $monthItems, string $month) => [
                'month' => $month,
                'count' => $monthItems->count(),
            ])
            ->sortBy('month')
            ->values();
    }

    private function monthExpression(): string
    {
        return match (Dossier::query()->getConnection()->getDriverName()) {
            'sqlite' => "strftime('%Y-%m', created_at)",
            'pgsql' => "to_char(created_at, 'YYYY-MM')",
            default => "DATE_FORMAT(created_at, '%Y-%m')",
        };
    }

    private function relationshipActivity(
        Intermediary $intermediary,
        Collection $clients,
        Collection $projects,
        \App\Models\User $user,
        bool $includeFinance,
    ): Collection {
        $activity = collect();

        if ($intermediary->updated_at) {
            $activity->push($this->activityItem(
                id: "intermediary-updated-{$intermediary->id}-{$intermediary->updated_at->timestamp}",
                type: 'intermediary_updated',
                subjectName: $intermediary->name,
                subjectCode: $intermediary->code,
                occurredAt: $intermediary->updated_at,
                href: null,
                causerName: $this->causerFor(Intermediary::class, $intermediary->id),
            ));
        }

        foreach ($clients as $client) {
            if ($client->created_at) {
                $activity->push($this->activityItem(
                    id: "client-created-{$client->id}-{$client->created_at->timestamp}",
                    type: 'client_created',
                    subjectName: $client->full_name,
                    subjectCode: $client->client_number,
                    occurredAt: $client->created_at,
                    href: route('clients.show', $client, false),
                    causerName: $this->causerFor(Client::class, $client->id),
                ));
            }

            if ($this->hasMeaningfulUpdate($client->created_at, $client->updated_at)) {
                $activity->push($this->activityItem(
                    id: "client-updated-{$client->id}-{$client->updated_at->timestamp}",
                    type: 'client_updated',
                    subjectName: $client->full_name,
                    subjectCode: $client->client_number,
                    occurredAt: $client->updated_at,
                    href: route('clients.show', $client, false),
                    causerName: $this->causerFor(Client::class, $client->id),
                ));
            }
        }

        foreach ($projects as $project) {
            $projectName = $project->project_object ?: $project->dossier_number;

            if ($project->created_at) {
                $activity->push($this->activityItem(
                    id: "project-created-{$project->id}-{$project->created_at->timestamp}",
                    type: 'project_created',
                    subjectName: $projectName,
                    subjectCode: $project->dossier_number,
                    occurredAt: $project->created_at,
                    href: route('dossiers.show', $project, false),
                    causerName: $this->causerFor(Dossier::class, $project->id),
                ));
            }

            if ($this->hasMeaningfulUpdate($project->created_at, $project->updated_at)) {
                $activity->push($this->activityItem(
                    id: "project-updated-{$project->id}-{$project->updated_at->timestamp}",
                    type: 'project_updated',
                    subjectName: $projectName,
                    subjectCode: $project->dossier_number,
                    occurredAt: $project->updated_at,
                    href: route('dossiers.show', $project, false),
                    causerName: $this->causerFor(Dossier::class, $project->id),
                ));
            }
        }

        if ($includeFinance) {
            $paymentActivities = FinanceActivityLog::query()
                ->where('company_id', $user->company_id)
                ->when($user->branch_id, fn (Builder $query) => $query->where('branch_id', $user->branch_id))
                ->where('subject_type', (new IntermediaryPaymentBatch())->getMorphClass())
                ->whereJsonContains('new_values->intermediary_id', $intermediary->id)
                ->with('user:id,name')
                ->latest()
                ->get()
                ->take(40);

            foreach ($paymentActivities as $log) {
                $amount = $log->new_values['amount'] ?? null;
                $activity->push($this->activityItem(
                    id: "finance-activity-{$log->id}",
                    type: $log->action === 'finance.intermediary_payment.cancelled' ? 'intermediary_payment_cancelled' : 'intermediary_payment_recorded',
                    subjectName: 'Paiement intermédiaire',
                    subjectCode: is_numeric($amount) ? number_format((float) $amount, 2, ',', ' ').' MAD' : null,
                    occurredAt: $log->created_at,
                    href: route('intermediaries.show', $intermediary, false).'?tab=finance',
                    causerName: $log->user?->name,
                ));
            }
        }

        return $activity
            ->sortByDesc('occurredAt')
            ->take(40)
            ->values();
    }

    private function causerFor(string $modelClass, int $modelId): ?string
    {
        return AuditLog::where('auditable_type', $modelClass)
            ->where('auditable_id', $modelId)
            ->whereHas('user')
            ->latest('created_at')
            ->first()
            ?->user?->name;
    }

    private function activityItem(
        string $id,
        string $type,
        string $subjectName,
        ?string $subjectCode,
        $occurredAt,
        ?string $href,
        ?string $causerName = null,
    ): array {
        return [
            'id' => $id,
            'type' => $type,
            'subjectName' => $subjectName,
            'subjectCode' => $subjectCode,
            'occurredAt' => $occurredAt->toIso8601String(),
            'occurredAtHuman' => $occurredAt->diffForHumans(),
            'href' => $href,
            'causerName' => $causerName,
        ];
    }

    private function hasMeaningfulUpdate($createdAt, $updatedAt): bool
    {
        return $createdAt !== null
            && $updatedAt !== null
            && $updatedAt->greaterThan($createdAt->copy()->addMinute());
    }
}
