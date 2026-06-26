<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\ConvertQuoteToInvoiceRequest;
use App\Http\Requests\Finance\StoreFinanceDocumentRequest;
use App\Http\Requests\Finance\UpdateFinanceDocumentRequest;
use App\Http\Resources\FinanceDocumentResource;
use App\Models\Client;
use App\Models\Dossier;
use App\Models\FinanceDocument;
use App\Models\FinanceDocumentItem;
use App\Services\Finance\FinanceCalculator;
use App\Services\Finance\FinanceNumberService;
use App\Services\Finance\FinanceSettingsService;
use App\Services\FinanceDocumentGenerator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;
use Inertia\Response;

class FinanceDocumentController extends Controller
{
    public function index(Request $request): Response
    {
        $query = FinanceDocument::with(['client', 'dossier']);

        if ($type = $request->input('type')) {
            $query->where('type', $type);
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('number', 'like', "%{$search}%")
                    ->orWhereHas('client', fn($cq) => $cq->where('full_name', 'like', "%{$search}%"))
                    ->orWhereHas('dossier', fn($dq) => $dq->where('dossier_number', 'like', "%{$search}%"));
            });
        }

        $paginator = $query->orderBy('created_at', 'desc')->paginate(20);
        $records = $paginator->through(fn($doc) => new FinanceDocumentResource($doc));

        $metrics = [
            'totalTtc' => (float) FinanceDocument::sum('total_ttc'),
            'paidTotal' => (float) FinanceDocument::sum('paid_total'),
            'remainingTotal' => (float) FinanceDocument::sum('remaining_total'),
            'draftCount' => FinanceDocument::where('status', 'draft')->count(),
        ];

        return Inertia::render('Finance/Documents/Index', [
            'documents' => $records,
            'metrics' => $metrics,
            'clients' => Client::select('id', 'full_name')
                ->orderBy('full_name')
                ->get()
                ->map(fn($c) => ['id' => (string) $c->id, 'label' => $c->full_name]),
            'dossiers' => Dossier::select('id', 'dossier_number', 'project_object')
                ->orderBy('dossier_number')
                ->get()
                ->map(fn($d) => [
                    'id' => (string) $d->id,
                    'label' => $d->dossier_number . ' — ' . $d->project_object,
                ]),
            'filters' => $request->only(['type', 'status', 'search']),
        ]);
    }

    public function store(StoreFinanceDocumentRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $document = DB::transaction(function () use ($data) {
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
                        'discount_rate' => $itemData['discount_rate'] ?? 0,
                        'tva_rate' => $itemData['tva_rate'] ?? $document->tva_rate,
                    ]);
                    $item->calculateTotals();
                    $document->items()->save($item);
                }
            }

            $document->recalculateTotals()->save();

            return $document;
        });

        return redirect()->route('finance.documents.index')
            ->with('success', "Document {$document->number} créé avec succès.");
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
                'notes' => $data['notes'] ?? $financeDocument->notes,
                'terms' => $data['terms'] ?? $financeDocument->terms,
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
                        'discount_rate' => $itemData['discount_rate'] ?? 0,
                        'tva_rate' => $itemData['tva_rate'] ?? $financeDocument->tva_rate,
                    ]);
                    $item->calculateTotals();
                    $financeDocument->items()->save($item);
                }
            }

            $financeDocument->recalculateTotals()->save();
        });

        return redirect()->route('finance.documents.index')
            ->with('success', "Document {$financeDocument->number} mis à jour.");
    }

    public function destroy(FinanceDocument $financeDocument): RedirectResponse
    {
        $number = $financeDocument->number;
        $financeDocument->delete();

        return redirect()->route('finance.documents.index')
            ->with('success', "Document {$number} supprimé.");
    }

    public function generate(FinanceDocument $financeDocument): RedirectResponse
    {
        if ($financeDocument->items()->count() === 0) {
            return redirect()->back()->with('error', 'Ajoutez au moins une ligne au document avant génération.');
        }

        $financeDocument->loadMissing(['client', 'dossier', 'items']);

        try {
            // Delete previous generated files
            $oldDir = storage_path('app/public/finance/' . $financeDocument->number);
            if (is_dir($oldDir)) {
                File::deleteDirectory($oldDir);
            }

            $values = FinanceDocumentGenerator::buildDocumentValues($financeDocument);
            $result = app(FinanceDocumentGenerator::class)->generateFromValues(
                $financeDocument->type,
                $financeDocument->number,
                $values,
            );

            $financeDocument->excel_path = $result['xlsx_path'];
            $financeDocument->pdf_path = $result['pdf_path'];
            $financeDocument->generated_at = now();
            $financeDocument->save();

            return redirect()->back()->with(
                'success',
                "Document {$financeDocument->number} généré avec succès.",
            );
        } catch (\Exception $e) {
            return redirect()->back()->with(
                'error',
                'Erreur de génération : ' . $e->getMessage(),
            );
        }
    }

    public function download(FinanceDocument $financeDocument)
    {
        if (!$financeDocument->excel_path || !file_exists(storage_path('app/public/' . $financeDocument->excel_path))) {
            return redirect()->back()->with('error', 'Aucun fichier généré disponible.');
        }

        return response()->download(
            storage_path('app/public/' . $financeDocument->excel_path),
            $financeDocument->number . '.xlsx',
        );
    }

    public function downloadPdf(FinanceDocument $financeDocument)
    {
        if (!$financeDocument->pdf_path || !file_exists(storage_path('app/public/' . $financeDocument->pdf_path))) {
            return redirect()->back()->with('error', 'Aucun PDF disponible.');
        }

        return response()->download(
            storage_path('app/public/' . $financeDocument->pdf_path),
            $financeDocument->number . '.pdf',
        );
    }

    public function accept(FinanceDocument $financeDocument): RedirectResponse
    {
        if (!$financeDocument->isQuote()) {
            return redirect()->back()->with('error', 'Seul un devis peut être accepté.');
        }

        $financeDocument->update([
            'status' => 'accepted',
            'accepted_at' => now(),
        ]);

        return redirect()->back()->with('success', "Devis {$financeDocument->number} accepté !");
    }

    public function reject(FinanceDocument $financeDocument): RedirectResponse
    {
        if (!$financeDocument->isQuote()) {
            return redirect()->back()->with('error', 'Seul un devis peut être refusé.');
        }

        $financeDocument->update([
            'status' => 'rejected',
            'rejected_at' => now(),
        ]);

        return redirect()->back()->with('success', "Devis {$financeDocument->number} refusé !");
    }

    public function cancel(FinanceDocument $financeDocument): RedirectResponse
    {
        $financeDocument->update([
            'status' => 'cancelled',
        ]);

        return redirect()->back()->with('success', "Document {$financeDocument->number} annulé !");
    }

    public function convertToInvoice(ConvertQuoteToInvoiceRequest $request, FinanceDocument $financeDocument): RedirectResponse
    {
        if (!$financeDocument->canConvertToInvoice()) {
            return redirect()->back()->with('error', 'Ce devis ne peut pas être converti.');
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

        return redirect()->route('finance.documents.show', $invoice)
            ->with('success', "Facture {$invoice->number} créée à partir du devis {$financeDocument->number} !");
    }
}
