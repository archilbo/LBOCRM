<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDossierRequest;
use App\Http\Requests\UpdateDossierRequest;
use App\Http\Resources\DossierResource;
use App\Models\City;
use App\Models\Client;
use App\Models\DocumentTemplate;
use App\Models\Dossier;
use App\Models\User;
use App\Services\CompanyContext;
use App\Services\Dossiers\DossierLocationGroupingService;
use App\Services\Dossiers\DossierNumberService;
use App\Services\Dossiers\DossierWorkflowStepperService;
use Carbon\CarbonInterface;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DossierController extends Controller
{
    public function index(
        Request $request,
        DossierLocationGroupingService $locationGroupingService,
        CompanyContext $companyContext,
    ): Response {
        $this->authorize('viewAny', Dossier::class);

        $dossiers = $companyContext->applyTo(Dossier::query(), $request->user())
            ->with(['client', 'city'])
            ->withCount(['documents', 'financeDocuments'])
            ->withExists(['contract', 'archiveRecord'])
            ->latest('updated_at')
            ->get();

        $monthExpression = match (DB::connection()->getDriverName()) {
            'sqlite' => "strftime('%Y-%m', created_at)",
            'pgsql' => "TO_CHAR(created_at, 'YYYY-MM')",
            default => "DATE_FORMAT(created_at, '%Y-%m')",
        };

        $monthlyProjects = $companyContext->applyTo(Dossier::query(), $request->user())
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

        return Inertia::render('Dossiers/Index', [
            'dossiers' => DossierResource::collection($dossiers)->resolve(),
            'locationGroups' => $locationGroupingService->groups($request->user()),
            'clients' => $this->clientOptions($request->user(), $companyContext),
            'cities' => City::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'code', 'color']),
            'monthlyProjects' => $monthlyProjects,
            'metrics' => [
                'total' => $dossiers->count(),
                'active' => $dossiers->where('status', 'active')->count(),
                'opened' => $dossiers->where('status', 'opened')->count(),
                'closed' => $dossiers->whereIn('status', ['closed', 'cloture', 'archived'])->count(),
                'documentsTotal' => (int) $dossiers->sum('documents_count'),
                'financeDocumentsTotal' => (int) $dossiers->sum('finance_documents_count'),
            ],
        ]);
    }

    public function show(
        Request $request,
        Dossier $dossier,
        DossierWorkflowStepperService $workflowStepper,
        CompanyContext $companyContext,
    ): Response {
        $this->authorize('view', $dossier);

        $dossier
            ->load([
                'client.intermediary',
                'city',
                'documents.template',
                'contract',
                'financeDocuments.payments',
                'payments.document',
                'archiveRecord',
                'workflowRequirementHistories.changedBy',
            ])
            ->loadCount(['documents', 'financeDocuments'])
            ->loadExists(['contract', 'archiveRecord']);

        $workflow = $workflowStepper->evaluate($dossier);
        $user = $request->user();

        $dossierOptions = $companyContext->applyTo(Dossier::query(), $user)
            ->with('client:id,full_name')
            ->latest('created_at')
            ->get(['id', 'client_id', 'dossier_number', 'project_object'])
            ->map(fn (Dossier $item) => [
                'id' => (string) $item->id,
                'label' => trim(implode(' - ', array_filter([
                    $item->dossier_number,
                    $item->project_object,
                    $item->client?->full_name,
                ]))),
                'clientId' => (string) $item->client_id,
            ])
            ->values();

        $templates = DocumentTemplate::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(fn (DocumentTemplate $template) => [
                'id' => (string) $template->id,
                'label' => $template->name,
                'type' => $template->document_type,
            ])
            ->values();

        return Inertia::render('Dossiers/Show', [
            'dossier' => DossierResource::make($dossier)->resolve(),
            'canDesign' => (bool) ($user && (
                $user->can('project-design.view')
                || $user->hasRole('admin')
            )),
            'workflow' => $workflow,
            'documents' => $dossier->documents
                ->sortByDesc('updated_at')
                ->values()
                ->map(fn ($document) => [
                    'id' => $document->id,
                    'name' => $document->template?->name
                        ?? $document->original_filename
                        ?? $document->document_number
                        ?? 'Document',
                    'documentNumber' => $document->document_number,
                    'documentType' => $document->template?->document_type,
                    'status' => $document->status,
                    'fileName' => $document->original_filename,
                    'uploadedAt' => optional($document->uploaded_at)->format('Y-m-d'),
                    'verifiedAt' => optional($document->verified_at)->format('Y-m-d'),
                    'downloadUrl' => $document->stored_path
                        ? route('documents.download', $document)
                        : null,
                    'notes' => $document->notes,
                ]),
            'contract' => $this->contractPayload($dossier),
            'financeDocuments' => $dossier->financeDocuments
                ->sortByDesc('issue_date')
                ->values()
                ->map(fn ($document) => [
                    'id' => $document->id,
                    'type' => $document->type,
                    'number' => $document->number,
                    'status' => $document->status,
                    'issueDate' => optional($document->issue_date)->format('Y-m-d'),
                    'dueDate' => optional($document->due_date)->format('Y-m-d'),
                    'totalTtc' => (float) $document->total_ttc,
                    'paidTotal' => (float) $document->paid_total,
                    'remainingTotal' => (float) $document->remaining_total,
                    'currency' => $document->currency ?: 'MAD',
                    'generatedAt' => optional($document->generated_at)->format('Y-m-d H:i'),
                ]),
            'payments' => $dossier->payments
                ->sortByDesc('paid_at')
                ->values()
                ->map(fn ($payment) => [
                    'id' => $payment->id,
                    'paymentNumber' => $payment->payment_number ?: '#'.$payment->id,
                    'amount' => (float) $payment->amount,
                    'method' => $payment->method,
                    'reference' => $payment->reference,
                    'paidAt' => optional($payment->paid_at)->format('Y-m-d'),
                    'documentNumber' => $payment->document?->number,
                ]),
            'archiveRecord' => $this->archivePayload($dossier),
            'activity' => $this->activityPayload($dossier),
            'clients' => $this->clientOptions($user, $companyContext),
            'cities' => City::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'code', 'color']),
            'dossiers' => $dossierOptions,
            'templates' => $templates,
        ]);
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

        $city = City::query()->findOrFail($request->integer('city_id'));
        $numbering = $numberService->generate($city);
        $data = $this->prepareDossierData($request->validated(), true);

        $data['dossier_number'] = $numbering['number'];
        $data['city_id'] = $city->id;
        $data['sequence_number'] = $numbering['sequence'];
        $data['period'] = $numbering['period'];
        $data['company_id'] = $client->company_id;
        $data['branch_id'] = $client->branch_id;

        Dossier::query()->create($data);

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

        $dossier->update([
            ...$this->prepareDossierData($request->validated()),
            'company_id' => $client->company_id,
            'branch_id' => $client->branch_id,
        ]);

        return $this->redirectAfterMutation(
            $request->input('return_to'),
            'Project updated successfully.',
        );
    }

    public function destroy(Dossier $dossier): RedirectResponse
    {
        $this->authorize('delete', $dossier);
        $dossier->delete();

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
                'label' => $client->client_number.' - '.$client->full_name,
            ])
            ->values()
            ->all();
    }

    private function contractPayload(Dossier $dossier): ?array
    {
        $contract = $dossier->contract;

        if (! $contract) {
            return null;
        }

        return [
            'id' => $contract->id,
            'contractNumber' => $contract->contract_number,
            'status' => $contract->status,
            'surface' => (float) $contract->surface,
            'pricePerSquareMeter' => (float) $contract->price_per_square_meter,
            'feeRatePercent' => (float) $contract->fee_rate_percent,
            'calculationMode' => $contract->calculation_mode,
            'forfaitTtc' => (float) $contract->forfait_ttc,
            'ht' => (float) $contract->ht,
            'tva' => (float) $contract->tva,
            'ttc' => (float) $contract->ttc,
            'notes' => $contract->notes,
            'generatedAt' => optional($contract->generated_at)->format('Y-m-d'),
            'signedAt' => optional($contract->signed_at)->format('Y-m-d'),
            'createdAt' => optional($contract->created_at)->format('Y-m-d'),
            'hasGeneratedDoc' => filled($contract->generated_document_path),
            'hasPdf' => filled($contract->pdf_path),
        ];
    }

    private function archivePayload(Dossier $dossier): ?array
    {
        $archive = $dossier->archiveRecord;

        if (! $archive) {
            return null;
        }

        return [
            'id' => $archive->id,
            'archiveNumber' => $archive->archive_number,
            'status' => $archive->status,
            'room' => $archive->room,
            'shelf' => $archive->shelf,
            'box' => $archive->box,
            'folder' => $archive->folder,
            'inDate' => optional($archive->in_date)->format('Y-m-d'),
            'outDate' => optional($archive->out_date)->format('Y-m-d'),
            'returnedAt' => optional($archive->returned_at)->format('Y-m-d'),
            'requestedBy' => $archive->requested_by,
            'notes' => $archive->notes,
            'isOverdue' => $archive->isOverdue(),
            'isLost' => (bool) $archive->is_lost,
            'lostReason' => $archive->lost_reason,
            'locationLabel' => trim(implode(' / ', array_filter([
                $archive->room,
                $archive->shelf,
                $archive->box,
                $archive->folder,
            ]))),
        ];
    }

    private function activityPayload(Dossier $dossier): array
    {
        $items = collect();

        $this->pushActivity(
            $items,
            'project-'.$dossier->id.'-created',
            'project_created',
            $dossier->dossier_number,
            $dossier->status,
            null,
            $dossier->created_at,
            route('dossiers.show', $dossier),
        );

        if ($dossier->updated_at && $dossier->created_at && ! $dossier->updated_at->equalTo($dossier->created_at)) {
            $this->pushActivity(
                $items,
                'project-'.$dossier->id.'-updated',
                'project_updated',
                $dossier->project_object,
                $dossier->status,
                null,
                $dossier->updated_at,
                route('dossiers.show', $dossier),
            );
        }

        foreach ($dossier->workflowRequirementHistories as $history) {
            $this->pushActivity(
                $items,
                'workflow-'.$history->id,
                'workflow_updated',
                trim($history->step_key.' / '.$history->requirement_key),
                $history->new_is_done ? 'completed' : 'pending',
                null,
                $history->changed_at ?? $history->created_at,
                route('dossiers.show', ['dossier' => $dossier, 'tab' => 'workflow']),
            );
        }

        foreach ($dossier->documents as $document) {
            $subject = $document->template?->name
                ?? $document->original_filename
                ?? $document->document_number
                ?? 'Document';

            $this->pushActivity(
                $items,
                'document-'.$document->id.'-created',
                'document_created',
                $subject,
                $document->status,
                null,
                $document->created_at,
                route('dossiers.show', ['dossier' => $dossier, 'tab' => 'documents']),
            );

            if ($document->updated_at && $document->created_at && ! $document->updated_at->equalTo($document->created_at)) {
                $this->pushActivity(
                    $items,
                    'document-'.$document->id.'-updated',
                    'document_updated',
                    $subject,
                    $document->status,
                    null,
                    $document->updated_at,
                    route('dossiers.show', ['dossier' => $dossier, 'tab' => 'documents']),
                );
            }
        }

        if ($dossier->contract) {
            $contract = $dossier->contract;

            $this->pushActivity(
                $items,
                'contract-'.$contract->id.'-created',
                'contract_created',
                $contract->contract_number,
                $contract->status,
                (float) $contract->ttc,
                $contract->created_at,
                route('dossiers.show', ['dossier' => $dossier, 'tab' => 'contract']),
            );

            $this->pushActivity(
                $items,
                'contract-'.$contract->id.'-generated',
                'contract_generated',
                $contract->contract_number,
                $contract->status,
                (float) $contract->ttc,
                $contract->generated_at,
                route('dossiers.show', ['dossier' => $dossier, 'tab' => 'contract']),
            );

            $this->pushActivity(
                $items,
                'contract-'.$contract->id.'-signed',
                'contract_signed',
                $contract->contract_number,
                'signed',
                (float) $contract->ttc,
                $contract->signed_at,
                route('dossiers.show', ['dossier' => $dossier, 'tab' => 'contract']),
            );
        }

        foreach ($dossier->financeDocuments as $document) {
            $this->pushActivity(
                $items,
                'finance-'.$document->id.'-created',
                'finance_document_created',
                $document->number,
                $document->status,
                (float) $document->total_ttc,
                $document->created_at,
                route('dossiers.show', ['dossier' => $dossier, 'tab' => 'finance']),
            );

            if ($document->updated_at && $document->created_at && ! $document->updated_at->equalTo($document->created_at)) {
                $this->pushActivity(
                    $items,
                    'finance-'.$document->id.'-updated',
                    'finance_document_updated',
                    $document->number,
                    $document->status,
                    (float) $document->total_ttc,
                    $document->updated_at,
                    route('dossiers.show', ['dossier' => $dossier, 'tab' => 'finance']),
                );
            }
        }

        foreach ($dossier->payments as $payment) {
            $this->pushActivity(
                $items,
                'payment-'.$payment->id,
                'payment_recorded',
                $payment->payment_number ?: '#'.$payment->id,
                null,
                (float) $payment->amount,
                $payment->paid_at ?? $payment->created_at,
                route('dossiers.show', ['dossier' => $dossier, 'tab' => 'finance']),
            );
        }

        if ($dossier->archiveRecord) {
            $archive = $dossier->archiveRecord;

            $this->pushActivity(
                $items,
                'archive-'.$archive->id.'-created',
                'archive_created',
                $archive->archive_number,
                $archive->status,
                null,
                $archive->created_at,
                route('dossiers.show', ['dossier' => $dossier, 'tab' => 'overview']),
            );

            if ($archive->updated_at && $archive->created_at && ! $archive->updated_at->equalTo($archive->created_at)) {
                $this->pushActivity(
                    $items,
                    'archive-'.$archive->id.'-updated',
                    'archive_updated',
                    $archive->archive_number,
                    $archive->status,
                    null,
                    $archive->updated_at,
                    route('dossiers.show', ['dossier' => $dossier, 'tab' => 'overview']),
                );
            }
        }

        return $items
            ->sortByDesc('occurredAt')
            ->take(60)
            ->values()
            ->all();
    }

    private function pushActivity(
        Collection $items,
        string $id,
        string $type,
        string $subject,
        ?string $status,
        ?float $amount,
        ?CarbonInterface $occurredAt,
        ?string $href,
    ): void {
        if (! $occurredAt) {
            return;
        }

        $items->push([
            'id' => $id,
            'type' => $type,
            'subject' => $subject,
            'status' => $status,
            'amount' => $amount,
            'occurredAt' => $occurredAt->toIso8601String(),
            'occurredAtLabel' => $occurredAt->diffForHumans(),
            'href' => $href,
        ]);
    }

    private function redirectAfterMutation(?string $returnTo, string $message): RedirectResponse
    {
        $path = $this->safeLocalPath($returnTo);

        if ($path) {
            return redirect()->to($path)->with('success', $message);
        }

        return redirect()->route('dossiers.index')->with('success', $message);
    }

    private function safeLocalPath(?string $path): ?string
    {
        if (! is_string($path) || ! str_starts_with($path, '/') || str_starts_with($path, '//')) {
            return null;
        }

        return $path;
    }
}
