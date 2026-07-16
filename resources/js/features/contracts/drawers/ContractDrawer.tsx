import { FormEvent, useEffect, useMemo, useState, useCallback } from 'react';
import {
    Autocomplete, Button, Card, Input, ListBox, Select, TextArea,
} from '@heroui/react';
import { Input as RacInput } from 'react-aria-components/Input';
import { ChevronDown, Check, ChevronLeft, ChevronRight, TriangleAlert, AlertCircle } from 'lucide-react';
import { AppDrawer } from '@/components/ui/AppDrawer';
import type {
    ContractClientOption, ContractDossierOption, ContractFormPayload, ContractRow,
} from '@/features/contracts/types';
import type { FormErrors } from '@/lib/formErrors';
import { firstError, hasErrors } from '@/lib/formErrors';
import { cn } from '@/lib/cn';
import { currencyFormat } from '@/lib/currency';

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

const fieldToStep: Record<string, number> = {
    dossier_id: 0,
    status: 0,
    client_id: 0,
    surface: 1,
    price_per_square_meter: 1,
    fee_rate_percent: 1,
    forfait_ttc: 1,
    calculation_mode: 1,
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
            if (!form.fee_rate_percent) hints.push('Selectionnez le taux d\'honoraires');
            return hints;
        }
    }
    return [];
}

function parseAmount(value: string): number {
    return Number(String(value || '0').replace(',', '.')) || 0;
}

function FormErrorSummary({ errors }: { errors?: FormErrors }) {
    if (!hasErrors(errors)) return null;
    const entries = Object.entries(errors ?? {});
    return (
        <Card className="border border-[color-mix(in_srgb,var(--danger)_35%,transparent)] bg-[color-mix(in_srgb,var(--danger)_8%,transparent)] p-4 shadow-none">
            <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] text-[var(--danger)]">
                    <TriangleAlert size={16} />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--danger)]">Veuillez verifier le formulaire</p>
                    <ul className="mt-2 space-y-1 text-sm text-[var(--text-muted)]">
                        {entries.slice(0, 8).map(([field, message]) => (
                            <li key={field}>
                                <span className="font-medium">{field.replaceAll('_', ' ')}:</span> {message}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </Card>
    );
}

const triggerClass = 'flex h-10 w-full min-w-0 items-center gap-2 rounded-[var(--radius-md)] border bg-[var(--surface)] px-3 text-sm text-[var(--foreground)] outline-none transition border-[var(--border)] hover:border-[var(--accent)] focus-visible:border-[var(--accent)]';

const popoverClass = 'z-[70] min-w-[var(--trigger-width)] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-lg';

const inputClass = 'mx-3 mt-3 flex h-9 w-[calc(100%-1.5rem)] rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm outline-none';

const itemClass = 'flex cursor-pointer items-center rounded-lg px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition hover:bg-[var(--surface-2)] data-[focus-visible]:bg-[var(--surface-2)] data-[selected]:bg-[var(--accent)]/10';

const inputBaseClass = 'h-10 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--foreground)] placeholder:text-[var(--text-muted)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--accent)_14%,transparent)] aria-invalid:border-[var(--danger)] aria-invalid:ring-4 aria-invalid:ring-[color-mix(in_srgb,var(--danger)_12%,transparent)]';

const textAreaBaseClass = 'min-h-28 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--text-muted)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--accent)_14%,transparent)] aria-invalid:border-[var(--danger)] aria-invalid:ring-4 aria-invalid:ring-[color-mix(in_srgb,var(--danger)_12%,transparent)]';

function ClientAutocomplete({
    selectedClientId, clients, clientQuery, onClientQueryChange, filteredClients,
    onSelect, onClear,
}: {
    selectedClientId: string | null;
    clients: ContractClientOption[];
    clientQuery: string;
    onClientQueryChange: (v: string) => void;
    filteredClients: ContractClientOption[];
    onSelect: (clientId: string) => void;
    onClear: () => void;
}) {
    return (
            <Autocomplete
                selectedKey={selectedClientId}
                onSelectionChange={(key) => {
                    if (key) onSelect(String(key));
                    else onClear();
                }}
                onClear={onClear}
                shouldCloseOnBlur={false}
            >
            <Autocomplete.Trigger className={triggerClass}>
                <Autocomplete.Value className="flex-1 text-sm text-[var(--foreground)]" />
                <Autocomplete.ClearButton className="mr-1.5" />
                <Autocomplete.Indicator>
                    <ChevronDown size={15} className="text-[var(--text-muted)]" />
                </Autocomplete.Indicator>
            </Autocomplete.Trigger>
            <Autocomplete.Popover isNonModal className={popoverClass}>
                <Autocomplete.Filter inputValue={clientQuery} onInputChange={onClientQueryChange}>
                    <RacInput
                        placeholder="Rechercher un client par nom ou CIN..."
                        className={inputClass}
                    />
                    <ListBox className="max-h-60 overflow-y-auto p-1">
                        {filteredClients.map((c) => (
                            <ListBox.Item
                                key={c.id}
                                id={c.id}
                                textValue={c.fullName}
                                className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition hover:bg-[var(--surface-2)] data-[focus-visible]:bg-[var(--surface-2)] data-[selected]:bg-[var(--accent)]/10"
                            >
                                <span className="truncate font-medium">{c.fullName}</span>
                                <span className="text-xs text-[var(--text-muted)]">{c.cin}</span>
                            </ListBox.Item>
                        ))}
                    </ListBox>
                </Autocomplete.Filter>
            </Autocomplete.Popover>
        </Autocomplete>
    );
}

function DossierAutocomplete({
    selectedKey, options, onSelectionChange, onClear, noClient,
}: {
    selectedKey: string | null;
    options: { id: string; label: string }[];
    query: string;
    onQueryChange: (v: string) => void;
    onSelectionChange: (key: string | null) => void;
    onClear: () => void;
    noClient: boolean;
}) {
    return (
        <Select
            selectedKey={selectedKey}
            onSelectionChange={(key) => onSelectionChange(key ? String(key) : null)}
            placeholder={noClient ? 'Selectionnez un client d abord' : 'Selectionner un dossier'}
            isDisabled={noClient}
            shouldCloseOnBlur={false}
        >
            <Select.Trigger className={triggerClass}>
                <Select.Value className="flex-1 truncate text-sm text-[var(--foreground)]" />
                <Select.Indicator>
                    <ChevronDown size={15} className="text-[var(--text-muted)]" />
                </Select.Indicator>
            </Select.Trigger>
            <Select.Popover isNonModal className={popoverClass}>
                <ListBox className="max-h-60 overflow-y-auto p-1">
                    {options.map((d) => (
                        <ListBox.Item
                            key={d.id}
                            id={d.id}
                            textValue={d.label}
                            className={itemClass}
                        >
                            {d.label}
                        </ListBox.Item>
                    ))}
                    {!noClient && options.length === 0 && (
                        <ListBox.Item
                            key="__empty__"
                            id="__empty__"
                            textValue="Aucun dossier"
                            className="flex cursor-pointer items-center rounded-lg px-3 py-2.5 text-sm text-[var(--text-muted)] outline-none"
                        >
                            Aucun dossier pour ce client
                        </ListBox.Item>
                    )}
                </ListBox>
            </Select.Popover>
        </Select>
    );
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
            <Select
                selectedKey={value || null}
                onSelectionChange={(k) => onChange((k ?? '') as T)}
                placeholder={placeholder || 'Selectionner...'}
                shouldCloseOnBlur={false}
            >
                <Select.Trigger
                    className={cn(
                        triggerClass,
                        error && 'border-[var(--danger)]',
                    )}
                >
                    <Select.Value className="flex-1 truncate text-left text-sm" />
                    <Select.Indicator>
                        <ChevronDown size={15} className="text-[var(--text-muted)]" />
                    </Select.Indicator>
                </Select.Trigger>
                <Select.Popover isNonModal className={popoverClass}>
                    <ListBox className="max-h-60 overflow-y-auto p-1">
                        {options.map((opt) => (
                            <ListBox.Item
                                key={opt.id}
                                id={opt.id}
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
                </Select.Popover>
            </Select>
            {error ? <p className="text-xs font-medium text-[var(--danger)]">{error}</p> : null}
        </div>
    );
}

function CalculationSummary({ estimation, ht, tva, ttc }: { estimation?: number; ht: number; tva: number; ttc: number }) {
    const items = estimation != null
        ? [
            { label: 'Estimation projet', value: currencyFormat(estimation), accent: false },
            { label: 'Honoraires HT', value: currencyFormat(ht), accent: false },
            { label: 'TVA 20%', value: currencyFormat(tva), accent: false },
            { label: 'TTC', value: currencyFormat(ttc), accent: true },
        ]
        : [
            { label: 'HT', value: currencyFormat(ht), accent: false },
            { label: 'TVA 20%', value: currencyFormat(tva), accent: false },
            { label: 'TTC', value: currencyFormat(ttc), accent: true },
        ];
    return (
        <Card className="mt-4 border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Resume</p>
            <div className={cn('grid gap-2', estimation != null ? 'grid-cols-4' : 'grid-cols-3')}>
                {items.map((item) => (
                    <Card key={item.label} className={cn(
                        'rounded-lg p-3 shadow-none',
                        item.accent ? 'bg-[color-mix(in_srgb,var(--accent)_9%,var(--surface-2))]' : 'bg-[var(--surface-2)]',
                    )}>
                        <p className={cn('text-[10px]', item.accent ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]')}>{item.label}</p>
                        <p className={cn('mt-0.5', item.accent ? 'text-base font-bold text-[var(--accent)]' : 'text-base font-semibold text-[var(--foreground)]')}>{item.value}</p>
                    </Card>
                ))}
            </div>
        </Card>
    );
}

export function ContractDrawer({
    isOpen, mode, contract, clients, dossiers,
    initialDossierId = '', onOpenChange, onSubmit, errors = {}, isSubmitting = false,
}: ContractDrawerProps) {
    const [form, setForm] = useState<ContractFormPayload>(emptyForm);
    const [step, setStep] = useState(0);
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
    const [clientQuery, setClientQuery] = useState('');
    const [dossierQuery, setDossierQuery] = useState('');

    const filteredClients = useMemo(() => {
        const q = clientQuery.trim().toLowerCase();
        if (!q) return clients;
        return clients.filter((c) =>
            c.fullName.toLowerCase().includes(q) || c.cin.toLowerCase().includes(q),
        );
    }, [clients, clientQuery]);

    const clientDossiers = useMemo(() => {
        const client = clients.find((c) => c.id === selectedClientId);
        return client?.dossiers ?? [];
    }, [clients, selectedClientId]);

    const dossierOptions = useMemo(() => {
        return clientDossiers.map((d) => ({
            id: d.id,
            label: d.label,
        }));
    }, [clientDossiers]);

    const filteredDossierOptions = useMemo(() => {
        const q = dossierQuery.trim().toLowerCase();
        if (!q) return dossierOptions;
        return dossierOptions.filter((d) => d.label.toLowerCase().includes(q));
    }, [dossierOptions, dossierQuery]);

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
                price_per_square_meter: contract.pricePerSquareMeter != null
                    ? String(contract.pricePerSquareMeter) : '',
                calculation_mode: contract.calculationMode || 'percentage',
                fee_rate_percent: contract.feeRatePercent != null
                    ? String(contract.feeRatePercent) : '',
                forfait_ttc: contract.forfaitTtc != null ? String(contract.forfaitTtc) : '',
                notes: contract.notes || '',
            });
            return;
        }
        setSelectedClientId(null);
        setForm({ ...emptyForm, dossier_id: initialDossierId });
    }, [contract, clients, initialDossierId, isOpen, mode]);

    useEffect(() => {
        if (!hasErrors(errors) || mode !== 'create') return;
        for (const field of Object.keys(errors)) {
            const errorStep = fieldToStep[field];
            if (errorStep !== undefined) {
                setStep(errorStep);
                return;
            }
        }
    }, [errors, mode]);

    const updateField = useCallback((field: keyof ContractFormPayload, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    }, []);

    const selectedDossierHasContract = useMemo(() => {
        if (mode !== 'create' || !form.dossier_id || !selectedClientId) return false;
        const client = clients.find((c) => c.id === selectedClientId);
        const dossier = client?.dossiers.find((d) => d.id === form.dossier_id);
        return dossier?.hasContract ?? false;
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
        return errors;
    }, [errors, selectedDossierHasContract]);

    const handleSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSubmit(form);
    }, [form, onSubmit]);

    const handleClientSelect = useCallback((clientId: string) => {
        const client = clients.find((c) => c.id === clientId);
        setSelectedClientId(clientId);
        setClientQuery(client?.fullName ?? '');
        setDossierQuery('');
        setForm((prev) => ({ ...prev, dossier_id: '' }));
    }, [clients]);

    const handleClearClient = useCallback(() => {
        setSelectedClientId(null);
        setClientQuery('');
        setDossierQuery('');
        setForm((prev) => ({ ...prev, dossier_id: '' }));
    }, []);

    const handleDossierSelect = useCallback((key: string | null) => {
        updateField('dossier_id', key ?? '');
    }, [updateField]);

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
                            <div className="flex min-w-0 flex-col gap-1.5">
                                <label className="text-xs font-semibold text-[var(--foreground)]">Client</label>
                                <ClientAutocomplete
                                    selectedClientId={selectedClientId}
                                    clients={clients}
                                    clientQuery={clientQuery}
                                    onClientQueryChange={setClientQuery}
                                    filteredClients={filteredClients}
                                    onSelect={handleClientSelect}
                                    onClear={handleClearClient}
                                />
                            </div>
                            <DossierAutocomplete
                                selectedKey={form.dossier_id || null}
                                options={filteredDossierOptions}
                                query={dossierQuery}
                                onQueryChange={setDossierQuery}
                                onSelectionChange={handleDossierSelect}
                                onClear={() => updateField('dossier_id', '')}
                                noClient={false}
                            />
                            <SelectField
                                label="Statut"
                                options={statusOptions}
                                value={form.status}
                                onChange={(v) => updateField('status', v)}
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
                            />
                            {isForfait ? (
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-[var(--foreground)]">FORFAIT TTC</label>
                                    <Input
                                        type="number" min="0" step="0.01"
                                        value={form.forfait_ttc}
                                        onChange={(e) => updateField('forfait_ttc', e.target.value)}
                                        aria-invalid={firstError(errors, 'forfait_ttc') ? true : undefined}
                                        className={inputBaseClass}
                                    />
                                    <p className="text-xs text-[var(--text-muted)]">Saisissez le montant TTC final. HT et TVA sont calcules automatiquement.</p>

                                </div>
                            ) : (
                                <>
                                    <SelectField
                                        label="Taux d'honoraires"
                                        options={feeRateOptions}
                                        value={form.fee_rate_percent}
                                        onChange={(v) => updateField('fee_rate_percent', v)}
                                    />
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-semibold text-[var(--foreground)]">Surface (m2)</label>
                                            <Input
                                                type="number" min="0" step="0.01"
                                                value={form.surface}
                                                onChange={(e) => updateField('surface', e.target.value)}
                                                aria-invalid={firstError(errors, 'surface') ? true : undefined}
                                                className={inputBaseClass}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-semibold text-[var(--foreground)]">Prix / m2</label>
                                            <Input
                                                type="number" min="0" step="0.01"
                                                value={form.price_per_square_meter}
                                                onChange={(e) => updateField('price_per_square_meter', e.target.value)}
                                                aria-invalid={firstError(errors, 'price_per_square_meter') ? true : undefined}
                                                className={inputBaseClass}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                        <CalculationSummary estimation={!isForfait ? estimation : undefined} ht={ht} tva={tva} ttc={ttc} />
                    </section>
                    <section>
                        <h3 className="mb-3 mt-6 flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
                            <span className="flex size-6 items-center justify-center rounded-md bg-[var(--accent)]/10 text-[11px] font-bold text-[var(--accent)]">3</span>
                            Notes
                        </h3>
                        <div className="flex flex-col gap-1.5">
                            <TextArea
                                value={form.notes}
                                onChange={(e) => updateField('notes', e.target.value)}
                                className={textAreaBaseClass}
                            />
                        </div>
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
                                <ClientAutocomplete
                                    selectedClientId={selectedClientId}
                                    clients={clients}
                                    clientQuery={clientQuery}
                                    onClientQueryChange={setClientQuery}
                                    filteredClients={filteredClients}
                                    onSelect={handleClientSelect}
                                    onClear={handleClearClient}
                                />
                            </div>
                            <DossierAutocomplete
                                selectedKey={selectedClientId ? (form.dossier_id || null) : null}
                                options={filteredDossierOptions}
                                query={dossierQuery}
                                onQueryChange={setDossierQuery}
                                onSelectionChange={handleDossierSelect}
                                onClear={() => updateField('dossier_id', '')}
                                noClient={!selectedClientId}
                            />
                            <SelectField
                                label="Statut"
                                options={statusOptions}
                                value={form.status}
                                onChange={(v) => updateField('status', v)}
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
                            />
                            {isForfait ? (
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-[var(--foreground)]">FORFAIT TTC</label>
                                    <Input
                                        type="number" min="0" step="0.01"
                                        value={form.forfait_ttc}
                                        onChange={(e) => updateField('forfait_ttc', e.target.value)}
                                        aria-invalid={firstError(errors, 'forfait_ttc') ? true : undefined}
                                        className={inputBaseClass}
                                    />
                                    <p className="text-xs text-[var(--text-muted)]">Saisissez le montant TTC final. HT et TVA sont calcules automatiquement.</p>

                                </div>
                            ) : (
                                <>
                                    <SelectField
                                        label="Taux d'honoraires"
                                        options={feeRateOptions}
                                        value={form.fee_rate_percent}
                                        onChange={(v) => updateField('fee_rate_percent', v)}
                                    />
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-semibold text-[var(--foreground)]">Surface (m2)</label>
                                            <Input
                                                type="number" min="0" step="0.01"
                                                value={form.surface}
                                                onChange={(e) => updateField('surface', e.target.value)}
                                                aria-invalid={firstError(errors, 'surface') ? true : undefined}
                                                className={inputBaseClass}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-semibold text-[var(--foreground)]">Prix / m2</label>
                                            <Input
                                                type="number" min="0" step="0.01"
                                                value={form.price_per_square_meter}
                                                onChange={(e) => updateField('price_per_square_meter', e.target.value)}
                                                aria-invalid={firstError(errors, 'price_per_square_meter') ? true : undefined}
                                                className={inputBaseClass}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                        <CalculationSummary estimation={!isForfait ? estimation : undefined} ht={ht} tva={tva} ttc={ttc} />
                    </section>
                );
            case 2:
                return (
                    <section>
                        <h3 className="mb-3 text-sm font-semibold text-[var(--foreground)]">Revisez et confirmez</h3>
                        <div className="mb-4 space-y-3">
                            {[
                                { label: 'Projet', value: dossiers.find((d) => d.id === form.dossier_id)?.label || form.dossier_id || '-' },
                                { label: 'Statut', value: form.status, capitalize: true },
                                { label: 'Mode', value: isForfait ? 'Forfait' : 'Pourcentage', capitalize: false },
                                ...(isForfait
                                    ? [{ label: 'Montant FORFAIT TTC', value: form.forfait_ttc ? currencyFormat(Number(form.forfait_ttc)) : '-' }]
                                    : [
                                        { label: 'Taux honoraires', value: `${form.fee_rate_percent}%` },
                                        { label: 'Surface', value: form.surface ? `${form.surface} m²` : '-' },
                                        { label: 'Prix / m2', value: form.price_per_square_meter ? currencyFormat(Number(form.price_per_square_meter)) : '-' },
                                    ]
                                ),
                            ].flat().map((row: { label: string; value: string; capitalize?: boolean }) => (
                                <Card key={row.label} className="flex items-center justify-between border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 shadow-none">
                                    <span className="text-xs text-[var(--text-muted)]">{row.label}</span>
                                    <span className={cn('text-[13px] font-medium text-[var(--foreground)]', row.capitalize && 'capitalize')}>{row.value}</span>
                                </Card>
                            ))}
                        </div>
                        <CalculationSummary estimation={!isForfait ? estimation : undefined} ht={ht} tva={tva} ttc={ttc} />
                        <div className="mt-4 flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-[var(--foreground)]">Notes</label>
                            <TextArea
                                value={form.notes}
                                onChange={(e) => updateField('notes', e.target.value)}
                                className={textAreaBaseClass}
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
                    <Button variant="solid" color="primary" onPress={() => setStep((s) => s + 1)} isDisabled={isSubmitting || !stepValid}>
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
                                    <button type="button" onClick={() => setStep(i)} className="group relative z-10 flex flex-col items-center gap-1.5 transition hover:opacity-90">
                                        <span className={cn(
                                            'flex size-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-200 border-2',
                                            'group-hover:scale-110 group-hover:shadow-md',
                                            isCompleted && 'border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/20',
                                            isCurrent && 'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-foreground)] shadow-lg shadow-[var(--accent)]/20',
                                            isPending && 'border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-muted)]',
                                        )}>
                                            {isCompleted ? <Check size={14} strokeWidth={3} /> : <span>{i + 1}</span>}
                                        </span>
                                        <span className={cn(
                                            'text-[11px] font-medium text-center leading-tight max-w-[80px] truncate',
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

                {stepContent()}

                {mode === 'create' && stepHints.length > 0 ? (
                    <Card className="border border-[var(--border)] bg-[var(--surface-2)] p-3 shadow-none">
                        <div className="flex items-start gap-2">
                            <AlertCircle size={14} className="mt-0.5 shrink-0 text-[var(--accent)]" />
                            <div>
                                <p className="text-xs font-medium text-[var(--foreground)]">Champs requis pour continuer :</p>
                                <ul className="mt-1 space-y-0.5">
                                    {stepHints.map((hint, i) => (
                                        <li key={i} className="text-[11px] text-[var(--text-muted)]">• {hint}</li>
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
