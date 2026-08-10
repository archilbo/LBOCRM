import { IconAlertTriangle, IconCalendarDue, IconCash, IconChevronRight, IconClock, IconUser } from '@tabler/icons-react';

import { AppButton } from '@/components/ui/AppButton';
import { AppFilterTabs } from '@/components/ui/AppFilterTabs';
import { AppKpiCard } from '@/components/ui/AppKpiCard';
import { AppPagination } from '@/components/ui/AppPagination';
import { AppSearchInput } from '@/components/ui/AppSearchInput';
import { AppWorkspaceTable } from '@/components/ui/AppWorkspaceTable';
import { FinanceRowActions } from '@/features/finance/components/FinanceRowActions';
import type { FinanceDocument } from '@/features/finance/types';
import { formatCompactMoney } from '@/lib/currency';

type CollectionMetrics = { toReceive: number; overdue: number; dueToday: number; promisesUpcoming?: number; currency: string };
type CollectionFilters = { collection_filter?: string; collection_search?: string; collection_sort?: string };
type Pagination = { page: number; pageSize: number; total: number };

type Props = {
    receivables: FinanceDocument[];
    metrics: CollectionMetrics | null;
    filters?: CollectionFilters;
    pagination: Pagination;
    canCreatePayment: boolean;
    canManageReminders: boolean;
    canManagePromises: boolean;
    onQuery: (query: Record<string, string | number | undefined>) => void;
    onPayment: (invoice: FinanceDocument) => void;
    onReminder: (invoice: FinanceDocument) => void;
    onPromise: (invoice: FinanceDocument) => void;
    onOpen: (invoice: FinanceDocument) => void;
};

const filterOptions = [
    { id: 'all', label: 'Tous' },
    { id: 'today', label: "Aujourd'hui" },
    { id: 'upcoming', label: 'À venir' },
    { id: 'overdue', label: 'En retard' },
    { id: 'overdue_30', label: '+30 jours' },
    { id: 'promises', label: 'Promesses' },
];

const sortOptions = [
    { id: 'oldest_overdue', label: 'Retard le plus ancien' },
    { id: 'highest_outstanding', label: 'Reste le plus élevé' },
    { id: 'nearest_due', label: 'Échéance la plus proche' },
    { id: 'client', label: 'Client' },
];

function dueLabel(invoice: FinanceDocument): { label: string; tone: string; icon: typeof IconClock } {
    const receivable = invoice.receivable;
    if (!receivable || receivable.dueState === 'upcoming') return { label: 'À venir', tone: 'border-sky-400/25 bg-sky-400/10 text-sky-400', icon: IconCalendarDue };
    if (receivable.dueState === 'due_today') return { label: "Échéance aujourd'hui", tone: 'border-amber-400/25 bg-amber-400/10 text-amber-400', icon: IconCalendarDue };
    if (receivable.dueState === 'overdue') {
        const severity = receivable.daysOverdue >= 31 ? 'border-red-400/30 bg-red-400/12 text-red-400' : 'border-amber-400/30 bg-amber-400/12 text-amber-400';
        return { label: `En retard · ${receivable.daysOverdue} j`, tone: severity, icon: IconAlertTriangle };
    }
    return { label: 'Payée', tone: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-400', icon: IconClock };
}

export function ReceivablesWorkspace({ receivables, metrics, filters, pagination, canCreatePayment, canManageReminders, canManagePromises, onQuery, onPayment, onReminder, onPromise, onOpen }: Props) {
    const filter = filters?.collection_filter || 'all';
    const search = filters?.collection_search || '';
    const sort = filters?.collection_sort || 'oldest_overdue';
    const currency = metrics?.currency || 'MAD';

    function query(overrides: Record<string, string | number | undefined>) {
        onQuery({
            collection_filter: filter,
            collection_search: search || undefined,
            collection_sort: sort,
            collection_page: 1,
            ...overrides,
        });
    }

    return (
        <section className="space-y-4">
            <div className="flex flex-col gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Encaissements</p>
                    <h2 className="mt-1 text-lg font-semibold text-[var(--text)]">À encaisser</h2>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">Suivez les échéances, retards et relances clients.</p>
                </div>
                <div className="grid w-full grid-cols-2 gap-2 sm:min-w-[640px] xl:w-auto xl:grid-cols-4">
                    <AppKpiCard
                        icon={<span className="flex size-6 items-center justify-center rounded-md bg-amber-400/12 text-amber-400"><IconCash size={14} /></span>}
                        label="À recevoir"
                        value={formatCompactMoney(metrics?.toReceive || 0, currency)}
                        detail="Factures ouvertes"
                        fullValue={metrics?.toReceive || 0}
                        currency={currency}
                        stacked
                        keepCurrencyAttached
                        className="min-w-0 bg-[var(--surface-2)]/55"
                        valueClassName="text-amber-400"
                    />
                    <AppKpiCard
                        icon={<span className="flex size-6 items-center justify-center rounded-md bg-red-400/12 text-red-400"><IconAlertTriangle size={14} /></span>}
                        label="En retard"
                        value={formatCompactMoney(metrics?.overdue || 0, currency)}
                        detail="À traiter en priorité"
                        fullValue={metrics?.overdue || 0}
                        currency={currency}
                        stacked
                        keepCurrencyAttached
                        className="min-w-0 bg-[var(--surface-2)]/55"
                        valueClassName="text-red-400"
                    />
                    <AppKpiCard
                        icon={<span className="flex size-6 items-center justify-center rounded-md bg-sky-400/12 text-sky-400"><IconCalendarDue size={14} /></span>}
                        label="Aujourd'hui"
                        value={formatCompactMoney(metrics?.dueToday || 0, currency)}
                        detail="Échéances du jour"
                        fullValue={metrics?.dueToday || 0}
                        currency={currency}
                        stacked
                        keepCurrencyAttached
                        className="min-w-0 bg-[var(--surface-2)]/55"
                        valueClassName="text-sky-400"
                    />
                    <AppKpiCard
                        icon={<span className="flex size-6 items-center justify-center rounded-md bg-violet-400/12 text-violet-400"><IconClock size={14} /></span>}
                        label="Promesses"
                        value={formatCompactMoney(metrics?.promisesUpcoming || 0, currency)}
                        detail="Engagements à suivre"
                        fullValue={metrics?.promisesUpcoming || 0}
                        currency={currency}
                        stacked
                        keepCurrencyAttached
                        className="min-w-0 bg-[var(--surface-2)]/55"
                        valueClassName="text-violet-400"
                    />
                </div>
            </div>

            <AppWorkspaceTable
                ariaLabel="Factures à encaisser"
                data={receivables}
                rowKey={(invoice) => invoice.id}
                minTableWidthClassName="min-w-[1200px] table-fixed"
                columnOrderStorageKey="finance-receivables-columns"
                columnOrderHint="Glissez pour réorganiser"
                toolbar={
                    <div className="space-y-3 p-3">
                        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                            <AppSearchInput
                                value={search}
                                onChange={(value) => query({ collection_search: value || undefined })}
                                placeholder="Rechercher client, projet, facture..."
                                ariaLabel="Rechercher des encaissements"
                                maxWidth="lg:max-w-[320px]"
                            />
                            <select
                                aria-label="Trier les encaissements"
                                value={sort}
                                onChange={(event) => query({ collection_sort: event.target.value })}
                                className="h-8 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-2.5 text-[11px] text-[var(--text)] outline-none focus:border-[var(--accent)]"
                            >
                                {sortOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
                            </select>
                        </div>
                        <AppFilterTabs label="Filtrer les encaissements" hideLabel value={filter} options={filterOptions} onChange={(value) => query({ collection_filter: value })} />
                    </div>
                }
                columns={[
                    {
                        id: 'client', label: 'Client / projet', icon: <IconUser size={12} />, reorderable: false, headerClassName: 'w-[34%]',
                        cellClassName: 'max-w-0',
                        render: (invoice) => <div className="min-w-0"><p className="truncate font-semibold text-[var(--text)]">{invoice.client?.name || 'Client non renseigné'}</p><p className="mt-0.5 truncate text-[10px] text-[var(--text-muted)]">{invoice.dossier?.number || '—'}{invoice.dossier?.projectObject ? ` · ${invoice.dossier.projectObject}` : ''}</p></div>,
                    },
                    {
                        id: 'invoice', label: 'Facture', icon: <IconCash size={12} />, headerClassName: 'w-[13%]',
                        render: (invoice) => <div><p className="font-semibold text-[var(--text)]">{invoice.number}</p><p className="mt-0.5 text-[10px] text-[var(--text-muted)]">Échéance {invoice.dueDate || 'non définie'}</p></div>,
                    },
                    {
                        id: 'amounts', label: 'Encaissement', headerClassName: 'w-[17%] text-right', cellClassName: 'text-right',
                        render: (invoice) => <div className="space-y-0.5 tabular-nums"><p className="font-semibold text-[var(--text)]">Reste {formatCompactMoney(invoice.remainingTotal, invoice.currency)}</p><p className="text-[10px] text-[var(--text-muted)]">Payé {formatCompactMoney(invoice.paidTotal, invoice.currency)} / {formatCompactMoney(invoice.totalTtc, invoice.currency)}</p></div>,
                    },
                    {
                        id: 'state', label: 'État', headerClassName: 'w-[14%]',
                        render: (invoice) => {
                            const due = dueLabel(invoice); const Icon = due.icon;
                            return <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-semibold ${due.tone}`}><Icon size={11} />{due.label}</span>;
                        },
                    },
                    {
                        id: 'actions', label: 'Actions', fixedPosition: 'end', headerClassName: 'w-[16%] text-right', cellClassName: 'whitespace-nowrap text-right', reorderable: false,
                        render: (invoice) => <div className="flex justify-end gap-1">
                            {canCreatePayment ? <AppButton isIconOnly compact size="sm" variant="solid" color="primary" tooltip="Enregistrer un paiement" aria-label="Enregistrer un paiement" className="size-7 min-h-7 min-w-7" onPress={() => onPayment(invoice)}><IconCash size={14} /></AppButton> : null}
                            <FinanceRowActions
                                actions={[
                                    canManageReminders ? { id: 'reminder', label: 'Rappeler', icon: <IconClock size={14} />, onPress: () => onReminder(invoice), tone: 'accent' } : null,
                                    canManagePromises ? { id: 'promise', label: 'Promesse de paiement', icon: <IconCash size={14} />, onPress: () => onPromise(invoice), tone: 'success' } : null,
                                ]}
                            />
                            <AppButton isIconOnly compact size="sm" variant="quiet" tooltip="Ouvrir la facture" aria-label="Ouvrir la facture" className="size-7 min-h-7 min-w-7" onPress={() => onOpen(invoice)}><IconChevronRight size={14} /></AppButton>
                        </div>,
                    },
                ]}
                emptyContent={<div className="space-y-1"><p className="font-semibold text-[var(--text)]">Aucun paiement à encaisser.</p><p>Les factures réglées ou annulées n'apparaissent pas ici.</p></div>}
                renderMobileRow={(invoice) => {
                    const due = dueLabel(invoice);
                    return <div key={invoice.id} className="space-y-3 p-3"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate font-semibold text-[var(--text)]">{invoice.client?.name || 'Client non renseigné'}</p><p className="mt-0.5 truncate text-[10px] text-[var(--text-muted)]">{invoice.dossier?.number || '—'} · {invoice.number}</p></div><p className="shrink-0 text-sm font-semibold tabular-nums text-[var(--text)]">{formatCompactMoney(invoice.remainingTotal, invoice.currency)}</p></div><div className="flex items-center justify-between gap-2"><span className={`inline-flex items-center rounded-full border px-2 py-1 text-[10px] font-semibold ${due.tone}`}>{due.label}</span><span className="text-[10px] text-[var(--text-muted)]">Échéance {invoice.dueDate || '—'}</span></div><div className="flex gap-1.5">{canCreatePayment ? <AppButton isIconOnly compact size="sm" variant="solid" color="primary" tooltip="Enregistrer un paiement" aria-label="Enregistrer un paiement" className="size-7 min-h-7 min-w-7" onPress={() => onPayment(invoice)}><IconCash size={14} /></AppButton> : null}<FinanceRowActions actions={[canManageReminders ? { id: 'reminder', label: 'Rappeler', icon: <IconClock size={14} />, onPress: () => onReminder(invoice), tone: 'accent' } : null, canManagePromises ? { id: 'promise', label: 'Promesse de paiement', icon: <IconCash size={14} />, onPress: () => onPromise(invoice), tone: 'success' } : null]} /><AppButton isIconOnly compact size="sm" variant="quiet" tooltip="Ouvrir la facture" aria-label="Ouvrir la facture" className="size-7 min-h-7 min-w-7" onPress={() => onOpen(invoice)}><IconChevronRight size={14} /></AppButton></div></div>;
                }}
                footer={<AppPagination page={pagination.page} pageSize={pagination.pageSize} total={pagination.total} onChange={(page) => query({ collection_page: page })} />}
            />
        </section>
    );
}
