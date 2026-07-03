import { Head, router } from '@inertiajs/react';
import {
    CheckCircle2,
    Circle,
    Eye,
    FolderKanban,
    Pencil,
    Plus,
    Search,
    Send,
    ShieldCheck,
    Trash2,
    X,
    XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormErrors } from '@/lib/formErrors';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { AppButton } from '@/components/ui/AppButton';
import { AppPagination } from '@/components/ui/AppPagination';
import { AuthorizationDrawer } from '@/features/authorizations/drawers/AuthorizationDrawer';
import { countByValue, filterByValue } from '@/lib/filters';
import type {
    AuthorizationDossierOption,
    AuthorizationFormPayload,
    AuthorizationRow,
    AuthorizationStatus,
} from '@/features/authorizations/types';

/* FORCE_AUTHORIZATIONS_REDESIGN_53G */

type PageProps = {
    authorizations: AuthorizationRow[];
    dossiers: AuthorizationDossierOption[];
    metrics: {
        total: number;
        notStarted: number;
        submitted: number;
        approved: number;
        received: number;
        observations: number;
    };
};

function statusClass(status: AuthorizationStatus) {
    if (status === 'received') return 'border-violet-400/25 bg-violet-400/10 text-violet-300';
    if (status === 'approved') return 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300';
    if (status === 'submitted') return 'border-sky-400/25 bg-sky-400/10 text-sky-300';
    if (status === 'observations') return 'border-amber-400/25 bg-amber-400/10 text-amber-300';
    if (status === 'rejected') return 'border-red-400/25 bg-red-400/10 text-red-300';

    return 'border-zinc-500/30 bg-zinc-500/10 text-zinc-300';
}

function authorityLabel(value: string | null) {
    const labels: Record<string, string> = {
        commune: 'Commune',
        urban_agency: 'Urban agency',
        province: 'Province',
        other: 'Other',
    };

    return value ? labels[value] ?? value : '-';
}

function toBackendPayload(payload: AuthorizationFormPayload) {
    return {
        dossier_id: payload.dossierId,
        authorization_number: payload.authorizationNumber || null,
        submission_number: payload.submissionNumber || null,
        authority_name: payload.authorityName || null,
        authority_type: payload.authorityType || null,
        status: payload.status || 'not_started',
        submitted_at: payload.submittedAt || null,
        approved_at: payload.approvedAt || null,
        received_at: payload.receivedAt || null,
        observations_text: payload.observationsText || null,
        notes: payload.notes || null,
    };
}

function matchesSearch(authorization: AuthorizationRow, query: string) {
    if (!query.trim()) {
        return true;
    }

    return [
        authorization.authorizationNumber,
        authorization.submissionNumber,
        authorization.authorityName,
        authorization.authorityType,
        authorization.dossierNumber,
        authorization.projectObject,
        authorization.clientName,
        authorization.clientCin,
        authorization.status,
        authorization.observationsText,
        authorization.notes,
    ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query.trim().toLowerCase());
}

function flowItems(authorization: AuthorizationRow) {
    return [
        {
            key: 'not_started',
            label: 'Created',
            done: true,
            date: authorization.createdAt,
        },
        {
            key: 'submitted',
            label: 'Submitted',
            done: Boolean(authorization.submittedAt) || ['submitted', 'observations', 'approved', 'received'].includes(authorization.status),
            date: authorization.submittedAt,
        },
        {
            key: 'approved',
            label: 'Approved',
            done: Boolean(authorization.approvedAt) || ['approved', 'received'].includes(authorization.status),
            date: authorization.approvedAt,
        },
        {
            key: 'received',
            label: 'Received',
            done: Boolean(authorization.receivedAt) || authorization.status === 'received',
            date: authorization.receivedAt,
        },
    ];
}

function KpiCard({
    label,
    value,
    detail,
}: {
    label: string;
    value: string | number;
    detail: string;
}) {
    return (
        <div className="crm-kpi-card">
            <p className="crm-kpi-label">{label}</p>
            <p className="crm-kpi-value">{value}</p>
            <p className="mt-2 truncate text-xs text-[var(--crm-text-soft)]">{detail}</p>
        </div>
    );
}

function AuthorizationTimeline({ authorization }: { authorization: AuthorizationRow }) {
    return (
        <div className="space-y-2">
            {flowItems(authorization).map((item) => (
                <div key={item.key} className="flex items-center gap-3">
                    <span className={[
                        'flex size-7 shrink-0 items-center justify-center rounded-full border',
                        item.done
                            ? 'border-[var(--crm-gold)] bg-[var(--crm-gold-soft)] text-[var(--crm-gold)]'
                            : 'border-[var(--crm-border)] bg-[var(--crm-surface)] text-[var(--crm-text-soft)]',
                    ].join(' ')}>
                        {item.done ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                    </span>

                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{item.label}</p>
                        <p className="truncate text-xs text-[var(--crm-text-muted)]">{item.date || '-'}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

function AuthorizationDetailPanel({
    authorization,
    onEdit,
    onDelete,
    onUpdateStatus,
}: {
    authorization: AuthorizationRow | null;
    onEdit: (authorization: AuthorizationRow) => void;
    onDelete: (authorization: AuthorizationRow) => void;
    onUpdateStatus: (authorization: AuthorizationRow, status: string) => void;
}) {
    if (!authorization) {
        return (
            <aside className="crm-panel p-4">
                <p className="text-sm font-semibold">Authorization details</p>
                <p className="mt-2 text-sm text-[var(--crm-text-muted)]">
                    Select an authorization to review status, authority, dates, and observations.
                </p>
            </aside>
        );
    }

    return (
        <aside className="crm-panel overflow-hidden">
            <div className="border-b border-[var(--crm-border)] p-4">
                <p className="crm-eyebrow">Selected authorization</p>
                <div className="mt-2 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <h2 className="truncate text-lg font-semibold">
                            {authorization.submissionNumber || authorization.authorizationNumber || 'No number'}
                        </h2>
                        <p className="text-sm text-[var(--crm-text-muted)]">{authorization.dossierNumber}</p>
                    </div>

                    <span className={`shrink-0 rounded-full border px-2 py-1 text-[11px] font-semibold ${statusClass(authorization.status)}`}>
                        {authorization.status}
                    </span>
                </div>
            </div>

            <div className="space-y-5 p-5">
                <div className="grid grid-cols-2 gap-3">
                    <div className="crm-panel-soft p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">Project</p>
                        <p className="mt-1 truncate text-sm font-semibold">{authorization.projectObject}</p>
                        <p className="truncate text-xs text-[var(--crm-text-muted)]">{authorization.clientName}</p>
                    </div>

                    <div className="crm-panel-soft p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">Authority</p>
                        <p className="mt-1 truncate text-sm font-semibold">{authorization.authorityName || '-'}</p>
                        <p className="truncate text-xs text-[var(--crm-text-muted)]">{authorityLabel(authorization.authorityType)}</p>
                    </div>

                    <div className="crm-panel-soft p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">Submitted</p>
                        <p className="mt-1 truncate text-sm font-semibold">{authorization.submittedAt || '-'}</p>
                        <p className="truncate text-xs text-[var(--crm-text-muted)]">Deposit date</p>
                    </div>

                    <div className="crm-panel-soft p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">Received</p>
                        <p className="mt-1 truncate text-sm font-semibold text-[var(--crm-gold)]">{authorization.receivedAt || '-'}</p>
                        <p className="truncate text-xs text-[var(--crm-text-muted)]">Final receipt</p>
                    </div>
                </div>

                <div className="crm-panel-soft p-3">
                    <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-semibold">Administrative flow</p>
                        <p className="text-xs text-[var(--crm-text-muted)]">
                            {flowItems(authorization).filter((item) => item.done).length}/4 done
                        </p>
                    </div>
                    <AuthorizationTimeline authorization={authorization} />
                </div>

                <div className="crm-panel-soft p-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">Observations</p>
                    <p className="mt-2 max-h-36 overflow-y-auto whitespace-pre-line text-sm leading-6 text-[var(--crm-text-muted)]">
                        {authorization.observationsText || 'No observations.'}
                    </p>
                </div>

                <div className="grid gap-2">
                    <AppButton variant="primary" onPress={() => onUpdateStatus(authorization, 'submitted')}>
                        <Send size={15} />
                        Mark submitted
                    </AppButton>

                    <div className="grid grid-cols-2 gap-2">
                        <AppButton variant="secondary" size="sm" onPress={() => onUpdateStatus(authorization, 'approved')}>
                            <CheckCircle2 size={14} />
                            Approved
                        </AppButton>

                        <AppButton variant="secondary" size="sm" onPress={() => onUpdateStatus(authorization, 'received')}>
                            <ShieldCheck size={14} />
                            Received
                        </AppButton>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <AppButton variant="secondary" size="sm" onPress={() => onUpdateStatus(authorization, 'observations')}>
                            <XCircle size={14} />
                            Observations
                        </AppButton>

                        <AppButton variant="secondary" size="sm" onPress={() => onEdit(authorization)}>
                            <Pencil size={14} />
                            Edit
                        </AppButton>
                    </div>

                    <AppButton variant="danger" size="sm" onPress={() => onDelete(authorization)}>
                        <Trash2 size={14} />
                        Delete
                    </AppButton>
                </div>
            </div>
        </aside>
    );
}

export default function AuthorizationsIndex({
    authorizations,
    dossiers,
    metrics,
}: PageProps) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [query, setQuery] = useState('');
    const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
    const [selectedAuthorization, setSelectedAuthorization] = useState<AuthorizationRow | null>(
        authorizations[0] ?? null,
    );
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [tablePage, setTablePage] = useState(1);
    const TABLE_PAGE_SIZE = 15;

    const statusOptions = useMemo(
        () => [
            { id: 'all', label: 'All', count: authorizations.length },
            { id: 'not_started', label: 'Not started', count: countByValue(authorizations, (authorization) => authorization.status, 'not_started') },
            { id: 'submitted', label: 'Submitted', count: countByValue(authorizations, (authorization) => authorization.status, 'submitted') },
            { id: 'observations', label: 'Observations', count: countByValue(authorizations, (authorization) => authorization.status, 'observations') },
            { id: 'approved', label: 'Approved', count: countByValue(authorizations, (authorization) => authorization.status, 'approved') },
            { id: 'received', label: 'Received', count: countByValue(authorizations, (authorization) => authorization.status, 'received') },
        ],
        [authorizations],
    );

    const filteredAuthorizations = useMemo(() => {
        return filterByValue(authorizations, statusFilter, (authorization) => authorization.status)
            .filter((authorization) => matchesSearch(authorization, query));
    }, [authorizations, query, statusFilter]);

    useEffect(() => {
        setTablePage(1);
    }, [query, statusFilter]);

    const pagedAuthorizations = useMemo(
        () => filteredAuthorizations.slice((tablePage - 1) * TABLE_PAGE_SIZE, tablePage * TABLE_PAGE_SIZE),
        [filteredAuthorizations, tablePage],
    );

    const selectedVisible = selectedAuthorization && filteredAuthorizations.some((authorization) => authorization.id === selectedAuthorization.id)
        ? selectedAuthorization
        : filteredAuthorizations[0] ?? null;

    function openCreateDrawer() {
        setSelectedAuthorization(null);
        setDrawerMode('create');
        setFormErrors({});
        setDrawerOpen(true);
    }

    function openEditDrawer(authorization: AuthorizationRow) {
        setSelectedAuthorization(authorization);
        setDrawerMode('edit');
        setFormErrors({});
        setDrawerOpen(true);
    }

    function handleSubmit(payload: AuthorizationFormPayload) {
        const backendPayload = toBackendPayload(payload);

        if (drawerMode === 'edit' && selectedAuthorization) {
            router.put(`/authorizations/${selectedAuthorization.id}`, backendPayload, {
                preserveScroll: true,
                onSuccess: () => {
                    setDrawerOpen(false);
                    setFormErrors({});
                    toast.success('Authorization updated successfully.');
                },
                onError: (errors) => {
                    setFormErrors(errors as FormErrors);
                    toast.error('Please check authorization form errors.');
                },
            });

            return;
        }

        router.post('/authorizations', backendPayload, {
            preserveScroll: true,
            onSuccess: () => {
                setDrawerOpen(false);
                setFormErrors({});
                toast.success('Authorization created successfully.');
            },
            onError: (errors) => {
                setFormErrors(errors as FormErrors);
                toast.error('Please check authorization form errors. Maybe this dossier already has an authorization.');
            },
        });
    }

    function updateStatus(authorization: AuthorizationRow, status: string) {
        router.put(
            `/authorizations/${authorization.id}/status`,
            { status },
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Authorization status updated.'),
                onError: () => toast.error('Authorization status could not be updated.'),
            },
        );
    }

    function deleteAuthorization(authorization: AuthorizationRow) {
        if (!window.confirm(`Delete authorization for ${authorization.dossierNumber}?`)) {
            return;
        }

        router.delete(`/authorizations/${authorization.id}`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Authorization deleted successfully.'),
            onError: () => toast.error('Authorization could not be deleted.'),
        });
    }

    return (
        <>
            <Head title="Authorizations" />

            <AppShell
                eyebrowKey="authorizations.eyebrow"
                titleKey="authorizations.title"
                subtitleKey="authorizations.subtitle"
                action={
                    <AppButton variant="primary" onPress={openCreateDrawer}>
                        <Plus size={16} />
                        New authorization
                    </AppButton>
                }
            >
                <section className="crm-kpi-grid max-xl:grid-cols-3 max-md:grid-cols-1">
                    <KpiCard label="Authorizations" value={metrics.total} detail="Total authorization records" />
                    <KpiCard label="Not started" value={metrics.notStarted} detail="Need submission" />
                    <KpiCard label="Submitted" value={metrics.submitted} detail="Waiting authority answer" />
                    <KpiCard label="Observations" value={metrics.observations} detail="Need follow-up" />
                    <KpiCard label="Received" value={metrics.received} detail="Final files received" />
                </section>

                <section className="crm-panel p-4">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                        <div className="flex flex-wrap gap-2">
                            {statusOptions.map((option) => {
                                const active = option.id === statusFilter;

                                return (
                                    <button
                                        key={option.id}
                                        type="button"
                                        onClick={() => setStatusFilter(option.id)}
                                        className={[
                                            'inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-semibold transition',
                                            active
                                                ? 'border-[var(--crm-gold)] bg-[var(--crm-gold-soft)] text-[var(--crm-gold)]'
                                                : 'border-[var(--crm-border)] bg-[var(--crm-surface)] text-[var(--crm-text-muted)] hover:text-[var(--crm-text)]',
                                        ].join(' ')}
                                    >
                                        {option.label}
                                        <span className="rounded-full bg-black/20 px-2 py-0.5 text-xs">{option.count}</span>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="crm-command-input relative w-full xl:w-[400px]">
                            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--crm-text-soft)]" />
                            <input
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Search authorizations, projects, authorities..."
                                className="h-full w-full bg-transparent pl-9 pr-9 text-sm outline-none placeholder:text-[var(--crm-text-soft)]"
                            />
                            {query ? (
                                <button
                                    type="button"
                                    onClick={() => setQuery('')}
                                    className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-[var(--crm-text-soft)] hover:bg-[var(--crm-surface-2)]"
                                >
                                    <X size={14} />
                                </button>
                            ) : null}
                        </div>
                    </div>
                </section>

                <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
                    <div className="crm-panel overflow-hidden">
                        <div className="flex items-center justify-between border-b border-[var(--crm-border)] px-5 py-4">
                            <div>
                                <p className="text-sm font-semibold">Authorization workspace</p>
                                <p className="text-xs text-[var(--crm-text-muted)]">{filteredAuthorizations.length} visible authorization(s)</p>
                            </div>

                            <AppButton variant="secondary" size="sm" onPress={() => setStatusFilter('all')}>
                                Reset
                            </AppButton>
                        </div>

                        <div className="app-scrollbar overflow-x-auto">
                            <table className="crm-table min-w-[1080px]">
                                <thead>
                                    <tr>
                                        <th>Authorization</th>
                                        <th>Project</th>
                                        <th>Authority</th>
                                        <th>Flow</th>
                                        <th>Dates</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredAuthorizations.length > 0 ? (
                                        pagedAuthorizations.map((authorization) => {
                                            const selected = selectedVisible?.id === authorization.id;
                                            const doneCount = flowItems(authorization).filter((item) => item.done).length;

                                            return (
                                                <tr
                                                    key={authorization.id}
                                                    className={selected ? 'bg-[color-mix(in_srgb,var(--crm-gold)_8%,transparent)]' : ''}
                                                    onClick={() => setSelectedAuthorization(authorization)}
                                                >
                                                    <td>
                                                        <div className="flex items-center gap-3">
                                                            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--crm-gold-soft)] text-[var(--crm-gold)]">
                                                                <ShieldCheck size={16} />
                                                            </span>
                                                            <div className="min-w-0">
                                                                <p className="max-w-[220px] truncate font-semibold text-[var(--crm-text)]">
                                                                    {authorization.submissionNumber || authorization.authorizationNumber || 'No number'}
                                                                </p>
                                                                <p className="text-xs text-[var(--crm-text-muted)]">{authorization.dossierNumber}</p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <div className="flex items-start gap-2">
                                                            <FolderKanban size={14} className="mt-0.5 shrink-0 text-[var(--crm-text-soft)]" />
                                                            <div className="min-w-0">
                                                                <p className="max-w-[230px] truncate font-medium text-[var(--crm-text)]">{authorization.projectObject}</p>
                                                                <p className="max-w-[230px] truncate text-xs text-[var(--crm-text-muted)]">{authorization.clientName}</p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <p className="max-w-[180px] truncate font-medium text-[var(--crm-text)]">{authorization.authorityName || '-'}</p>
                                                        <p className="max-w-[180px] truncate text-xs text-[var(--crm-text-muted)]">{authorityLabel(authorization.authorityType)}</p>
                                                    </td>

                                                    <td>
                                                        <div className="w-[150px]">
                                                            <div className="mb-1 flex justify-between text-xs text-[var(--crm-text-muted)]">
                                                                <span>{doneCount}/4</span>
                                                                <span>{authorization.observations.length} obs</span>
                                                            </div>
                                                            <div className="h-1.5 rounded-full bg-[var(--crm-surface-3)]">
                                                                <div className="h-full rounded-full bg-[var(--crm-gold)]" style={{ width: `${Math.round((doneCount / 4) * 100)}%` }} />
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <p className="text-xs text-[var(--crm-text-muted)]">Submitted: {authorization.submittedAt || '-'}</p>
                                                        <p className="text-xs text-[var(--crm-text-muted)]">Received: {authorization.receivedAt || '-'}</p>
                                                    </td>

                                                    <td>
                                                        <span className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-semibold ${statusClass(authorization.status)}`}>
                                                            {authorization.status}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <div className="flex justify-end gap-1">
                                                            <button type="button" className="crm-action-button" title="Preview" onClick={(event) => { event.stopPropagation(); setSelectedAuthorization(authorization); }}>
                                                                <Eye size={14} />
                                                            </button>
                                                            <button type="button" className="crm-action-button" title="Edit" onClick={(event) => { event.stopPropagation(); openEditDrawer(authorization); }}>
                                                                <Pencil size={14} />
                                                            </button>
                                                            <button type="button" className="crm-action-button" title="Submitted" onClick={(event) => { event.stopPropagation(); updateStatus(authorization, 'submitted'); }}>
                                                                <Send size={14} />
                                                            </button>
                                                            <button type="button" className="crm-action-button" title="Approved" onClick={(event) => { event.stopPropagation(); updateStatus(authorization, 'approved'); }}>
                                                                <CheckCircle2 size={14} />
                                                            </button>
                                                            <button type="button" className="crm-action-button" title="Received" onClick={(event) => { event.stopPropagation(); updateStatus(authorization, 'received'); }}>
                                                                <ShieldCheck size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={7}>
                                                <div className="py-10 text-center">
                                                    <p className="text-sm font-semibold">No authorizations found</p>
                                                    <p className="mt-1 text-sm text-[var(--crm-text-muted)]">Change filters or create an authorization follow-up.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <AuthorizationDetailPanel
                        authorization={selectedVisible}
                        onEdit={openEditDrawer}
                        onDelete={deleteAuthorization}
                        onUpdateStatus={updateStatus}
                    />
                </section>

                <AppPagination page={tablePage} pageSize={TABLE_PAGE_SIZE} total={filteredAuthorizations.length} onChange={setTablePage} />

                <AuthorizationDrawer
                    isOpen={drawerOpen}
                    mode={drawerMode}
                    authorization={selectedAuthorization}
                    dossiers={dossiers}
                    onOpenChange={setDrawerOpen}
                    onSubmit={handleSubmit}
                    errors={formErrors}
                />
            </AppShell>
        </>
    );
}