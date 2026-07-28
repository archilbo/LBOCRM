<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDossierRequest;
use App\Http\Requests\UpdateDossierRequest;
use App\Http\Resources\DossierResource;
use App\Models\AuditLog;
use App\Models\City;
use App\Models\Client;
use App\Models\Box;
use App\Models\DocumentTemplate;
use App\Models\Dossier;
use App\Models\Room;
use App\Models\Shelf;
use App\Services\Dossiers\DossierLocationGroupingService;
use App\Services\Dossiers\DossierNumberService;
use App\Services\Dossiers\DossierWorkflowStepperService;
use App\Services\CompanyContext;
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
    ): Response
    {
        $this->authorize('viewAny', Dossier::class);

        $dossiers = $companyContext->applyTo(Dossier::query(), $request->user())
            ->with(['client', 'city'])
            ->withCount(['documents', 'financeRecords'])
            ->withExists(['contract', 'archiveRecord'])
            ->latest()
            ->get();

        $monthExpression = match (DB::connection()->getDriverName()) {
            'sqlite' => "strftime('%Y-%m', created_at)",
            'pgsql' => "TO_CHAR(created_at, 'YYYY-MM')",
            default => "DATE_FORMAT(created_at, '%Y-%m')",
        };

        $monthlyProjects = $companyContext->applyTo(Dossier::query(), $request->user())
            ->selectRaw("{$monthExpression} as month")
            ->selectRaw('COUNT(*) as count')
            ->where('created_at', '>=', now()->subMonths(12))
            ->groupByRaw($monthExpression)
            ->orderBy('month')
            ->get()
            ->map(fn ($item) => ['month' => $item->month, 'count' => (int) $item->count])
            ->values();

        return Inertia::render('Dossiers/Index', [
            'dossiers' => DossierResource::collection($dossiers)->resolve(),
            'locationGroups' => $locationGroupingService->groups($request->user()),
            'clients' => $this->clientOptions($request->user(), $companyContext),
            'cities' => City::where('is_active', true)->orderBy('name')->get(['id', 'name', 'code', 'color']),
            'monthlyProjects' => $monthlyProjects,
            'metrics' => [
                'total' => $companyContext->applyTo(Dossier::query(), $request->user())->count(),
                'active' => $companyContext->applyTo(Dossier::query(), $request->user())->where('status', 'active')->count(),
                'opened' => $companyContext->applyTo(Dossier::query(), $request->user())->where('status', 'opened')->count(),
                'closed' => $companyContext->applyTo(Dossier::query(), $request->user())->where('status', 'closed')->count(),
                'documentsTotal' => (int) $dossiers->sum('documents_count'),
            ],
        ]);
    }

    public function show(Request $request, Dossier $dossier, DossierWorkflowStepperService $workflowStepper): Response
    {
        $this->authorize('view', $dossier);

        $dossier
            ->load([
                'client.intermediary',
                'documents.template',
                'contract',
                'financeRecords',
                'archiveRecord',
            ])
            ->loadCount(['documents', 'financeRecords'])
            ->loadExists(['contract', 'archiveRecord']);

        $workflow = $workflowStepper->evaluate($dossier);

        $dossiers = app(CompanyContext::class)->applyTo(Dossier::query(), $request->user())
            ->with('client')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Dossier $d) => [
                'id' => (string) $d->id,
                'label' => $d->dossier_number . ' - ' . $d->project_object . ' - ' . ($d->client?->full_name ?? '-'),
                'clientId' => (string) ($d->client_id ?? $d->client?->id ?? ''),
            ])
            ->values();

        $templates = DocumentTemplate::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(fn (DocumentTemplate $t) => [
                'id' => (string) $t->id,
                'label' => $t->name,
                'code' => $t->code,
                'documentType' => $t->document_type,
                'isRequired' => (bool) $t->is_required,
            ])
            ->values();

        $contractClients = app(CompanyContext::class)->applyTo(Client::query(), $request->user())
            ->with(['dossiers' => fn ($q) => $q->with('contract')->orderByDesc('created_at')])
            ->orderBy('full_name')
            ->get()
            ->map(fn (Client $client) => [
                'id' => (string) $client->id,
                'fullName' => $client->full_name,
                'cin' => $client->cin,
                'dossiers' => $client->dossiers->map(fn (Dossier $d) => [
                    'id' => (string) $d->id,
                    'label' => $d->dossier_number . ' - ' . $d->project_object,
                    'floorArea' => $d->floor_area !== null ? (float) $d->floor_area : null,
                    'hasContract' => $d->contract !== null,
                ])->values()->all(),
            ])
            ->values();

        $financeDossiers = app(CompanyContext::class)->applyTo(Dossier::query(), $request->user())
            ->with('client')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Dossier $d) => [
                'id' => (string) $d->id,
                'label' => $d->dossier_number . ' - ' . $d->project_object . ' - ' . ($d->client?->full_name ?? '-'),
                'clientName' => $d->client?->full_name ?? '-',
            ])
            ->values();

        return Inertia::render('Dossiers/Show', [
            'dossier' => DossierResource::make($dossier)->resolve(),
            'canDesign' => $request->user()?->can('project-design.view') || $request->user()?->hasRole('admin') ?? false,
            'workflow' => $workflow,
            'documents' => $dossier->documents
                ->map(fn ($document) => [
                    'id' => $document->id,
                    'name' => $document->template?->name ?? $document->original_filename ?? 'Document',
                    'status' => $document->status,
                    'fileName' => $document->original_filename,
                    'uploadedAt' => optional($document->uploaded_at)->format('Y-m-d'),
                ])
                ->values(),
            'contract' => $dossier->contract ? [
                'id' => $dossier->contract->id,
                'dossierId' => (string) $dossier->contract->dossier_id,
                'contractNumber' => $dossier->contract->contract_number,
                'status' => $dossier->contract->status,
                'surface' => (float) $dossier->contract->surface,
                'pricePerSquareMeter' => (float) $dossier->contract->price_per_square_meter,
                'feeRatePercent' => (float) $dossier->contract->fee_rate_percent,
                'calculationMode' => $dossier->contract->calculation_mode,
                'forfaitTtc' => (float) $dossier->contract->forfait_ttc,
                'ht' => (float) $dossier->contract->ht,
                'tva' => (float) $dossier->contract->tva,
                'ttc' => (float) $dossier->contract->ttc,
                'notes' => $dossier->contract->notes,
                'generatedAt' => $dossier->contract->generated_at?->format('Y-m-d'),
                'signedAt' => $dossier->contract->signed_at?->format('Y-m-d'),
                'createdAt' => $dossier->contract->created_at?->format('Y-m-d'),
                'hasGeneratedDoc' => !is_null($dossier->contract->generated_document_path),
                'hasPdf' => !is_null($dossier->contract->pdf_path),
            ] : null,
            'financeRecords' => $dossier->financeRecords
                ->map(fn ($record) => [
                    'id' => $record->id,
                    'recordNumber' => $record->record_number,
                    'type' => $record->type,
                    'status' => $record->status,
                    'totalTtc' => (float) $record->total_ttc,
                    'paid' => (float) $record->paid,
                    'remaining' => (float) $record->remaining,
                ])
                ->values(),
            'archiveRecord' => $dossier->archiveRecord ? [
                'id' => $dossier->archiveRecord->id,
                'dossierId' => (string) $dossier->archiveRecord->dossier_id,
                'clientId' => (string) ($dossier->client_id ?? ''),
                'dossierNumber' => $dossier->dossier_number,
                'projectObject' => $dossier->project_object,
                'clientName' => $dossier->client?->full_name ?? '',
                'clientCin' => $dossier->client?->cin ?? '',
                'archiveNumber' => $dossier->archiveRecord->archive_number,
                'status' => $dossier->archiveRecord->status,
                'room' => $dossier->archiveRecord->room,
                'shelf' => $dossier->archiveRecord->shelf,
                'box' => $dossier->archiveRecord->box,
                'folder' => $dossier->archiveRecord->folder,
                'inDate' => $dossier->archiveRecord->in_date?->format('Y-m-d'),
                'outDate' => $dossier->archiveRecord->out_date?->format('Y-m-d'),
                'returnedAt' => $dossier->archiveRecord->returned_at?->format('Y-m-d'),
                'requestedBy' => $dossier->archiveRecord->requested_by,
                'notes' => $dossier->archiveRecord->notes,
                'isOverdue' => $dossier->archiveRecord->isOverdue(),
                'isLost' => $dossier->archiveRecord->is_lost,
                'lostReason' => $dossier->archiveRecord->lost_reason,
                'locationLabel' => trim(implode(' / ', array_filter([
                    $dossier->archiveRecord->room,
                    $dossier->archiveRecord->shelf,
                    $dossier->archiveRecord->box,
                    $dossier->archiveRecord->folder,
                ]))),
            ] : null,
            'clients' => $this->clientOptions($request->user(), app(CompanyContext::class)),
            'cities' => City::where('is_active', true)->orderBy('name')->get(['id', 'name', 'code', 'color']),
            'dossiers' => $dossiers,
            'templates' => $templates,
            'contractClients' => $contractClients,
            'financeDossiers' => $financeDossiers,
            'archiveRooms' => Room::with('shelves.boxes')->get()->map(fn ($room) => [
                'id' => $room->id,
                'code' => $room->code,
                'name' => $room->name,
            ]),
            'archiveShelves' => Shelf::all()->map(fn ($shelf) => [
                'id' => $shelf->id,
                'roomId' => $shelf->room_id,
                'code' => $shelf->code,
                'name' => $shelf->name,
            ]),
            'archiveBoxes' => Box::all()->map(fn ($box) => [
                'id' => $box->id,
                'shelfId' => $box->shelf_id,
                'code' => $box->code,
                'name' => $box->name,
            ]),
        ]);
    }

    public function store(
        StoreDossierRequest $request,
        DossierNumberService $numberService,
        CompanyContext $companyContext,
    ): RedirectResponse
    {
        $this->authorize('create', Dossier::class);

        $client = $companyContext->applyTo(Client::query(), $request->user())
            ->whereKey($request->integer('client_id'))
            ->firstOrFail();
        $city = City::findOrFail($request->integer('city_id'));
        $numbering = $numberService->generate($city);

        $data = $this->prepareDossierData($request->validated());
        $data['dossier_number'] = $numbering['number'];
        $data['city_id'] = $city->id;
        $data['sequence_number'] = $numbering['sequence'];
        $data['period'] = $numbering['period'];
        $data['company_id'] = $client->company_id;
        $data['branch_id'] = $client->branch_id;

        $dossier = Dossier::create($data);

        AuditLog::create([
            'user_id' => $request->user()?->id,
            'action' => 'dossier.created',
            'description' => "Created dossier {$dossier->dossier_number}",
            'auditable_type' => Dossier::class,
            'auditable_id' => $dossier->id,
            'created_at' => now(),
        ]);

        if ($request->filled('return_to')) {
            return redirect()
                ->to($request->string('return_to')->toString())
                ->with('success', 'Project created successfully.');
        }

        return redirect()
            ->route('dossiers.index')
            ->with('success', 'Project created successfully.');
    }

    public function update(
        UpdateDossierRequest $request,
        Dossier $dossier,
        CompanyContext $companyContext,
    ): RedirectResponse
    {
        $this->authorize('update', $dossier);

        $client = $companyContext->applyTo(Client::query(), $request->user())
            ->whereKey($request->integer('client_id'))
            ->firstOrFail();

        $dossier->update([
            ...$this->prepareDossierData($request->validated()),
            'company_id' => $client->company_id,
            'branch_id' => $client->branch_id,
        ]);

        AuditLog::create([
            'user_id' => $request->user()?->id,
            'action' => 'dossier.updated',
            'description' => "Updated dossier {$dossier->dossier_number}",
            'auditable_type' => Dossier::class,
            'auditable_id' => $dossier->id,
            'created_at' => now(),
        ]);

        return redirect()
            ->route('dossiers.index')
            ->with('success', 'Project updated successfully.');
    }

    public function destroy(Dossier $dossier): RedirectResponse
    {
        $this->authorize('delete', $dossier);

        $dossier->delete();

        return redirect()
            ->route('dossiers.index')
            ->with('success', 'Project deleted successfully.');
    }

    private function prepareDossierData(array $data): array
    {
        $data['status'] = $data['status'] ?? 'opened';
        $data['workflow_step'] = $data['workflow_step'] ?? 'client';
        $data['opened_at'] = $data['opened_at'] ?? now()->toDateString();
        unset($data['return_to']);

        if (($data['land_surface'] ?? null) === '') {
            $data['land_surface'] = null;
        }

        if (($data['floor_area'] ?? null) === '') {
            $data['floor_area'] = null;
        }

        return $data;
    }

    private function nextDossierNumber(): string
    {
        $year = now()->format('Y');
        $next = Dossier::count() + 1;

        do {
            $number = sprintf('DOS-%s-%04d', $year, $next);
            $next++;
        } while (Dossier::where('dossier_number', $number)->exists());

        return $number;
    }

    private function clientOptions(\App\Models\User $user, CompanyContext $companyContext): array
    {
        return $companyContext->applyTo(Client::query(), $user)
            ->orderBy('full_name')
            ->get()
            ->map(fn (Client $client) => [
                'id' => (string) $client->id,
                'label' => $client->client_number . ' - ' . $client->full_name,
            ])
            ->values()
            ->all();
    }
}
