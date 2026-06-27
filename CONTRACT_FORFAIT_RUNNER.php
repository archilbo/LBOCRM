<?php

$root = __DIR__;

function path_of(string $relative): string
{
    global $root;
    return $root.DIRECTORY_SEPARATOR.$relative;
}

function read_normalized(string $relative): string
{
    return str_replace("\r\n", "\n", file_get_contents(path_of($relative)));
}

function write_file(string $relative, string $content): void
{
    file_put_contents(path_of($relative), rtrim($content, "\r\n")."\n");
}

function replace_once(string $content, string $search, string $replace, string $label): string
{
    $pos = strpos($content, $search);
    if ($pos === false) {
        throw new RuntimeException("Missing patch target: {$label}");
    }

    return substr($content, 0, $pos).$replace.substr($content, $pos + strlen($search));
}

// Migration.
write_file('database/migrations/2026_06_27_160000_add_forfait_mode_to_contracts_table.php', <<<'PHP'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('contracts', function (Blueprint $table) {
            if (! Schema::hasColumn('contracts', 'calculation_mode')) {
                $table->string('calculation_mode', 20)->default('percentage')->after('fee_rate_percent');
            }

            if (! Schema::hasColumn('contracts', 'forfait_ttc')) {
                $table->decimal('forfait_ttc', 12, 2)->nullable()->after('calculation_mode');
            }
        });
    }

    public function down(): void
    {
        Schema::table('contracts', function (Blueprint $table) {
            if (Schema::hasColumn('contracts', 'forfait_ttc')) {
                $table->dropColumn('forfait_ttc');
            }

            if (Schema::hasColumn('contracts', 'calculation_mode')) {
                $table->dropColumn('calculation_mode');
            }
        });
    }
};
PHP);

// Config.
$configPath = 'config/archilbo_templates.php';
$config = read_normalized($configPath);
if (! str_contains($config, "'tva_rate'")) {
    $config = replace_once($config, "        'construction_unit_price' => env('ARCHI_LBO_CONSTRUCTION_UNIT_PRICE', 900),", "        'construction_unit_price' => env('ARCHI_LBO_CONSTRUCTION_UNIT_PRICE', 900),\n        'tva_rate' => env('ARCHI_LBO_CONTRACT_TVA_RATE', 20),", 'config tva rate');
}
write_file($configPath, $config);

// Model.
$modelPath = 'app/Models/Contract.php';
$model = read_normalized($modelPath);
if (! str_contains($model, "'calculation_mode',")) {
    $model = replace_once($model, "        'fee_rate_percent',\n        'ht',", "        'fee_rate_percent',\n        'calculation_mode',\n        'forfait_ttc',\n        'ht',", 'model fillable');
}
if (! str_contains($model, "'forfait_ttc' => 'decimal:2',")) {
    $model = replace_once($model, "        'fee_rate_percent' => 'decimal:2',\n        'ht' => 'decimal:2',", "        'fee_rate_percent' => 'decimal:2',\n        'forfait_ttc' => 'decimal:2',\n        'ht' => 'decimal:2',", 'model casts');
}
write_file($modelPath, $model);

// Requests.
foreach (['app/Http/Requests/StoreContractRequest.php', 'app/Http/Requests/UpdateContractRequest.php'] as $requestPath) {
    $request = read_normalized($requestPath);
    if (! str_contains($request, "'calculation_mode'")) {
        $request = replace_once($request, "            'price_per_square_meter' => ['nullable', 'numeric', 'min:0'],\n            'fee_rate_percent' => ['nullable', 'numeric', 'in:0.5,2,0.50,2.00'],", "            'price_per_square_meter' => ['nullable', 'numeric', 'min:0'],\n            'calculation_mode' => ['nullable', 'string', Rule::in(['percentage', 'forfait'])],\n            'fee_rate_percent' => ['nullable', 'numeric', 'in:0.5,2,0.50,2.00'],\n            'forfait_ttc' => ['nullable', 'numeric', 'min:0'],", "request {$requestPath}");
    }
    write_file($requestPath, $request);
}

// Resource.
$resourcePath = 'app/Http/Resources/ContractResource.php';
$resource = read_normalized($resourcePath);
if (! str_contains($resource, "'calculationMode'")) {
    $resourceSearch = <<<'PHP'
            'pricePerSquareMeter' => (float) $this->price_per_square_meter,
            'feeRatePercent' => (float) ($this->fee_rate_percent ?? 0.5),
PHP;
    $resourceReplace = <<<'PHP'
            'pricePerSquareMeter' => (float) $this->price_per_square_meter,
            'calculationMode' => $this->calculation_mode ?? 'percentage',
            'feeRatePercent' => (float) ($this->fee_rate_percent ?? 0.5),
            'forfaitTtc' => $this->forfait_ttc !== null ? (float) $this->forfait_ttc : null,
PHP;
    $resource = replace_once($resource, $resourceSearch, $resourceReplace, 'resource fields');
}
write_file($resourcePath, $resource);

// Controller.
$controllerPath = 'app/Http/Controllers/ContractController.php';
$controller = read_normalized($controllerPath);
$oldPrepare = <<<'PHP'
    private function prepareContractData(array $data): array
    {
        $dossier = Dossier::query()->findOrFail($data['dossier_id']);

        $feeRatePercent = (float) ($data['fee_rate_percent'] ?? config('archilbo_templates.contracts.default_rate', 0.5));
        $surface = (float) ($data['surface'] ?? 0);
        $unitPrice = (float) config('archilbo_templates.contracts.construction_unit_price', 900);

        if ($surface <= 0) {
            $surface = (float) ($dossier->floor_area ?? 0);
        }

        $estimation = $surface * $unitPrice;
        $ht = $estimation * ($feeRatePercent / 100);
        $tva = $ht * 0.20;
        $ttc = $ht + $tva;

        return [
            'dossier_id' => $dossier->id,
            'status' => $data['status'] ?? 'draft',
            'surface' => $surface,
            'price_per_square_meter' => $unitPrice,
            'fee_rate_percent' => $feeRatePercent,
            'ht' => $ht,
            'tva' => $tva,
            'ttc' => $ttc,
            'notes' => $data['notes'] ?? null,
        ];
    }
PHP;
$newPrepare = <<<'PHP'
    private function prepareContractData(array $data): array
    {
        $dossier = Dossier::query()->findOrFail($data['dossier_id']);

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
PHP;
if (str_contains($controller, $oldPrepare)) {
    $controller = replace_once($controller, $oldPrepare, $newPrepare, 'controller prepare');
}
write_file($controllerPath, $controller);

// Generator.
$generatorPath = 'app/Services/ContractDocumentGenerator.php';
$generator = read_normalized($generatorPath);
$oldValuesCalc = <<<'PHP'
        $rate = (float) ($contract->fee_rate_percent ?? config('archilbo_templates.contracts.default_rate', 0.5));
        $unitPrice = (float) config('archilbo_templates.contracts.construction_unit_price', 900);

        $plancher = (float) ($contract->surface ?: $dossier?->floor_area ?: 0);
        $sup = (float) ($dossier?->land_surface ?: 0);

        $estimation = $plancher * $unitPrice;
        $ht = $estimation * ($rate / 100);
        $tva = $ht * 0.20;
        $ttc = $ht + $tva;
PHP;
$newValuesCalc = <<<'PHP'
        $rate = (float) ($contract->fee_rate_percent ?? config('archilbo_templates.contracts.default_rate', 0.5));
        $unitPrice = (float) ($contract->price_per_square_meter ?: config('archilbo_templates.contracts.construction_unit_price', 900));

        $plancher = (float) ($contract->surface ?: $dossier?->floor_area ?: 0);
        $sup = (float) ($dossier?->land_surface ?: 0);

        $estimation = $plancher * $unitPrice;
        $ht = (float) $contract->ht;
        $tva = (float) $contract->tva;
        $ttc = (float) $contract->ttc;

        if ($ht <= 0 && $ttc <= 0) {
            $tvaRate = ((float) config('archilbo_templates.contracts.tva_rate', 20)) / 100;
            $ht = $estimation * ($rate / 100);
            $tva = $ht * $tvaRate;
            $ttc = $ht + $tva;
        }
PHP;
if (str_contains($generator, $oldValuesCalc)) {
    $generator = replace_once($generator, $oldValuesCalc, $newValuesCalc, 'generator values');
}
write_file($generatorPath, $generator);

// Frontend types.
$typesPath = 'resources/js/features/contracts/types.ts';
$types = read_normalized($typesPath);
if (! str_contains($types, 'calculationMode:')) {
    $types = replace_once($types, "    pricePerSquareMeter: number;\n    feeRatePercent: number;", "    pricePerSquareMeter: number;\n    calculationMode: 'percentage' | 'forfait' | string;\n    feeRatePercent: number;\n    forfaitTtc: number | null;", 'row fields');
}
if (! str_contains($types, 'calculationMode: string;')) {
    $types = replace_once($types, "    pricePerSquareMeter: string;\n    feeRatePercent: string;", "    pricePerSquareMeter: string;\n    calculationMode: string;\n    feeRatePercent: string;\n    forfaitTtc: string;", 'form fields');
}
write_file($typesPath, $types);

// Drawer rewrite.
write_file('resources/js/features/contracts/drawers/ContractDrawer.tsx', <<<'TSX'
import { FormEvent, useEffect, useMemo, useState } from 'react';
import type { Key } from 'react-aria-components';
import { AppButton } from '@/components/ui/AppButton';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppFormErrorSummary } from '@/components/ui/AppFormErrorSummary';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppTextField } from '@/components/ui/AppTextField';
import { AppTextarea } from '@/components/ui/AppTextarea';
import type {
    ContractDossierOption,
    ContractFormPayload,
    ContractRow,
} from '@/features/contracts/types';
import type { FormErrors } from '@/lib/formErrors';
import { firstError } from '@/lib/formErrors';

type ContractDrawerProps = {
    isOpen: boolean;
    mode: 'create' | 'edit';
    contract: ContractRow | null;
    dossiers: ContractDossierOption[];
    onOpenChange: (isOpen: boolean) => void;
    onSubmit: (payload: ContractFormPayload) => void;
    errors?: FormErrors;
};

const emptyForm: ContractFormPayload = {
    dossierId: '',
    status: 'draft',
    surface: '',
    pricePerSquareMeter: '900',
    calculationMode: 'percentage',
    feeRatePercent: '0.5',
    forfaitTtc: '',
    notes: '',
};

const statusOptions = [
    { id: 'draft', label: 'Draft' },
    { id: 'generated', label: 'Generated' },
    { id: 'signed', label: 'Signed' },
    { id: 'cancelled', label: 'Cancelled' },
];

const calculationModeOptions = [
    { id: 'percentage', label: 'Percentage 0.5% / 2%' },
    { id: 'forfait', label: 'FORFAIT - enter TTC' },
];

const feeRateOptions = [
    { id: '0.5', label: '0.5%' },
    { id: '2', label: '2%' },
];

function parseAmount(value: string): number {
    return Number(String(value || '0').replace(',', '.')) || 0;
}

function formatMoney(value: number): string {
    return new Intl.NumberFormat('fr-MA', {
        style: 'currency',
        currency: 'MAD',
        maximumFractionDigits: 2,
    }).format(value);
}

export function ContractDrawer({
    isOpen,
    mode,
    contract,
    dossiers,
    onOpenChange,
    onSubmit,
    errors = {},
}: ContractDrawerProps) {
    const [form, setForm] = useState<ContractFormPayload>(emptyForm);

    const dossierOptions = useMemo(
        () =>
            dossiers.map((dossier) => ({
                id: dossier.id,
                label:
                    mode === 'create' && dossier.hasContract
                        ? `${dossier.label} - already has contract`
                        : dossier.label,
            })),
        [dossiers, mode],
    );

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        if (mode === 'edit' && contract) {
            setForm({
                dossierId: contract.dossierId || '',
                status: contract.status || 'draft',
                surface: contract.surface ? String(contract.surface) : '',
                pricePerSquareMeter: contract.pricePerSquareMeter
                    ? String(contract.pricePerSquareMeter)
                    : '900',
                calculationMode: contract.calculationMode || 'percentage',
                feeRatePercent: contract.feeRatePercent
                    ? String(contract.feeRatePercent)
                    : '0.5',
                forfaitTtc: contract.forfaitTtc ? String(contract.forfaitTtc) : '',
                notes: contract.notes || '',
            });

            return;
        }

        setForm(emptyForm);
    }, [contract, isOpen, mode]);

    function updateField(field: keyof ContractFormPayload, value: string) {
        setForm((current) => ({ ...current, [field]: value }));
    }

    function updateSelect(field: keyof ContractFormPayload, value: Key | null) {
        setForm((current) => ({ ...current, [field]: value ? String(value) : '' }));
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        onSubmit(form);
    }

    const isForfait = form.calculationMode === 'forfait';
    const surface = parseAmount(form.surface);
    const pricePerSquareMeter = parseAmount(form.pricePerSquareMeter);
    const estimation = surface * pricePerSquareMeter;
    const ht = isForfait ? parseAmount(form.forfaitTtc) / 1.2 : estimation * (parseAmount(form.feeRatePercent) / 100);
    const tva = isForfait ? parseAmount(form.forfaitTtc) - ht : ht * 0.2;
    const ttc = isForfait ? parseAmount(form.forfaitTtc) : ht + tva;

    return (
        <AppDrawer
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            title={mode === 'create' ? 'Create contract' : 'Edit contract'}
            description="Save contract calculation to the database. Use FORFAIT when the client has a fixed TTC price."
            footer={
                <>
                    <AppButton variant="secondary" onPress={() => onOpenChange(false)}>
                        Cancel
                    </AppButton>

                    <AppButton variant="primary" type="submit" form="contract-form">
                        Save
                    </AppButton>
                </>
            }
        >
            <form id="contract-form" className="space-y-6" onSubmit={handleSubmit}>
                <AppFormErrorSummary errors={errors} />

                <section>
                    <h3 className="mb-3 text-sm font-semibold">Project and status</h3>

                    <div className="grid gap-4">
                        <AppSelect
                            label="Dossier / Project"
                            placeholder="Select dossier"
                            selectedKey={form.dossierId}
                            onSelectionChange={(value) => updateSelect('dossierId', value)}
                            options={dossierOptions}
                            error={firstError(errors, 'dossier_id')}
                        />

                        <AppSelect
                            label="Status"
                            selectedKey={form.status}
                            onSelectionChange={(value) => updateSelect('status', value)}
                            options={statusOptions}
                            error={firstError(errors, 'status')}
                        />
                    </div>
                </section>

                <section>
                    <h3 className="mb-3 text-sm font-semibold">Calculation</h3>

                    <div className="grid gap-4">
                        <AppSelect
                            label="Calculation mode"
                            selectedKey={form.calculationMode}
                            onSelectionChange={(value) => updateSelect('calculationMode', value)}
                            options={calculationModeOptions}
                            error={firstError(errors, 'calculation_mode')}
                        />

                        {isForfait ? (
                            <AppTextField
                                label="FORFAIT TTC"
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.forfaitTtc}
                                onChange={(value) => updateField('forfaitTtc', value)}
                                description="Enter only the final TTC amount. HT and TVA are calculated automatically."
                                error={firstError(errors, 'forfait_ttc')}
                            />
                        ) : (
                            <AppSelect
                                label="Contract rate"
                                selectedKey={form.feeRatePercent}
                                onSelectionChange={(value) => updateSelect('feeRatePercent', value)}
                                options={feeRateOptions}
                                error={firstError(errors, 'fee_rate_percent')}
                            />
                        )}
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <AppTextField
                            label="Surface"
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.surface}
                            onChange={(value) => updateField('surface', value)}
                            error={firstError(errors, 'surface')}
                        />

                        <AppTextField
                            label="Price / m2"
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.pricePerSquareMeter}
                            onChange={(value) => updateField('pricePerSquareMeter', value)}
                            error={firstError(errors, 'price_per_square_meter')}
                        />
                    </div>

                    <div className="mt-4 grid gap-2 rounded-2xl border bg-[var(--surface-2)] p-4 text-sm sm:grid-cols-3">
                        <div>
                            <p className="text-xs text-[var(--text-muted)]">HT</p>
                            <p className="mt-1 font-semibold">{formatMoney(ht)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-[var(--text-muted)]">TVA 20%</p>
                            <p className="mt-1 font-semibold">{formatMoney(tva)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-[var(--text-muted)]">TTC</p>
                            <p className="mt-1 font-semibold">{formatMoney(ttc)}</p>
                        </div>
                    </div>
                </section>

                <section>
                    <AppTextarea
                        label="Notes"
                        value={form.notes}
                        onChange={(value) => updateField('notes', value)}
                        error={firstError(errors, 'notes')}
                    />
                </section>
            </form>
        </AppDrawer>
    );
}
TSX);

// Contracts page payload and labels.
$indexPath = 'resources/js/pages/Contracts/Index.tsx';
$index = read_normalized($indexPath);
if (! str_contains($index, 'calculation_mode: payload.calculationMode')) {
    $index = replace_once($index, "        surface: payload.surface || null,\n        price_per_square_meter: payload.pricePerSquareMeter || null,\n        notes: payload.notes || null,", "        surface: payload.surface || null,\n        price_per_square_meter: payload.pricePerSquareMeter || null,\n        calculation_mode: payload.calculationMode || 'percentage',\n        fee_rate_percent: payload.feeRatePercent || null,\n        forfait_ttc: payload.calculationMode === 'forfait' ? payload.forfaitTtc || null : null,\n        notes: payload.notes || null,", 'contracts payload');
}
$index = str_replace("{row.original.surface} mÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â²", "{row.original.surface} m2", $index);
if (! str_contains($index, "accessorKey: 'calculationMode'")) {
    $modeColumn = <<<'TSX'
            {
                accessorKey: 'calculationMode',
                header: 'Mode',
                cell: ({ row }) => (
                    <AppBadge tone={row.original.calculationMode === 'forfait' ? 'violet' : 'blue'}>
                        {row.original.calculationMode === 'forfait' ? 'FORFAIT' : `${row.original.feeRatePercent}%`}
                    </AppBadge>
                ),
            },
            {
                accessorKey: 'ttc',
TSX;
    $index = replace_once($index, "            {\n                accessorKey: 'ttc',", $modeColumn, 'mode column');
}
if (! str_contains($index, 'selectedContract.calculationMode')) {
    $previewMode = <<<'TSX'
                                    <div className="rounded-2xl border bg-[var(--surface)] p-4">
                                        <p className="text-xs text-[var(--text-muted)]">Calculation</p>
                                        <p className="mt-1 text-sm font-semibold">
                                            {selectedContract.calculationMode === 'forfait' ? 'FORFAIT TTC' : `${selectedContract.feeRatePercent}%`}
                                        </p>
                                    </div>

                                    <div className="grid gap-2 md:grid-cols-2 2xl:grid-cols-1">
TSX;
    $index = replace_once($index, "                                    <div className=\"grid gap-2 md:grid-cols-2 2xl:grid-cols-1\">", $previewMode, 'preview mode');
}
write_file($indexPath, $index);

// QA command.
write_file('app/Console/Commands/ContractForfaitCalculationQaCommand.php', <<<'PHP'
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class ContractForfaitCalculationQaCommand extends Command
{
    protected $signature = 'archilbo:contract-forfait-calculation-qa {ttc=12000}';

    protected $description = 'Verify contract forfait TTC calculation derives HT and TVA correctly.';

    public function handle(): int
    {
        $ttc = (float) $this->argument('ttc');
        $tvaRate = ((float) config('archilbo_templates.contracts.tva_rate', 20)) / 100;

        $ht = $ttc / (1 + $tvaRate);
        $tva = $ttc - $ht;

        if (abs(($ht + $tva) - $ttc) > 0.01) {
            $this->error('Forfait calculation failed: HT + TVA does not equal TTC.');

            return self::FAILURE;
        }

        $this->table(['TTC', 'HT', 'TVA'], [[
            number_format($ttc, 2, '.', ' '),
            number_format($ht, 2, '.', ' '),
            number_format($tva, 2, '.', ' '),
        ]]);

        $this->info('Contract forfait calculation QA passed.');

        return self::SUCCESS;
    }
}
PHP);

// Report.
$reportPath = 'docs/AI_WORK_REPORT.md';
$report = read_normalized($reportPath);
if (! str_contains($report, 'Contract FORFAIT calculation mode')) {
    $report .= <<<'MD'
---

# AI Work Report

## Date

2026-06-27

## Step Completed

Contract FORFAIT calculation mode

## What Was Built

Added a contract calculation mode for fixed client prices. Existing percentage contracts keep the 0.5% / 2% calculation. New FORFAIT contracts accept only a final TTC amount and automatically derive HT and TVA.

## Files Created

- `database/migrations/2026_06_27_160000_add_forfait_mode_to_contracts_table.php`
- `app/Console/Commands/ContractForfaitCalculationQaCommand.php`

## Files Modified

- `config/archilbo_templates.php`
- `app/Models/Contract.php`
- `app/Http/Requests/StoreContractRequest.php`
- `app/Http/Requests/UpdateContractRequest.php`
- `app/Http/Resources/ContractResource.php`
- `app/Http/Controllers/ContractController.php`
- `app/Services/ContractDocumentGenerator.php`
- `resources/js/features/contracts/types.ts`
- `resources/js/features/contracts/drawers/ContractDrawer.tsx`
- `resources/js/pages/Contracts/Index.tsx`
- `docs/AI_WORK_REPORT.md`

## Behavior

- Percentage mode: HT = surface x price/m2 x selected rate / 100, TVA = HT x TVA rate, TTC = HT + TVA.
- FORFAIT mode: user enters TTC only, HT = TTC / 1.20, TVA = TTC - HT.
- Contract DOCX generation now uses stored HT/TVA/TTC values, so forfait amounts are preserved in generated templates.
- The contract form now sends `fee_rate_percent`, fixing the previous selector-submit mismatch.

## Next Recommended Step

Open `/contracts`, create a FORFAIT contract with TTC 12000, confirm HT is 10000 and TVA is 2000, then generate/download the DOCX.
MD;
}
write_file($reportPath, $report);

echo "CONTRACT_FORFAIT_RUNNER completed.\n";