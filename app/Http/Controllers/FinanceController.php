<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreFinanceRecordRequest;
use App\Http\Requests\UpdateFinanceRecordRequest;
use App\Http\Resources\FinanceRecordResource;
use App\Models\Dossier;
use App\Models\FinanceRecord;
use App\Services\FinanceDocumentGenerator;
use App\Services\OfficeDocumentConverter;
use Illuminate\Support\Facades\File;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class FinanceController extends Controller
{
    public function index(): Response
    {
        $records = FinanceRecord::query()
            ->with(['dossier.client', 'client'])
            ->latest()
            ->get();

        return Inertia::render('Finance/Index', [
            'financeRecords' => FinanceRecordResource::collection($records)->resolve(),
            'dossiers' => $this->dossierOptions(),
            'metrics' => [
                'totalRecords' => FinanceRecord::count(),
                'totalTtc' => (float) FinanceRecord::sum('total_ttc'),
                'paid' => (float) FinanceRecord::sum('paid'),
                'remaining' => (float) FinanceRecord::sum('remaining'),
                'overdue' => (float) FinanceRecord::query()
                    ->whereDate('due_date', '<', now()->toDateString())
                    ->where('remaining', '>', 0)
                    ->sum('remaining'),
                'draft' => FinanceRecord::where('status', 'draft')->count(),
                'sent' => FinanceRecord::where('status', 'sent')->count(),
                'paidCount' => FinanceRecord::where('status', 'paid')->count(),
                'partiallyPaid' => FinanceRecord::where('status', 'partially_paid')->count(),
                'overdueCount' => FinanceRecord::where('status', 'overdue')->count(),
            ],
        ]);
    }

    public function store(StoreFinanceRecordRequest $request): RedirectResponse
    {
        $data = $this->prepareFinanceData($request->validated());
        $data['record_number'] = $this->nextRecordNumber($data['type']);

        FinanceRecord::create($data);

        return redirect()
            ->route('finance.index')
            ->with('success', 'Finance record created successfully.');
    }

    public function update(UpdateFinanceRecordRequest $request, FinanceRecord $financeRecord): RedirectResponse
    {
        $financeRecord->update($this->prepareFinanceData($request->validated()));

        return redirect()
            ->route('finance.index')
            ->with('success', 'Finance record updated successfully.');
    }

    public function destroy(FinanceRecord $financeRecord): RedirectResponse
    {
        $financeRecord->delete();

        return redirect()
            ->route('finance.index')
            ->with('success', 'Finance record deleted successfully.');
    }

    public function markPaid(FinanceRecord $financeRecord): RedirectResponse
    {
        $financeRecord->update([
            'status' => 'paid',
            'paid' => $financeRecord->total_ttc,
            'remaining' => 0,
            'paid_at' => now()->toDateString(),
        ]);

        return redirect()
            ->route('finance.index')
            ->with('success', 'Finance record marked as paid.');
    }

    public function generate(FinanceRecord $financeRecord): RedirectResponse
    {
        try {
            // Delete old generated files before regenerating
            $oldDir = storage_path('app/public/finance/' . $financeRecord->record_number);
            if (is_dir($oldDir)) {
                File::deleteDirectory($oldDir);
            }

            $paths = app(FinanceDocumentGenerator::class)->generate($financeRecord);

            $financeRecord->update([
                'generated_file_path' => $paths['xlsx_path'],
                'generated_pdf_path' => null,
                'generated_at' => now(),
            ]);

            return redirect()
                ->route('finance.index')
                ->with('success', 'Excel document generated successfully.');
        } catch (\Throwable $e) {
            return redirect()
                ->route('finance.index')
                ->with('error', 'Generation failed: ' . $e->getMessage());
        }
    }

    public function download(FinanceRecord $financeRecord): RedirectResponse|StreamedResponse
    {
        if (!$financeRecord->generated_file_path) {
            return redirect()
                ->route('finance.index')
                ->with('error', 'No generated document found. Please generate first.');
        }

        if (!Storage::disk('public')->exists($financeRecord->generated_file_path)) {
            return redirect()
                ->route('finance.index')
                ->with('error', 'Generated file is missing. Please regenerate.');
        }

        return Storage::disk('public')->download(
            $financeRecord->generated_file_path,
            $financeRecord->record_number . '.xlsx'
        );
    }

    public function exportPdf(Request $request, FinanceRecord $financeRecord): RedirectResponse
    {
        if (!$financeRecord->generated_file_path) {
            return redirect()
                ->route('finance.index')
                ->with('error', 'No generated document found. Please generate first.');
        }

        $absoluteXlsx = Storage::disk('public')->path($financeRecord->generated_file_path);

        if (!file_exists($absoluteXlsx)) {
            return redirect()
                ->route('finance.index')
                ->with('error', 'Generated file is missing. Please regenerate.');
        }

        $converter = app(OfficeDocumentConverter::class);

        if (!$converter->isAvailable()) {
            return redirect()
                ->route('finance.index')
                ->with('error', 'LibreOffice is not installed. XLSX generated, but PDF export is unavailable.');
        }

        try {
            $relativePdf = 'finance/' . $financeRecord->record_number . '/' . $financeRecord->record_number . '.pdf';
            $absolutePdf = Storage::disk('public')->path($relativePdf);

            $converter->convertDocxToPdf($absoluteXlsx, $absolutePdf);

            $financeRecord->update([
                'generated_pdf_path' => $relativePdf,
            ]);

            return redirect()
                ->route('finance.index')
                ->with('success', 'PDF exported successfully.');
        } catch (\Throwable $e) {
            return redirect()
                ->route('finance.index')
                ->with('error', 'PDF export failed: ' . $e->getMessage());
        }
    }

    public function downloadPdf(FinanceRecord $financeRecord): RedirectResponse|StreamedResponse
    {
        if (!$financeRecord->generated_pdf_path) {
            return redirect()
                ->route('finance.index')
                ->with('error', 'No PDF found. Please export PDF first.');
        }

        if (!Storage::disk('public')->exists($financeRecord->generated_pdf_path)) {
            return redirect()
                ->route('finance.index')
                ->with('error', 'PDF file is missing. Please re-export.');
        }

        return Storage::disk('public')->download(
            $financeRecord->generated_pdf_path,
            $financeRecord->record_number . '.pdf'
        );
    }

    private function prepareFinanceData(array $data): array
    {
        $dossier = Dossier::query()->with('client')->findOrFail($data['dossier_id']);

        $totalTtc = (float) ($data['total_ttc'] ?? 0);
        $ht = (float) ($data['ht'] ?? 0);
        $tva = (float) ($data['tva'] ?? 0);
        $paid = (float) ($data['paid'] ?? 0);

        if ($ht <= 0 && $totalTtc > 0) {
            $ht = round($totalTtc / 1.20, 2);
        }

        if ($tva <= 0 && $totalTtc > 0) {
            $tva = round($totalTtc - $ht, 2);
        }

        if ($totalTtc <= 0) {
            $totalTtc = $ht + $tva;
        }

        if ($paid > $totalTtc) {
            $paid = $totalTtc;
        }

        $remaining = max($totalTtc - $paid, 0);

        $status = $data['status'] ?? 'draft';

        if ($remaining <= 0 && $totalTtc > 0) {
            $status = 'paid';
        } elseif ($paid > 0 && $remaining > 0) {
            $status = 'partially_paid';
        } elseif (($data['due_date'] ?? null) && $remaining > 0 && $data['due_date'] < now()->toDateString()) {
            $status = 'overdue';
        }

        return [
            'dossier_id' => $dossier->id,
            'client_id' => $dossier->client_id,
            'type' => $data['type'] ?? 'devis',
            'status' => $status,
            'ht' => $ht,
            'tva' => $tva,
            'total_ttc' => $totalTtc,
            'paid' => $paid,
            'remaining' => $remaining,
            'issued_at' => ($data['issued_at'] ?? null) ?: now()->toDateString(),
            'due_date' => ($data['due_date'] ?? null) ?: null,
            'paid_at' => ($status === 'paid') ? (($data['paid_at'] ?? null) ?: now()->toDateString()) : (($data['paid_at'] ?? null) ?: null),
            'notes' => $data['notes'] ?? null,
        ];
    }

    private function nextRecordNumber(string $type): string
    {
        $year = now()->format('Y');

        $prefix = match ($type) {
            'invoice' => 'INV',
            'payment' => 'PAY',
            default => 'DEV',
        };

        $next = FinanceRecord::where('type', $type)->count() + 1;

        do {
            $number = sprintf('%s-%s-%04d', $prefix, $year, $next);
            $next++;
        } while (FinanceRecord::where('record_number', $number)->exists());

        return $number;
    }

    private function dossierOptions(): array
    {
        return Dossier::query()
            ->with('client')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Dossier $dossier) => [
                'id' => (string) $dossier->id,
                'label' => $dossier->dossier_number . ' - ' . $dossier->project_object . ' - ' . ($dossier->client?->full_name ?? '-'),
                'clientName' => $dossier->client?->full_name ?? '-',
            ])
            ->values()
            ->all();
    }
}
