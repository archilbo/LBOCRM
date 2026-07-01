<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreContractRequest;
use App\Http\Requests\UpdateContractRequest;
use App\Http\Resources\ContractResource;
use App\Models\Contract;
use App\Models\Dossier;
use App\Notifications\ContractNotification;
use App\Services\ContractDocumentGenerator;
use App\Services\WordDocumentConverter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ContractController extends Controller
{
    public function index(): Response
    {
        $contracts = Contract::query()
            ->with(['dossier.client'])
            ->latest()
            ->get();

        return Inertia::render('Contracts/Index', [
            'contracts' => ContractResource::collection($contracts)->resolve(),
            'dossiers' => $this->dossierOptions(),
            'metrics' => [
                'total' => Contract::count(),
                'draft' => Contract::where('status', 'draft')->count(),
                'generated' => Contract::where('status', 'generated')->count(),
                'signed' => Contract::where('status', 'signed')->count(),
                'totalTtc' => (float) Contract::sum('ttc'),
            ],
        ]);
    }

    public function store(StoreContractRequest $request): RedirectResponse
    {
        $data = $this->prepareContractData($request->validated());
        $data['contract_number'] = $this->nextContractNumber();

        $contract = Contract::create($data);

        $request->user()->notify(new ContractNotification($contract, 'created', 'Contract created: ' . $contract->contract_number));

        if ($request->filled('return_to')) {
            return redirect()
                ->to($request->string('return_to')->toString())
                ->with('success', 'Contract created successfully.');
        }

        return redirect()
            ->route('contracts.index')
            ->with('success', 'Contract created successfully.');
    }

    public function update(UpdateContractRequest $request, Contract $contract): RedirectResponse
    {
        $contract->update($this->prepareContractData($request->validated()));

        $request->user()->notify(new ContractNotification($contract->fresh(), 'updated', 'Contract updated: ' . $contract->contract_number));

        return redirect()
            ->route('contracts.index')
            ->with('success', 'Contract updated successfully.');
    }

    public function destroy(Contract $contract): RedirectResponse
    {
        $directory = 'contracts/' . $contract->contract_number;

        if (Storage::disk('public')->exists($directory)) {
            Storage::disk('public')->deleteDirectory($directory);
        }

        $contract->delete();

        return redirect()
            ->route('contracts.index')
            ->with('success', 'Contract deleted successfully.');
    }

    public function generate(Request $request, Contract $contract): RedirectResponse
    {
        try {
            $paths = app(ContractDocumentGenerator::class)->generate($contract);

            $contract->update([
                'status' => 'generated',
                'generated_document_path' => $paths['docx_path'],
                'generated_at' => now(),
            ]);

            $request->user()->notify(new ContractNotification($contract->fresh(), 'generated', 'Contract generated: ' . $contract->contract_number));

            return redirect()
                ->route('contracts.index')
                ->with('success', 'Contract DOCX generated successfully.');
        } catch (\Throwable $e) {
            return redirect()
                ->route('contracts.index')
                ->with('error', 'Failed to generate contract: ' . $e->getMessage());
        }
    }

    public function exportPdf(Contract $contract): RedirectResponse
    {
        if (!$contract->generated_document_path || !Storage::disk('public')->exists($contract->generated_document_path)) {
            return redirect()
                ->route('contracts.index')
                ->with('error', 'Generate the DOCX first before exporting PDF.');
        }

        $absoluteDocx = Storage::disk('public')->path($contract->generated_document_path);
        $pdfRelative = 'contracts/' . $contract->contract_number . '/' . $contract->contract_number . '-contract.pdf';
        $absolutePdf = Storage::disk('public')->path($pdfRelative);

        try {
            app(WordDocumentConverter::class)->convertDocxToPdf($absoluteDocx, $absolutePdf);

            $contract->update([
                'pdf_path' => $pdfRelative,
            ]);

            return redirect()
                ->route('contracts.index')
                ->with('success', 'PDF exported successfully.');
        } catch (\Throwable $e) {
            return redirect()
                ->route('contracts.index')
                ->with('error', 'PDF export failed: ' . $e->getMessage());
        }
    }

    public function markSigned(Request $request, Contract $contract): RedirectResponse
    {
        $contract->update([
            'status' => 'signed',
            'signed_at' => now(),
        ]);

        $request->user()->notify(new ContractNotification($contract->fresh(), 'signed', 'Contract signed: ' . $contract->contract_number));

        return redirect()
            ->route('contracts.index')
            ->with('success', 'Contract marked as signed.');
    }

    public function downloadGenerated(Contract $contract): StreamedResponse|RedirectResponse
    {
        if (!$contract->generated_document_path || !Storage::disk('public')->exists($contract->generated_document_path)) {
            $paths = app(ContractDocumentGenerator::class)->generate($contract);

            $contract->update([
                'status' => 'generated',
                'generated_document_path' => $paths['docx_path'],
                'generated_at' => now(),
            ]);

            $contract->refresh();
        }

        if (!$contract->generated_document_path || !Storage::disk('public')->exists($contract->generated_document_path)) {
            return redirect()
                ->route('contracts.index')
                ->with('error', 'Could not generate contract file.');
        }

        return Storage::disk('public')->download(
            $contract->generated_document_path,
            $contract->contract_number . '-contract.docx'
        );
    }

    public function downloadPdf(Contract $contract): StreamedResponse|RedirectResponse
    {
        if (!$contract->generated_document_path || !Storage::disk('public')->exists($contract->generated_document_path)) {
            $paths = app(ContractDocumentGenerator::class)->generate($contract);

            $contract->update([
                'status' => 'generated',
                'generated_document_path' => $paths['docx_path'],
                'generated_at' => now(),
            ]);

            $contract->refresh();
        }

        if (!$contract->pdf_path || !Storage::disk('public')->exists($contract->pdf_path)) {
            $absoluteDocx = Storage::disk('public')->path($contract->generated_document_path);
            $pdfRelative = 'contracts/' . $contract->contract_number . '/' . $contract->contract_number . '-contract.pdf';
            $absolutePdf = Storage::disk('public')->path($pdfRelative);

            app(WordDocumentConverter::class)->convertDocxToPdf($absoluteDocx, $absolutePdf);

            $contract->update([
                'pdf_path' => $pdfRelative,
            ]);

            $contract->refresh();
        }

        if (!$contract->pdf_path || !Storage::disk('public')->exists($contract->pdf_path)) {
            return redirect()
                ->route('contracts.index')
                ->with('error', 'Could not export PDF.');
        }

        return Storage::disk('public')->download(
            $contract->pdf_path,
            $contract->contract_number . '-contract.pdf'
        );
    }

    private function prepareContractData(array $data): array
    {
        $dossier = Dossier::query()->findOrFail($data['dossier_id']);
        unset($data['return_to']);

        $calculationMode = ($data['calculation_mode'] ?? 'percentage') === 'forfait'
            ? 'forfait'
            : 'percentage';
        $feeRatePercent = (float) ($data['fee_rate_percent'] ?? config('archilbo_templates.contracts.default_rate', 0.5));
        $surface = (float) ($data['surface'] ?? 0);
        $unitPrice = (float) ($data['price_per_square_meter'] ?? config('archilbo_templates.contracts.construction_unit_price', 900));
        $tvaRate = ((float) config('archilbo_templates.contracts.tva_rate', 20)) / 100;

        if ($surface <= 0) {
            $surface = (float) ($dossier->floor_area ?? 0);
        }

        $estimation = $surface * $unitPrice;

        if ($calculationMode === 'forfait') {
            $ttc = max(0, (float) ($data['forfait_ttc'] ?? 0));
            $ht = $tvaRate > -1 ? $ttc / (1 + $tvaRate) : $ttc;
            $tva = $ttc - $ht;
        } else {
            $ht = $estimation * ($feeRatePercent / 100);
            $tva = $ht * $tvaRate;
            $ttc = $ht + $tva;
        }

        return [
            'dossier_id' => $dossier->id,
            'status' => $data['status'] ?? 'draft',
            'surface' => $surface,
            'price_per_square_meter' => $unitPrice,
            'calculation_mode' => $calculationMode,
            'fee_rate_percent' => $feeRatePercent,
            'forfait_ttc' => $calculationMode === 'forfait' ? $ttc : null,
            'ht' => $ht,
            'tva' => $tva,
            'ttc' => $ttc,
            'notes' => $data['notes'] ?? null,
        ];
    }

    private function nextContractNumber(): string
    {
        $year = now()->format('Y');
        $next = Contract::count() + 1;

        do {
            $number = sprintf('CTR-%s-%04d', $year, $next);
            $next++;
        } while (Contract::where('contract_number', $number)->exists());

        return $number;
    }

    private function dossierOptions(): array
    {
        return Dossier::query()
            ->with(['client', 'contract'])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Dossier $dossier) => [
                'id' => (string) $dossier->id,
                'label' => $dossier->dossier_number . ' - ' . $dossier->project_object . ' - ' . ($dossier->client?->full_name ?? '-'),
                'floorArea' => $dossier->floor_area !== null ? (float) $dossier->floor_area : null,
                'hasContract' => $dossier->contract !== null,
            ])
            ->values()
            ->all();
    }
}
