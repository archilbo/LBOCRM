<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\RenameDocumentTemplateRequest;
use App\Http\Requests\Finance\StoreDocumentTemplateRequest;
use App\Http\Requests\Finance\UpdateDocumentTemplateRequest;
use App\Http\Resources\DocumentTemplateResource;
use App\Models\FinanceTemplate;
use App\Services\Finance\DefaultFinanceTemplateFactory;
use App\Services\Finance\FinanceSettingsService;
use App\Services\Finance\FinanceActivityService;
use App\Services\Finance\FinanceContextService;
use App\Services\Finance\FinanceTemplatePlaceholderRegistry;
use App\Services\Finance\FinanceTemplateRenderer;
use App\Services\Finance\RenameFinanceTemplateService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class DocumentTemplateController extends Controller
{
    public function __construct(
        private readonly FinanceTemplatePlaceholderRegistry $placeholders,
        private readonly DefaultFinanceTemplateFactory $factory,
        private readonly FinanceTemplateRenderer $renderer,
    ) {
    }

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', FinanceTemplate::class);
        $templates = app(FinanceContextService::class)->apply(FinanceTemplate::query(), $request->user())
            ->orderBy('type')
            ->orderByDesc('is_default')
            ->orderBy('name')
            ->get();

        return Inertia::render('Finance/Templates/Index', [
            'templates' => DocumentTemplateResource::collection($templates)->resolve($request),
            'templatesByType' => DocumentTemplateResource::collection($templates)->resolve($request),
            'placeholders' => $this->placeholders->all(),
            'sampleData' => $this->sampleData(),
            'routes' => [
                'store' => route('finance.templates.store'),
                'close' => route('finance.documents.index', ['tab' => 'templates']),
            ],
        ]);
    }

    public function store(StoreDocumentTemplateRequest $request): RedirectResponse
    {
        $this->authorize('create', FinanceTemplate::class);
        $data = $request->validated();
        $scope = app(FinanceContextService::class)->payload($request->user());
        $source = !empty($data['copy_from_id'])
            ? app(FinanceContextService::class)->apply(FinanceTemplate::query(), $request->user())->findOrFail($data['copy_from_id'])
            : null;
        $payload = $source ? $source->only(['header_html', 'body_html', 'footer_html', 'css', 'settings', 'logo_path', 'paper_size', 'orientation']) : [];
        $payload = array_merge($payload, $data);
        unset($payload['copy_from_id']);

        $template = DB::transaction(function () use ($payload, $scope) {
            $payload = [...$scope, ...$payload];
            $payload['slug'] = $this->uniqueSlug($payload['slug'] ?? $payload['name']);
            $payload['created_by'] = Auth::id();
            $payload['is_default'] = (bool) ($payload['is_default'] ?? false);

            if ($payload['is_default']) {
                FinanceTemplate::where($scope)->where('type', $payload['type'])->update(['is_default' => false]);
            }

            return FinanceTemplate::create($payload);
        });
        app(FinanceActivityService::class)->log($template, $request->user(), 'finance.template.created', [], $template->only(['type', 'name', 'slug', 'is_default']));

        return redirect()->route('finance.templates.index', ['type' => $template->type, 'template' => $template->id])
            ->with('success', 'Template cree avec succes.');
    }

    public function show(FinanceTemplate $documentTemplate): JsonResponse
    {
        $this->authorize('view', $documentTemplate);
        return response()->json(['template' => new DocumentTemplateResource($documentTemplate)]);
    }

    public function update(UpdateDocumentTemplateRequest $request, FinanceTemplate $documentTemplate): RedirectResponse
    {
        $this->authorize('update', $documentTemplate);
        $data = $request->validated();
        $old = $documentTemplate->only(['type', 'name', 'slug', 'is_default']);

        DB::transaction(function () use ($data, $documentTemplate) {
            $data['slug'] = $this->uniqueSlug($data['slug'] ?? $data['name'], $documentTemplate->id);
            $data['is_default'] = (bool) ($data['is_default'] ?? false);

            if ($data['is_default']) {
                FinanceTemplate::where('company_id', $documentTemplate->company_id)
                    ->where('branch_id', $documentTemplate->branch_id)
                    ->where('type', $documentTemplate->type)
                    ->whereKeyNot($documentTemplate->id)
                    ->update(['is_default' => false]);
            }

            $documentTemplate->update($data);
        });
        app(FinanceActivityService::class)->log($documentTemplate, $request->user(), 'finance.template.updated', $old, $documentTemplate->only(array_keys($old)));

        return redirect()->back()->with('success', 'Template mis a jour.');
    }

    public function rename(
        RenameDocumentTemplateRequest $request,
        FinanceTemplate $documentTemplate,
        RenameFinanceTemplateService $service,
    ): RedirectResponse {
        $this->authorize('update', $documentTemplate);
        $service->rename($documentTemplate, $request->user(), $request->validated('name'));

        return redirect()->back()->with('success', 'Template renomme avec succes.');
    }

    public function destroy(FinanceTemplate $documentTemplate): RedirectResponse
    {
        $this->authorize('delete', $documentTemplate);
        if ($documentTemplate->is_default && FinanceTemplate::where('company_id', $documentTemplate->company_id)->where('branch_id', $documentTemplate->branch_id)->where('type', $documentTemplate->type)->where('is_default', true)->count() <= 1) {
            return redirect()->back()->with('error', 'Impossible de supprimer le dernier template par defaut.');
        }

        app(FinanceActivityService::class)->log($documentTemplate, request()->user(), 'finance.template.deleted', $documentTemplate->toArray());
        $documentTemplate->delete();

        return redirect()->back()->with('success', 'Template supprime.');
    }

    public function duplicate(FinanceTemplate $documentTemplate): RedirectResponse
    {
        $this->authorize('update', $documentTemplate);
        $copy = $documentTemplate->replicate();
        $copy->name = $documentTemplate->name . ' - Copie';
        $copy->slug = $this->uniqueSlug($documentTemplate->slug . '-copie');
        $copy->is_default = false;
        $copy->created_by = Auth::id();
        $copy->save();
        app(FinanceActivityService::class)->log($copy, request()->user(), 'finance.template.duplicated', [], ['source_template_id' => $documentTemplate->id]);

        return redirect()->route('finance.templates.index', ['type' => $copy->type, 'template' => $copy->id])
            ->with('success', 'Template duplique.');
    }

    public function setDefault(FinanceTemplate $documentTemplate): RedirectResponse
    {
        $this->authorize('update', $documentTemplate);
        DB::transaction(function () use ($documentTemplate) {
            FinanceTemplate::where('company_id', $documentTemplate->company_id)
                ->where('branch_id', $documentTemplate->branch_id)
                ->where('type', $documentTemplate->type)->update(['is_default' => false]);
            $documentTemplate->update(['is_default' => true]);
        });

        return redirect()->back()->with('success', 'Template defini par defaut.');
    }

    public function resetDefault(string $type): RedirectResponse
    {
        $this->authorize('create', FinanceTemplate::class);
        if (!in_array($type, ['quote', 'invoice', 'receipt'], true)) {
            return redirect()->back()->with('error', 'Type de template invalide.');
        }

        $scope = app(FinanceContextService::class)->payload(request()->user());
        DB::transaction(function () use ($type, $scope) {
            FinanceTemplate::where($scope)->where('type', $type)->update(['is_default' => false]);
            $defaults = $this->factory->forType($type);
            $defaults = [...$scope, ...$defaults];
            $defaults['slug'] = $this->uniqueSlug('default-' . $type . '-' . now()->format('YmdHis'));
            $defaults['created_by'] = Auth::id();
            FinanceTemplate::create($defaults);
        });

        return redirect()->back()->with('success', 'Template par defaut recree.');
    }

    public function preview(FinanceTemplate $documentTemplate): JsonResponse
    {
        $this->authorize('view', $documentTemplate);
        return response()->json([
            'html' => $this->renderer->renderTemplatePreview($documentTemplate, $this->sampleData()),
        ]);
    }

    private function uniqueSlug(string $value, ?int $ignoreId = null): string
    {
        $base = Str::slug($value) ?: 'template';
        $slug = $base;
        $i = 2;

        while (FinanceTemplate::where('slug', $slug)->when($ignoreId, fn ($query) => $query->whereKeyNot($ignoreId))->exists()) {
            $slug = $base . '-' . $i++;
        }

        return $slug;
    }

    private function sampleData(): array
    {
        $currency = FinanceSettingsService::getCurrency();

        return [
            'company' => [
                'name' => FinanceSettingsService::getCompanyName() ?: 'ARCHI LBO SARLAU',
                'address' => FinanceSettingsService::getCompanyAddress() ?: 'Adresse societe',
                'phone' => FinanceSettingsService::getCompanyPhone() ?: '+212 000 000 000',
                'email' => FinanceSettingsService::getCompanyEmail() ?: 'contact@archilbo.local',
                'ice' => FinanceSettingsService::getCompanyIce() ?: '000000000000000',
                'tva' => (string) FinanceSettingsService::getTvaRate(),
                'patente' => '123456',
                'cnss' => '654321',
                'logo_path' => '',
            ],
            'bank' => ['name' => FinanceSettingsService::getBankName() ?: 'Banque Exemple', 'rib' => FinanceSettingsService::getBankRib() ?: '000 000 000000000000 00'],
            'document' => ['number' => 'DEV-2026-0001', 'type_label' => 'Devis', 'status' => 'draft', 'issue_date' => '27/06/2026', 'due_date' => '27/07/2026', 'valid_until' => '27/07/2026', 'currency' => $currency, 'notes' => 'Note interne exemple.', 'terms' => 'Paiement a reception.'],
            'client' => ['name' => 'Client Exemple', 'cin' => 'AA000000', 'address' => 'Adresse client', 'phone' => '+212 600 000 000', 'email' => 'client@example.test'],
            'dossier' => ['number' => 'DOS-2026-0001', 'project_object' => 'Projet de construction', 'address' => 'Adresse projet', 'commune' => 'Commune', 'province' => 'Province'],
            'items' => [
                ['position' => 1, 'title' => 'Etudes architecturales', 'description' => 'Plans et dossier administratif', 'quantity' => 1, 'unit' => 'forfait', 'unit_price_display' => '8 000.00 ' . $currency, 'total_ht_display' => '8 000.00 ' . $currency, 'total_ttc_display' => '8 000.00 ' . $currency],
                ['position' => 2, 'title' => 'Suivi dossier', 'description' => 'Suivi administratif', 'quantity' => 1, 'unit' => 'forfait', 'unit_price_display' => '2 000.00 ' . $currency, 'total_ht_display' => '2 000.00 ' . $currency, 'total_ttc_display' => '2 000.00 ' . $currency],
            ],
            'totals' => ['subtotal_ht' => '10 000.00 ' . $currency, 'discount_total' => '0.00 ' . $currency, 'tax_total' => '2 000.00 ' . $currency, 'total_ttc' => '12 000.00 ' . $currency, 'paid_total' => '4 000.00 ' . $currency, 'remaining_total' => '8 000.00 ' . $currency],
            'payments' => [['payment_number' => 'PAY-2026-0001', 'paid_at' => '27/06/2026', 'method' => 'Virement', 'reference' => 'REF-001', 'amount_display' => '4 000.00 ' . $currency]],
        ];
    }
}
