import { FormEvent, useEffect, useMemo, useState, useCallback } from 'react';
import { Card, Input, TextArea } from '@heroui/react';
import { IconCheck, IconChevronLeft, IconChevronRight, IconAlertTriangle, IconAlertCircle } from '@tabler/icons-react';

import { AppAutocomplete } from '@/components/ui/AppAutocomplete';
import { AppButton } from '@/components/ui/AppButton';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { drawerStyles, DrawerSelect, type SelectOption, type DrawerBaseProps } from '@/components/drawers';
import { cn } from '@/lib/cn';
import { formatCompactMoney } from '@/lib/currency';
import { firstError, hasErrors } from '@/lib/formErrors';
import type { ContractClientOption, ContractDossierOption, ContractFormPayload, ContractRow, } from '@/features/contracts/types';

export type ContractDrawerProps = DrawerBaseProps & {
    mode: 'create' | 'edit';
    contract: ContractRow | null;
    clients: ContractClientOption[];
    dossiers: ContractDossierOption[];
    initialDossierId?: string;
    initialFloorArea?: number | string | null;
    lockProject?: boolean;
    onSubmit: (payload: ContractFormPayload) => void;
};

const emptyForm: ContractFormPayload = {
    dossier_id: '',
    status: 'draft',
    surface: '',
    price_per_square_meter: '900',
    calculation_mode: 'percentage',
    fee_rate_percent: '0.5',
    forfait_ttc: '',
    notes: '',
};

const statusOptions: SelectOption[] = [
    { id: 'draft', label: 'Brouillon' },
    { id: 'generated', label: 'Genere' },
    { id: 'signed', label: 'Signe' },
    { id: 'cancelled', label: 'Annule' },
];

const calculationModeOptions: SelectOption[] = [
    { id: 'percentage', label: 'Pourcentage 0.5% / 2%' },
    { id: 'forfait', label: 'FORFAIT - saisir TTC' },
];

const feeRateOptions: SelectOption[] = [
    { id: '0.5', label: '0.5%' },
    { id: '2', label: '2%' },
];

const createSteps = [
    { key: 'project', label: 'Client & Projet' },
    { key: 'calculation', label: 'Calcul' },
    { key: 'review', label: 'Revision' },
    { key: 'confirm', label: 'Confirmation' },
];

const fieldToStep: Record<string, number> = {
    dossier_id: 0, status: 0, client_id: 0,
    surface: 1, price_per_square_meter: 1, fee_rate_percent: 1, forfait_ttc: 1, calculation_mode: 1,
};

function isStepValid(step: number, form: ContractFormPayload, selectedClientId: string | null, isForfait: boolean): boolean {
    if (step === 0) return Boolean(selectedClientId && form.dossier_id);
    if (step === 1) {
        if (isForfait) return Boolean(form.forfait_ttc);
        return Boolean(form.surface && form.price_per_square_meter && form.fee_rate_percent);
    }
    return true;
}

function getStepHints(step: number, form: ContractFormPayload, selectedClientId: string | null, isForfait: boolean, dossierHasContract: boolean): string[] {
    if (step === 0) {
        const hints: string[] = [];
        if (!selectedClientId) hints.push('Selectionnez un client');
        if (selectedClientId && !form.dossier_id) hints.push('Selectionnez un dossier');
        if (dossierHasContract) hints.push('Ce dossier a deja un contrat');
        return hints;
    }
    if (step === 1) {
        if (isForfait) {
            if (!form.forfait_ttc) return ['Saisissez le montant FORFAIT TTC'];
        } else {
            const hints: string[] = [];
            if (!form.surface) hints.push('Saisissez la surface (m2)');
            if (!form.price_per_square_meter) hints.push('Saisissez le prix / m2');
            if (!form.fee_rate_percent) hints.push("Selectionnez le taux d'honoraires");
            return hints;
        }
    }
    return [];
}

function parseAmount(value: string): number {
    return Number(String(value || '0').replace(',', '.')) || 0;
}

function FormErrorSummary({ errors }: { errors?: Record<string, string> }) {
    if (!hasErrors(errors)) return null;
    const entries = Object.entries(errors ?? {});
    return (
        <Card className="border border-[color-mix(in_srgb,var(--danger)_35%,transparent)] bg-[color-mix(in_srgb,var(--danger)_8%,transparent)] p-4 shadow-none">
            <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] text-[var(--danger)]">
                    <IconAlertTriangle size={16} />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--danger)]">Veuillez verifier le formulaire</p>
                    <ul className="mt-2 space-y-1 text-sm text-[var(--text-muted)]">
                        {entries.slice(0, 8).map(([field, message]) => (
                            <li key={field}>
                                <span className="font-medium">{field.split('_').join(' ')}:</span> {message}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </Card>
    );
}

function CalculationSummary({ estimation, ht, tva, ttc }: { estimation?: number; ht: number; tva: number; ttc: number }) {
    const items = [
        ...(estimation != null ? [{ label: 'Estimation projet', value: formatCompactMoney(estimation), accent: false }] : []),
        { label: 'Honoraires HT', value: formatCompactMoney(ht), accent: false },
        { label: 'TVA 20%', value: formatCompactMoney(tva), accent: false },
        { label: 'TTC', value: formatCompactMoney(ttc), accent: true },
    ];
    return (
        <Card className="mt-4 border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Resume</p>
            <div className={cn('grid gap-2', estimation != null ? 'grid-cols-4' : 'grid-cols-3')}>
                {items.map((item) => (
                    <Card key={item.label} className={cn(
                        'rounded-lg p-3 shadow-none',
                        item.accent ? 'bg-[color-mix(in_srgb,var(--accent)_9%,var(--surface-2))]' : 'bg-[var(--surface-2)]',
                    )}>
                        <p className={cn('text-[9px]', item.accent ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]')}>{item.label}</p>
                        <p className={cn('mt-0.5', item.accent ? 'text-base font-bold text-[var(--accent)]' : 'text-base font-semibold text-[var(--foreground)]')}>{item.value}</p>
                    </Card>
                ))}
            </div>
        </Card>
    );
}

/* ──── Module-level sub-components (extracted from ContractDrawer to prevent focus-loss on re-render) ──── */

type ClientFieldsProps = {
    selectedClientId: string | null;
    clientOptions: { id: string; label: string }[];
    onClientSelect: (clientId: string) => void;
    dossier_id: string;
    dossierOptions: { id: string; label: string }[];
    onDossierSelect: (key: string) => void;
    disabled?: boolean;
};

function ClientFields({
    selectedClientId, clientOptions, onClientSelect,
    dossier_id, dossierOptions, onDossierSelect, disabled,
}: ClientFieldsProps) {
    return (
        <>
            <div className={drawerStyles.fieldGroup}>
                <label className={drawerStyles.label}>Client</label>
                <AppAutocomplete
                    value={selectedClientId ?? ''}
                    onChange={onClientSelect}
                    options={clientOptions}
                    placeholder="Rechercher un client..."
                    isDisabled={disabled}
                />
            </div>
            <div className={drawerStyles.fieldGroup}>
                <label className={drawerStyles.label}>Projet</label>
                <AppAutocomplete
                    value={selectedClientId ? dossier_id : ''}
                    onChange={onDossierSelect}
                    options={dossierOptions}
                    placeholder={!selectedClientId ? "Sélectionnez un client d'abord" : 'Rechercher un dossier...'}
                    isDisabled={!selectedClientId || disabled}
                />
            </div>
        </>
    );
}

type CalculationSectionProps = {
    form: ContractFormPayload;
    errors: Record<string, string>;
    updateField: (field: keyof ContractFormPayload, value: string) => void;
    isForfait: boolean;
    estimation: number;
    ht: number;
    tva: number;
    ttc: number;
    lockProject?: boolean;
    mode: 'create' | 'edit';
};

function CalculationSection({
    form, errors, updateField, isForfait, estimation, ht, tva, ttc, lockProject, mode,
}: CalculationSectionProps) {
    const surfaceDisabled = lockProject && mode === 'create';
    return (
        <>
            <div className={drawerStyles.fieldGroup}>
                <label className={drawerStyles.label}>Mode de calcul</label>
                <DrawerSelect value={form.calculation_mode} onChange={(v) => updateField('calculation_mode', v)} options={calculationModeOptions} />
            </div>
            {isForfait ? (
                <div className={drawerStyles.fieldGroup}>
                    <label className={drawerStyles.label}>Forfait TTC</label>
                    <Input type="text" inputMode="decimal" value={form.forfait_ttc}
                        onChange={(e) => updateField('forfait_ttc', e.target.value)}
                        aria-invalid={firstError(errors, 'forfait_ttc') ? true : undefined}
                        className={drawerStyles.input}
                        placeholder="ex: 1500,50" />
                    <p className="text-[9px] text-[var(--text-muted)]">Saisissez le montant TTC final. HT et TVA sont calcules automatiquement.</p>
                </div>
            ) : (
                <>
                    <div className={drawerStyles.fieldGroup}>
                        <label className={drawerStyles.label}>Taux honoraires</label>
                        <DrawerSelect value={form.fee_rate_percent} onChange={(v) => updateField('fee_rate_percent', v)} options={feeRateOptions} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className={drawerStyles.fieldGroup}>
                            <label className={drawerStyles.label}>Surface (m2)</label>
                            <Input type="text" inputMode="decimal" value={form.surface}
                                onChange={(e) => updateField('surface', e.target.value)}
                                disabled={surfaceDisabled}
                                aria-invalid={firstError(errors, 'surface') ? true : undefined}
                                className={drawerStyles.input}
                                placeholder="ex: 280" />
                        </div>
                        <div className={drawerStyles.fieldGroup}>
                            <label className={drawerStyles.label}>Prix / m2</label>
                            <Input type="text" inputMode="decimal" value={form.price_per_square_meter}
                                onChange={(e) => updateField('price_per_square_meter', e.target.value)}
                                aria-invalid={firstError(errors, 'price_per_square_meter') ? true : undefined}
                                className={drawerStyles.input}
                                placeholder="ex: 900" />
                        </div>
                    </div>
                </>
            )}
            <CalculationSummary estimation={!isForfait ? estimation : undefined} ht={ht} tva={tva} ttc={ttc} />
        </>
    );
}

type ReviewStepProps = {
    form: ContractFormPayload;
    dossiers: ContractDossierOption[];
    isForfait: boolean;
    estimation: number;
    ht: number;
    tva: number;
    ttc: number;
    updateField: (field: keyof ContractFormPayload, value: string) => void;
    errors: Record<string, string>;
};

function ReviewStep({ form, dossiers, isForfait, estimation, ht, tva, ttc, updateField }: ReviewStepProps) {
    const summaryRows = [
        { label: 'Projet', value: dossiers.find((d) => d.id === form.dossier_id)?.label || form.dossier_id || '-' },
        { label: 'Statut', value: form.status, capitalize: true },
        { label: 'Mode de calcul', value: isForfait ? 'Forfait' : 'Pourcentage' },
        ...(isForfait
            ? [{ label: 'Forfait TTC', value: form.forfait_ttc ? formatCompactMoney(Number(form.forfait_ttc)) : '-' }]
            : [
                { label: 'Taux honoraires', value: `${form.fee_rate_percent}%` },
                { label: 'Surface', value: form.surface ? `${form.surface} m²` : '-' },
                { label: 'Prix / m²', value: form.price_per_square_meter ? formatCompactMoney(Number(form.price_per_square_meter)) : '-' },
            ]
        ),
    ];
    return (
        <div className="flex flex-col gap-3">
            <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
                {summaryRows.map((row, idx) => (
                    <div key={row.label} className={cn(
                        'flex items-center justify-between px-3 py-2',
                        idx < summaryRows.length - 1 && 'border-b border-[var(--border)]',
                    )}>
                        <span className="text-[10px] text-[var(--text-muted)]">{row.label}</span>
                        <span className={cn('text-xs font-medium text-[var(--foreground)]', row.capitalize && 'capitalize')}>{row.value}</span>
                    </div>
                ))}
            </div>
            <CalculationSummary estimation={!isForfait ? estimation : undefined} ht={ht} tva={tva} ttc={ttc} />
            <div className={drawerStyles.fieldGroup}>
                <label className={drawerStyles.label}>Notes</label>
                <TextArea value={form.notes} onChange={(e) => updateField('notes', e.target.value)} className={drawerStyles.textarea} placeholder="Ajouter des notes..." />
            </div>
        </div>
    );
}

type EditFormProps = {
    form: ContractFormPayload;
    errors: Record<string, string>;
    updateField: (field: keyof ContractFormPayload, value: string) => void;
    isForfait: boolean;
    estimation: number;
    ht: number;
    tva: number;
    ttc: number;
    lockProject?: boolean;
    mode: 'create' | 'edit';
    selectedClientId: string | null;
    clientOptions: { id: string; label: string }[];
    onClientSelect: (clientId: string) => void;
    dossier_id: string;
    dossierOptions: { id: string; label: string }[];
    onDossierSelect: (key: string) => void;
    visibleStatusOptions: SelectOption[];
};

function EditForm({
    form, errors, updateField, isForfait, estimation, ht, tva, ttc, lockProject, mode,
    selectedClientId, clientOptions,
    onClientSelect, dossier_id, dossierOptions, onDossierSelect,
    visibleStatusOptions,
}: EditFormProps) {
    return (
        <div className="flex flex-col gap-3">
            <ClientFields
                selectedClientId={selectedClientId}
                clientOptions={clientOptions}
                onClientSelect={onClientSelect}
                dossier_id={dossier_id}
                dossierOptions={dossierOptions}
                onDossierSelect={onDossierSelect}
                disabled
            />
            <div className={drawerStyles.fieldGroup}>
                <label className={drawerStyles.label}>Statut</label>
                <DrawerSelect value={form.status} onChange={(v) => updateField('status', v)} options={visibleStatusOptions} />
            </div>
            <CalculationSection
                form={form}
                errors={errors}
                updateField={updateField}
                isForfait={isForfait}
                estimation={estimation}
                ht={ht}
                tva={tva}
                ttc={ttc}
                lockProject={lockProject}
                mode={mode}
            />
            <div className={drawerStyles.fieldGroup}>
                <label className={drawerStyles.label}>Notes</label>
                <TextArea value={form.notes} onChange={(e) => updateField('notes', e.target.value)} className={drawerStyles.textarea} placeholder="Ajouter des notes..." />
            </div>
        </div>
    );
}

type DrawerFooterProps = {
    mode: 'create' | 'edit';
    step: number;
    isSubmitting: boolean;
    stepValid: boolean;
    onOpenChange: (open: boolean) => void;
    onBack?: () => void;
    onNext?: () => void;
};

function DrawerFooter({ mode, step, isSubmitting, stepValid, onOpenChange, onBack, onNext }: DrawerFooterProps) {
    if (mode === 'edit') {
        return (
            <div className="flex w-full items-center justify-end gap-2">
                <AppButton variant="light" onPress={() => onOpenChange(false)} isDisabled={isSubmitting}>Annuler</AppButton>
                <AppButton variant="solid" color="primary" type="submit" form="contract-form" isLoading={isSubmitting}>Enregistrer</AppButton>
            </div>
        );
    }
    return (
        <div className="flex w-full items-center justify-between gap-2">
            {step > 0 ? (
                <AppButton variant="light" onPress={onBack} isDisabled={isSubmitting}>
                    <IconChevronLeft size={14} /> Retour
                </AppButton>
            ) : <div />}
            {step === createSteps.length - 1 ? (
                <AppButton variant="solid" color="primary" type="submit" form="contract-form" isLoading={isSubmitting}>
                    <IconCheck size={14} /> {isSubmitting ? 'Création…' : 'Créer le contrat'}
                </AppButton>
            ) : (
                <AppButton variant="solid" color="primary" onPress={onNext}
                    isDisabled={isSubmitting || !stepValid}>
                    Suivant <IconChevronRight size={14} />
                </AppButton>
            )}
        </div>
    );
}

/* ──── Main Component ──── */

export function ContractDrawer({
    isOpen, mode, contract, clients, dossiers,
    initialDossierId = '', initialFloorArea, lockProject = false, onOpenChange, onSubmit, errors = {}, isSubmitting = false,
}: ContractDrawerProps) {
    const [form, setForm] = useState<ContractFormPayload>(emptyForm);
    const [step, setStep] = useState(0);
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
    const visibleStatusOptions = mode === 'create' ? statusOptions.filter((o) => o.id !== 'generated') : statusOptions;

    const clientOptions = useMemo(() => clients.map((c) => ({ id: c.id, label: `${c.cin} - ${c.fullName}` })), [clients]);

    const clientDossiers = useMemo(() => {
        const client = clients.find((c) => c.id === selectedClientId);
        return client?.dossiers ?? [];
    }, [clients, selectedClientId]);

    const dossierOptions = useMemo(() => {
        return clientDossiers.map((d) => ({ id: d.id, label: d.label }));
    }, [clientDossiers]);

    useEffect(() => {
        if (!isOpen) { setStep(0); setSelectedClientId(null); return; }
        if (mode === 'edit' && contract) {
            const client = clients.find((c) =>
                c.dossiers.some((d) => d.id === contract.dossierId),
            );
            setSelectedClientId(client?.id ?? null);
            setForm({
                dossier_id: contract.dossierId || '',
                status: contract.status || 'draft',
                surface: contract.surface != null ? String(contract.surface) : '',
                price_per_square_meter: contract.pricePerSquareMeter != null ? String(contract.pricePerSquareMeter) : '',
                calculation_mode: contract.calculationMode || 'percentage',
                fee_rate_percent: contract.feeRatePercent != null ? String(contract.feeRatePercent) : '',
                forfait_ttc: contract.forfaitTtc != null ? String(contract.forfaitTtc) : '',
                notes: contract.notes || '',
            });
            return;
        }
        if (initialDossierId) {
            const client = clients.find((c) =>
                c.dossiers.some((d) => d.id === initialDossierId),
            );
            setSelectedClientId(client?.id ?? null);

            const floorArea = initialFloorArea ?? client?.dossiers.find((d) => d.id === initialDossierId)?.floorArea;

            setForm({
                ...emptyForm,
                dossier_id: initialDossierId,
                surface: floorArea != null ? String(floorArea) : '',
            });
            return;
        }
        setSelectedClientId(null);
        setForm(emptyForm);
    }, [contract, clients, initialDossierId, initialFloorArea, isOpen, mode]);

    useEffect(() => {
        if (!hasErrors(errors) || mode !== 'create') return;
        for (const field of Object.keys(errors)) {
            const errorStep = fieldToStep[field];
            if (errorStep !== undefined) { setStep(errorStep); return; }
        }
    }, [errors, mode]);

    const updateField = useCallback((field: keyof ContractFormPayload, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    }, []);

    const selectedDossierHasContract = useMemo(() => {
        if (mode !== 'create' || !form.dossier_id || !selectedClientId) return false;
        const client = clients.find((c) => c.id === selectedClientId);
        return client?.dossiers.find((d) => d.id === form.dossier_id)?.hasContract ?? false;
    }, [form.dossier_id, selectedClientId, clients, mode]);

    const isForfait = form.calculation_mode === 'forfait';
    const surface = parseAmount(form.surface);
    const pricePerSquareMeter = parseAmount(form.price_per_square_meter);
    const estimation = surface * pricePerSquareMeter;
    const ht = isForfait ? parseAmount(form.forfait_ttc) / 1.2 : estimation * (parseAmount(form.fee_rate_percent) / 100);
    const tva = isForfait ? parseAmount(form.forfait_ttc) - ht : ht * 0.2;
    const ttc = isForfait ? parseAmount(form.forfait_ttc) : ht + tva;

    const stepValid = isStepValid(step, form, selectedClientId, isForfait) && (step !== 0 || !selectedDossierHasContract);
    const stepHints = getStepHints(step, form, selectedClientId, isForfait, selectedDossierHasContract);

    const displayErrors = useMemo(() => {
        if (!selectedDossierHasContract) {
            const { dossier_id: _, ...rest } = errors;
            return rest;
        }
        return { ...errors, dossier: 'Ce dossier a deja un contrat. Veuillez selectionner un autre dossier.' };
    }, [errors, selectedDossierHasContract]);

    const handleSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSubmit(form);
    }, [form, onSubmit]);

    const handleClientSelect = useCallback((clientId: string) => {
        setSelectedClientId(clientId || null);
        setForm((prev) => ({ ...prev, dossier_id: '' }));
    }, []);

    const handleDossierSelect = useCallback((key: string) => {
        updateField('dossier_id', key);
        if (key) {
            const selectedDossier = clientDossiers.find((d) => d.id === key);
            if (selectedDossier?.floorArea != null) {
                updateField('surface', String(selectedDossier.floorArea));
            }
        }
    }, [updateField, clientDossiers]);

    const handleStepBack = useCallback(() => setStep((s) => s - 1), []);
    const handleStepForward = useCallback(() => setStep((s) => s + 1), []);

    /* ──── render ──── */

    const stepContent = mode === 'edit' ? (
        <EditForm
            form={form}
            errors={errors}
            updateField={updateField}
            isForfait={isForfait}
            estimation={estimation}
            ht={ht}
            tva={tva}
            ttc={ttc}
            lockProject={lockProject}
            mode={mode}
            selectedClientId={selectedClientId}
            clientOptions={clientOptions}
            onClientSelect={handleClientSelect}
            dossier_id={form.dossier_id}
            dossierOptions={dossierOptions}
            onDossierSelect={handleDossierSelect}
            visibleStatusOptions={visibleStatusOptions}
        />
    ) : (
        <>
            {step === 0 && (
                <ClientFields
                    selectedClientId={selectedClientId}
                    clientOptions={clientOptions}
                    onClientSelect={handleClientSelect}
                    dossier_id={form.dossier_id}
                    dossierOptions={dossierOptions}
                    onDossierSelect={handleDossierSelect}
                    disabled={lockProject}
                />
            )}
            {(step === 1) && (
                <CalculationSection
                    form={form}
                    errors={errors}
                    updateField={updateField}
                    isForfait={isForfait}
                    estimation={estimation}
                    ht={ht}
                    tva={tva}
                    ttc={ttc}
                    lockProject={lockProject}
                    mode={mode}
                />
            )}
            {(step === 2 || step === 3) && (
                <ReviewStep
                    form={form}
                    dossiers={dossiers}
                    isForfait={isForfait}
                    estimation={estimation}
                    ht={ht}
                    tva={tva}
                    ttc={ttc}
                    updateField={updateField}
                    errors={errors}
                />
            )}
        </>
    );

    return (
        <AppDrawer
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            title={mode === 'create' ? 'Nouveau contrat' : 'Modifier le contrat'}
            description={mode === 'create' ? 'Configurez un nouveau contrat en quelques etapes.' : 'Mettez a jour les details et recalculez les montants.'}
            footer={
                <DrawerFooter
                    mode={mode}
                    step={step}
                    isSubmitting={isSubmitting}
                    stepValid={stepValid}
                    onOpenChange={onOpenChange}
                    onBack={handleStepBack}
                    onNext={handleStepForward}
                />
            }
        >
            <form id="contract-form" className="flex flex-col gap-3" onSubmit={handleSubmit}>
                <FormErrorSummary errors={displayErrors} />

                {mode === 'create' ? (
                    <div className="flex items-stretch w-full gap-0 pt-2 pb-4">
                        {createSteps.map((s, i) => {
                            const isCompleted = i < step;
                            const isCurrent = i === step;
                            const isPending = i > step;
                            const showConnector = i < createSteps.length - 1;
                            return (
                                <div key={s.key} className="flex-1 flex flex-col items-center relative min-w-0">
                                    <button type="button" onClick={() => {
                                        if (i < step) setStep(i);
                                        else if (i === step + 1 && stepValid) setStep(i);
                                    }} className="group relative z-10 flex flex-col items-center gap-1.5 transition hover:opacity-90">
                                        <span className={cn(
                                            'flex size-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-200 border-2',
                                            'group-hover:scale-110 group-hover:shadow-md',
                                            isCompleted && 'border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/20',
                                            isCurrent && 'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-foreground)] shadow-lg shadow-[var(--accent)]/20',
                                            isPending && 'border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-muted)]',
                                        )}>
                                            {isCompleted ? <IconCheck size={14} strokeWidth={3} /> : <span>{i + 1}</span>}
                                        </span>
                                        <span className={cn(
                                            'text-[10px] font-medium text-center leading-tight max-w-[80px] truncate',
                                            isCompleted && 'text-emerald-400',
                                            isCurrent && 'text-[var(--accent)] font-semibold',
                                            isPending && 'text-[var(--text-muted)]',
                                        )}>
                                            {s.label}
                                        </span>
                                    </button>
                                    {showConnector ? (
                                        <div className={cn(
                                            'absolute top-4 h-px z-0 rounded-full',
                                            isCompleted ? 'bg-emerald-500/40' : 'bg-[var(--border)]',
                                        )} style={{
                                            left: 'calc(50% + 16px)',
                                            width: 'calc(100% - 32px)',
                                        }} />
                                    ) : null}
                                </div>
                            );
                        })}
                    </div>
                ) : null}

                {stepContent}

                {mode === 'create' && stepHints.length > 0 ? (
                    <Card className="border border-[var(--border)] bg-[var(--surface-2)] p-3 shadow-none">
                        <div className="flex items-start gap-2">
                            <IconAlertCircle size={14} className="mt-0.5 shrink-0 text-[var(--accent)]" />
                            <div>
                                <p className="text-xs font-medium text-[var(--foreground)]">Champs requis pour continuer :</p>
                                <ul className="mt-1 space-y-0.5">
                                    {stepHints.map((hint, i) => (
                                        <li key={i} className="text-[10px] text-[var(--text-muted)]">• {hint}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </Card>
                ) : null}
            </form>
        </AppDrawer>
    );
}

/* ──── Sub-components ──── */
