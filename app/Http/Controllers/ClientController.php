<?php

namespace App\Http\Controllers;

use App\Actions\Clients\UpdateClientStatusAction;
use App\Http\Requests\ScanCinRequest;
use App\Http\Requests\StoreClientRequest;
use App\Http\Requests\UpdateClientRequest;
use App\Http\Requests\UpdateClientStatusRequest;
use App\Http\Resources\ClientResource;
use App\Models\AuditLog;
use App\Models\Client;
use App\Models\DocumentTemplate;
use App\Models\FinanceTemplate;
use App\Models\Intermediary;
use App\Models\User;
use App\Enums\ClientStatus;
use App\Services\Clients\ClientWorkspaceService;
use App\Services\CompanyContext;
use App\Services\Finance\FinanceContextService;
use App\Services\PermissionRegistry;
use App\Services\Finance\FinanceSettingsService;
use App\Exceptions\CinScanException;
use App\Services\Cin\CinScanner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\City;

class ClientController extends Controller
{
    public function index(Request $request, CompanyContext $companyContext): Response
    {
        $this->authorize('viewAny', Client::class);

        $clients = $companyContext->applyTo(Client::query(), $request->user())
            ->with('intermediary')
            ->withCount('dossiers')
            ->latest()
            ->get();

        $clientScope = fn () => $companyContext->applyTo(Client::query(), $request->user());

        return Inertia::render('Clients/Index', [
            'clients' => ClientResource::collection($clients)->resolve(),
            'intermediaries' => $this->intermediaryOptions($request->user(), $companyContext),
            'metrics' => [
                'total' => $clientScope()->count(),
                'active' => $clientScope()->where('status', ClientStatus::Active->value)->count(),
                'inactive' => $clientScope()->where('status', ClientStatus::Inactive->value)->count(),
                'archived' => $clientScope()->where('status', ClientStatus::Archived->value)->count(),
            ],
        ]);
    }

    public function show(
        Request $request,
        Client $client,
        ClientWorkspaceService $workspaceService,
        FinanceContextService $financeContext,
        CompanyContext $companyContext,
    ): Response
    {
        $this->authorize('view', $client);

        $canViewFinance = app(PermissionRegistry::class)->allows($request->user(), 'finance.view');

        $client->load(['intermediary', 'dossiers'])->loadCount('dossiers');
        $selectedDossierId = $request->integer('dossier_id') ?: null;

        return Inertia::render('Clients/Show', [
            'tab' => $request->query('tab', 'overview'),
            'client' => ClientResource::make($client)->resolve(),
            'cities' => City::all(),
            'workspace' => $workspaceService->forClient($client, $selectedDossierId, $request->user()),
            'documentTemplates' => DocumentTemplate::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get()
                ->map(fn (DocumentTemplate $template) => [
                    'id' => (string) $template->id,
                    'label' => $template->name,
                    'code' => $template->code,
                    'type' => $template->document_type,
                ])
                ->values(),
            'financeTemplates' => $canViewFinance && app(PermissionRegistry::class)->allows($request->user(), 'finance.templates.view')
                ? $financeContext->apply(FinanceTemplate::query(), $request->user())
                ->active()
                ->orderBy('type')
                ->orderByDesc('is_default')
                ->orderBy('name')
                ->get()
                ->map(fn (FinanceTemplate $template) => [
                    'id' => (string) $template->id,
                    'label' => $template->name,
                    'type' => $template->type,
                    'slug' => $template->slug,
                    'isDefault' => (bool) $template->is_default,
                ])
                ->values()
                : collect(),
            'financeSettings' => $canViewFinance ? [
                'defaultTvaRate' => FinanceSettingsService::getTvaRate(),
                'defaultCurrency' => FinanceSettingsService::getCurrency(),
                'defaultPaymentTermsDays' => FinanceSettingsService::getDefaultPaymentDays(),
                'defaultQuoteValidityDays' => FinanceSettingsService::getQuoteValidityDays(),
                'defaultUnitPriceM2' => FinanceSettingsService::getUnitPriceM2(),
                'defaultArchitectRate' => FinanceSettingsService::getArchitectRate(),
                'companyInfo' => (new FinanceSettingsService())->companyInfo(),
                'bankInfo' => (new FinanceSettingsService())->bankInfo(),
            ] : null,
            'dossiers' => $client->dossiers()
                ->latest()
                ->get()
                ->map(fn ($dossier) => [
                    'id' => $dossier->id,
                    'dossierNumber' => $dossier->dossier_number,
                    'projectObject' => $dossier->project_object,
                    'status' => $dossier->status,
                    'workflowStep' => $dossier->workflow_step,
                    'floorArea' => $dossier->floor_area,
                    'updatedAt' => optional($dossier->updated_at)->diffForHumans(),
                ])
                ->values(),
            'intermediaries' => $this->intermediaryOptions($request->user(), $companyContext),
        ]);
    }

    public function store(StoreClientRequest $request, FinanceContextService $financeContext): RedirectResponse
    {
        $this->authorize('create', Client::class);

        $data = $this->prepareClientData($request->validated());
        $data = [...$financeContext->payload($request->user()), ...$data];
        $data['client_number'] = $this->nextClientNumber($data['company_id']);

        $client = Client::create($data);

        AuditLog::create([
            'user_id' => $request->user()?->id,
            'action' => 'client.created',
            'description' => "Created client {$client->full_name}",
            'auditable_type' => Client::class,
            'auditable_id' => $client->id,
            'created_at' => now(),
        ]);

        return redirect()
            ->route('clients.index')
            ->with('success', 'Client created successfully.');
    }

    public function update(UpdateClientRequest $request, Client $client): RedirectResponse
    {
        $this->authorize('update', $client);

        $data = $request->validated();
        $returnTo = $data['return_to'] ?? null;
        unset($data['return_to']);

        $client->update($this->prepareClientData($data));

        AuditLog::create([
            'user_id' => $request->user()?->id,
            'action' => 'client.updated',
            'description' => "Updated client {$client->full_name}",
            'auditable_type' => Client::class,
            'auditable_id' => $client->id,
            'created_at' => now(),
        ]);

        if ($this->isSafeLocalReturnPath($returnTo)) {
            return redirect()
                ->to($returnTo)
                ->with('success', 'Client updated successfully.');
        }

        return redirect()
            ->route('clients.index')
            ->with('success', 'Client updated successfully.');
    }

    public function updateStatus(
        UpdateClientStatusRequest $request,
        Client $client,
        UpdateClientStatusAction $action,
    ): RedirectResponse {
        $this->authorize('updateStatus', $client);

        $action->execute(
            $client,
            ClientStatus::from($request->string('status')->toString()),
            $request->user(),
            $request->ip(),
            $request->userAgent(),
        );

        return back()->with('success', 'Client status updated successfully.');
    }

    public function destroy(Client $client): RedirectResponse
    {
        $this->authorize('delete', $client);

        $client->delete();

        return redirect()
            ->route('clients.index')
            ->with('success', 'Client deleted successfully.');
    }

    public function scanCin(
        ScanCinRequest $request,
        CinScanner $scanner,
    ): JsonResponse {
        $this->authorize(
            'scanCin',
            Client::class
        );

        try {
            $result = $scanner->scan(
                $request->file('front_image'),
                $request->file('back_image'),
            );

            return response()->json($result);
        } catch (CinScanException $exception) {
            return response()->json(
                [
                    'success' => false,
                    'error' => $exception->errorCode,
                    'message' => $exception->getMessage(),
                ],
                $exception->httpStatus,
            );
        }
    }

    private function prepareClientData(array $data): array
    {
        $firstName = trim((string) ($data['first_name'] ?? ''));
        $lastName = trim((string) ($data['last_name'] ?? ''));

        $data['full_name'] = trim($firstName . ' ' . $lastName);

        if ($data['full_name'] === '') {
            $data['full_name'] = 'Unnamed client';
        }

        $data['status'] = $data['status'] ?? ClientStatus::Active->value;

        if (($data['intermediary_id'] ?? null) === '') {
            $data['intermediary_id'] = null;
        }

        return $data;
    }

    private function nextClientNumber(int $companyId): string
    {
        $year = now()->format('Y');
        $next = Client::query()->where('company_id', $companyId)->count() + 1;

        do {
            $number = sprintf('CL-%s-%04d', $year, $next);
            $next++;
        } while (Client::where('client_number', $number)->exists());

        return $number;
    }

    private function intermediaryOptions(User $user, CompanyContext $companyContext): array
    {
        return $companyContext->applyTo(Intermediary::query(), $user)
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

    private function isSafeLocalReturnPath(mixed $returnTo): bool
    {
        return is_string($returnTo)
            && str_starts_with($returnTo, '/')
            && ! str_starts_with($returnTo, '//')
            && parse_url($returnTo, PHP_URL_HOST) === null;
    }
}
