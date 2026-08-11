<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDossierRequest;
use App\Http\Requests\UpdateDossierRequest;
use App\Http\Resources\DossierResource;
use App\Models\AuditLog;
use App\Models\City;
use App\Models\Client;
use App\Models\Dossier;
use App\Models\Intermediary;
use App\Models\User;
use App\Services\CompanyContext;
use App\Services\Dossiers\DossierLocationGroupingService;
use App\Services\Dossiers\DossierNumberService;
use App\Services\Dossiers\ProjectWorkspaceDataService;
use App\Services\PermissionRegistry;
use App\Services\Recovery\RecoveryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DossierController extends Controller
{
    public function index(
        Request $request,
        DossierLocationGroupingService $locationGroupingService,
        CompanyContext $companyContext,
        PermissionRegistry $permissions,
    ): Response {
        $this->authorize('viewAny', Dossier::class);

        /** @var User $user */
        $user = $request->user();
        $canViewDocuments = $permissions->allows($user, 'documents.view');
        $canViewFinance = $permissions->allows($user, 'finance.view');
        $canViewContracts = $permissions->allows($user, 'contracts.view');
        $canViewArchive = $permissions->allows($user, 'archive.view');

        $query = $companyContext->applyTo(Dossier::query(), $user)
            ->with(['client', 'city', 'intermediary']);

        if ($canViewDocuments) {
            $query->withCount('documents');
        }

        if ($canViewFinance) {
            $query->withCount('financeDocuments');
        }

        if ($canViewContracts) {
            $query->withExists('contract');
        }

        if ($canViewArchive) {
            $query->withExists('archiveRecord');
        }

        $dossiers = $query
            ->latest('updated_at')
            ->get();

        $monthExpression = match (DB::connection()->getDriverName()) {
            'sqlite' => "strftime('%Y-%m', created_at)",
            'pgsql' => "TO_CHAR(created_at, 'YYYY-MM')",
            default => "DATE_FORMAT(created_at, '%Y-%m')",
        };

        $monthlyProjects = $companyContext->applyTo(Dossier::query(), $user)
            ->selectRaw("{$monthExpression} as month")
            ->selectRaw('COUNT(*) as count')
            ->where('created_at', '>=', now()->startOfMonth()->subMonths(11))
            ->groupByRaw($monthExpression)
            ->orderBy('month')
            ->get()
            ->map(fn ($item) => [
                'month' => (string) $item->month,
                'count' => (int) $item->count,
            ])
            ->values();

        $canMutateProjects = $user->can('create', Dossier::class)
            || $dossiers->contains(fn (Dossier $dossier) => $user->can('update', $dossier));

        return Inertia::render('Dossiers/Index', [
            'dossiers' => DossierResource::collection($dossiers)->resolve($request),
            'locationGroups' => $locationGroupingService->groups($user),
            'clients' => $canMutateProjects
                ? $this->clientOptions($user, $companyContext)
                : [],
            'cities' => $canMutateProjects
                ? City::query()
                    ->where('is_active', true)
                    ->orderBy('name')
                    ->get(['id', 'name', 'code', 'color'])
                : [],
            'intermediaries' => $canMutateProjects
                ? $this->intermediaryOptions($user, $companyContext)
                : [],
            'monthlyProjects' => $monthlyProjects,
            'metrics' => [
                'total' => $dossiers->count(),
                'active' => $dossiers->where('status', 'active')->count(),
                'opened' => $dossiers->where('status', 'opened')->count(),
                'closed' => $dossiers->whereIn('status', ['closed', 'cloture', 'archived'])->count(),
                'documentsTotal' => $canViewDocuments
                    ? (int) $dossiers->sum('documents_count')
                    : 0,
                'financeDocumentsTotal' => $canViewFinance
                    ? (int) $dossiers->sum('finance_documents_count')
                    : 0,
            ],
            'capabilities' => [
                'canCreate' => $user->can('create', Dossier::class),
                'canViewDocuments' => $canViewDocuments,
                'canViewContracts' => $canViewContracts,
                'canViewFinance' => $canViewFinance,
                'canViewArchive' => $canViewArchive,
            ],
        ]);
    }

    public function show(
        Request $request,
        Dossier $dossier,
        ProjectWorkspaceDataService $workspace,
    ): Response {
        $this->authorize('view', $dossier);

        /** @var User $user */
        $user = $request->user();

        return Inertia::render(
            'Dossiers/Show',
            $workspace->build($dossier, $user, $request),
        );
    }

    public function store(
        StoreDossierRequest $request,
        DossierNumberService $numberService,
        CompanyContext $companyContext,
    ): RedirectResponse {
        $this->authorize('create', Dossier::class);

        $client = $companyContext->applyTo(Client::query(), $request->user())
            ->whereKey($request->integer('client_id'))
            ->firstOrFail();

        $city = City::query()
            ->where('is_active', true)
            ->findOrFail($request->integer('city_id'));

        $numbering = $numberService->generate();
        $data = $this->prepareDossierData($request->validated(), true);

        $data['dossier_number'] = $numbering['number'];
        $data['city_id'] = $city->id;
        $data['sequence_number'] = $numbering['sequence'];
        $data['period'] = $numbering['period'];
        $data['company_id'] = $client->company_id;
        $data['branch_id'] = $client->branch_id;

        $dossier = Dossier::query()->create($data);

        AuditLog::query()->create([
            'user_id' => $request->user()?->id,
            'action' => 'dossier.created',
            'description' => "Created dossier {$dossier->dossier_number}",
            'metadata' => [
                'project_object' => $dossier->project_object,
                'client_id' => $dossier->client_id,
                'city_id' => $dossier->city_id,
            ],
            'auditable_type' => Dossier::class,
            'auditable_id' => $dossier->id,
            'created_at' => now(),
        ]);

        return $this->redirectAfterMutation(
            $request->input('return_to'),
            'Project created successfully.',
        );
    }

    public function update(
        UpdateDossierRequest $request,
        Dossier $dossier,
        CompanyContext $companyContext,
    ): RedirectResponse {
        $this->authorize('update', $dossier);

        $client = $companyContext->applyTo(Client::query(), $request->user())
            ->whereKey($request->integer('client_id'))
            ->firstOrFail();

        $data = $this->prepareDossierData($request->validated());

        if (array_key_exists('city_id', $data) && $data['city_id'] !== null) {
            $data['city_id'] = City::query()
                ->where('is_active', true)
                ->findOrFail((int) $data['city_id'])
                ->id;
        } else {
            unset($data['city_id']);
        }

        $original = $dossier->only([
            'client_id',
            'intermediary_id',
            'city_id',
            'project_object',
            'status',
            'workflow_step',
            'notes',
        ]);

        $dossier->fill([
            ...$data,
            'company_id' => $client->company_id,
            'branch_id' => $client->branch_id,
        ]);

        $changes = $dossier->getDirty();
        $dossier->save();

        AuditLog::query()->create([
            'user_id' => $request->user()?->id,
            'action' => 'dossier.updated',
            'description' => "Updated dossier {$dossier->dossier_number}",
            'metadata' => [
                'before' => array_intersect_key($original, $changes),
                'changes' => $changes,
            ],
            'auditable_type' => Dossier::class,
            'auditable_id' => $dossier->id,
            'created_at' => now(),
        ]);

        return $this->redirectAfterMutation(
            $request->input('return_to'),
            'Project updated successfully.',
        );
    }

    public function destroy(Request $request, Dossier $dossier, RecoveryService $recovery): RedirectResponse
    {
        $this->authorize('delete', $dossier);

        AuditLog::query()->create([
            'user_id' => $request->user()?->id,
            'action' => 'dossier.deleted',
            'description' => "Deleted dossier {$dossier->dossier_number}",
            'metadata' => [
                'dossier_number' => $dossier->dossier_number,
                'project_object' => $dossier->project_object,
                'client_id' => $dossier->client_id,
                'company_id' => $dossier->company_id,
                'branch_id' => $dossier->branch_id,
            ],
            'auditable_type' => Dossier::class,
            'auditable_id' => $dossier->id,
            'created_at' => now(),
        ]);

        DB::transaction(function () use ($dossier, $request, $recovery): void {
            $recovery->moveToTrash($dossier, $request->user());
            $dossier->delete();
        });

        return redirect()
            ->route('dossiers.index')
            ->with('success', 'Project deleted successfully.');
    }

    private function prepareDossierData(array $data, bool $forCreate = false): array
    {
        if ($forCreate) {
            $data['status'] = $data['status'] ?? 'opened';
            $data['workflow_step'] = $data['workflow_step'] ?? 'client';
            $data['opened_at'] = $data['opened_at'] ?? now()->toDateString();
        }

        unset($data['return_to']);

        foreach (['land_surface', 'floor_area'] as $field) {
            if (($data[$field] ?? null) === '') {
                $data[$field] = null;
            }
        }

        return $data;
    }

    private function clientOptions(User $user, CompanyContext $companyContext): array
    {
        return $companyContext->applyTo(Client::query(), $user)
            ->orderBy('full_name')
            ->get()
            ->map(fn (Client $client) => [
                'id' => (string) $client->id,
                'label' => $client->cin.' - '.$client->full_name,
                'cin' => $client->cin,
            ])
            ->values()
            ->all();
    }

    private function intermediaryOptions(User $user, CompanyContext $companyContext): array
    {
        return $companyContext->applyTo(Intermediary::query(), $user)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Intermediary $intermediary) => [
                'id' => (string) $intermediary->id,
                'label' => $intermediary->name,
            ])
            ->values()
            ->all();
    }

    private function redirectAfterMutation(mixed $requestedPath, string $message): RedirectResponse
    {
        $safePath = $this->safeLocalPath($requestedPath);

        if ($safePath !== null) {
            return redirect()
                ->to($safePath)
                ->with('success', $message);
        }

        return redirect()
            ->route('dossiers.index')
            ->with('success', $message);
    }

    private function safeLocalPath(mixed $requestedPath): ?string
    {
        if (! is_string($requestedPath)) {
            return null;
        }

        $requestedPath = trim($requestedPath);

        if (
            $requestedPath === ''
            || ! str_starts_with($requestedPath, '/')
            || str_starts_with($requestedPath, '//')
            || str_contains($requestedPath, '\\')
            || preg_match('/[\x00-\x1F\x7F]/', $requestedPath)
        ) {
            return null;
        }

        $parts = parse_url($requestedPath);

        if (
            $parts === false
            || isset($parts['scheme'])
            || isset($parts['host'])
            || isset($parts['user'])
            || isset($parts['pass'])
            || isset($parts['port'])
            || isset($parts['fragment'])
        ) {
            return null;
        }

        $path = $parts['path'] ?? '';

        if (! preg_match('#^/(?:dossiers(?:/\d+)?|clients/\d+)$#', $path)) {
            return null;
        }

        return $path.(isset($parts['query']) ? '?'.$parts['query'] : '');
    }
}
