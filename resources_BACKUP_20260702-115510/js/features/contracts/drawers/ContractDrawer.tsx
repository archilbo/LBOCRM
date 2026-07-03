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
    initialDossierId?: string;
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
    initialDossierId = '',
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

        const initialDossier = dossiers.find((dossier) => dossier.id === initialDossierId);

        setForm({
            ...emptyForm,
            dossierId: initialDossierId,
            surface: initialDossier?.floorArea ? String(initialDossier.floorArea) : '',
        });
    }, [contract, dossiers, initialDossierId, isOpen, mode]);

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
