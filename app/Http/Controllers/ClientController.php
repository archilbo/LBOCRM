<?php

namespace App\Http\Controllers;

use App\Http\Requests\ScanCinRequest;
use App\Http\Requests\StoreClientRequest;
use App\Http\Requests\UpdateClientRequest;
use App\Http\Resources\ClientResource;
use App\Models\Client;
use App\Models\DocumentTemplate;
use App\Models\FinanceTemplate;
use App\Models\Intermediary;
use App\Services\Clients\ClientWorkspaceService;
use App\Services\Finance\FinanceContextService;
use App\Services\Finance\FinanceSettingsService;
use App\Services\GeminiOcrService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\City;

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

    public function show(
        Request $request,
        Client $client,
        ClientWorkspaceService $workspaceService,
        FinanceContextService $financeContext,
    ): Response
    {
        $client->load(['intermediary', 'dossiers'])->loadCount('dossiers');
        $selectedDossierId = $request->integer('dossier_id') ?: null;

        return Inertia::render('Clients/Show', [
            'tab' => $request->query('tab', 'overview'),
            'client' => ClientResource::make($client)->resolve(),
            'cities' => City::all(),
            'workspace' => $workspaceService->forClient($client, $selectedDossierId),
            'documentTemplates' => DocumentTemplate::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get()
                ->map(fn (DocumentTemplate $template) => [
                    'id' => (string) $template->id,
                    'label' => $template->name,
                    'type' => $template->document_type,
                ])
                ->values(),
            'financeTemplates' => $financeContext->apply(FinanceTemplate::query(), $request->user())
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
                ->values(),
            'financeSettings' => [
                'defaultTvaRate' => FinanceSettingsService::getTvaRate(),
                'defaultCurrency' => FinanceSettingsService::getCurrency(),
                'defaultPaymentTermsDays' => FinanceSettingsService::getDefaultPaymentDays(),
                'defaultQuoteValidityDays' => FinanceSettingsService::getQuoteValidityDays(),
                'defaultUnitPriceM2' => FinanceSettingsService::getUnitPriceM2(),
                'defaultArchitectRate' => FinanceSettingsService::getArchitectRate(),
                'companyInfo' => (new FinanceSettingsService())->companyInfo(),
                'bankInfo' => (new FinanceSettingsService())->bankInfo(),
            ],
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
            'intermediaries' => $this->intermediaryOptions(),
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

    public function scanCin(ScanCinRequest $request, GeminiOcrService $ocrService): JsonResponse
    {
        $result = $ocrService->extractBoth(
            $request->file('front_image')->getRealPath(),
            $request->file('back_image')->getRealPath(),
        );

        return response()->json($result);
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
