import { useEffect, useMemo } from 'react';
import { Card, ListBox, Select } from '@heroui/react';
import { AlertTriangle, User } from 'lucide-react';
import type { ClientOption, DossierOption } from '@/features/finance/types';

type FinanceClientDossierFieldsProps = {
    clientId: string;
    dossierId: string;
    clients: ClientOption[];
    dossiers: DossierOption[];
    onClientChange: (clientId: string) => void;
    onDossierChange: (dossierId: string) => void;
    disabled?: boolean;
    restrictedDossierIds?: string[];
};

const labelCls = 'text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-subtle)]';
const compactTrigger = 'flex h-8 w-full min-w-0 items-center gap-2 rounded-[var(--radius-md)] border bg-[var(--surface)] px-2.5 text-xs text-[var(--foreground)] outline-none transition border-[var(--border)] hover:border-[var(--accent)] focus-visible:border-[var(--accent)]';
const compactItem = 'flex cursor-pointer items-center rounded-lg px-2.5 py-2 text-xs text-[var(--foreground)] outline-none transition hover:bg-[var(--surface-2)] data-[focus-visible]:bg-[var(--surface-2)] data-[selected]:bg-[var(--accent)]/10';
const compactPopover = 'z-[70] min-w-[var(--trigger-width)] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-lg';

export function FinanceClientDossierFields({
    clientId, dossierId, clients, dossiers, onClientChange, onDossierChange, disabled = false, restrictedDossierIds = [],
}: FinanceClientDossierFieldsProps) {
    const selectedDossier = useMemo(
        () => dossiers.find((d) => d.id === dossierId) || null,
        [dossiers, dossierId],
    );

    useEffect(() => {
        if (selectedDossier?.clientId && selectedDossier.clientId !== clientId) {
            onClientChange(selectedDossier.clientId);
        }
    }, [clientId, onClientChange, selectedDossier]);

    const hasNoDossiers = Boolean(clientId) && dossiers.length === 0;
    const isDossierRestricted = Boolean(dossierId) && restrictedDossierIds.includes(dossierId);

    useEffect(() => {
        if (clientId && dossierId && !dossiers.some((d) => d.id === dossierId && d.clientId === clientId)) {
            onDossierChange('');
        }
    }, [clientId, dossierId, dossiers, onDossierChange]);

    const dossierDisabled = disabled || hasNoDossiers || isDossierRestricted;

    return (
            <Card className="p-3 space-y-3">
            <div className="flex items-center gap-1.5 mb-2"><User size={13} className="text-[var(--text-subtle)]" /><p className={labelCls}>Client & dossier</p></div>
            <div className="grid gap-2 lg:grid-cols-2">
                <div className="flex min-w-0 flex-col gap-1">
                    <label className={labelCls}>Client</label>
                    <Select
                        placeholder="Selectionner un client"
                        selectedKey={clientId || null}
                        isDisabled={disabled}
                        onSelectionChange={(key) => { onClientChange(key != null ? String(key) : ''); }}
                    >
                        <Select.Trigger className={compactTrigger}><Select.Value className="flex-1 text-xs text-[var(--foreground)]" /><Select.Indicator /></Select.Trigger>
                        <Select.Popover className={compactPopover}><ListBox className="p-1 gap-0">
                            {clients.map((c) => (
                                <ListBox.Item key={c.id} id={c.id} textValue={c.label} className={compactItem}>{c.label}</ListBox.Item>
                            ))}
                        </ListBox></Select.Popover>
                    </Select>
                </div>
                <div className="flex min-w-0 flex-col gap-1">
                    <label className={labelCls}>Dossier</label>
                    <Select
                        key={clientId || 'empty'}
                        placeholder={hasNoDossiers ? 'Aucun dossier pour ce client' : 'Selectionner un dossier'}
                        selectedKey={dossierId || null}
                        isDisabled={dossierDisabled}
                        onSelectionChange={(key) => { onDossierChange(key != null ? String(key) : ''); }}
                    >
                        <Select.Trigger className={compactTrigger}><Select.Value className="flex-1 text-xs text-[var(--foreground)]" /><Select.Indicator /></Select.Trigger>
                        <Select.Popover className={compactPopover}><ListBox className="p-1 gap-0">
                            {dossiers.map((d) => (
                                <ListBox.Item key={d.id} id={d.id} textValue={d.label} className={compactItem}>{d.label}</ListBox.Item>
                            ))}
                        </ListBox></Select.Popover>
                    </Select>
                </div>
            </div>
            {hasNoDossiers ? (
                <Card className="border border-amber-400/30 bg-amber-400/10 p-3 shadow-none">
                    <div className="flex items-start gap-2">
                        <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-400" />
                        <p className="text-xs text-amber-100">Ce client n&apos;a aucun dossier. Créez d&apos;abord un dossier avant de créer un document financier.</p>
                    </div>
                </Card>
            ) : isDossierRestricted ? (
                <Card className="border border-red-400/30 bg-red-400/10 p-3 shadow-none">
                    <div className="flex items-start gap-2">
                        <AlertTriangle size={14} className="mt-0.5 shrink-0 text-red-400" />
                        <p className="text-xs text-red-100">Ce dossier a déjà un devis ou une facture. Un seul document financier par dossier est autorisé.</p>
                    </div>
                </Card>
            ) : selectedDossier ? (
                <div className="grid gap-2 text-[11px] text-[var(--text-muted)] sm:grid-cols-3">
                    <p><span className="font-semibold text-[var(--text)]">Projet:</span> {selectedDossier.projectObject || '-'}</p>
                    <p><span className="font-semibold text-[var(--text)]">Adresse:</span> {selectedDossier.address || '-'}</p>
                    <p><span className="font-semibold text-[var(--text)]">Surface:</span> {selectedDossier.floorArea || selectedDossier.landSurface || '-'} m2</p>
                </div>
            ) : null}
        </Card>
    );
}
