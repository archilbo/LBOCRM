import { FormEvent, useEffect, useMemo, useState } from 'react';
import { IconFileText, IconMapPin, IconMessage2, IconRuler, IconStarFilled, IconUsers, IconX } from '@tabler/icons-react';

import { Autocomplete, EmptyState, Input, ListBox, SearchField, TextArea, useFilter } from '@heroui/react';
import { AppAutocomplete } from '@/components/ui/AppAutocomplete';
import { AppButton } from '@/components/ui/AppButton';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { DrawerField, DrawerSelect, DrawerSection, drawerStyles } from '@/components/drawers';
import type {
    City,
    ClientOption,
    DossierFormPayload,
    DossierLocationOptions,
    DossierRow,
} from '@/features/dossiers/types';
import type { FormErrors } from '@/lib/formErrors';
import { firstError } from '@/lib/formErrors';
import { dossierStatusOptions, dossierWorkflowOptions } from '@/config/statuses';
import { useTranslation } from '@/lib/i18n';

type ProjectDrawerProps = {
    isOpen: boolean;
    mode: 'create' | 'edit';
    dossier: DossierRow | null;
    clients: ClientOption[];
    intermediaries: ClientOption[];
    cities: City[];
    locationOptions?: DossierLocationOptions;
    initialClientId?: string;
    onOpenChange: (isOpen: boolean) => void;
    onSubmit: (payload: DossierFormPayload) => void;
    errors?: FormErrors;
};

const emptyForm: DossierFormPayload = {
    clientIds: [],
    primaryClientId: '',
    intermediaryId: '',
    cityId: '',
    projectObject: '',
    description: '',
    projectAddress: '',
    province: '',
    commune: '',
    landTitleNumber: '',
    landSurface: '',
    floorArea: '',
    status: 'opened',
    workflowStep: 'client',
    notes: '',
};

function stringValue(value: unknown): string {
    if (value === null || value === undefined) return '';
    return String(value);
}

type LocationAutocompleteProps = {
    value: string;
    onChange: (value: string) => void;
    options: string[];
    placeholder: string;
    createLabel: (value: string) => string;
};

function LocationAutocomplete({ value, onChange, options, placeholder, createLabel }: LocationAutocompleteProps) {
    const { contains } = useFilter({ sensitivity: 'base' });
    const [query, setQuery] = useState('');
    const values = useMemo(() => {
        const unique = new Map<string, string>();
        for (const option of [...options, value]) {
            const trimmed = option.trim();
            if (trimmed) unique.set(trimmed.toLocaleLowerCase(), trimmed);
        }
        return [...unique.values()];
    }, [options, value]);
    const customValue = query.trim();
    const isKnown = values.some((option) => option.localeCompare(customValue, undefined, { sensitivity: 'accent' }) === 0);

    return (
        <Autocomplete
            selectedKey={value || null}
            onSelectionChange={(key) => {
                onChange(String(key ?? ''));
                setQuery('');
            }}
            aria-label={placeholder}
        >
            <Autocomplete.Trigger className={drawerStyles.trigger}>
                <Autocomplete.Value className="flex-1 truncate text-xs text-[var(--foreground)] placeholder-shown:text-[var(--text-muted)]">
                    {({ isPlaceholder, selectedText }) => isPlaceholder ? placeholder : selectedText}
                </Autocomplete.Value>
                <Autocomplete.Indicator>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--text-muted)]">
                        <path d="m6 9 6 6 6-6" />
                    </svg>
                </Autocomplete.Indicator>
            </Autocomplete.Trigger>
            <Autocomplete.Popover className="z-[80] min-w-[var(--trigger-width)] rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-lg">
                <Autocomplete.Filter filter={contains}>
                    <SearchField autoFocus name="location-search" variant="secondary" value={query} onChange={setQuery}>
                        <SearchField.Group>
                            <SearchField.SearchIcon />
                            <SearchField.Input placeholder={placeholder} className="text-xs" />
                            <SearchField.ClearButton />
                        </SearchField.Group>
                    </SearchField>
                    <ListBox
                        className="max-h-56 overflow-y-auto p-1"
                        renderEmptyState={() => <EmptyState className="py-4 text-xs text-[var(--text-muted)]">Aucun résultat</EmptyState>}
                    >
                        {customValue && !isKnown ? (
                            <ListBox.Item
                                key={`create-${customValue}`}
                                id={customValue}
                                textValue={customValue}
                                className="flex cursor-pointer items-center rounded-lg px-2.5 py-2 text-xs font-medium text-[var(--accent)] outline-none transition hover:bg-[var(--accent)]/10"
                            >
                                {createLabel(customValue)}
                            </ListBox.Item>
                        ) : null}
                        {values.map((option) => (
                            <ListBox.Item
                                key={option}
                                id={option}
                                textValue={option}
                                className="flex cursor-pointer items-center rounded-lg px-2.5 py-2 text-xs text-[var(--foreground)] outline-none transition hover:bg-[var(--surface-2)] data-[selected=true]:bg-[var(--accent)]/10 data-[selected=true]:text-[var(--accent)]"
                            >
                                {option}
                                <ListBox.ItemIndicator />
                            </ListBox.Item>
                        ))}
                    </ListBox>
                </Autocomplete.Filter>
            </Autocomplete.Popover>
        </Autocomplete>
    );
}

export function ProjectDrawer({
    isOpen,
    mode,
    dossier,
    clients,
    intermediaries,
    cities = [],
    locationOptions = { provinces: [], communes: [] },
    initialClientId = '',
    onOpenChange,
    onSubmit,
    errors = {},
}: ProjectDrawerProps) {
    const { t } = useTranslation();
    const [form, setForm] = useState<DossierFormPayload>(emptyForm);
    const [clientPicker, setClientPicker] = useState('');

    const cityOptions = useMemo(() =>
        (cities ?? []).map((c) => ({ id: String(c.id), label: `${c.code} - ${c.name}` })),
    [cities]);
    const provinceOptions = useMemo(() => locationOptions.provinces ?? [], [locationOptions.provinces]);
    const communeOptions = useMemo(() => locationOptions.communes ?? [], [locationOptions.communes]);

    useEffect(() => {
        if (!isOpen) return;

        if (mode === 'edit' && dossier) {
            const current = dossier as unknown as Record<string, unknown>;
            const existingClients = Array.isArray(current.clients)
                ? current.clients.filter((client): client is Record<string, unknown> => Boolean(client) && typeof client === 'object')
                : [];
            const clientIds = existingClients.length > 0
                ? existingClients.map((client) => stringValue(client.id)).filter(Boolean)
                : [stringValue(current.clientId)].filter(Boolean);
            const primaryClientId = stringValue(current.primaryClientId)
                || stringValue(existingClients.find((client) => client.isPrimary === true)?.id)
                || clientIds[0]
                || '';
            setForm({
                clientIds,
                primaryClientId,
                intermediaryId: stringValue(current.intermediaryId),
                cityId: stringValue((current as Record<string, unknown>).city && typeof (current as Record<string, unknown>).city === 'object'
                    ? ((current as Record<string, unknown>).city as Record<string, unknown>).id ?? ''
                    : ''),
                projectObject: stringValue(current.projectObject),
                description: stringValue(current.description),
                projectAddress: stringValue(current.projectAddress || current.address || ''),
                province: stringValue(current.province),
                commune: stringValue(current.commune),
                landTitleNumber: stringValue(current.landTitleNumber),
                landSurface: stringValue(current.landSurface),
                floorArea: stringValue(current.floorArea),
                status: stringValue(current.status) || 'opened',
                workflowStep: stringValue(current.workflowStep) || 'client',
                notes: stringValue(current.notes),
            });
            setClientPicker('');
            return;
        }

        setForm({
            ...emptyForm,
            clientIds: initialClientId ? [initialClientId] : [],
            primaryClientId: initialClientId,
        });
        setClientPicker('');
    }, [dossier, initialClientId, isOpen, mode]);

    function updateField(field: keyof DossierFormPayload, value: string) {
        setForm((current) => ({ ...current, [field]: value }));
    }

    const selectedClients = useMemo(
        () => form.clientIds
            .map((id) => clients.find((client) => client.id === id))
            .filter((client): client is ClientOption => Boolean(client)),
        [clients, form.clientIds],
    );

    function addClient(clientId: string) {
        if (!clientId) return;

        setForm((current) => {
            if (current.clientIds.includes(clientId)) return current;

            return {
                ...current,
                clientIds: [...current.clientIds, clientId],
                primaryClientId: current.primaryClientId || clientId,
            };
        });
        setClientPicker('');
    }

    function removeClient(clientId: string) {
        setForm((current) => {
            const clientIds = current.clientIds.filter((id) => id !== clientId);

            return {
                ...current,
                clientIds,
                primaryClientId: current.primaryClientId === clientId ? (clientIds[0] ?? '') : current.primaryClientId,
            };
        });
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        onSubmit(form);
    }

    return (
        <AppDrawer
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            title={mode === 'create' ? t('dossiers.drawer.createTitle') : t('dossiers.drawer.editTitle')}
            description={
                mode === 'create'
                    ? t('dossiers.drawer.createDescription')
                    : t('dossiers.drawer.editDescription')
            }
            size="lg"
            placement="right"
            footer={
                <div className="flex w-full items-center justify-end gap-2">
                    <AppButton variant="light" onPress={() => onOpenChange(false)}>
                        {t('dossiers.drawer.cancel')}
                    </AppButton>
                    <AppButton variant="solid" color="primary" type="submit" form="project-form">
                        {t('dossiers.drawer.save')}
                    </AppButton>
                </div>
            }
        >
            <form
                id="project-form"
                className="min-w-0 space-y-4"
                onSubmit={handleSubmit}
            >
                <DrawerSection icon={<IconUsers size={12} />} title={t('dossiers.drawer.clientWorkflow')}>
                    <div className="flex flex-col gap-2">
                        <DrawerField label={t('dossiers.drawer.client')} error={firstError(errors, 'client_ids', 'primary_client_id')}>
                            <div className="space-y-2">
                                <AppAutocomplete
                                    value={clientPicker}
                                    onChange={addClient}
                                    options={clients.filter((client) => !form.clientIds.includes(client.id))}
                                    placeholder="Ajouter un client"
                                />
                                {selectedClients.length > 0 ? (
                                    <div className="space-y-1.5" aria-label="Clients sélectionnés">
                                        {selectedClients.map((client) => {
                                            const isPrimary = client.id === form.primaryClientId;

                                            return (
                                                <div key={client.id} className="flex min-w-0 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-2">
                                                    <IconUsers size={14} className="shrink-0 text-[var(--text-muted)]" aria-hidden />
                                                    <span className="min-w-0 flex-1 truncate text-xs font-medium text-[var(--foreground)]">{client.label}</span>
                                                    {isPrimary ? (
                                                        <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-[var(--accent)]/15 px-1.5 py-0.5 text-[10px] font-semibold text-[var(--accent)]">
                                                            <IconStarFilled size={11} aria-hidden /> Principal
                                                        </span>
                                                    ) : (
                                                        <AppButton
                                                            type="button"
                                                            size="sm"
                                                            variant="light"
                                                            className="shrink-0 text-[10px]"
                                                            onPress={() => setForm((current) => ({ ...current, primaryClientId: client.id }))}
                                                        >
                                                            Principal
                                                        </AppButton>
                                                    )}
                                                    <AppButton
                                                        type="button"
                                                        isIconOnly
                                                        compact
                                                        size="sm"
                                                        variant="light"
                                                        isDisabled={selectedClients.length === 1}
                                                        aria-label={`Retirer ${client.label}`}
                                                        tooltip={selectedClients.length === 1 ? 'Au moins un client est requis' : 'Retirer'}
                                                        onPress={() => removeClient(client.id)}
                                                    >
                                                        <IconX size={14} />
                                                    </AppButton>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-xs text-[var(--text-muted)]">Sélectionnez au moins un client.</p>
                                )}
                            </div>
                        </DrawerField>
                        <DrawerField label={t('dossiers.drawer.city')} error={firstError(errors, 'city_id')}>
                            <DrawerSelect
                                value={form.cityId}
                                onChange={(v) => updateField('cityId', v)}
                                options={cityOptions}
                                placeholder={t('dossiers.drawer.selectCity')}
                            />
                        </DrawerField>
                        <DrawerField label={t('clients.form.intermediaryName')} error={firstError(errors, 'intermediary_id')}>
                            <DrawerSelect
                                value={form.intermediaryId}
                                onChange={(v) => updateField('intermediaryId', v)}
                                options={intermediaries}
                                placeholder={t('clients.selectIntermediary')}
                            />
                        </DrawerField>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            <DrawerField label={t('dossiers.drawer.status')} error={firstError(errors, 'status')}>
                                <DrawerSelect
                                    value={form.status}
                                    onChange={(v) => updateField('status', v)}
                                    options={dossierStatusOptions}
                                    placeholder={t('dossiers.drawer.status')}
                                />
                            </DrawerField>
                            <DrawerField label={t('dossiers.drawer.workflowStep')} error={firstError(errors, 'workflow_step')}>
                                <DrawerSelect
                                    value={form.workflowStep}
                                    onChange={(v) => updateField('workflowStep', v)}
                                    options={dossierWorkflowOptions}
                                    placeholder={t('dossiers.drawer.workflowStep')}
                                />
                            </DrawerField>
                        </div>
                    </div>
                </DrawerSection>

                <DrawerSection icon={<IconFileText size={12} />} title={t('dossiers.drawer.projectInfo')}>
                    <div className="flex flex-col gap-2">
                        <DrawerField label={t('dossiers.drawer.projectObject')} error={firstError(errors, 'project_object')}>
                            <Input type="text" value={form.projectObject} onChange={(e) => updateField('projectObject', e.target.value)}
                                placeholder={t('dossiers.drawer.projectObject')} className={drawerStyles.input} />
                        </DrawerField>
                        <DrawerField label={t('dossiers.drawer.description')} error={firstError(errors, 'description')}>
                            <TextArea value={form.description} onChange={(e) => updateField('description', e.target.value)}
                                placeholder={t('dossiers.drawer.description')} className={drawerStyles.textarea} />
                        </DrawerField>
                    </div>
                </DrawerSection>

                <DrawerSection icon={<IconMapPin size={12} />} title={t('dossiers.drawer.location')}>
                    <div className="flex flex-col gap-2">
                        <DrawerField label={t('dossiers.drawer.address')} error={firstError(errors, 'project_address', 'address')}>
                            <Input type="text" value={form.projectAddress} onChange={(e) => updateField('projectAddress', e.target.value)}
                                placeholder={t('dossiers.drawer.address')} className={drawerStyles.input} />
                        </DrawerField>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            <DrawerField label={t('dossiers.drawer.province')} error={firstError(errors, 'province')}>
                                <LocationAutocomplete
                                    value={form.province}
                                    onChange={(value) => updateField('province', value)}
                                    options={provinceOptions}
                                    placeholder={t('dossiers.drawer.province')}
                                    createLabel={(value) => `Utiliser « ${value} »`}
                                />
                            </DrawerField>
                            <DrawerField label={t('dossiers.drawer.commune')} error={firstError(errors, 'commune')}>
                                <LocationAutocomplete
                                    value={form.commune}
                                    onChange={(value) => updateField('commune', value)}
                                    options={communeOptions}
                                    placeholder={t('dossiers.drawer.commune')}
                                    createLabel={(value) => `Utiliser « ${value} »`}
                                />
                            </DrawerField>
                        </div>
                    </div>
                </DrawerSection>

                <DrawerSection icon={<IconRuler size={12} />} title={t('dossiers.drawer.landSection')}>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <DrawerField label={t('dossiers.drawer.landTitleNumber')} error={firstError(errors, 'land_title_number')}>
                            <Input type="text" value={form.landTitleNumber} onChange={(e) => updateField('landTitleNumber', e.target.value)}
                                placeholder={t('dossiers.drawer.landTitleNumber')} className={drawerStyles.input} />
                        </DrawerField>
                        <DrawerField label={t('dossiers.drawer.landSurface')} error={firstError(errors, 'land_surface')}>
                            <Input type="text" value={form.landSurface} onChange={(e) => updateField('landSurface', e.target.value)}
                                placeholder={t('dossiers.drawer.landSurface')} className={drawerStyles.input} />
                        </DrawerField>
                        <DrawerField label={t('dossiers.drawer.floorArea')} error={firstError(errors, 'floor_area')}>
                            <Input type="text" value={form.floorArea} onChange={(e) => updateField('floorArea', e.target.value)}
                                placeholder={t('dossiers.drawer.floorArea')} className={drawerStyles.input} />
                        </DrawerField>
                    </div>
                </DrawerSection>

                <DrawerSection icon={<IconMessage2 size={12} />} title={t('dossiers.drawer.notes')}>
                    <DrawerField label={t('dossiers.drawer.notes')} error={firstError(errors, 'notes')}>
                        <TextArea value={form.notes} onChange={(e) => updateField('notes', e.target.value)}
                            placeholder={t('dossiers.drawer.notesPlaceholder')} className={drawerStyles.textarea} />
                    </DrawerField>
                </DrawerSection>
            </form>
        </AppDrawer>
    );
}
