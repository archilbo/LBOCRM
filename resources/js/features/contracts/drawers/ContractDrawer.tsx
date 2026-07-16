import { FormEvent, useEffect, useMemo, useState } from 'react';
import type { Key } from 'react-aria-components';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@heroui/react';
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
import { cn } from '@/lib/cn';

type ContractDrawerProps = {
    isOpen: boolean;
    mode: 'create' | 'edit';
    contract: ContractRow | null;
    dossiers: ContractDossierOption[];
    initialDossierId?: string;
    onOpenChange: (isOpen: boolean) => void;
    onSubmit: (payload: ContractFormPayload) => void;
    errors?: FormErrors;
    isSubmitting?: boolean;
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
    { id: 'draft', label: 'Brouillon' },
    { id: 'generated', label: 'Genere' },
    { id: 'signed', label: 'Signe' },
    { id: 'cancelled', label: 'Annule' },
];

const calculationModeOptions = [
    { id: 'percentage', label: 'Pourcentage 0.5% / 2%' },
    { id: 'forfait', label: 'FORFAIT - saisir TTC' },
];

const feeRateOptions = [
    { id: '0.5', label: '0.5%' },
    { id: '2', label: '2%' },
];

const createSteps = [
    { key: 'project', label: 'Projet' },
    { key: 'calculation', label: 'Calcul' },
    { key: 'review', label: 'Revision' },
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
    isSubmitting = false,
}: ContractDrawerProps) {
    const [form, setForm] = useState<ContractFormPayload>(emptyForm);
    const [step, setStep] = useState(0);

    const dossierOptions = useMemo(
        () =>
            dossiers.map((dossier) => ({
                id: dossier.id,
                label:
                    mode === 'create' && dossier.hasContract
                        ? `${dossier.label} - contrat existant`
                        : dossier.label,
            })),
        [dossiers, mode],
    );

    useEffect(() => {
        if (!isOpen) {
            setStep(0);
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

    function handleNext() {
        if (step < createSteps.length - 1) setStep((s) => s + 1);
    }

    function handleBack() {
        if (step > 0) setStep((s) => s - 1);
    }

    const isLastStep = step === createSteps.length - 1;

    const stepContent = () => {
        if (mode === 'edit') {
            return (
                <>
                    <section>
                        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
                            <span className="flex size-6 items-center justify-center rounded-md bg-[var(--accent)]/10 text-[11px] font-bold text-[var(--accent)]">1</span>
                            Projet et statut
                        </h3>
                        <div className="grid gap-4">
                            <AppSelect
                                label="Dossier / Projet"
                                placeholder="Selectionner un dossier"
                                selectedKey={form.dossierId}
                                onSelectionChange={(value) => updateSelect('dossierId', value)}
                                options={dossierOptions}
                                error={firstError(errors, 'dossier_id')}
                            />
                            <AppSelect
                                label="Statut"
                                selectedKey={form.status}
                                onSelectionChange={(value) => updateSelect('status', value)}
                                options={statusOptions}
                                error={firstError(errors, 'status')}
                            />
                        </div>
                    </section>

                    <section>
                        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
                            <span className="flex size-6 items-center justify-center rounded-md bg-[var(--accent)]/10 text-[11px] font-bold text-[var(--accent)]">2</span>
                            Calcul des honoraires
                        </h3>
                        <div className="grid gap-4">
                            <AppSelect
                                label="Mode de calcul"
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
                                    description="Saisissez le montant TTC final. HT et TVA sont calcules automatiquement."
                                    error={firstError(errors, 'forfait_ttc')}
                                />
                            ) : (
                                <AppSelect
                                    label="Taux d'honoraires"
                                    selectedKey={form.feeRatePercent}
                                    onSelectionChange={(value) => updateSelect('feeRatePercent', value)}
                                    options={feeRateOptions}
                                    error={firstError(errors, 'fee_rate_percent')}
                                />
                            )}
                        </div>
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <AppTextField
                                label="Surface (m2)"
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.surface}
                                onChange={(value) => updateField('surface', value)}
                                error={firstError(errors, 'surface')}
                            />
                            <AppTextField
                                label="Prix / m2"
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.pricePerSquareMeter}
                                onChange={(value) => updateField('pricePerSquareMeter', value)}
                                error={firstError(errors, 'price_per_square_meter')}
                            />
                        </div>
                        <CalculationSummary ht={ht} tva={tva} ttc={ttc} />
                    </section>

                    <section>
                        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
                            <span className="flex size-6 items-center justify-center rounded-md bg-[var(--accent)]/10 text-[11px] font-bold text-[var(--accent)]">3</span>
                            Notes
                        </h3>
                        <AppTextarea
                            label="Notes"
                            value={form.notes}
                            onChange={(value) => updateField('notes', value)}
                            error={firstError(errors, 'notes')}
                        />
                    </section>
                </>
            );
        }

        switch (step) {
            case 0:
                return (
                    <section>
                        <h3 className="mb-3 text-sm font-semibold text-[var(--foreground)]">Selectionnez le projet et le statut initial</h3>
                        <div className="grid gap-4">
                            <AppSelect
                                label="Dossier / Projet"
                                placeholder="Selectionner un dossier"
                                selectedKey={form.dossierId}
                                onSelectionChange={(value) => updateSelect('dossierId', value)}
                                options={dossierOptions}
                                error={firstError(errors, 'dossier_id')}
                            />
                            <AppSelect
                                label="Statut"
                                selectedKey={form.status}
                                onSelectionChange={(value) => updateSelect('status', value)}
                                options={statusOptions}
                                error={firstError(errors, 'status')}
                            />
                        </div>
                    </section>
                );
            case 1:
                return (
                    <section>
                        <h3 className="mb-3 text-sm font-semibold text-[var(--foreground)]">Configurez les parametres de calcul</h3>
                        <div className="grid gap-4">
                            <AppSelect
                                label="Mode de calcul"
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
                                    description="Saisissez le montant TTC final. HT et TVA sont calcules automatiquement."
                                    error={firstError(errors, 'forfait_ttc')}
                                />
                            ) : (
                                <AppSelect
                                    label="Taux d'honoraires"
                                    selectedKey={form.feeRatePercent}
                                    onSelectionChange={(value) => updateSelect('feeRatePercent', value)}
                                    options={feeRateOptions}
                                    error={firstError(errors, 'fee_rate_percent')}
                                />
                            )}
                        </div>
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <AppTextField
                                label="Surface (m2)"
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.surface}
                                onChange={(value) => updateField('surface', value)}
                                error={firstError(errors, 'surface')}
                            />
                            <AppTextField
                                label="Prix / m2"
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.pricePerSquareMeter}
                                onChange={(value) => updateField('pricePerSquareMeter', value)}
                                error={firstError(errors, 'price_per_square_meter')}
                            />
                        </div>
                        <CalculationSummary ht={ht} tva={tva} ttc={ttc} />
                    </section>
                );
            case 2:
                return (
                    <section>
                        <h3 className="mb-3 text-sm font-semibold text-[var(--foreground)]">Revisez et confirmez</h3>

                        <div className="mb-4 space-y-3">
                            <div className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2">
                                <span className="text-xs text-[var(--text-muted)]">Projet</span>
                                <span className="text-[13px] font-medium text-[var(--foreground)]">
                                    {dossiers.find((d) => d.id === form.dossierId)?.label || form.dossierId || '-'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2">
                                <span className="text-xs text-[var(--text-muted)]">Statut</span>
                                <span className="text-[13px] font-medium capitalize text-[var(--foreground)]">{form.status}</span>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2">
                                <span className="text-xs text-[var(--text-muted)]">Mode</span>
                                <span className="text-[13px] font-medium capitalize text-[var(--foreground)]">{form.calculationMode}</span>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2">
                                <span className="text-xs text-[var(--text-muted)]">Surface</span>
                                <span className="text-[13px] font-medium text-[var(--foreground)]">{form.surface || '-'} m&sup2;</span>
                            </div>
                        </div>

                        <CalculationSummary ht={ht} tva={tva} ttc={ttc} />

                        <div className="mt-4">
                            <AppTextarea
                                label="Notes"
                                value={form.notes}
                                onChange={(value) => updateField('notes', value)}
                                error={firstError(errors, 'notes')}
                            />
                        </div>
                    </section>
                );
            default:
                return null;
        }
    };

    const drawerFooter = () => {
        if (mode === 'edit') {
            return (
                <>
                    <Button variant="bordered" color="default" onPress={() => onOpenChange(false)} isDisabled={isSubmitting}>Annuler</Button>
                    <Button variant="solid" color="primary" type="submit" form="contract-form" isLoading={isSubmitting}>Enregistrer</Button>
                </>
            );
        }

        return (
            <>
                {step > 0 ? (
                    <Button variant="bordered" color="default" onPress={handleBack} isDisabled={isSubmitting}>
                        <ChevronLeft size={15} /> Retour
                    </Button>
                ) : <div />}
                {isLastStep ? (
                    <Button variant="solid" color="primary" type="submit" form="contract-form" isLoading={isSubmitting}>
                        <Check size={15} /> {isSubmitting ? 'Creation...' : 'Creer le contrat'}
                    </Button>
                ) : (
                    <Button variant="solid" color="primary" onPress={handleNext} isDisabled={isSubmitting}>
                        Suivant <ChevronRight size={15} />
                    </Button>
                )}
            </>
        );
    };

    return (
        <AppDrawer
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            title={mode === 'create' ? 'Nouveau contrat' : 'Modifier le contrat'}
            description={mode === 'create' ? 'Configurez un nouveau contrat en quelques etapes.' : 'Mettez a jour les details et recalculez les montants.'}
            footer={drawerFooter()}
        >
            <form id="contract-form" className="flex flex-col gap-6" onSubmit={handleSubmit}>
                <AppFormErrorSummary errors={errors} />

                {mode === 'create' ? (
                    <div className="flex items-center gap-2">
                        {createSteps.map((s, i) => (
                            <div key={s.key} className="flex items-center gap-2 flex-1">
                                <div className={cn(
                                    'flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition',
                                    i < step ? 'bg-emerald-500/20 text-emerald-400' :
                                    i === step ? 'bg-[var(--accent)]/20 text-[var(--accent)]' :
                                    'bg-[var(--surface-2)] text-[var(--text-muted)]',
                                )}>
                                    {i < step ? <Check size={12} /> : i + 1}
                                </div>
                                <span className={cn(
                                    'text-[11px] font-semibold transition hidden sm:inline',
                                    i === step ? 'text-[var(--foreground)]' : 'text-[var(--text-muted)]',
                                )}>
                                    {s.label}
                                </span>
                                {i < createSteps.length - 1 ? (
                                    <div className={cn(
                                        'ml-2 flex-1 h-px transition',
                                        i < step ? 'bg-emerald-500/40' : 'bg-[var(--border)]',
                                    )} />
                                ) : null}
                            </div>
                        ))}
                    </div>
                ) : null}

                {stepContent()}
            </form>
        </AppDrawer>
    );
}

function CalculationSummary({ ht, tva, ttc }: { ht: number; tva: number; ttc: number }) {
    return (
        <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Resume</p>
            <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg bg-[var(--surface-2)] p-3">
                    <p className="text-[10px] text-[var(--text-muted)]">HT</p>
                    <p className="mt-0.5 text-base font-semibold text-[var(--foreground)]">{formatMoney(ht)}</p>
                </div>
                <div className="rounded-lg bg-[var(--surface-2)] p-3">
                    <p className="text-[10px] text-[var(--text-muted)]">TVA 20%</p>
                    <p className="mt-0.5 text-base font-semibold text-[var(--foreground)]">{formatMoney(tva)}</p>
                </div>
                <div className="rounded-lg bg-[color-mix(in_srgb,var(--accent)_9%,var(--surface-2))] p-3">
                    <p className="text-[10px] text-[var(--accent)]">TTC</p>
                    <p className="mt-0.5 text-base font-bold text-[var(--accent)]">{formatMoney(ttc)}</p>
                </div>
            </div>
        </div>
    );
}
