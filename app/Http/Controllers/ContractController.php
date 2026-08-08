<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreContractRequest;
use App\Http\Requests\UpdateContractRequest;
use App\Http\Resources\ContractResource;
use App\Models\Client;
use App\Models\ArchitectFeeOption;
use App\Models\Contract;
use App\Models\Dossier;
use App\Notifications\ContractNotification;
use App\Services\ContractDocumentGenerator;
use App\Services\Contracts\ContractTemplateNamingService;
use App\Services\Dossiers\DossierPathBuilder;
use App\Support\DecimalMoney;
use App\Services\WordDocumentConverter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ContractController extends Controller
{
    public function index(Request $request, \App\Services\CompanyContext $companyContext): Response
    {
        $this->authorize('viewAny', Contract::class);

        $scope = Contract::query()->whereIn(
            'dossier_id',
            $companyContext->applyTo(Dossier::query(), $request->user())->select('id'),
        );

        $contracts = (clone $scope)
            ->with(['dossier.client'])
            ->latest()
            ->get();

        return Inertia::render('Contracts/Index', [
            'contracts' => ContractResource::collection($contracts)->resolve(),
            'dossiers' => $this->dossierOptions($request->user(), $companyContext),
            'clients' => $this->clientOptions($request->user(), $companyContext),
            'architectFeeOptions' => \App\Services\Finance\FinanceSettingsService::architectFeeOptions(true),
            'metrics' => [
                'total' => (clone $scope)->count(),
                'draft' => (clone $scope)->where('status', 'draft')->count(),
                'generated' => (clone $scope)->where('status', 'generated')->count(),
                'signed' => (clone $scope)->where('status', 'signed')->count(),
                'totalTtc' => (float) (clone $scope)->sum('ttc'),
            ],
        ]);
    }

    public function store(StoreContractRequest $request): RedirectResponse
    {
        $this->authorize('create', Contract::class);
        abort_unless(app(\App\Services\CompanyContext::class)->applyTo(Dossier::query(), $request->user())->whereKey($request->integer('dossier_id'))->exists(), 404);
        $data = $this->prepareContractData($request->validated(), true);
        $data['contract_number'] = $data['contract_number'] ?? $this->nextContractNumber();

        $contract = Contract::create($data);

        $request->user()->notify(new ContractNotification($contract, 'created', 'Contract created: ' . $contract->contract_number));

        if ($request->filled('return_to')) {
            return redirect()
                ->to($request->string('return_to')->toString())
                ->with('success', 'Contrat cree avec succes.');
        }

        return redirect()
            ->route('contracts.index')
            ->with('success', 'Contrat cree avec succes.');
    }

    public function update(UpdateContractRequest $request, Contract $contract): RedirectResponse
    {
        $this->authorize('update', $contract);
        $hadGeneratedFiles = $contract->generated_document_path || $contract->pdf_path;

        $contract->update($this->prepareContractData($request->validated(), false, $contract));

        $this->invalidateGeneratedFiles($contract, $hadGeneratedFiles);

        $request->user()->notify(new ContractNotification($contract->fresh(), 'updated', 'Contract updated: ' . $contract->contract_number));

        if ($request->filled('return_to')) {
            return redirect()->to($request->string('return_to')->toString())->with('success', 'Contrat mis a jour avec succes.');
        }

        return redirect()
            ->route('contracts.index')
            ->with('success', 'Contrat mis a jour avec succes.')
            ->with('warning', $hadGeneratedFiles ? 'Les documents generes ont ete marques comme a regenerer.' : null);
    }

    public function destroy(Request $request, Contract $contract): RedirectResponse
    {
        $this->authorize('delete', $contract);
        $directory = 'contracts/' . $contract->contract_number;

        if (Storage::disk('public')->exists($directory)) {
            Storage::disk('public')->deleteDirectory($directory);
        }

        $contract->delete();

        if ($request->filled('return_to')) {
            return redirect()->to($request->string('return_to')->toString())->with('success', 'Contrat supprime avec succes.');
        }

        return redirect()
            ->route('contracts.index')
            ->with('success', 'Contrat supprime avec succes.');
    }

    public function generate(Request $request, Contract $contract): RedirectResponse
    {
        $this->authorize('generate', $contract);
        try {
            if ($contract->generated_document_path && Storage::disk('local')->exists($contract->generated_document_path)) {
                Storage::disk('local')->delete($contract->generated_document_path);
            }
            if ($contract->pdf_path && Storage::disk('local')->exists($contract->pdf_path)) {
                Storage::disk('local')->delete($contract->pdf_path);
            }

            $paths = app(ContractDocumentGenerator::class)->generate($contract);

            $contract->update([
                'status' => $contract->status === 'signed' ? 'signed' : 'generated',
                'generated_document_path' => $paths['docx_path'],
                'pdf_path' => null,
                'generated_at' => now(),
            ]);

            $request->user()->notify(new ContractNotification($contract->fresh(), 'generated', 'Contract generated: ' . $contract->contract_number));

            if ($request->filled('return_to')) {
                return redirect()->to($request->string('return_to')->toString())->with('success', 'Contrat DOCX genere avec succes.');
            }

            return redirect()
                ->route('contracts.index')
                ->with('success', 'Contrat DOCX genere avec succes.');
        } catch (\Throwable $e) {
            if ($request->filled('return_to')) {
                return redirect()->to($request->string('return_to')->toString())->with('error', 'Echec de la generation du contrat: ' . $e->getMessage());
            }
            return redirect()
                ->route('contracts.index')
                ->with('error', 'Echec de la generation du contrat: ' . $e->getMessage());
        }
    }

    public function exportPdf(Request $request, Contract $contract): RedirectResponse
    {
        $this->authorize('generate', $contract);
        try {
            $contract->loadMissing(['dossier.city', 'dossier.client']);

            $paths = app(ContractDocumentGenerator::class)->generate($contract);

            $absoluteDocx = Storage::disk('local')->path($paths['docx_path']);
            $pathBuilder = app(DossierPathBuilder::class);
            $pdfRelative = $pathBuilder->contractPdfPath($contract, $contract->dossier);
            $absolutePdf = Storage::disk('local')->path($pdfRelative);

            app(WordDocumentConverter::class)->convertDocxToPdf($absoluteDocx, $absolutePdf);

            $contract->update([
                'status' => $contract->status === 'signed' ? 'signed' : 'generated',
                'generated_document_path' => $paths['docx_path'],
                'pdf_path' => $pdfRelative,
                'generated_at' => now(),
            ]);

            if ($request->filled('return_to')) {
                return redirect()->to($request->string('return_to')->toString())->with('success', 'PDF exporte avec succes.');
            }

            return redirect()
                ->route('contracts.index')
                ->with('success', 'PDF exporte avec succes.');
        } catch (\Throwable $e) {
            if ($request->filled('return_to')) {
                return redirect()->to($request->string('return_to')->toString())->with('error', 'Echec de l\'export PDF: ' . $e->getMessage());
            }
            return redirect()
                ->route('contracts.index')
                ->with('error', 'Echec de l\'export PDF: ' . $e->getMessage());
        }
    }

    public function markSigned(Request $request, Contract $contract): RedirectResponse
    {
        $this->authorize('update', $contract);
        if ($contract->status === 'signed') {
            if ($request->filled('return_to')) {
                return redirect()->to($request->string('return_to')->toString())->with('error', 'Ce contrat est deja signe.');
            }
            return redirect()
                ->route('contracts.index')
                ->with('error', 'Ce contrat est deja signe.');
        }

        $contract->update([
            'status' => 'signed',
            'signed_at' => now(),
        ]);

        $request->user()->notify(new ContractNotification($contract->fresh(), 'signed', 'Contract signed: ' . $contract->contract_number));

        if ($request->filled('return_to')) {
            return redirect()->to($request->string('return_to')->toString())->with('success', 'Contrat marque comme signe.');
        }

        return redirect()
            ->route('contracts.index')
            ->with('success', 'Contrat marque comme signe.');
    }

    public function print(Contract $contract): BinaryFileResponse|RedirectResponse
    {
        $this->authorize('print', $contract);
        try {
            if (! $this->ensurePdfExists($contract) || ! $contract->pdf_path) {
                return redirect()
                    ->route('contracts.index')
                    ->with('error', 'Fichier PDF introuvable.');
            }

            $absolutePath = Storage::disk('local')->path($contract->pdf_path);

            if (! is_file($absolutePath)) {
                return redirect()
                    ->route('contracts.index')
                    ->with('error', 'Fichier PDF introuvable.');
            }

            return response()->file($absolutePath, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => sprintf(
                    'inline; filename="%s"',
                    $this->contractDownloadFilename($contract, 'pdf')
                ),
                'Cache-Control' => 'private, no-store, max-age=0',
            ]);
        } catch (\Throwable $e) {
            report($e);

            return redirect()
                ->route('contracts.index')
                ->with('error', 'Impression impossible: ' . $e->getMessage());
        }
    }

    public function downloadGenerated(Contract $contract): StreamedResponse|RedirectResponse
    {
        $this->authorize('download', $contract);
        $contract->loadMissing(['dossier.city', 'dossier.client']);

        if (!$contract->generated_document_path || !Storage::disk('local')->exists($contract->generated_document_path)) {
            $paths = app(ContractDocumentGenerator::class)->generate($contract);

            $contract->update([
                'status' => $contract->status === 'signed' ? 'signed' : 'generated',
                'generated_document_path' => $paths['docx_path'],
                'generated_at' => now(),
            ]);

            $contract->refresh();
        }

        if (!$contract->generated_document_path || !Storage::disk('local')->exists($contract->generated_document_path)) {
            return redirect()
                ->route('contracts.index')
                ->with('error', 'Could not generate contract file.');
        }

        return Storage::disk('local')->download(
            $contract->generated_document_path,
            $this->contractDownloadFilename($contract, 'docx')
        );
    }

    public function downloadPdf(Contract $contract): StreamedResponse|RedirectResponse
    {
        $this->authorize('download', $contract);
        $contract->loadMissing(['dossier.city', 'dossier.client']);

        if (!$contract->generated_document_path || !Storage::disk('local')->exists($contract->generated_document_path)) {
            $paths = app(ContractDocumentGenerator::class)->generate($contract);

            $contract->update([
                'status' => $contract->status === 'signed' ? 'signed' : 'generated',
                'generated_document_path' => $paths['docx_path'],
                'generated_at' => now(),
            ]);

            $contract->refresh();
        }

        if (!$contract->pdf_path || !Storage::disk('local')->exists($contract->pdf_path)) {
            $absoluteDocx = Storage::disk('local')->path($contract->generated_document_path);
            $pathBuilder = app(DossierPathBuilder::class);
            $pdfRelative = $pathBuilder->contractPdfPath($contract, $contract->dossier);
            $absolutePdf = Storage::disk('local')->path($pdfRelative);

            app(WordDocumentConverter::class)->convertDocxToPdf($absoluteDocx, $absolutePdf);

            $contract->update([
                'pdf_path' => $pdfRelative,
            ]);

            $contract->refresh();
        }

        if (! $contract->pdf_path || ! Storage::disk('local')->exists($contract->pdf_path)) {
            return redirect()
                ->route('contracts.index')
                ->with('error', 'Could not export PDF.');
        }

        return Storage::disk('local')->download(
            $contract->pdf_path,
            $this->contractDownloadFilename($contract, 'pdf')
        );
    }

    public function previewPdf(Contract $contract): BinaryFileResponse|RedirectResponse
    {
        $this->authorize('view', $contract);

        if (!$this->ensurePdfExists($contract)) {
            return redirect()
                ->route('contracts.index')
                ->with('error', 'Fichier PDF introuvable.');
        }

        return response()->file(Storage::disk('local')->path($contract->pdf_path), [
            'Content-Disposition' => 'inline; filename="' . $this->contractDownloadFilename($contract, 'pdf') . '"',
        ]);
    }

    private function ensurePdfExists(Contract $contract): bool
    {
        $contract->loadMissing(['dossier.city', 'dossier.client']);

        if (!$contract->generated_document_path || !Storage::disk('local')->exists($contract->generated_document_path)) {
            $paths = app(ContractDocumentGenerator::class)->generate($contract);

            $contract->update([
                'status' => $contract->status === 'signed' ? 'signed' : 'generated',
                'generated_document_path' => $paths['docx_path'],
                'generated_at' => now(),
            ]);

            $contract->refresh();
        }

        if (!$contract->pdf_path || !Storage::disk('local')->exists($contract->pdf_path)) {
            $absoluteDocx = Storage::disk('local')->path($contract->generated_document_path);
            $pathBuilder = app(DossierPathBuilder::class);
            $pdfRelative = $pathBuilder->contractPdfPath($contract, $contract->dossier);
            $absolutePdf = Storage::disk('local')->path($pdfRelative);

            app(WordDocumentConverter::class)->convertDocxToPdf($absoluteDocx, $absolutePdf);

            $contract->update([
                'pdf_path' => $pdfRelative,
            ]);

            $contract->refresh();
        }

        return $contract->pdf_path && Storage::disk('local')->exists($contract->pdf_path);
    }

    private function invalidateGeneratedFiles(Contract $contract, bool $hadFiles): void
    {
        if (!$hadFiles) {
            return;
        }

        $contract->loadMissing(['dossier.city', 'dossier.client']);

        if ($contract->generated_document_path && Storage::disk('local')->exists($contract->generated_document_path)) {
            Storage::disk('local')->delete($contract->generated_document_path);
        }

        if ($contract->pdf_path && Storage::disk('local')->exists($contract->pdf_path)) {
            Storage::disk('local')->delete($contract->pdf_path);
        }

        $contract->update([
            'generated_document_path' => null,
            'pdf_path' => null,
            'generated_at' => null,
        ]);
    }

    private function prepareContractData(array $data, bool $isNew = false, ?Contract $existing = null): array
    {
        $dossier = Dossier::query()->findOrFail($data['dossier_id']);
        unset($data['return_to']);

        $optionId = $data['architect_fee_option_id'] ?? $existing?->architect_fee_option_id;
        $option = $optionId ? ArchitectFeeOption::query()->find($optionId) : null;

        if ($isNew && ! $option) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'architect_fee_option_id' => 'Aucun taux architecte actif n’est disponible. Configurez-en un dans les paramètres Finance.',
            ]);
        }

        if ($option && ! $option->is_active && ($isNew || (int) $option->id !== (int) $existing?->architect_fee_option_id)) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'architect_fee_option_id' => 'Ce taux architecte n’est plus actif.',
            ]);
        }

        if ($option && ! is_file(app(ContractTemplateNamingService::class)->pathForKey($option->contract_template_key))) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'architect_fee_option_id' => 'Aucun modèle de contrat détecté pour ce taux. Ajoutez le fichier ' . app(ContractTemplateNamingService::class)->filenameFor($option->calculation_type, $option->percentage_rate) . '.',
            ]);
        }

        $calculationMode = $option?->calculation_type
            ?? (($data['calculation_mode'] ?? $existing?->calculation_mode ?? 'percentage') === 'forfait' ? 'forfait' : 'percentage');
        $feeRatePercent = $option && $option->calculation_type === 'percentage'
            ? (float) $option->percentage_rate
            : (float) ($existing?->fee_rate_percent ?? $data['fee_rate_percent'] ?? config('archilbo_templates.contracts.default_rate', 0.5));
        $surface = (float) ($data['surface'] ?? 0);
        $unitPrice = (float) ($data['price_per_square_meter'] ?? config('archilbo_templates.contracts.construction_unit_price', 900));
        $tvaRate = ((float) config('archilbo_templates.contracts.tva_rate', 20)) / 100;

        if ($surface <= 0) {
            $surface = (float) ($dossier->floor_area ?? 0);
        }

        $estimation = $surface * $unitPrice;

        if ($calculationMode === 'forfait') {
            $ttcCents = DecimalMoney::parse($data['forfait_ttc'] ?? '0');
            $ttc = DecimalMoney::fromCents($ttcCents);
            // Use integer-cent math for HT/TVA to avoid floating-point drift
            $divisor = 1 + $tvaRate; // e.g. 1.2
            if ($divisor > 0) {
                $htCents = (int) round($ttcCents / $divisor);
                $ht = DecimalMoney::fromCents($htCents);
                $tva = round($ttc - $ht, 2);
            } else {
                $ht = $ttc;
                $tva = 0.0;
            }
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
            'architect_fee_option_id' => $option?->id,
            'architect_fee_type' => $option?->calculation_type ?? $existing?->architect_fee_type,
            'architect_fee_rate' => $option?->calculation_type === 'percentage' ? $option->percentage_rate : null,
            'architect_fee_amount' => $calculationMode === 'forfait' ? $ttc : null,
            'architect_fee_label' => $option?->name ?? $existing?->architect_fee_label,
            'contract_template_key' => $option?->contract_template_key ?? $existing?->contract_template_key,
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

    private function clientOptions(\App\Models\User $user, \App\Services\CompanyContext $companyContext): array
    {
        return $companyContext->applyTo(Client::query(), $user)
            ->with(['dossiers' => fn ($query) => $companyContext->applyTo($query->getQuery(), $user)->with('contract')->orderByDesc('created_at')])
            ->orderBy('full_name')
            ->get()
            ->map(fn (Client $client) => [
                'id' => (string) $client->id,
                'fullName' => $client->full_name,
                'cin' => $client->cin,
                'dossiers' => $client->dossiers->map(fn (Dossier $dossier) => [
                    'id' => (string) $dossier->id,
                    'label' => $dossier->dossier_number . ' - ' . $dossier->project_object,
                    'floorArea' => $dossier->floor_area !== null ? (float) $dossier->floor_area : null,
                    'hasContract' => $dossier->contract !== null,
                ])->values()->all(),
            ])
            ->values()
            ->all();
    }

    private function dossierOptions(\App\Models\User $user, \App\Services\CompanyContext $companyContext): array
    {
        return $companyContext->applyTo(Dossier::query(), $user)
            ->with(['client', 'contract'])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Dossier $dossier) => [
                'id' => (string) $dossier->id,
                'label' => $dossier->dossier_number . ($dossier->project_object ? ' - ' . $dossier->project_object : ''),
                'floorArea' => $dossier->floor_area !== null ? (float) $dossier->floor_area : null,
                'hasContract' => $dossier->contract !== null,
            ])
            ->values()
            ->all();
    }

    private function contractDownloadFilename(Contract $contract, string $ext): string
    {
        $client = $contract->dossier?->client;
        $civility = $client?->civility ?? 'M';
        $name = $client?->full_name ?? 'client';

        return sprintf(
            'CONTRAT D\'ARCHITECT %s %s.%s',
            $civility,
            $name,
            $ext
        );
    }
}
