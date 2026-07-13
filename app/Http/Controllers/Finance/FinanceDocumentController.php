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
use App\Services\Finance\FinanceNumberService;
use App\Services\Finance\FinancePdfGenerator;
use App\Services\Finance\FinanceSettingsService;
use App\Services\Finance\FinanceMonthlySummaryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\Process\Process;

class FinanceDocumentController extends Controller
{
    public function index(Request $request, FinanceMonthlySummaryService $monthlySummaryService): Response
    {
        $query = FinanceDocument::with(['client', 'dossier', 'items', 'payments'])
            ->withCount('payments');

        if ($type = $request->input('type')) {
            $query->where('type', $type);
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('number', 'like', "%{$search}%")
                    ->orWhereHas('client', fn ($cq) => $cq->where('full_name', 'like', "%{$search}%"))
                    ->orWhereHas('dossier', fn ($dq) => $dq->where('dossier_number', 'like', "%{$search}%"));
            });
        }

        $documents = $query->orderBy('created_at', 'desc')->limit(100)->get();
        $records = FinanceDocumentResource::collection($documents)->resolve($request);

        $payments = Payment::with(['document', 'client', 'dossier', 'receiptDocument'])
            ->orderByDesc('paid_at')
            ->orderByDesc('created_at')
            ->limit(100)
            ->get();

        $currency = FinanceSettingsService::getCurrency();

        $metrics = [
            'totalQuotes' => (float) FinanceDocument::where('type', 'quote')->sum('total_ttc'),
            'totalInvoices' => (float) FinanceDocument::where('type', 'invoice')->sum('total_ttc'),
            'paidTotal' => (float) FinanceDocument::where('type', 'invoice')->sum('paid_total'),
            'remainingTotal' => (float) FinanceDocument::where('type', 'invoice')->sum('remaining_total'),
            'overdueTotal' => (float) FinanceDocument::where('type', 'invoice')->where('status', 'overdue')->sum('remaining_total'),
            'draftCount' => FinanceDocument::where('status', 'draft')->count(),
            'totalExpenses' => (float) Expense::sum('amount'),
            'currency' => $currency,
        ];

        $expensesRecords = Expense::with(['dossier', 'creator'])
            ->orderByDesc('expense_date')
            ->orderByDesc('created_at')
            ->limit(100)
            ->get()
            ->map(fn (Expense $expense) => [
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

        return Inertia::render('Finance/Documents/Index', [
            'documents' => $records,
            'payments' => PaymentResource::collection($payments)->resolve($request),
            'expenses' => $expensesRecords,
            'monthlySummaries' => $monthlySummaryService->months(),
            'metrics' => $metrics,
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
            'templates' => FinanceTemplate::query()
                ->orderBy('name')
                ->get()
                ->map(fn ($template) => [
                    'id' => (string) $template->id,
                    'label' => $template->name,
                    'type' => $template->type,
                ]),
            'defaultTemplates' => FinanceTemplate::query()
                ->where('is_default', true)
                ->orderBy('type')
                ->get()
                ->map(fn ($template) => [
                    'id' => (string) $template->id,
                    'label' => $template->name,
                    'type' => $template->type,
                    'slug' => $template->slug,
                ]),
            'templateEditorUrl' => route('finance.templates.index'),
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
            'filters' => $request->only(['type', 'status', 'search']),
        ]);
    }

    public function store(StoreFinanceDocumentRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $document = DB::transaction(function () use ($data, $request) {
            $number = FinanceNumberService::nextDocumentNumber($data['type']);

            $document = FinanceDocument::create([
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
        $financeDocument->loadMissing(['client', 'dossier', 'items', 'payments', 'template', 'creator']);

        return Inertia::render('Finance/Documents/Show', [
            'document' => new FinanceDocumentResource($financeDocument),
        ]);
    }

    public function update(UpdateFinanceDocumentRequest $request, FinanceDocument $financeDocument): RedirectResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($data, $financeDocument) {
            $financeDocument->update([
                'type' => $data['type'] ?? $financeDocument->type,
                'client_id' => $data['client_id'] ?? $financeDocument->client_id,
                'dossier_id' => $data['dossier_id'] ?? $financeDocument->dossier_id,
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
        $number = $financeDocument->number;
        $financeDocument->delete();

        return redirect()->route('finance.documents.index')
            ->with('success', "Document {$number} supprime.");
    }

    public function generate(Request $request, FinanceDocument $financeDocument, FinancePdfGenerator $pdfGenerator, FinanceExcelExporter $excelExporter): RedirectResponse
    {
        if ($financeDocument->items()->count() === 0) {
            return redirect()->back()->with('error', 'Ajoutez au moins une ligne au document avant generation.');
        }

        try {
            $pdfGenerator->generate($financeDocument);
            $excelExporter->generate($financeDocument->refresh());

            $request->user()->notify(new FinanceDocumentNotification($financeDocument, 'generated', ucfirst($financeDocument->type) . ' generated: ' . $financeDocument->number));

            return redirect()->back()->with('success', "Document {$financeDocument->number} genere avec succes.");
        } catch (\Throwable $e) {
            return redirect()->back()->with('error', 'Erreur de generation : ' . $e->getMessage());
        }
    }

    public function generatePdf(FinanceDocument $financeDocument, FinancePdfGenerator $generator): RedirectResponse
    {
        if ($financeDocument->items()->count() === 0) {
            return redirect()->back()->with('error', 'Ajoutez au moins une ligne au document avant generation PDF.');
        }

        try {
            $generator->generate($financeDocument);

            return redirect()->back()->with('success', "PDF {$financeDocument->number} genere avec succes.");
        } catch (\Throwable $e) {
            return redirect()->back()->with('error', 'Erreur de generation PDF : ' . $e->getMessage());
        }
    }

    public function generateExcel(FinanceDocument $financeDocument, FinanceExcelExporter $exporter): RedirectResponse
    {
        if ($financeDocument->items()->count() === 0) {
            return redirect()->back()->with('error', 'Ajoutez au moins une ligne au document avant export Excel.');
        }

        try {
            $exporter->generate($financeDocument);

            return redirect()->back()->with('success', "Excel {$financeDocument->number} genere avec succes.");
        } catch (\Throwable $e) {
            return redirect()->back()->with('error', 'Erreur export Excel : ' . $e->getMessage());
        }
    }

    public function download(FinanceDocument $financeDocument)
    {
        return $this->downloadExcel($financeDocument);
    }

    public function downloadExcel(FinanceDocument $financeDocument)
    {
        if (!$financeDocument->excel_path || !Storage::disk('public')->exists($financeDocument->excel_path)) {
            return redirect()->back()->with('error', 'Aucun fichier Excel disponible.');
        }

        return Storage::disk('public')->download($financeDocument->excel_path, $financeDocument->number . '.xlsx');
    }

    public function downloadPdf(FinanceDocument $financeDocument)
    {
        if (!$financeDocument->pdf_path || !Storage::disk('public')->exists($financeDocument->pdf_path)) {
            return redirect()->back()->with('error', 'Aucun PDF disponible.');
        }

        return Storage::disk('public')->download($financeDocument->pdf_path, $financeDocument->number . '.pdf');
    }
    public function revealGeneratedFiles(FinanceDocument $financeDocument): RedirectResponse
    {
        if (!app()->environment('local')) {
            return redirect()->back()->with('error', 'Ouverture Explorer disponible uniquement en local.');
        }

        if (PHP_OS_FAMILY !== 'Windows') {
            return redirect()->back()->with('error', 'Ouverture Explorer disponible uniquement sur Windows.');
        }

        $relativePath = $financeDocument->pdf_path ?: $financeDocument->excel_path;

        if (!$relativePath || !Storage::disk('public')->exists($relativePath)) {
            return redirect()->back()->with('error', 'Aucun fichier genere disponible.');
        }

        $absolutePath = Storage::disk('public')->path($relativePath);
        $storageRoot = realpath(Storage::disk('public')->path(''));
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

    public function accept(Request $request, FinanceDocument $financeDocument): RedirectResponse
    {
        if (!$financeDocument->isQuote()) {
            return redirect()->back()->with('error', 'Seul un devis peut etre accepte.');
        }

        $financeDocument->update([
            'status' => 'accepted',
            'accepted_at' => now(),
        ]);

        $request->user()->notify(new FinanceDocumentNotification($financeDocument->fresh(), 'accepted', 'Quote accepted: ' . $financeDocument->number));

        return redirect()->back()->with('success', "Devis {$financeDocument->number} accepte !");
    }

    public function reject(Request $request, FinanceDocument $financeDocument): RedirectResponse
    {
        if (!$financeDocument->isQuote()) {
            return redirect()->back()->with('error', 'Seul un devis peut etre refuse.');
        }

        $financeDocument->update([
            'status' => 'rejected',
            'rejected_at' => now(),
        ]);

        $request->user()->notify(new FinanceDocumentNotification($financeDocument->fresh(), 'rejected', 'Quote rejected: ' . $financeDocument->number));

        return redirect()->back()->with('success', "Devis {$financeDocument->number} refuse !");
    }

    public function cancel(Request $request, FinanceDocument $financeDocument): RedirectResponse
    {
        $financeDocument->update([
            'status' => 'cancelled',
        ]);

        $request->user()->notify(new FinanceDocumentNotification($financeDocument->fresh(), 'cancelled', ucfirst($financeDocument->type) . ' cancelled: ' . $financeDocument->number));

        return redirect()->back()->with('success', "Document {$financeDocument->number} annule !");
    }

    public function convertToInvoice(ConvertQuoteToInvoiceRequest $request, FinanceDocument $financeDocument): RedirectResponse
    {
        if (!$financeDocument->canConvertToInvoice()) {
            return redirect()->back()->with('error', 'Ce devis ne peut pas etre converti.');
        }

        $data = $request->validated();

        $invoice = DB::transaction(function () use ($financeDocument, $data) {
            $invoiceNumber = FinanceNumberService::nextDocumentNumber('invoice');

            $invoice = FinanceDocument::create([
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

        return redirect()->route('finance.documents.show', $invoice)
            ->with('success', "Facture {$invoice->number} creee a partir du devis {$financeDocument->number} !");
    }
}
