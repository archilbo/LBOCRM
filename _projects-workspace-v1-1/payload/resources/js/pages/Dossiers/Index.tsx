import { Head, router } from '@inertiajs/react';
import {
    Activity,
    BadgeDollarSign,
    Building2,
    CheckCircle2,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    ChevronsUpDown,
    CircleDot,
    Clock3,
    Eye,
    FileText,
    FolderKanban,
    ListChecks,
    MapPin,
    MoreHorizontal,
    Pencil,
    Plus,
    RefreshCw,
    Search,
    Trash2,
    UserRound,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
    Button as AriaButton,
    Menu,
    MenuItem,
    MenuTrigger,
    Popover,
    Separator,
} from 'react-aria-components';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppButton } from '@/components/ui/AppButton';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { AppModal } from '@/components/ui/AppModal';
import {
    AppWorkspaceTable,
    type AppWorkspaceTableColumn,
} from '@/components/ui/AppWorkspaceTable';
import { DossierLocationExplorer } from '@/features/dossiers/components/DossierLocationExplorer';
import { ProjectDrawer } from '@/features/dossiers/drawers/ProjectDrawer';
import { toDossierRequestPayload } from '@/features/dossiers/projectPayload';
import type {
    City,
    DossierFormPayload,
    DossierLocationGroup,
    DossierRow,
    ProjectMonthlyCount,
} from '@/features/dossiers/types';
import { dossierWorkflowOptions, getDossierWorkflowLabel } from '@/config/statuses';
import type { FormErrors } from '@/lib/formErrors';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/cn';

type PageProps = {
    dossiers: DossierRow[];
    locationGroups: DossierLocationGroup[];
    clients: { id: string; label: string }[];
    cities: City[];
    monthlyProjects: ProjectMonthlyCount[];
    metrics: {
        total: number;
        active: number;
        opened: number;
        closed: number;
        documentsTotal: number;
        financeDocumentsTotal: number;
    };
};

type SortField =
    | 'projectObject'
    | 'clientName'
    | 'status'
    | 'documentsCount'
    | 'financeDocumentsCount'
    | 'updatedAtIso';

type SortDirection = 'asc' | 'desc';
type ViewMode = 'workspace' | 'location';
type RowAction = 'documents' | 'finance' | 'archives' | 'delete';

const PAGE_SIZE = 10;
const COLUMN_ORDER_KEY = 'archilbo.projects.table.columns.v1';

function compareProjects(left: DossierRow, right: DossierRow, field: SortField): number {
    if (field === 'documentsCount' || field === 'financeDocumentsCount') {
        return left[field] - right[field];
    }

    return String(left[field] ?? '').localeCompare(String(right[field] ?? ''), undefined, {
        numeric: true,
        sensitivity: 'base',
    });
}

function initials(name: string): string {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('') || 'PR';
}

function statusTone(status: string): 'neutral' | 'blue' | 'green' | 'amber' | 'red' | 'violet' {
    if (['active', 'completed', 'closed'].includes(status)) return 'green';
    if (['opened', 'in_progress', 'submitted'].includes(status)) return 'blue';
    if (['blocked', 'cancelled', 'rejected'].includes(status)) return 'red';
    if (['archived'].includes(status)) return 'violet';
    if (['pending', 'missing', 'draft'].includes(status)) return 'amber';
    return 'neutral';
}

function safeStatusLabel(t: (key: string) => string, status: string): string {
    const key = `projects.statuses.${status}`;
    const translated = t(key);
    if (translated !== key) return translated;

    return status.replace(/_/g, ' ');
}

function SortHeader({
    label,
    field,
    activeField,
    direction,
    onSort,
}: {
    label: string;
    field: SortField;
    activeField: SortField;
    direction: SortDirection;
    onSort: (field: SortField) => void;
}) {
    let icon: ReactNode = <ChevronsUpDown size={12} className="text-[var(--text-muted)]" />;

    if (activeField === field) {
        icon = direction === 'asc'
            ? <ChevronUp size={12} className="text-[var(--accent)]" />
            : <ChevronDown size={12} className="text-[var(--accent)]" />;
    }

    return (
        <button
            type="button"
            onClick={() => onSort(field)}
            className="inline-flex items-center gap-1.5 transition hover:text-[var(--foreground)]"
        >
            {label}
            {icon}
        </button>
    );
}

export default function DossiersIndex({
    dossiers,
    locationGroups,
    clients,
    cities,
    monthlyProjects,
    metrics,
}: PageProps) {
    const { t, locale } = useTranslation();
    const createRequested = typeof window !== 'undefined'
        && new URLSearchParams(window.location.search).get('command') === 'create';

    const [viewMode, setViewMode] = useState<ViewMode>('workspace');
    const [drawerOpen, setDrawerOpen] = useState(createRequested);
    const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
    const [selectedDossier, setSelectedDossier] = useState<DossierRow | null>(null);
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [query, setQuery] = useState('');
    const [workflowFilter, setWorkflowFilter] = useState('all');
    const [sortField, setSortField] = useState<SortField>('updatedAtIso');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [page, setPage] = useState(0);
    const [deleteTarget, setDeleteTarget] = useState<DossierRow | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (!createRequested || typeof window === 'undefined') return;

        const params = new URLSearchParams(window.location.search);
        params.delete('command');
        const queryString = params.toString();
        window.history.replaceState(
            null,
            '',
            `${window.location.pathname}${queryString ? `?${queryString}` : ''}`,
        );
    }, [createRequested]);

    const statusOptions = useMemo(() => [
        { id: 'all', label: t('projects.allWorkflows'), count: dossiers.length },
        ...dossierWorkflowOptions.map((option) => ({
            id: option.id,
            label: option.label,
            count: dossiers.filter((dossier) => dossier.workflowStep === option.id).length,
        })),
    ], [dossiers, t]);

    const filteredDossiers = useMemo(() => {
        const normalizedQuery = query.trim().toLocaleLowerCase(locale);

        return dossiers
            .filter((dossier) => {
                if (workflowFilter !== 'all' && dossier.workflowStep !== workflowFilter) {
                    return false;
                }

                if (!normalizedQuery) return true;

                return [
                    dossier.projectObject,
                    dossier.dossierNumber,
                    dossier.clientName,
                    dossier.clientNumber,
                    dossier.clientCin,
                    dossier.city?.name,
                    dossier.province,
                    dossier.commune,
                    dossier.status,
                    dossier.workflowStep,
                ]
                    .filter(Boolean)
                    .join(' ')
                    .toLocaleLowerCase(locale)
                    .includes(normalizedQuery);
            })
            .sort((left, right) => {
                const comparison = compareProjects(left, right, sortField);
                return sortDirection === 'asc' ? comparison : -comparison;
            });
    }, [dossiers, locale, query, sortDirection, sortField, workflowFilter]);

    const pageCount = Math.max(1, Math.ceil(filteredDossiers.length / PAGE_SIZE));
    const resolvedPage = Math.min(page, pageCount - 1);
    const pageDossiers = filteredDossiers.slice(
        resolvedPage * PAGE_SIZE,
        (resolvedPage + 1) * PAGE_SIZE,
    );

    const monthlyMax = Math.max(1, ...monthlyProjects.map((item) => item.count));

    function toggleSort(field: SortField) {
        if (sortField === field) {
            setSortDirection((current) => current === 'asc' ? 'desc' : 'asc');
            return;
        }

        setSortField(field);
        setSortDirection('asc');
    }

    function openCreateDrawer() {
        setSelectedDossier(null);
        setDrawerMode('create');
        setFormErrors({});
        setDrawerOpen(true);
    }

    function openEditDrawer(dossier: DossierRow) {
        setSelectedDossier(dossier);
        setDrawerMode('edit');
        setFormErrors({});
        setDrawerOpen(true);
    }

    function handleSubmit(payload: DossierFormPayload) {
        const requestPayload = toDossierRequestPayload(payload);

        if (drawerMode === 'edit' && selectedDossier) {
            router.put(`/dossiers/${selectedDossier.id}`, requestPayload, {
                preserveScroll: true,
                onSuccess: () => {
                    setDrawerOpen(false);
                    setFormErrors({});
                    toast.success(t('projects.updated'));
                },
                onError: (errors) => {
                    setFormErrors(errors as FormErrors);
                    toast.error(t('projects.formError'));
                },
            });
            return;
        }

        router.post('/dossiers', requestPayload, {
            preserveScroll: true,
            onSuccess: () => {
                setDrawerOpen(false);
                setFormErrors({});
                toast.success(t('projects.created'));
            },
            onError: (errors) => {
                setFormErrors(errors as FormErrors);
                toast.error(t('projects.formError'));
            },
        });
    }

    function handleRowAction(dossier: DossierRow, action: RowAction) {
        if (action === 'documents') {
            router.visit(`/documents?dossier_id=${dossier.id}`);
            return;
        }

        if (action === 'finance') {
            router.visit(`/finance/documents?dossier_id=${dossier.id}`);
            return;
        }

        if (action === 'archives') {
            router.visit(`/archives?dossier_id=${dossier.id}`);
            return;
        }

        setDeleteTarget(dossier);
    }

    function confirmDelete() {
        if (!deleteTarget) return;

        setDeleting(true);
        router.delete(`/dossiers/${deleteTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setDeleting(false);
                setDeleteTarget(null);
                toast.success(t('projects.deleted'));
            },
            onError: () => {
                setDeleting(false);
                toast.error(t('projects.deleteError'));
            },
        });
    }

    function rowActions(dossier: DossierRow) {
        return (
            <div
                className="flex items-center justify-end gap-0.5"
                onClick={(event) => event.stopPropagation()}
            >
                <AppButton
                    isIconOnly
                    compact
                    variant="quiet"
                    tooltip={t('projects.openProject')}
                    aria-label={t('projects.openProject')}
                    onPress={() => router.visit(`/dossiers/${dossier.id}`)}
                >
                    <Eye size={14} />
                </AppButton>
                <AppButton
                    isIconOnly
                    compact
                    variant="quiet"
                    tooltip={t('projects.editProject')}
                    aria-label={t('projects.editProject')}
                    onPress={() => openEditDrawer(dossier)}
                >
                    <Pencil size={14} />
                </AppButton>
                <MenuTrigger>
                    <AriaButton
                        aria-label={t('actions.more')}
                        className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-[var(--text-muted)] outline-none transition hover:bg-[var(--surface-2)] hover:text-[var(--foreground)] data-[focus-visible]:ring-2 data-[focus-visible]:ring-[var(--accent)]/40"
                    >
                        <MoreHorizontal size={14} />
                    </AriaButton>
                    <Popover
                        placement="bottom end"
                        className="z-[100] w-48 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-xl outline-none"
                    >
                        <Menu
                            aria-label={t('actions.more')}
                            onAction={(key) => handleRowAction(dossier, String(key) as RowAction)}
                            className="outline-none"
                        >
                            <MenuItem
                                id="documents"
                                textValue={t('projects.openDocuments')}
                                className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-[var(--foreground)] outline-none transition data-[focused]:bg-[var(--surface-2)]"
                            >
                                <FileText size={14} className="text-sky-400" />
                                {t('projects.openDocuments')}
                            </MenuItem>
                            <MenuItem
                                id="finance"
                                textValue={t('projects.openFinance')}
                                className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-[var(--foreground)] outline-none transition data-[focused]:bg-[var(--surface-2)]"
                            >
                                <BadgeDollarSign size={14} className="text-amber-400" />
                                {t('projects.openFinance')}
                            </MenuItem>
                            <MenuItem
                                id="archives"
                                textValue={t('projects.openArchives')}
                                className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-[var(--foreground)] outline-none transition data-[focused]:bg-[var(--surface-2)]"
                            >
                                <FolderKanban size={14} className="text-violet-400" />
                                {t('projects.openArchives')}
                            </MenuItem>
                            <Separator className="my-1 h-px bg-[var(--border)]" />
                            <MenuItem
                                id="delete"
                                textValue={t('actions.delete')}
                                className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-red-400 outline-none transition data-[focused]:bg-red-400/10"
                            >
                                <Trash2 size={14} />
                                {t('actions.delete')}
                            </MenuItem>
                        </Menu>
                    </Popover>
                </MenuTrigger>
            </div>
        );
    }

    const columns: AppWorkspaceTableColumn<DossierRow>[] = [
        {
            id: 'project',
            label: (
                <SortHeader
                    label={t('projects.table.project')}
                    field="projectObject"
                    activeField={sortField}
                    direction={sortDirection}
                    onSort={toggleSort}
                />
            ),
            icon: <FolderKanban size={13} />,
            render: (dossier) => (
                <div className="min-w-0">
                    <p className="max-w-[220px] truncate font-semibold text-[var(--foreground)]">
                        {dossier.projectObject}
                    </p>
                    <p className="max-w-[220px] truncate text-[11px] text-[var(--text-muted)]">
                        {dossier.dossierNumber}
                    </p>
                </div>
            ),
        },
        {
            id: 'client',
            label: (
                <SortHeader
                    label={t('projects.table.client')}
                    field="clientName"
                    activeField={sortField}
                    direction={sortDirection}
                    onSort={toggleSort}
                />
            ),
            icon: <UserRound size={13} />,
            render: (dossier) => (
                <div className="flex min-w-0 items-center gap-2">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-2)] text-[10px] font-semibold text-[var(--accent)]">
                        {initials(dossier.clientName)}
                    </span>
                    <div className="min-w-0">
                        <p className="max-w-[160px] truncate font-medium text-[var(--foreground)]">
                            {dossier.clientName}
                        </p>
                        <p className="max-w-[160px] truncate text-[10px] text-[var(--text-muted)]">
                            {dossier.clientNumber} · {dossier.clientCin}
                        </p>
                    </div>
                </div>
            ),
        },
        {
            id: 'city',
            label: t('projects.table.city'),
            icon: <Building2 size={13} />,
            render: (dossier) => (
                <span className="text-[var(--text-muted)]">{dossier.city?.name ?? '—'}</span>
            ),
        },
        {
            id: 'location',
            label: t('projects.table.location'),
            icon: <MapPin size={13} />,
            render: (dossier) => (
                <div className="max-w-[170px]">
                    <p className="truncate text-[var(--foreground)]">{dossier.commune ?? '—'}</p>
                    <p className="truncate text-[10px] text-[var(--text-muted)]">
                        {dossier.province ?? dossier.projectAddress ?? '—'}
                    </p>
                </div>
            ),
        },
        {
            id: 'workflow',
            label: t('projects.table.workflow'),
            icon: <ListChecks size={13} />,
            render: (dossier) => (
                <span className="text-[var(--foreground)]">
                    {getDossierWorkflowLabel(dossier.workflowStep)}
                </span>
            ),
        },
        {
            id: 'status',
            label: (
                <SortHeader
                    label={t('projects.table.status')}
                    field="status"
                    activeField={sortField}
                    direction={sortDirection}
                    onSort={toggleSort}
                />
            ),
            icon: <CircleDot size={13} />,
            render: (dossier) => (
                <AppBadge tone={statusTone(dossier.status)}>
                    {safeStatusLabel(t, dossier.status)}
                </AppBadge>
            ),
        },
        {
            id: 'documents',
            label: (
                <SortHeader
                    label={t('projects.table.documents')}
                    field="documentsCount"
                    activeField={sortField}
                    direction={sortDirection}
                    onSort={toggleSort}
                />
            ),
            icon: <FileText size={13} />,
            cellClassName: 'text-center tabular-nums',
            render: (dossier) => dossier.documentsCount,
        },
        {
            id: 'finance',
            label: (
                <SortHeader
                    label={t('projects.table.finance')}
                    field="financeDocumentsCount"
                    activeField={sortField}
                    direction={sortDirection}
                    onSort={toggleSort}
                />
            ),
            icon: <BadgeDollarSign size={13} />,
            cellClassName: 'text-center tabular-nums',
            render: (dossier) => dossier.financeDocumentsCount,
        },
        {
            id: 'updated',
            label: (
                <SortHeader
                    label={t('projects.table.updated')}
                    field="updatedAtIso"
                    activeField={sortField}
                    direction={sortDirection}
                    onSort={toggleSort}
                />
            ),
            icon: <Clock3 size={13} />,
            render: (dossier) => (
                <span className="whitespace-nowrap text-[11px] text-[var(--text-muted)]">
                    {dossier.updatedAt ?? '—'}
                </span>
            ),
        },
        {
            id: 'actions',
            label: t('projects.table.actions'),
            icon: <MoreHorizontal size={13} />,
            reorderable: false,
            headerClassName: 'w-[116px] text-right',
            cellClassName: 'relative w-[116px]',
            render: rowActions,
        },
    ];

    const metricCards = [
        {
            label: t('projects.metrics.total'),
            value: metrics.total,
            icon: FolderKanban,
            tone: 'text-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_12%,transparent)]',
        },
        {
            label: t('projects.metrics.active'),
            value: metrics.active,
            icon: CheckCircle2,
            tone: 'text-emerald-400 bg-emerald-400/10',
        },
        {
            label: t('projects.metrics.opened'),
            value: metrics.opened,
            icon: Activity,
            tone: 'text-sky-400 bg-sky-400/10',
        },
        {
            label: t('projects.metrics.closed'),
            value: metrics.closed,
            icon: CircleDot,
            tone: 'text-violet-400 bg-violet-400/10',
        },
    ];

    return (
        <>
            <Head title={t('projects.title')} />
            <AppShell>
                <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                            {t('projects.eyebrow')}
                        </p>
                        <h1 className="text-2xl font-bold tracking-[-0.02em] text-[var(--foreground)]">
                            {t('projects.title')}
                        </h1>
                        <p className="mt-1 max-w-3xl text-sm text-[var(--text-muted)]">
                            {t('projects.subtitle')}
                        </p>
                    </div>
                    <AppButton
                        isIconOnly
                        compact
                        variant="accent"
                        tooltip={t('projects.newProject')}
                        aria-label={t('projects.newProject')}
                        onPress={openCreateDrawer}
                    >
                        <Plus size={15} />
                    </AppButton>
                </header>

                <div className="flex min-w-0 items-center gap-1 overflow-x-auto border-b border-[var(--border)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {([
                        { id: 'workspace' as const, label: t('projects.workspace'), icon: ListChecks },
                        { id: 'location' as const, label: t('projects.location'), icon: MapPin },
                    ]).map((mode) => {
                        const Icon = mode.icon;
                        const selected = viewMode === mode.id;

                        return (
                            <button
                                key={mode.id}
                                type="button"
                                onClick={() => setViewMode(mode.id)}
                                className={cn(
                                    'flex h-10 shrink-0 items-center gap-2 px-3 text-xs font-medium text-[var(--text-muted)] transition hover:text-[var(--foreground)]',
                                    selected && 'font-semibold text-[var(--accent)]',
                                )}
                            >
                                <Icon size={14} />
                                {mode.label}
                            </button>
                        );
                    })}
                    <span className="ml-auto shrink-0 px-3 text-[10px] text-[var(--text-muted)]">
                        {t('projects.resultCount', { count: filteredDossiers.length })}
                    </span>
                </div>

                {viewMode === 'location' ? (
                    <DossierLocationExplorer groups={locationGroups} />
                ) : (
                    <>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {metricCards.map((card) => {
                                const Icon = card.icon;

                                return (
                                    <div
                                        key={card.label}
                                        className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm"
                                    >
                                        <span className={cn('flex size-9 items-center justify-center rounded-lg', card.tone)}>
                                            <Icon size={16} />
                                        </span>
                                        <div>
                                            <p className="text-[11px] font-medium text-[var(--text-muted)]">
                                                {card.label}
                                            </p>
                                            <p className="text-lg font-semibold tabular-nums text-[var(--foreground)]">
                                                {card.value}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {monthlyProjects.length > 0 ? (
                            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-sm">
                                <div className="mb-3 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold text-[var(--foreground)]">
                                            {t('intermediaries.monthlyProjects')}
                                        </p>
                                        <p className="text-[10px] text-[var(--text-muted)]">12 mois</p>
                                    </div>
                                    <span className="text-xs font-semibold tabular-nums text-[var(--accent)]">
                                        {monthlyProjects.reduce((total, item) => total + item.count, 0)}
                                    </span>
                                </div>
                                <div className="flex h-16 items-end gap-1.5">
                                    {monthlyProjects.map((item) => (
                                        <div key={item.month} className="group flex min-w-0 flex-1 flex-col items-center justify-end gap-1">
                                            <div
                                                title={`${item.month}: ${item.count}`}
                                                className="w-full min-w-1 rounded-t bg-[var(--accent)]/55 transition group-hover:bg-[var(--accent)]"
                                                style={{ height: `${Math.max(5, (item.count / monthlyMax) * 52)}px` }}
                                            />
                                            <span className="max-w-full truncate text-[8px] text-[var(--text-muted)]">
                                                {item.month.slice(5)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : null}

                        <AppWorkspaceTable
                            ariaLabel={t('projects.title')}
                            columns={columns}
                            data={pageDossiers}
                            rowKey={(dossier) => dossier.id}
                            onRowPress={(dossier) => router.visit(`/dossiers/${dossier.id}`)}
                            minTableWidthClassName="min-w-[1120px]"
                            columnOrderStorageKey={COLUMN_ORDER_KEY}
                            columnOrderHint={t('projects.reorderHint')}
                            emptyContent={(
                                <AppEmptyState
                                    className="border-0 bg-transparent py-8"
                                    icon={<FolderKanban size={20} />}
                                    title={t('projects.noResults')}
                                    description={t('projects.noResultsDescription')}
                                />
                            )}
                            toolbar={(
                                <div className="flex flex-col gap-2 px-3 py-2 sm:flex-row sm:items-center">
                                    <div className="relative min-w-0 flex-1 sm:max-w-sm">
                                        <Search
                                            size={13}
                                            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                                        />
                                        <input
                                            value={query}
                                            onChange={(event) => {
                                                setQuery(event.target.value);
                                                setPage(0);
                                            }}
                                            placeholder={t('projects.searchPlaceholder')}
                                            className="h-8 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] pl-8 pr-8 text-xs text-[var(--foreground)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
                                        />
                                        {query ? (
                                            <button
                                                type="button"
                                                aria-label={t('actions.clearSearch')}
                                                onClick={() => {
                                                    setQuery('');
                                                    setPage(0);
                                                }}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] transition hover:text-[var(--foreground)]"
                                            >
                                                <X size={13} />
                                            </button>
                                        ) : null}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <select
                                            value={workflowFilter}
                                            onChange={(event) => {
                                                setWorkflowFilter(event.target.value);
                                                setPage(0);
                                            }}
                                            aria-label={t('projects.allWorkflows')}
                                            className="h-8 min-w-44 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                                        >
                                            {statusOptions.map((option) => (
                                                <option key={option.id} value={option.id} disabled={option.count === 0 && option.id !== 'all'}>
                                                    {option.label} ({option.count})
                                                </option>
                                            ))}
                                        </select>
                                        <AppButton
                                            isIconOnly
                                            compact
                                            variant="quiet"
                                            tooltip={t('projects.refresh')}
                                            aria-label={t('projects.refresh')}
                                            onPress={() => router.reload()}
                                        >
                                            <RefreshCw size={14} />
                                        </AppButton>
                                    </div>
                                </div>
                            )}
                            renderMobileRow={(dossier) => (
                                <div
                                    key={dossier.id}
                                    className="cursor-pointer p-3 transition hover:bg-[var(--surface-2)]"
                                    onClick={() => router.visit(`/dossiers/${dossier.id}`)}
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent)]">
                                            <FolderKanban size={16} />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-semibold text-[var(--foreground)]">
                                                        {dossier.projectObject}
                                                    </p>
                                                    <p className="truncate text-[11px] text-[var(--text-muted)]">
                                                        {dossier.dossierNumber} · {dossier.clientName}
                                                    </p>
                                                </div>
                                                <AppBadge tone={statusTone(dossier.status)}>
                                                    {safeStatusLabel(t, dossier.status)}
                                                </AppBadge>
                                            </div>
                                            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-[var(--text-muted)]">
                                                <span>{dossier.commune ?? dossier.city?.name ?? '—'}</span>
                                                <span>{getDossierWorkflowLabel(dossier.workflowStep)}</span>
                                                <span>{dossier.documentsCount} doc.</span>
                                                <span>{dossier.financeDocumentsCount} fin.</span>
                                            </div>
                                            <div
                                                className="mt-2 flex justify-end"
                                                onClick={(event) => event.stopPropagation()}
                                            >
                                                {rowActions(dossier)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            footer={(
                                <div className="flex items-center justify-between gap-3 px-3 py-2">
                                    <p className="text-[10px] text-[var(--text-muted)]">
                                        {t('projects.resultCount', { count: filteredDossiers.length })}
                                    </p>
                                    <div className="flex items-center gap-1">
                                        <AppButton
                                            isIconOnly
                                            compact
                                            variant="quiet"
                                            tooltip={t('projects.previous')}
                                            aria-label={t('projects.previous')}
                                            isDisabled={resolvedPage === 0}
                                            onPress={() => setPage(Math.max(0, resolvedPage - 1))}
                                        >
                                            <ChevronLeft size={14} />
                                        </AppButton>
                                        <span className="min-w-20 text-center text-[10px] font-medium text-[var(--text-muted)]">
                                            {t('projects.pageStatus', {
                                                current: resolvedPage + 1,
                                                total: pageCount,
                                            })}
                                        </span>
                                        <AppButton
                                            isIconOnly
                                            compact
                                            variant="quiet"
                                            tooltip={t('projects.next')}
                                            aria-label={t('projects.next')}
                                            isDisabled={resolvedPage >= pageCount - 1}
                                            onPress={() => setPage(Math.min(pageCount - 1, resolvedPage + 1))}
                                        >
                                            <ChevronRight size={14} />
                                        </AppButton>
                                    </div>
                                </div>
                            )}
                        />
                    </>
                )}

                <ProjectDrawer
                    isOpen={drawerOpen}
                    mode={drawerMode}
                    dossier={selectedDossier}
                    clients={clients}
                    cities={cities}
                    onOpenChange={setDrawerOpen}
                    onSubmit={handleSubmit}
                    errors={formErrors}
                />

                <AppModal
                    isOpen={deleteTarget !== null}
                    onOpenChange={(open) => {
                        if (!open && !deleting) setDeleteTarget(null);
                    }}
                    title={t('projects.deleteTitle')}
                    size="sm"
                >
                    <p className="text-sm leading-6 text-[var(--text-muted)]">
                        {t('projects.deleteDescription')}
                    </p>
                    {deleteTarget ? (
                        <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
                            <p className="text-sm font-semibold text-[var(--foreground)]">
                                {deleteTarget.projectObject}
                            </p>
                            <p className="text-xs text-[var(--text-muted)]">
                                {deleteTarget.dossierNumber}
                            </p>
                        </div>
                    ) : null}
                    <div className="mt-5 flex justify-end gap-2">
                        <AppButton
                            variant="light"
                            isDisabled={deleting}
                            onPress={() => setDeleteTarget(null)}
                        >
                            {t('actions.cancel')}
                        </AppButton>
                        <AppButton
                            color="danger"
                            isDisabled={deleting}
                            onPress={confirmDelete}
                        >
                            {deleting ? '…' : t('actions.delete')}
                        </AppButton>
                    </div>
                </AppModal>
            </AppShell>
        </>
    );
}
