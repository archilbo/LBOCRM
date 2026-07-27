<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\ConvertQuoteToInvoiceRequest;
use App\Http\Requests\Finance\StoreFinanceDocumentRequest;
use App\Http\Requests\Finance\UpdateFinanceDocumentRequest;
use App\Http\Resources\FinanceDocumentResource;
use App\Http\Resources\PaymentResource;
use App\Notifications\FinanceDocumentNotification;
use App\Models\Client;
use App\Models\Dossier;
use App\Models\Expense;
use App\Models\FinanceDocument;
use App\Models\FinanceDocumentItem;
use App\Models\FinanceTemplate;
use App\Models\Payment;
use App\Services\Finance\FinanceExcelExporter;
use App\Services\Finance\FinanceActivityService;
use App\Services\Finance\FinanceContextService;
use App\Services\Finance\FinanceDocumentLockGuard;
use App\Services\Finance\FinanceDocumentQueryService;
use App\Services\Finance\FinanceFileStorageService;
use App\Services\Finance\FinanceNumberService;
use App\Services\Finance\FinancePdfGenerator;
use App\Services\Finance\FinanceSettingsService;
use App\Services\Finance\FinanceMonthlySummaryService;
use App\Services\Finance\FinanceTemplateRenderer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\Process\Process;

class FinanceDocumentController extends Controller
{
    public function index(
        Request $request,
        FinanceMonthlySummaryService $monthlySummaryService,
        FinanceDocumentQueryService $queries,
        FinanceContextService $context,
    ): Response
    {
        $this->authorize('viewAny', FinanceDocument::class);
        $user = $request->user();
        $context->payload($user);

        $currency = FinanceSettingsService::getCurrency();
        $expenses = $queries->expenses($request, $user)->through(fn (Expense $expense) => [
                'id' => $expense->id,
                'category' => $expense->category,
                'vendor' => $expense->vendor,
                'amount' => (float) $expense->amount,
                'currency' => $expense->currency,
                'expenseDate' => $expense->expense_date->toDateString(),
                'paymentMethod' => $expense->payment_method,
                'notes' => $expense->notes,
                'dossier' => $expense->dossier ? [
                    'id' => $expense->dossier->id,
                    'number' => $expense->dossier->dossier_number,
                ] : null,
                'createdBy' => $expense->creator?->name,
                'createdAt' => $expense->created_at?->toDateTimeString(),
            ]);
        $financeTemplates = $context->apply(FinanceTemplate::query(), $user)
            ->orderBy('type')
            ->orderByDesc('is_default')
            ->orderBy('name')
            ->get();

        return Inertia::render('Finance/Documents/Index', [
            'documents' => FinanceDocumentResource::collection($queries->documents($request, $user)),
            'payments' => PaymentResource::collection($queries->payments($request, $user)),
            'expenses' => $expenses,
            'monthlySummaries' => $monthlySummaryService->months(null, $user),
            'metrics' => $queries->metrics($user, $currency),
            'clients' => Client::select('id', 'full_name', 'cin', 'address')
                ->orderBy('full_name')
                ->get()
                ->map(fn ($c) => [
                    'id' => (string) $c->id,
                    'label' => $c->full_name,
                    'cin' => $c->cin,
                    'address' => $c->address,
                ]),
            'dossiers' => Dossier::select('id', 'client_id', 'dossier_number', 'project_object', 'project_address', 'floor_area', 'land_surface')
                ->orderBy('dossier_number')
                ->get()
                ->map(fn ($d) => [
                    'id' => (string) $d->id,
                    'label' => trim($d->dossier_number . ' - ' . ($d->project_object ?? '')),
                    'clientId' => (string) $d->client_id,
                    'projectObject' => $d->project_object,
                    'address' => $d->project_address,
                    'floorArea' => $d->floor_area,
                    'landSurface' => $d->land_surface,
                ]),
            'templates' => $financeTemplates->map(fn ($template) => [
                    'id' => (string) $template->id,
                    'label' => $template->name,
                    'type' => $template->type,
                    'slug' => $template->slug,
                    'isDefault' => (bool) $template->is_default,
                    'updatedAt' => $template->updated_at?->diffForHumans(),
                    'renameUrl' => route('finance.templates.rename', $template),
                    'editorUrl' => route('finance.templates.index', [
                        'type' => $template->type,
                        'template' => $template->id,
                    ]),
                ]),
            'templateEditorUrl' => route('finance.templates.index'),
            'settingsEditorUrl' => route('finance.settings.index'),
            'settings' => [
                'defaultTvaRate' => FinanceSettingsService::getTvaRate(),
                'defaultCurrency' => $currency,
                'defaultPaymentTermsDays' => FinanceSettingsService::getDefaultPaymentDays(),
                'defaultQuoteValidityDays' => 30,
                'defaultUnitPriceM2' => 0,
                'defaultArchitectRate' => 0,
                'companyInfo' => [],
                'bankInfo' => [],
            ],
            'filters' => $request->only([
                'tab', 'type', 'status', 'search', 'client_id', 'dossier_id',
                'date_from', 'date_to', 'sort', 'direction', 'per_page', 'page',
                'payment_search', 'payment_sort', 'payment_direction', 'payments_per_page', 'payments_page',
                'expense_search', 'expense_category', 'expense_sort', 'expense_direction', 'expenses_per_page', 'expenses_page',
            ]),
        ]);
    }

    public function store(StoreFinanceDocumentRequest $request): RedirectResponse
    {
        $this->authorize('create', FinanceDocument::class);
        $data = $request->validated();
        $scope = app(FinanceContextService::class)->payload($request->user());

        $document = DB::transaction(function () use ($data, $request, $scope) {
            $number = FinanceNumberService::nextDocumentNumber($data['type']);

            $document = FinanceDocument::create([
                ...$scope,
                'type' => $data['type'],
                'number' => $number,
                'status' => 'draft',
                'client_id' => $data['client_id'] ?? null,
                'dossier_id' => $data['dossier_id'] ?? null,
                'issue_date' => $data['issue_date'] ?? now(),
                'due_date' => $data['due_date'] ?? now()->addDays(FinanceSettingsService::getDefaultPaymentDays()),
                'valid_until' => $data['valid_until'] ?? now()->addDays(30),
                'currency' => $data['currency'] ?? FinanceSettingsService::getCurrency(),
                'tva_rate' => $data['tva_rate'] ?? FinanceSettingsService::getTvaRate(),
                'discount_total' => $data['discount_total'] ?? 0,
                'notes' => $data['notes'] ?? null,
                'terms' => $data['terms'] ?? FinanceSettingsService::getDefaultPaymentTerms(),
                'template_id' => $data['template_id'] ?? null,
                'created_by' => Auth::id(),
            ]);

            if (!empty($data['items'])) {
                foreach (array_values($data['items']) as $pos => $itemData) {
                    $item = new FinanceDocumentItem([
                        'position' => $pos + 1,
                        'title' => $itemData['title'] ?? null,
                        'description' => $itemData['description'] ?? null,
                        'quantity' => $itemData['quantity'] ?? 1,
                        'unit' => $itemData['unit'] ?? null,
                        'unit_price' => $itemData['unit_price'] ?? 0,
                    ]);
                    $item->calculateTotals();
                    $document->items()->save($item);
                }
            }

            $document->recalculateTotals()->save();

            return $document;
        });

        app(FinanceActivityService::class)->log($document, $request->user(), 'finance.document.created', [], [
            'number' => $document->number,
            'type' => $document->type,
            'total_ttc' => $document->total_ttc,
        ]);

        $request->user()->notify(new FinanceDocumentNotification($document, 'created', ucfirst($document->type) . ' created: ' . $document->number));

        return redirect()->route('finance.documents.index', [
            'tab' => match ($document->type) {
                'quote' => 'quotes',
                'invoice' => 'invoices',
                'receipt' => 'overview',
                default => 'overview',
            },
        ])->with('success', "Document {$document->number} cree avec succes.");
    }

    public function show(FinanceDocument $financeDocument): Response
    {
        $this->authorize('view', $financeDocument);
        $financeDocument->loadMissing(['client', 'dossier', 'items', 'payments', 'template', 'creator']);

        return Inertia::render('Finance/Documents/Show', [
            'document' => (new FinanceDocumentResource($financeDocument))->resolve(request()),
        ]);
    }

    public function update(UpdateFinanceDocumentRequest $request, FinanceDocument $financeDocument): RedirectResponse
    {
        $this->authorize('update', $financeDocument);
        app(FinanceDocumentLockGuard::class)->assertCanEditContent($financeDocument);
        $data = $request->validated();
        $old = $financeDocument->only(['type', 'client_id', 'dossier_id', 'status', 'total_ttc', 'template_id']);

        DB::transaction(function () use ($data, $financeDocument) {
            $financeDocument->update([
                'type' => $data['type'] ?? $financeDocument->type,
                'client_id' => $financeDocument->client_id,
                'dossier_id' => $financeDocument->dossier_id,
                'status' => $data['status'] ?? $financeDocument->status,
                'issue_date' => $data['issue_date'] ?? $financeDocument->issue_date,
                'due_date' => $data['due_date'] ?? $financeDocument->due_date,
                'valid_until' => $data['valid_until'] ?? $financeDocument->valid_until,
                'currency' => $data['currency'] ?? $financeDocument->currency,
                'tva_rate' => $data['tva_rate'] ?? $financeDocument->tva_rate,
                'discount_total' => $data['discount_total'] ?? $financeDocument->discount_total,
                'notes' => $data['notes'] ?? $financeDocument->notes,
                'terms' => $data['terms'] ?? $financeDocument->terms,
                'template_id' => $data['template_id'] ?? $financeDocument->template_id,
            ]);

            if (isset($data['items'])) {
                $financeDocument->items()->delete();

                foreach (array_values($data['items']) as $pos => $itemData) {
                    $item = new FinanceDocumentItem([
                        'position' => $pos + 1,
                        'title' => $itemData['title'],
                        'description' => $itemData['description'] ?? null,
                        'quantity' => $itemData['quantity'] ?? 1,
                        'unit' => $itemData['unit'] ?? null,
                        'unit_price' => $itemData['unit_price'] ?? 0,
                    ]);
                    $item->calculateTotals();
                    $financeDocument->items()->save($item);
                }
            }

            $financeDocument->recalculateTotals()->save();
        });

        app(FinanceActivityService::class)->log($financeDocument, $request->user(), 'finance.document.updated', $old, [
            ...$financeDocument->fresh()->only(['type', 'client_id', 'dossier_id', 'status', 'total_ttc', 'template_id']),
        ]);

        return redirect()->route('finance.documents.index', [
            'tab' => match ($financeDocument->type) {
                'quote' => 'quotes',
                'invoice' => 'invoices',
                'receipt' => 'overview',
                default => 'overview',
            },
        ])->with('success', "Document {$financeDocument->number} mis a jour.");
    }

    public function destroy(FinanceDocument $financeDocument): RedirectResponse
    {
        $this->authorize('delete', $financeDocument);
        app(FinanceDocumentLockGuard::class)->assertCanEditContent($financeDocument);
        $number = $financeDocument->number;
        app(FinanceActivityService::class)->log($financeDocument, request()->user(), 'finance.document.deleted', $financeDocument->toArray());
        $financeDocument->delete();

        return redirect()->route('finance.documents.index')
            ->with('success', "Document {$number} supprime.");
    }

    public function generate(Request $request, FinanceDocument $financeDocument, FinancePdfGenerator $pdfGenerator, FinanceExcelExporter $excelExporter): RedirectResponse
    {
        $this->authorize('issue', $financeDocument);
        if ($financeDocument->items()->count() === 0) {
            return redirect()->back()->with('error', 'Ajoutez au moins une ligne au document avant generation.');
        }

        try {
            $pdfGenerator->generate($financeDocument, $request->user());
            $excelExporter->generate($financeDocument->refresh(), $request->user());

            app(FinanceActivityService::class)->log($financeDocument, $request->user(), 'finance.document.exports_generated');

            $request->user()->notify(new FinanceDocumentNotification($financeDocument, 'generated', ucfirst($financeDocument->type) . ' generated: ' . $financeDocument->number));

            return redirect()->back()->with('success', "Document {$financeDocument->number} genere avec succes.");
        } catch (\Throwable $e) {
            return redirect()->back()->with('error', 'Erreur de generation : ' . $e->getMessage());
        }
    }

    public function generatePdf(Request $request, FinanceDocument $financeDocument, FinancePdfGenerator $generator): RedirectResponse
    {
        $this->authorize('issue', $financeDocument);
        if ($financeDocument->items()->count() === 0) {
            return redirect()->back()->with('error', 'Ajoutez au moins une ligne au document avant generation PDF.');
        }

        try {
            $generator->generate($financeDocument, $request->user());
            app(FinanceActivityService::class)->log($financeDocument, $request->user(), 'finance.document.pdf_generated');

            return redirect()->back()->with('success', "PDF {$financeDocument->number} genere avec succes.");
        } catch (\Throwable $e) {
            return redirect()->back()->with('error', 'Erreur de generation PDF : ' . $e->getMessage());
        }
    }

    public function generateExcel(Request $request, FinanceDocument $financeDocument, FinanceExcelExporter $exporter): RedirectResponse
    {
        $this->authorize('issue', $financeDocument);
        if ($financeDocument->items()->count() === 0) {
            return redirect()->back()->with('error', 'Ajoutez au moins une ligne au document avant export Excel.');
        }

        try {
            $exporter->generate($financeDocument, $request->user());
            app(FinanceActivityService::class)->log($financeDocument, $request->user(), 'finance.document.excel_generated');

            return redirect()->back()->with('success', "Excel {$financeDocument->number} genere avec succes.");
        } catch (\Throwable $e) {
            return redirect()->back()->with('error', 'Erreur export Excel : ' . $e->getMessage());
        }
    }

    public function download(FinanceDocument $financeDocument, FinanceFileStorageService $storage)
    {
        return $this->downloadExcel($financeDocument, $storage);
    }

    public function downloadExcel(FinanceDocument $financeDocument, FinanceFileStorageService $storage)
    {
        $this->authorize('download', $financeDocument);
        if (! $financeDocument->excel_path) {
            return redirect()->back()->with('error', 'Aucun fichier Excel disponible.');
        }

        return $storage->response($financeDocument->excel_path, $financeDocument->number.'.xlsx');
    }

    public function downloadPdf(FinanceDocument $financeDocument, FinanceFileStorageService $storage)
    {
        $this->authorize('download', $financeDocument);
        if (! $financeDocument->pdf_path) {
            return redirect()->back()->with('error', 'Aucun PDF disponible.');
        }

        return $storage->response($financeDocument->pdf_path, $financeDocument->number.'.pdf');
    }

    public function viewPdf(FinanceDocument $financeDocument, FinanceFileStorageService $storage)
    {
        $this->authorize('download', $financeDocument);
        if (! $financeDocument->pdf_path) {
            return redirect()->back()->with('error', 'Generez d abord le PDF.');
        }

        return $storage->response($financeDocument->pdf_path, $financeDocument->number.'.pdf', true);
    }

    public function viewHtml(FinanceDocument $financeDocument, FinanceTemplateRenderer $renderer)
    {
        $this->authorize('view', $financeDocument);
        $financeDocument->loadMissing(['client', 'dossier', 'items', 'payments', 'template']);

        return response($financeDocument->rendered_html_snapshot ?: $renderer->renderHtml($financeDocument))
            ->header('Content-Type', 'text/html; charset=UTF-8')
            ->header('Cache-Control', 'private, no-store, max-age=0');
    }

    public function print(FinanceDocument $financeDocument, FinanceTemplateRenderer $renderer)
    {
        $this->authorize('view', $financeDocument);
        $financeDocument->loadMissing(['client', 'dossier', 'items', 'payments', 'template']);
        $html = $financeDocument->rendered_html_snapshot ?: $renderer->renderHtml($financeDocument);
        $script = '<script>window.addEventListener("load",()=>window.print());</script>';
        $html = str_contains($html, '</body>') ? str_replace('</body>', $script.'</body>', $html) : $html.$script;

        return response($html)->header('Content-Type', 'text/html; charset=UTF-8')
            ->header('Cache-Control', 'private, no-store, max-age=0');
    }

    public function revealGeneratedFiles(FinanceDocument $financeDocument, FinanceFileStorageService $storage): RedirectResponse
    {
        $this->authorize('download', $financeDocument);
        if (!app()->environment('local')) {
            return redirect()->back()->with('error', 'Ouverture Explorer disponible uniquement en local.');
        }

        if (PHP_OS_FAMILY !== 'Windows') {
            return redirect()->back()->with('error', 'Ouverture Explorer disponible uniquement sur Windows.');
        }

        $relativePath = $financeDocument->pdf_path ?: $financeDocument->excel_path;

        $relativePath = $storage->ensurePrivate($relativePath);
        if (! $relativePath) {
            return redirect()->back()->with('error', 'Aucun fichier genere disponible.');
        }

        $absolutePath = $storage->disk()->path($relativePath);
        $storageRoot = realpath($storage->disk()->path(''));
        $realFile = realpath($absolutePath);

        if (!$storageRoot || !$realFile || !str_starts_with($realFile, $storageRoot)) {
            return redirect()->back()->with('error', 'Emplacement fichier invalide.');
        }

        try {
            (new Process(['explorer.exe', '/select,' . $realFile]))->start();

            return redirect()->back()->with('success', 'Dossier genere ouvert dans Explorer.');
        } catch (\Throwable $e) {
            return redirect()->back()->with('error', 'Impossible d ouvrir Explorer : ' . $e->getMessage());
        }
    }

    public function previewHtml(FinanceDocument $financeDocument, FinanceTemplateRenderer $renderer): JsonResponse
    {
        $this->authorize('view', $financeDocument);
        $financeDocument->loadMissing(['client', 'dossier', 'items', 'payments', 'template']);
        $html = $financeDocument->rendered_html_snapshot ?: $renderer->renderHtml($financeDocument);

        return response()->json(['html' => $html]);
    }

    public function previewDraft(Request $request, FinanceTemplateRenderer $renderer): JsonResponse
    {
        $this->authorize('create', FinanceDocument::class);
        $data = $request->validate([
            'type' => 'required|in:quote,invoice,receipt',
            'template_id' => 'nullable|string',
            'client_id' => 'nullable|string',
            'dossier_id' => 'nullable|string',
            'issue_date' => 'nullable|string',
            'due_date' => 'nullable|string',
            'valid_until' => 'nullable|string',
            'currency' => 'nullable|string',
            'tva_rate' => 'nullable|numeric',
            'discount_total' => 'nullable|numeric',
            'notes' => 'nullable|string',
            'terms' => 'nullable|string',
            'items' => 'nullable|array',
            'items.*.title' => 'nullable|string',
            'items.*.description' => 'nullable|string',
            'items.*.quantity' => 'nullable|numeric',
            'items.*.unit' => 'nullable|string',
            'items.*.unit_price' => 'nullable|numeric',
            'items.*.total_ht' => 'nullable|numeric',
            'items.*.total_tva' => 'nullable|numeric',
            'items.*.total_ttc' => 'nullable|numeric',
        ]);

        $template = $data['template_id']
            ? FinanceTemplate::query()
                ->whereKey($data['template_id'])
                ->whereIn('type', [$data['type'], 'finance'])
                ->first()
            : null;

        $template ??= FinanceTemplate::query()
            ->where('type', $data['type'])
            ->where('is_default', true)
            ->first()
            ?: FinanceTemplate::query()->where('type', $data['type'])->first()
            ?: FinanceTemplate::query()->where('type', 'finance')->where('is_default', true)->first();

        $client = $data['client_id'] ? Client::find($data['client_id']) : null;
        $dossier = $data['dossier_id'] ? Dossier::find($data['dossier_id']) : null;
        $currency = $data['currency'] ?: FinanceSettingsService::getCurrency();

        $items = collect($data['items'] ?? [])->values()->map(fn ($item, $i) => [
            'position' => $i + 1,
            'title' => $item['title'] ?? '',
            'description' => $item['description'] ?? '',
            'quantity' => (float) ($item['quantity'] ?? 1),
            'unit' => $item['unit'] ?? '',
            'unit_price' => (float) ($item['unit_price'] ?? 0),
            'unit_price_display' => number_format((float) ($item['unit_price'] ?? 0), 2, '.', ' ') . ' ' . $currency,
            'total_ht' => (float) ($item['total_ht'] ?? 0),
            'total_ht_display' => number_format((float) ($item['total_ht'] ?? 0), 2, '.', ' ') . ' ' . $currency,
            'total_tva' => (float) ($item['total_tva'] ?? 0),
            'total_tva_display' => number_format((float) ($item['total_tva'] ?? 0), 2, '.', ' ') . ' ' . $currency,
            'total_ttc' => (float) ($item['total_ttc'] ?? 0),
            'total_ttc_display' => number_format((float) ($item['total_ttc'] ?? 0), 2, '.', ' ') . ' ' . $currency,
        ])->all();

        $formatMoney = fn (float $v) => number_format($v, 2, '.', ' ') . ' ' . $currency;
        $discountRaw = (float) ($data['discount_total'] ?? 0);
        $issueDate = $data['issue_date'] ? Carbon::parse($data['issue_date'])->format('d/m/Y') : '';

        $renderData = [
            'company' => [
                'name' => FinanceSettingsService::getCompanyName(),
                'address' => FinanceSettingsService::getCompanyAddress(),
                'phone' => FinanceSettingsService::getCompanyPhone(),
                'email' => FinanceSettingsService::getCompanyEmail(),
                'ice' => FinanceSettingsService::getCompanyIce(),
                'tva' => (string) FinanceSettingsService::getTvaRate(),
                'patente' => (string) FinanceSettingsService::get('company', 'patente', ''),
                'cnss' => (string) FinanceSettingsService::get('company', 'cnss', ''),
                'logo_path' => (string) FinanceSettingsService::get('company', 'logo_path', ''),
            ],
            'bank' => [
                'name' => FinanceSettingsService::getBankName(),
                'rib' => FinanceSettingsService::getBankRib(),
            ],
            'document' => [
                'id' => null,
                'type' => $data['type'],
                'type_label' => match ($data['type']) { 'quote' => 'Devis', 'invoice' => 'Facture', 'receipt' => 'Recu', default => ucfirst($data['type']) },
                'number' => '',
                'status' => 'draft',
                'issue_date' => $issueDate,
                'due_date' => $data['due_date'] ? Carbon::parse($data['due_date'])->format('d/m/Y') : '',
                'valid_until' => $data['valid_until'] ? Carbon::parse($data['valid_until'])->format('d/m/Y') : '',
                'currency' => $currency,
                'notes' => $data['notes'] ?? '',
                'terms' => $data['terms'] ?? '',
            ],
            'client' => [
                'name' => $client?->full_name ?? '',
                'cin' => $client?->cin ?? '',
                'address' => $client?->address ?? '',
                'phone' => $client?->phone ?? '',
                'email' => $client?->email ?? '',
            ],
            'dossier' => [
                'number' => $dossier?->dossier_number ?? '',
                'project_object' => $dossier?->project_object ?? '',
                'address' => $dossier?->project_address ?? '',
                'commune' => $dossier?->commune ?? '',
                'province' => $dossier?->province ?? '',
            ],
            'items' => $items,
            'totals' => [
                'subtotal_ht' => $formatMoney((float) array_sum(array_column($items, 'total_ht'))),
                'subtotal_ht_raw' => (float) array_sum(array_column($items, 'total_ht')),
                'discount_total' => $formatMoney($discountRaw),
                'discount_total_raw' => $discountRaw,
                'tax_total' => $formatMoney((float) array_sum(array_column($items, 'total_tva'))),
                'tax_total_raw' => (float) array_sum(array_column($items, 'total_tva')),
                'total_ttc' => $formatMoney((float) array_sum(array_column($items, 'total_ttc')) - $discountRaw),
                'total_ttc_raw' => (float) array_sum(array_column($items, 'total_ttc')) - $discountRaw,
                'paid_total' => $formatMoney(0),
                'paid_total_raw' => 0,
                'remaining_total' => $formatMoney((float) array_sum(array_column($items, 'total_ttc')) - $discountRaw),
                'remaining_total_raw' => (float) array_sum(array_column($items, 'total_ttc')) - $discountRaw,
            ],
            'payments' => [],
        ];

        $html = $renderer->renderTemplatePreview($template, $renderData);

        return response()->json(['html' => $html]);
    }

    public function accept(Request $request, FinanceDocument $financeDocument): RedirectResponse
    {
        $this->authorize('update', $financeDocument);
        if (!$financeDocument->isQuote()) {
            return redirect()->back()->with('error', 'Seul un devis peut etre accepte.');
        }

        $financeDocument->update([
            'status' => 'accepted',
            'accepted_at' => now(),
        ]);

        $request->user()->notify(new FinanceDocumentNotification($financeDocument->fresh(), 'accepted', 'Quote accepted: ' . $financeDocument->number));
        app(FinanceActivityService::class)->log($financeDocument, $request->user(), 'finance.quote.accepted');

        return redirect()->back()->with('success', "Devis {$financeDocument->number} accepte !");
    }

    public function reject(Request $request, FinanceDocument $financeDocument): RedirectResponse
    {
        $this->authorize('update', $financeDocument);
        if (!$financeDocument->isQuote()) {
            return redirect()->back()->with('error', 'Seul un devis peut etre refuse.');
        }

        $financeDocument->update([
            'status' => 'rejected',
            'rejected_at' => now(),
        ]);

        $request->user()->notify(new FinanceDocumentNotification($financeDocument->fresh(), 'rejected', 'Quote rejected: ' . $financeDocument->number));
        app(FinanceActivityService::class)->log($financeDocument, $request->user(), 'finance.quote.rejected');

        return redirect()->back()->with('success', "Devis {$financeDocument->number} refuse !");
    }

    public function cancel(Request $request, FinanceDocument $financeDocument): RedirectResponse
    {
        $this->authorize('cancel', $financeDocument);
        $financeDocument->update([
            'status' => 'cancelled',
        ]);

        $request->user()->notify(new FinanceDocumentNotification($financeDocument->fresh(), 'cancelled', ucfirst($financeDocument->type) . ' cancelled: ' . $financeDocument->number));
        app(FinanceActivityService::class)->log($financeDocument, $request->user(), 'finance.document.cancelled');

        return redirect()->back()->with('success', "Document {$financeDocument->number} annule !");
    }

    public function convertToInvoice(ConvertQuoteToInvoiceRequest $request, FinanceDocument $financeDocument): RedirectResponse
    {
        $this->authorize('convert', $financeDocument);
        if (!$financeDocument->canConvertToInvoice()) {
            return redirect()->back()->with('error', 'Ce devis ne peut pas etre converti.');
        }

        $data = $request->validated();

        $scope = app(FinanceContextService::class)->payload($request->user());
        $invoice = DB::transaction(function () use ($financeDocument, $data, $scope) {
            $invoiceNumber = FinanceNumberService::nextDocumentNumber('invoice');

            $invoice = FinanceDocument::create([
                ...$scope,
                'type' => 'invoice',
                'number' => $invoiceNumber,
                'status' => 'issued',
                'client_id' => $financeDocument->client_id,
                'dossier_id' => $financeDocument->dossier_id,
                'source_document_id' => $financeDocument->id,
                'issue_date' => $data['issue_date'] ?? now(),
                'due_date' => $data['due_date'] ?? now()->addDays(FinanceSettingsService::getDefaultPaymentDays()),
                'valid_until' => $financeDocument->valid_until,
                'currency' => $financeDocument->currency,
                'tva_rate' => $financeDocument->tva_rate,
                'subtotal_ht' => $financeDocument->subtotal_ht,
                'discount_total' => $financeDocument->discount_total,
                'tax_total' => $financeDocument->tax_total,
                'total_ttc' => $financeDocument->total_ttc,
                'remaining_total' => $financeDocument->total_ttc,
                'notes' => $data['notes'] ?? $financeDocument->notes,
                'terms' => $financeDocument->terms,
                'template_id' => $financeDocument->template_id,
                'created_by' => Auth::id(),
            ]);

            foreach ($financeDocument->items as $item) {
                $newItem = $item->replicate();
                $newItem->finance_document_id = $invoice->id;
                $newItem->save();
            }

            $financeDocument->update([
                'status' => 'converted',
            ]);

            return $invoice;
        });

        $request->user()->notify(new FinanceDocumentNotification($invoice, 'converted', 'Quote converted to invoice: ' . $invoice->number));
        app(FinanceActivityService::class)->log($invoice, $request->user(), 'finance.quote.converted_to_invoice', [], [
            'source_document_id' => $financeDocument->id,
        ]);

        $successMessage = "Facture {$invoice->number} creee a partir du devis {$financeDocument->number} !";
        $returnTo = $data['return_to'] ?? null;

        if ($this->isSafeLocalReturnPath($returnTo)) {
            return redirect()->to($returnTo)->with('success', $successMessage);
        }

        return redirect()->route('finance.documents.show', $invoice)->with('success', $successMessage);
    }

    private function isSafeLocalReturnPath(mixed $returnTo): bool
    {
        return is_string($returnTo)
            && str_starts_with($returnTo, '/')
            && ! str_starts_with($returnTo, '//')
            && parse_url($returnTo, PHP_URL_HOST) === null;
    }
}
