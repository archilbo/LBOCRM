import { FormEvent, useMemo, useState, useEffect, useCallback } from 'react';
import { Button, Drawer, Input, ListBox, Textarea } from '@heroui/react';
import {
    DrawerBody, DrawerCloseTrigger, DrawerContent,
    DrawerDialog, DrawerFooter, DrawerHeader, DrawerHeading,
} from '@heroui/react';
import {
    SelectRoot, SelectTrigger, SelectValue, SelectIndicator, SelectPopover,
} from '@heroui/react';
import { ChevronDown, Check, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { AppFormErrorSummary } from '@/components/ui/AppFormErrorSummary';
import type {
    ContractClientOption, ContractDossierOption, ContractFormPayload, ContractRow,
} from '@/features/contracts/types';
import type { FormErrors } from '@/lib/formErrors';
import { firstError } from '@/lib/formErrors';
import { cn } from '@/lib/cn';

type ContractDrawerProps = {
    isOpen: boolean;
    mode: 'create' | 'edit';
    contract: ContractRow | null;
    clients: ContractClientOption[];
    dossiers: ContractDossierOption[];
    initialDossierId?: string;
    onOpenChange: (isOpen: boolean) => void;
    onSubmit: (payload: ContractFormPayload) => void;
    errors?: FormErrors;
    isSubmitting?: boolean;
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
    { key: 'project', label: 'Client & Projet' },
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

function SelectField<T extends string>({
    label, options, value, onChange, error, placeholder,
}: {
    label: string; options: { id: T; label: string }[]; value: T | ''; onChange: (v: T) => void;
    error?: string; placeholder?: string;
}) {
    return (
        <div className="flex min-w-0 flex-col gap-1.5">
            {label ? <label className="text-xs font-semibold text-[var(--foreground)]">{label}</label> : null}
            <SelectRoot
                selectedKey={value || null}
                onSelectionChange={(k) => onChange((k ?? '') as T)}
            >
                <SelectTrigger
                    className={cn(
                        'flex h-10 w-full min-w-0 items-center gap-2 rounded-[var(--radius-md)] border bg-[var(--surface)] px-3 text-sm text-[var(--foreground)] outline-none transition',
                        'border-[var(--border)] hover:border-[var(--accent)] focus-visible:border-[var(--accent)]',
                        error && 'border-[var(--danger)]',
                    )}
                >
                    <SelectValue className="flex-1 truncate text-left text-sm">
                        {({ selectedText }) => (
                            <span className={cn(!selectedText && 'text-[var(--text-muted)]')}>
                                {selectedText || placeholder || 'Selectionner...'}
                            </span>
                        )}
                    </SelectValue>
                    <SelectIndicator>
                        <ChevronDown size={15} className="text-[var(--text-muted)]" />
                    </SelectIndicator>
                </SelectTrigger>
                <SelectPopover className="z-50 min-w-[var(--trigger-width)] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-lg">
                    <ListBox className="max-h-60 overflow-y-auto p-1">
                        {options.map((opt) => (
                            <ListBox.Item
                                key={opt.id}
                                textValue={opt.label}
                                className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--foreground)] outline-none transition hover:bg-[var(--surface-2)] data-[focus-visible]:bg-[var(--surface-2)] data-[selected]:bg-[var(--accent)]/10 data-[selected]:text-[var(--accent)]"
                            >
                                <span className="flex-1 truncate">{opt.label}</span>
                                <ListBox.Item.Indicator>
                                    <Check size={14} className="text-[var(--accent)]" />
                                </ListBox.Item.Indicator>
                            </ListBox.Item>
                        ))}
                    </ListBox>
                </SelectPopover>
            </SelectRoot>
            {error ? <p className="text-xs font-medium text-[var(--danger)]">{error}</p> : null}
        </div>
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

export function ContractDrawer({
    isOpen, mode, contract, clients, dossiers,
    initialDossierId = '', onOpenChange, onSubmit, errors = {}, isSubmitting = false,
}: ContractDrawerProps) {
    const [form, setForm] = useState<ContractFormPayload>(emptyForm);
    const [step, setStep] = useState(0);
    const [clientSearch, setClientSearch] = useState('');
    const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

    const filteredClients = useMemo(() => {
        const q = clientSearch.toLowerCase().trim();
        if (!q) return clients;
        return clients.filter(
            (c) => c.fullName.toLowerCase().includes(q) || c.cin.toLowerCase().includes(q),
        );
    }, [clients, clientSearch]);

    const clientDossiers = useMemo(() => {
        const client = clients.find((c) => c.id === selectedClientId);
        return client?.dossiers ?? [];
    }, [clients, selectedClientId]);

    const dossierOptions = useMemo(() => {
        const source = mode === 'create' ? clientDossiers : dossiers;
        return source.map((d) => ({
            id: d.id,
            label: mode === 'create'
                ? d.label
                : d.label + ' - ' + (clients.find((c) => c.dossiers.some((cd) => cd.id === d.id))?.fullName ?? ''),
        }));
    }, [mode, clientDossiers, dossiers, clients]);

    useEffect(() => {
        if (!isOpen) { setStep(0); setClientSearch(''); setSelectedClientId(null); return; }
        if (mode === 'edit' && contract) {
            const client = clients.find((c) =>
                c.dossiers.some((d) => d.id === contract.dossierId),
            );
            setSelectedClientId(client?.id ?? null);
            setForm({
                dossier_id: contract.dossierId || '',
                status: contract.status || 'draft',
                surface: contract.surface ? String(contract.surface) : '',
                price_per_square_meter: contract.pricePerSquareMeter
                    ? String(contract.pricePerSquareMeter) : '900',
                calculation_mode: contract.calculationMode || 'percentage',
                fee_rate_percent: contract.feeRatePercent
                    ? String(contract.feeRatePercent) : '0.5',
                forfait_ttc: contract.forfaitTtc ? String(contract.forfaitTtc) : '',
                notes: contract.notes || '',
            });
            return;
        }
        setSelectedClientId(null);
        setForm({ ...emptyForm, dossier_id: initialDossierId });
    }, [contract, clients, initialDossierId, isOpen, mode]);

    const updateField = useCallback((field: keyof ContractFormPayload, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    }, []);

    const isForfait = form.calculation_mode === 'forfait';
    const surface = parseAmount(form.surface);
    const pricePerSquareMeter = parseAmount(form.price_per_square_meter);
    const estimation = surface * pricePerSquareMeter;
    const ht = isForfait ? parseAmount(form.forfait_ttc) / 1.2 : estimation * (parseAmount(form.fee_rate_percent) / 100);
    const tva = isForfait ? parseAmount(form.forfait_ttc) - ht : ht * 0.2;
    const ttc = isForfait ? parseAmount(form.forfait_ttc) : ht + tva;

    const handleSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSubmit(form);
    }, [form, onSubmit]);

    const handleClientSelect = useCallback((client: ContractClientOption) => {
        setSelectedClientId(client.id);
        setClientSearch(client.fullName);
        setForm((prev) => ({ ...prev, dossier_id: '' }));
    }, []);

    const handleClearClient = useCallback(() => {
        setSelectedClientId(null);
        setClientSearch('');
        setForm((prev) => ({ ...prev, dossier_id: '' }));
    }, []);

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
                            <Input
                                label="Client"
                                value={clientSearch}
                                onValueChange={(v) => { setClientSearch(v); setSelectedClientId(null); setForm((p) => ({ ...p, dossier_id: '' })); }}
                                placeholder="Rechercher un client..."
                                startContent={<Search size={15} className="text-[var(--text-muted)]" />}
                                isInvalid={Boolean(firstError(errors, 'dossier_id'))}
                                errorMessage={firstError(errors, 'dossier_id')}
                                className="[&_input]:text-sm"
                            />
                            {selectedClientId && filteredClients.length > 0 ? (
                                <div className="-mt-2 flex flex-wrap gap-1.5">
                                    {filteredClients
                                        .filter((c) => c.id === selectedClientId)
                                        .map((c) => (
                                            <span key={c.id} className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)]/10 px-2.5 py-1 text-xs font-medium text-[var(--accent)]">
                                                {c.fullName}
                                                <button type="button" onClick={handleClearClient} className="ml-0.5 hover:text-[var(--danger)]">&times;</button>
                                            </span>
                                        ))}
                                </div>
                            ) : null}
                            <SelectField
                                label="Dossier / Projet"
                                placeholder="Selectionner un dossier"
                                options={dossierOptions.filter((d) =>
                                    !selectedClientId || clientDossiers.some((cd) => cd.id === d.id),
                                )}
                                value={form.dossier_id}
                                onChange={(v) => updateField('dossier_id', v)}
                                error={firstError(errors, 'dossier_id')}
                            />
                            <SelectField
                                label="Statut"
                                options={statusOptions}
                                value={form.status}
                                onChange={(v) => updateField('status', v)}
                                error={firstError(errors, 'status')}
                            />
                        </div>
                    </section>
                    <section>
                        <h3 className="mb-3 mt-6 flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
                            <span className="flex size-6 items-center justify-center rounded-md bg-[var(--accent)]/10 text-[11px] font-bold text-[var(--accent)]">2</span>
                            Calcul des honoraires
                        </h3>
                        <div className="grid gap-4">
                            <SelectField
                                label="Mode de calcul"
                                options={calculationModeOptions}
                                value={form.calculation_mode}
                                onChange={(v) => updateField('calculation_mode', v)}
                                error={firstError(errors, 'calculation_mode')}
                            />
                            {isForfait ? (
                                <Input
                                    label="FORFAIT TTC" type="number" min="0" step="0.01"
                                    value={form.forfait_ttc}
                                    onValueChange={(v) => updateField('forfait_ttc', v)}
                                    description="Saisissez le montant TTC final. HT et TVA sont calcules automatiquement."
                                    isInvalid={Boolean(firstError(errors, 'forfait_ttc'))}
                                    errorMessage={firstError(errors, 'forfait_ttc')}
                                />
                            ) : (
                                <SelectField
                                    label="Taux d'honoraires"
                                    options={feeRateOptions}
                                    value={form.fee_rate_percent}
                                    onChange={(v) => updateField('fee_rate_percent', v)}
                                    error={firstError(errors, 'fee_rate_percent')}
                                />
                            )}
                        </div>
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <Input
                                label="Surface (m2)" type="number" min="0" step="0.01"
                                value={form.surface}
                                onValueChange={(v) => updateField('surface', v)}
                                isInvalid={Boolean(firstError(errors, 'surface'))}
                                errorMessage={firstError(errors, 'surface')}
                            />
                            <Input
                                label="Prix / m2" type="number" min="0" step="0.01"
                                value={form.price_per_square_meter}
                                onValueChange={(v) => updateField('price_per_square_meter', v)}
                                isInvalid={Boolean(firstError(errors, 'price_per_square_meter'))}
                                errorMessage={firstError(errors, 'price_per_square_meter')}
                            />
                        </div>
                        <CalculationSummary ht={ht} tva={tva} ttc={ttc} />
                    </section>
                    <section>
                        <h3 className="mb-3 mt-6 flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
                            <span className="flex size-6 items-center justify-center rounded-md bg-[var(--accent)]/10 text-[11px] font-bold text-[var(--accent)]">3</span>
                            Notes
                        </h3>
                        <Textarea
                            label="Notes"
                            value={form.notes}
                            onValueChange={(v) => updateField('notes', v)}
                            isInvalid={Boolean(firstError(errors, 'notes'))}
                            errorMessage={firstError(errors, 'notes')}
                        />
                    </section>
                </>
            );
        }

        switch (step) {
            case 0:
                return (
                    <section>
                        <h3 className="mb-3 text-sm font-semibold text-[var(--foreground)]">Selectionnez le client et le projet</h3>
                        <div className="grid gap-4">
                            <div className="flex min-w-0 flex-col gap-1.5">
                                <label className="text-xs font-semibold text-[var(--foreground)]">Client</label>
                                <div className="relative">
                                    <Input
                                        value={clientSearch}
                                        onValueChange={(v) => { setClientSearch(v); setSelectedClientId(null); setForm((p) => ({ ...p, dossier_id: '' })); }}
                                        placeholder="Rechercher un client par nom ou CIN..."
                                        startContent={<Search size={15} className="text-[var(--text-muted)]" />}
                                        className="[&_input]:text-sm"
                                    />
                                    {clientSearch && filteredClients.length > 0 && !selectedClientId ? (
                                        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-lg">
                                            {filteredClients.map((c) => (
                                                <button
                                                    key={c.id}
                                                    type="button"
                                                    onClick={() => handleClientSelect(c)}
                                                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-[var(--foreground)] transition hover:bg-[var(--surface-2)]"
                                                >
                                                    <span className="flex size-8 items-center justify-center rounded-full bg-[var(--accent)]/10 text-xs font-bold text-[var(--accent)]">
                                                        {c.fullName.charAt(0).toUpperCase()}
                                                    </span>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate font-medium">{c.fullName}</p>
                                                        <p className="truncate text-xs text-[var(--text-muted)]">{c.cin}</p>
                                                    </div>
                                                    <span className="text-xs text-[var(--text-muted)]">
                                                        {c.dossiers.length} dossier{c.dossiers.length !== 1 ? 's' : ''}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    ) : null}
                                    {selectedClientId ? (
                                        <div className="-mt-2 flex flex-wrap gap-1.5">
                                            {filteredClients
                                                .filter((c) => c.id === selectedClientId)
                                                .map((c) => (
                                                    <span key={c.id} className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)]/10 px-2.5 py-1 text-xs font-medium text-[var(--accent)]">
                                                        {c.fullName}
                                                        <button type="button" onClick={handleClearClient} className="ml-0.5 hover:text-[var(--danger)]">&times;</button>
                                                    </span>
                                                ))}
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                            <SelectField
                                label="Dossier / Projet"
                                placeholder={selectedClientId ? 'Selectionner un dossier' : 'Selectionnez un client d abord'}
                                options={dossierOptions}
                                value={selectedClientId ? form.dossier_id : ''}
                                onChange={(v) => updateField('dossier_id', v)}
                                error={firstError(errors, 'dossier_id')}
                            />
                            <SelectField
                                label="Statut"
                                options={statusOptions}
                                value={form.status}
                                onChange={(v) => updateField('status', v)}
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
                            <SelectField
                                label="Mode de calcul"
                                options={calculationModeOptions}
                                value={form.calculation_mode}
                                onChange={(v) => updateField('calculation_mode', v)}
                                error={firstError(errors, 'calculation_mode')}
                            />
                            {isForfait ? (
                                <Input
                                    label="FORFAIT TTC" type="number" min="0" step="0.01"
                                    value={form.forfait_ttc}
                                    onValueChange={(v) => updateField('forfait_ttc', v)}
                                    description="Saisissez le montant TTC final. HT et TVA sont calcules automatiquement."
                                    isInvalid={Boolean(firstError(errors, 'forfait_ttc'))}
                                    errorMessage={firstError(errors, 'forfait_ttc')}
                                />
                            ) : (
                                <SelectField
                                    label="Taux d'honoraires"
                                    options={feeRateOptions}
                                    value={form.fee_rate_percent}
                                    onChange={(v) => updateField('fee_rate_percent', v)}
                                    error={firstError(errors, 'fee_rate_percent')}
                                />
                            )}
                        </div>
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <Input
                                label="Surface (m2)" type="number" min="0" step="0.01"
                                value={form.surface}
                                onValueChange={(v) => updateField('surface', v)}
                                isInvalid={Boolean(firstError(errors, 'surface'))}
                                errorMessage={firstError(errors, 'surface')}
                            />
                            <Input
                                label="Prix / m2" type="number" min="0" step="0.01"
                                value={form.price_per_square_meter}
                                onValueChange={(v) => updateField('price_per_square_meter', v)}
                                isInvalid={Boolean(firstError(errors, 'price_per_square_meter'))}
                                errorMessage={firstError(errors, 'price_per_square_meter')}
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
                                    {dossiers.find((d) => d.id === form.dossier_id)?.label || form.dossier_id || '-'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2">
                                <span className="text-xs text-[var(--text-muted)]">Statut</span>
                                <span className="text-[13px] font-medium capitalize text-[var(--foreground)]">{form.status}</span>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2">
                                <span className="text-xs text-[var(--text-muted)]">Mode</span>
                                <span className="text-[13px] font-medium capitalize text-[var(--foreground)]">{form.calculation_mode}</span>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2">
                                <span className="text-xs text-[var(--text-muted)]">Surface</span>
                                <span className="text-[13px] font-medium text-[var(--foreground)]">{form.surface || '-'} m&sup2;</span>
                            </div>
                        </div>
                        <CalculationSummary ht={ht} tva={tva} ttc={ttc} />
                        <div className="mt-4">
                            <Textarea
                                label="Notes"
                                value={form.notes}
                                onValueChange={(v) => updateField('notes', v)}
                                isInvalid={Boolean(firstError(errors, 'notes'))}
                                errorMessage={firstError(errors, 'notes')}
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
                    <Button variant="bordered" color="default" onPress={() => onOpenChange(false)} isDisabled={isSubmitting}>
                        Annuler
                    </Button>
                    <Button variant="solid" color="primary" type="submit" form="contract-form" isLoading={isSubmitting}>
                        Enregistrer
                    </Button>
                </>
            );
        }
        return (
            <>
                {step > 0 ? (
                    <Button variant="bordered" color="default" onPress={() => setStep((s) => s - 1)} isDisabled={isSubmitting}>
                        <ChevronLeft size={15} /> Retour
                    </Button>
                ) : <div />}
                {step === createSteps.length - 1 ? (
                    <Button variant="solid" color="primary" type="submit" form="contract-form" isLoading={isSubmitting}>
                        <Check size={15} /> {isSubmitting ? 'Creation...' : 'Creer le contrat'}
                    </Button>
                ) : (
                    <Button variant="solid" color="primary" onPress={() => setStep((s) => s + 1)} isDisabled={isSubmitting}>
                        Suivant <ChevronRight size={15} />
                    </Button>
                )}
            </>
        );
    };

    return (
        <Drawer.Backdrop isOpen={isOpen} onOpenChange={onOpenChange} isDismissable>
            <DrawerContent>
                <DrawerDialog className="flex h-full flex-col outline-none">
                    <DrawerHeader className="flex items-start justify-between gap-4 border-b border-[var(--border)] px-5 py-4">
                        <div className="min-w-0">
                            <DrawerHeading className="text-base font-semibold text-[var(--foreground)]">
                                {mode === 'create' ? 'Nouveau contrat' : 'Modifier le contrat'}
                            </DrawerHeading>
                            <p className="mt-1 text-sm text-[var(--text-muted)]">
                                {mode === 'create' ? 'Configurez un nouveau contrat en quelques etapes.' : 'Mettez a jour les details et recalculez les montants.'}
                            </p>
                        </div>
                        <DrawerCloseTrigger />
                    </DrawerHeader>

                    <DrawerBody className="flex-1 overflow-y-auto px-5 py-5">
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
                    </DrawerBody>

                    <DrawerFooter className="flex items-center justify-end gap-2 border-t border-[var(--border)] px-5 py-4">
                        {drawerFooter()}
                    </DrawerFooter>
                </DrawerDialog>
            </DrawerContent>
        </Drawer.Backdrop>
    );
}
