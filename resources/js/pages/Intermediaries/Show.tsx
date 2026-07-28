import { Head, router } from '@inertiajs/react';
import { Input } from '@heroui/react';
import {
    Activity,
    ArrowLeft,
    BarChart3,
    Building2,
    CalendarDays,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    ChevronsUpDown,
    ChevronDown,
    ChevronUp,
    CircleDot,
    ContactRound,
    Eye,
    FolderKanban,
    History,
    IdCard,
    Mail,
    MapPin,
    Pencil,
    Phone,
    RefreshCw,
    Search,
    Trash2,
    UserCheck,
    UserRound,
    Users,
    X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { MiniLineChart } from '@/components/charts/MiniLineChart';
import { DonutChart } from '@/components/charts/DonutChart';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppButton } from '@/components/ui/AppButton';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { AppKpiCard } from '@/components/ui/AppKpiCard';
import { AppModal } from '@/components/ui/AppModal';
import { AppWorkspaceTable, type AppWorkspaceTableColumn } from '@/components/ui/AppWorkspaceTable';
import { StatusPill } from '@/components/ui/StatusPill';
import { IntermediaryDrawer } from '@/features/intermediaries/drawers/IntermediaryDrawer';
import type {
    ClientBrief,
    IntermediaryActivityItem,
    IntermediaryActivityType,
    IntermediaryFormPayload,
    IntermediaryRow,
    IntermediaryShowProps,
    ProjectBrief,
} from '@/features/intermediaries/types';
import { cn } from '@/lib/cn';
import type { FormErrors } from '@/lib/formErrors';
import { useTranslation } from '@/lib/i18n';

type TabId = 'overview' | 'clients' | 'projects' | 'analytics' | 'activity';
type SortDirection = 'asc' | 'desc';
type ClientSortField = 'fullName' | 'cin' | 'projectsCount' | 'status' | 'createdAt';
type ProjectSortField = 'projectObject' | 'clientName' | 'commune' | 'status' | 'createdAt';

function compareClients(left: ClientBrief, right: ClientBrief, field: ClientSortField): number {
    switch (field) {
        case 'fullName':
            return left.fullName.localeCompare(right.fullName);
        case 'cin':
            return (left.cin ?? '').localeCompare(right.cin ?? '');
        case 'projectsCount':
            return left.projectsCount - right.projectsCount;
        case 'status':
            return left.status.localeCompare(right.status);
        case 'createdAt':
            return (left.createdAt ?? '').localeCompare(right.createdAt ?? '');
    }
}

function compareProjects(left: ProjectBrief, right: ProjectBrief, field: ProjectSortField): number {
    switch (field) {
        case 'projectObject':
            return (left.projectObject ?? left.dossierNumber).localeCompare(
                right.projectObject ?? right.dossierNumber,
            );
        case 'clientName':
            return (left.clientName ?? '').localeCompare(right.clientName ?? '');
        case 'commune':
            return (left.commune ?? '').localeCompare(right.commune ?? '');
        case 'status':
            return left.status.localeCompare(right.status);
        case 'createdAt':
            return (left.createdAt ?? '').localeCompare(right.createdAt ?? '');
    }
}

type TabDefinition = {
    id: TabId;
    labelKey: string;
    icon: LucideIcon;
};

const PAGE_SIZE = 10;
const TABS: TabDefinition[] = [
    { id: 'overview', labelKey: 'intermediaries.overview', icon: ContactRound },
    { id: 'clients', labelKey: 'intermediaries.clients', icon: Users },
    { id: 'projects', labelKey: 'intermediaries.projects', icon: FolderKanban },
    { id: 'analytics', labelKey: 'intermediaries.analytics', icon: BarChart3 },
    { id: 'activity', labelKey: 'intermediaries.activity', icon: History },
];

const AVATAR_COLORS = [
    'bg-blue-500/15 text-blue-600 dark:text-blue-400',
    'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    'bg-violet-500/15 text-violet-600 dark:text-violet-400',
    'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    'bg-rose-500/15 text-rose-600 dark:text-rose-400',
    'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400',
];

function avatarColor(id: number): string {
    return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

function formatContact(value: string | null | undefined): string {
    return value && value.trim() !== '' ? value : '-';
}

function humanizeStatus(value: string): string {
    return value
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function initialTab(): TabId {
    if (typeof window === 'undefined') return 'overview';
    const tab = new URLSearchParams(window.location.search).get('tab');
    return TABS.some((item) => item.id === tab) ? (tab as TabId) : 'overview';
}

function ColumnHeader({
    label,
    icon: Icon,
    active,
    direction,
    onPress,
}: {
    label: string;
    icon: LucideIcon;
    active?: boolean;
    direction?: SortDirection;
    onPress?: () => void;
}) {
    const content = (
        <>
            <Icon size={13} strokeWidth={1.9} />
            <span>{label}</span>
            {onPress ? (
                active ? (
                    direction === 'asc' ? <ChevronUp size={11} className="text-[var(--accent)]" /> : <ChevronDown size={11} className="text-[var(--accent)]" />
                ) : <ChevronsUpDown size={11} className="text-[var(--text-muted)]" />
            ) : null}
        </>
    );

    if (!onPress) return <span className="inline-flex items-center gap-1.5">{content}</span>;

    return (
        <button type="button" onClick={onPress} className="inline-flex items-center gap-1.5 text-left transition hover:text-[var(--foreground)]">
            {content}
        </button>
    );
}

function PaginationFooter({
    page,
    pageCount,
    onPrevious,
    onNext,
    resultLabel,
    pageLabel,
    previousLabel,
    nextLabel,
}: {
    page: number;
    pageCount: number;
    onPrevious: () => void;
    onNext: () => void;
    resultLabel: string;
    pageLabel: string;
    previousLabel: string;
    nextLabel: string;
}) {
    return (
        <div className="flex items-center justify-between px-3 py-2">
            <span className="text-[10px] text-[var(--text-muted)]">{resultLabel}</span>
            <div className="flex items-center gap-1.5">
                <AppButton isIconOnly compact size="sm" variant="quiet" tooltip={previousLabel} aria-label={previousLabel} isDisabled={page === 0} onPress={onPrevious}>
                    <ChevronLeft size={14} />
                </AppButton>
                <span className="min-w-20 text-center text-[10px] font-semibold tabular-nums text-[var(--text-muted)]">{pageLabel}</span>
                <AppButton isIconOnly compact size="sm" variant="quiet" tooltip={nextLabel} aria-label={nextLabel} isDisabled={page >= pageCount - 1} onPress={onNext}>
                    <ChevronRight size={14} />
                </AppButton>
            </div>
        </div>
    );
}

function activityIcon(type: IntermediaryActivityType): ReactNode {
    if (type === 'client_created') return <UserCheck size={14} />;
    if (type === 'client_updated') return <UserRound size={14} />;
    if (type === 'project_created') return <FolderKanban size={14} />;
    if (type === 'project_updated') return <RefreshCw size={14} />;
    return <Pencil size={14} />;
}

export default function IntermediaryShow({
    intermediary,
    metrics,
    monthlyClients,
    monthlyProjects,
    clientStatusBreakdown,
    projectStatusBreakdown,
    clients,
    projects,
    activity,
}: IntermediaryShowProps) {
    const { t } = useTranslation();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedIntermediary, setSelectedIntermediary] = useState<IntermediaryRow | null>(null);
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [deleteTarget, setDeleteTarget] = useState<IntermediaryRow | null>(null);
    const [activeTab, setActiveTab] = useState<TabId>(initialTab);

    const [clientQuery, setClientQuery] = useState('');
    const [clientStatus, setClientStatus] = useState('all');
    const [clientSortField, setClientSortField] = useState<ClientSortField>('createdAt');
    const [clientSortDirection, setClientSortDirection] = useState<SortDirection>('desc');
    const [clientPage, setClientPage] = useState(0);

    const [projectQuery, setProjectQuery] = useState('');
    const [projectStatus, setProjectStatus] = useState('all');
    const [projectSortField, setProjectSortField] = useState<ProjectSortField>('createdAt');
    const [projectSortDirection, setProjectSortDirection] = useState<SortDirection>('desc');
    const [projectPage, setProjectPage] = useState(0);
    const [activityPage, setActivityPage] = useState(0);

    function typeLabel(type: string): string {
        const key = ['person', 'agency', 'architect_partner', 'business_referral'].includes(type) ? type : 'other';
        return t(`intermediaries.types.${key}`);
    }

    function statusLabel(status: string): string {
        const known = ['active', 'inactive', 'archived', 'opened', 'closed', 'blocked', 'new', 'pending'];
        return known.includes(status) ? t(`intermediaries.show.statusLabels.${status}`) : humanizeStatus(status);
    }

    function statusColor(status: string): 'success' | 'warning' | 'danger' | 'primary' | 'default' {
        if (status === 'active' || status === 'opened') return 'success';
        if (status === 'inactive' || status === 'pending') return 'warning';
        if (status === 'blocked') return 'danger';
        if (status === 'new') return 'primary';
        return 'default';
    }

    function selectTab(tab: TabId) {
        setActiveTab(tab);
        const url = new URL(window.location.href);
        url.searchParams.set('tab', tab);
        window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}`);
    }

    function openEditDrawer() {
        setSelectedIntermediary(intermediary);
        setFormErrors({});
        setDrawerOpen(true);
    }

    function handleSubmit(payload: IntermediaryFormPayload) {
        if (!selectedIntermediary) return;

        router.put(`/intermediaries/${selectedIntermediary.id}`, {
            name: payload.name,
            type: payload.type || 'person',
            phone: payload.phone || null,
            email: payload.email || null,
            notes: payload.notes || null,
            is_active: payload.isActive,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setDrawerOpen(false);
                setFormErrors({});
                toast.success(t('intermediaries.updateSuccess'));
            },
            onError: (errors) => {
                setFormErrors(errors as FormErrors);
                toast.error(t('intermediaries.formError'));
            },
        });
    }

    function confirmDelete() {
        if (!deleteTarget) return;

        router.delete(`/intermediaries/${deleteTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(t('intermediaries.deleteSuccess'));
                setDeleteTarget(null);
                router.visit('/intermediaries');
            },
            onError: () => toast.error(t('intermediaries.deleteError')),
        });
    }

    function toggleClientSort(field: ClientSortField) {
        if (clientSortField === field) {
            setClientSortDirection((current) => current === 'asc' ? 'desc' : 'asc');
            return;
        }
        setClientSortField(field);
        setClientSortDirection('asc');
    }

    function toggleProjectSort(field: ProjectSortField) {
        if (projectSortField === field) {
            setProjectSortDirection((current) => current === 'asc' ? 'desc' : 'asc');
            return;
        }
        setProjectSortField(field);
        setProjectSortDirection('asc');
    }

    const filteredClients = useMemo(() => {
        const query = clientQuery.trim().toLowerCase();
        return clients
            .filter((client) => {
                if (clientStatus !== 'all' && client.status !== clientStatus) return false;
                if (!query) return true;
                return [client.fullName, client.clientNumber, client.cin, client.phone, client.email]
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase()
                    .includes(query);
            })
            .sort((left, right) => {
                const comparison = compareClients(left, right, clientSortField);
                return clientSortDirection === 'asc' ? comparison : -comparison;
            });
    }, [clientQuery, clientSortDirection, clientSortField, clientStatus, clients]);

    const filteredProjects = useMemo(() => {
        const query = projectQuery.trim().toLowerCase();
        return projects
            .filter((project) => {
                if (projectStatus !== 'all' && project.status !== projectStatus) return false;
                if (!query) return true;
                return [project.projectObject, project.dossierNumber, project.clientName, project.commune, project.workflowStep]
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase()
                    .includes(query);
            })
            .sort((left, right) => {
                const comparison = compareProjects(left, right, projectSortField);
                return projectSortDirection === 'asc' ? comparison : -comparison;
            });
    }, [projectQuery, projectSortDirection, projectSortField, projectStatus, projects]);

    const clientPageCount = Math.max(1, Math.ceil(filteredClients.length / PAGE_SIZE));
    const projectPageCount = Math.max(1, Math.ceil(filteredProjects.length / PAGE_SIZE));
    const activityPageCount = Math.max(1, Math.ceil(activity.length / PAGE_SIZE));

    const resolvedClientPage = Math.min(clientPage, clientPageCount - 1);
    const resolvedProjectPage = Math.min(projectPage, projectPageCount - 1);
    const resolvedActivityPage = Math.min(activityPage, activityPageCount - 1);

    const pageClients = filteredClients.slice(
        resolvedClientPage * PAGE_SIZE,
        (resolvedClientPage + 1) * PAGE_SIZE,
    );
    const pageProjects = filteredProjects.slice(
        resolvedProjectPage * PAGE_SIZE,
        (resolvedProjectPage + 1) * PAGE_SIZE,
    );
    const pageActivity = activity.slice(
        resolvedActivityPage * PAGE_SIZE,
        (resolvedActivityPage + 1) * PAGE_SIZE,
    );

    const clientStatuses = useMemo(() => ['all', ...Array.from(new Set(clients.map((client) => client.status)))], [clients]);
    const projectStatuses = useMemo(() => ['all', ...Array.from(new Set(projects.map((project) => project.status)))], [projects]);

    const clientColumns: AppWorkspaceTableColumn<ClientBrief>[] = [
        {
            id: 'avatar',
            label: '',
            headerClassName: 'w-8',
            reorderable: false,
            render: (client) => <span className={cn('flex size-7 items-center justify-center rounded-lg text-[10px] font-bold', avatarColor(client.id))}>{client.fullName.charAt(0).toUpperCase()}</span>,
        },
        {
            id: 'client',
            label: <ColumnHeader label={t('intermediaries.show.client')} icon={UserRound} active={clientSortField === 'fullName'} direction={clientSortDirection} onPress={() => toggleClientSort('fullName')} />,
            render: (client) => <div className="min-w-0"><p className="max-w-[190px] truncate font-medium text-[var(--text)]">{client.fullName}</p><p className="text-[11px] text-[var(--text-muted)]">{client.clientNumber}</p></div>,
        },
        {
            id: 'cin',
            label: <ColumnHeader label={t('intermediaries.show.cin')} icon={IdCard} active={clientSortField === 'cin'} direction={clientSortDirection} onPress={() => toggleClientSort('cin')} />,
            render: (client) => <span className="whitespace-nowrap text-[var(--text-muted)]">{client.cin || '-'}</span>,
        },
        {
            id: 'contact',
            label: <ColumnHeader label={t('intermediaries.show.contact')} icon={Phone} />,
            render: (client) => <div className="grid gap-0.5"><span className="text-[var(--text)]">{formatContact(client.phone)}</span><span className="max-w-[180px] truncate text-[11px] text-[var(--text-muted)]">{formatContact(client.email)}</span></div>,
        },
        {
            id: 'projects',
            label: <ColumnHeader label={t('intermediaries.show.projectsCount')} icon={FolderKanban} active={clientSortField === 'projectsCount'} direction={clientSortDirection} onPress={() => toggleClientSort('projectsCount')} />,
            render: (client) => <AppBadge tone="blue">{client.projectsCount}</AppBadge>,
        },
        {
            id: 'status',
            label: <ColumnHeader label={t('intermediaries.status')} icon={CircleDot} active={clientSortField === 'status'} direction={clientSortDirection} onPress={() => toggleClientSort('status')} />,
            render: (client) => <StatusPill label={statusLabel(client.status)} color={statusColor(client.status)} size="sm" />,
        },
        {
            id: 'created',
            label: <ColumnHeader label={t('intermediaries.show.created')} icon={CalendarDays} active={clientSortField === 'createdAt'} direction={clientSortDirection} onPress={() => toggleClientSort('createdAt')} />,
            render: (client) => <span className="whitespace-nowrap text-[var(--text-muted)]">{client.createdAt || '-'}</span>,
        },
        {
            id: 'actions',
            label: '',
            headerClassName: 'w-10',
            reorderable: false,
            render: (client) => <div onClick={(event) => event.stopPropagation()}><AppButton isIconOnly compact variant="quiet" size="sm" tooltip={t('intermediaries.show.openClient')} aria-label={t('intermediaries.show.openClient')} onPress={() => router.visit(`/clients/${client.id}`)}><Eye size={13} /></AppButton></div>,
        },
    ];

    const projectColumns: AppWorkspaceTableColumn<ProjectBrief>[] = [
        {
            id: 'project',
            label: <ColumnHeader label={t('intermediaries.show.project')} icon={Building2} active={projectSortField === 'projectObject'} direction={projectSortDirection} onPress={() => toggleProjectSort('projectObject')} />,
            render: (project) => <div className="min-w-0"><p className="max-w-[220px] truncate font-medium text-[var(--text)]">{project.projectObject || project.dossierNumber}</p><p className="text-[11px] text-[var(--text-muted)]">{project.dossierNumber}</p></div>,
        },
        {
            id: 'client',
            label: <ColumnHeader label={t('intermediaries.show.clientName')} icon={UserRound} active={projectSortField === 'clientName'} direction={projectSortDirection} onPress={() => toggleProjectSort('clientName')} />,
            render: (project) => <span className="max-w-[180px] truncate text-[var(--text-muted)]">{project.clientName || '-'}</span>,
        },
        {
            id: 'commune',
            label: <ColumnHeader label={t('intermediaries.show.commune')} icon={MapPin} active={projectSortField === 'commune'} direction={projectSortDirection} onPress={() => toggleProjectSort('commune')} />,
            render: (project) => <span className="text-[var(--text-muted)]">{project.commune || '-'}</span>,
        },
        {
            id: 'status',
            label: <ColumnHeader label={t('intermediaries.status')} icon={CircleDot} active={projectSortField === 'status'} direction={projectSortDirection} onPress={() => toggleProjectSort('status')} />,
            render: (project) => <StatusPill label={statusLabel(project.status)} color={statusColor(project.status)} size="sm" />,
        },
        {
            id: 'created',
            label: <ColumnHeader label={t('intermediaries.show.created')} icon={CalendarDays} active={projectSortField === 'createdAt'} direction={projectSortDirection} onPress={() => toggleProjectSort('createdAt')} />,
            render: (project) => <span className="whitespace-nowrap text-[var(--text-muted)]">{project.createdAt || '-'}</span>,
        },
        {
            id: 'actions',
            label: '',
            headerClassName: 'w-10',
            reorderable: false,
            render: (project) => <div onClick={(event) => event.stopPropagation()}><AppButton isIconOnly compact variant="quiet" size="sm" tooltip={t('intermediaries.show.openProject')} aria-label={t('intermediaries.show.openProject')} onPress={() => router.visit(`/dossiers/${project.id}`)}><Eye size={13} /></AppButton></div>,
        },
    ];

    const tabCounts: Partial<Record<TabId, number>> = {
        clients: clients.length,
        projects: projects.length,
        activity: activity.length,
    };

    const metricCards = [
        { label: t('intermediaries.totalClients'), value: metrics.totalClients, detail: `${metrics.activeClients} ${t('intermediaries.activeClients').toLowerCase()}`, icon: <Users size={16} />, accentColor: '#38bdf8', valueClassName: 'text-sky-300' },
        { label: t('intermediaries.activeClients'), value: metrics.activeClients, detail: `${metrics.inactiveClients} ${t('intermediaries.inactiveClients').toLowerCase()}`, icon: <UserCheck size={16} />, accentColor: '#34d399', valueClassName: 'text-emerald-300' },
        { label: t('intermediaries.totalProjects'), value: metrics.totalProjects, detail: `${metrics.archivedProjects} ${t('intermediaries.show.archivedProjects').toLowerCase()}`, icon: <FolderKanban size={16} />, accentColor: '#60a5fa', valueClassName: 'text-blue-300' },
        { label: t('intermediaries.show.activeProjects'), value: metrics.activeProjects, detail: `${metrics.blockedProjects} ${t('intermediaries.show.blockedProjects').toLowerCase()}`, icon: <CheckCircle2 size={16} />, accentColor: '#a78bfa', valueClassName: 'text-violet-300' },
    ];

    return (
        <>
            <Head title={intermediary.name} />
            <AppShell>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 items-start gap-2.5">
                        <AppButton isIconOnly compact variant="quiet" tooltip={t('intermediaries.show.backToList')} aria-label={t('intermediaries.show.backToList')} onPress={() => router.visit('/intermediaries')}>
                            <ArrowLeft size={15} />
                        </AppButton>
                        <div className="min-w-0">
                            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">{t('intermediaries.eyebrow')}</p>
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="truncate text-2xl font-bold tracking-[-0.02em] text-[var(--foreground)]">{intermediary.name}</h1>
                                <StatusPill label={intermediary.isActive ? t('intermediaries.statuses.active') : t('intermediaries.statuses.inactive')} color={intermediary.isActive ? 'success' : 'warning'} size="sm" />
                                <AppBadge tone="violet">{typeLabel(intermediary.type)}</AppBadge>
                            </div>
                            <p className="mt-1 text-xs text-[var(--text-muted)]">{intermediary.code}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                        <AppButton isIconOnly compact variant="quiet" tooltip={t('intermediaries.editIntermediary')} aria-label={t('intermediaries.editIntermediary')} onPress={openEditDrawer}><Pencil size={14} /></AppButton>
                        <AppButton isIconOnly compact variant="danger-soft" color="danger" tooltip={t('intermediaries.deleteIntermediary')} aria-label={t('intermediaries.deleteIntermediary')} onPress={() => setDeleteTarget(intermediary)}><Trash2 size={14} /></AppButton>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
                    <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                        <span className={cn('flex size-14 shrink-0 items-center justify-center rounded-2xl text-lg font-bold', avatarColor(intermediary.id))}>{intermediary.name.charAt(0).toUpperCase()}</span>
                        <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-3">
                            <div><p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">{t('intermediaries.type')}</p><p className="mt-1 text-sm font-medium text-[var(--foreground)]">{typeLabel(intermediary.type)}</p></div>
                            <div><p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">{t('intermediaries.contact')}</p><p className="mt-1 truncate text-sm font-medium text-[var(--foreground)]">{intermediary.phone || intermediary.email || '-'}</p></div>
                            <div><p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">{t('intermediaries.updated')}</p><p className="mt-1 text-sm font-medium text-[var(--foreground)]">{intermediary.updatedAt || '-'}</p></div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {metricCards.map((card) => <AppKpiCard key={card.label} {...card} />)}
                </div>

                <div className="overflow-x-auto border-b border-[var(--border)]">
                    <div className="flex min-w-max items-center gap-1">
                        {TABS.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <AppButton
                                    key={tab.id}
                                    compact
                                    variant="quiet"
                                    onPress={() => selectTab(tab.id)}
                                    className={cn('relative rounded-none px-3 text-[12px]', activeTab === tab.id ? 'text-[var(--accent)] after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full after:bg-[var(--accent)]' : 'text-[var(--text-muted)]')}
                                >
                                    <Icon size={13} />
                                    {t(tab.labelKey)}
                                    {tabCounts[tab.id] !== undefined ? <span className="rounded bg-[var(--surface-2)] px-1.5 py-px text-[9px] font-semibold text-[var(--text-muted)]">{tabCounts[tab.id]}</span> : null}
                                </AppButton>
                            );
                        })}
                    </div>
                </div>

                {activeTab === 'overview' ? (
                    <div className="grid gap-4 lg:grid-cols-3">
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm lg:col-span-2">
                            <div className="mb-3 flex items-center justify-between gap-3">
                                <div><h2 className="text-sm font-semibold text-[var(--foreground)]">{t('intermediaries.show.summary')}</h2><p className="mt-0.5 text-[11px] text-[var(--text-muted)]">{t('intermediaries.relationshipOverview')}</p></div>
                                <Activity size={15} className="text-[var(--accent)]" />
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)]/45 p-3"><p className="text-[11px] text-[var(--text-muted)]">{t('intermediaries.linkedClients')}</p><p className="mt-1 text-2xl font-bold text-[var(--foreground)]">{metrics.totalClients}</p><p className="mt-1 text-[11px] text-emerald-400">{metrics.activeClients} {t('intermediaries.activeClients').toLowerCase()}</p></div>
                                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)]/45 p-3"><p className="text-[11px] text-[var(--text-muted)]">{t('intermediaries.linkedProjects')}</p><p className="mt-1 text-2xl font-bold text-[var(--foreground)]">{metrics.totalProjects}</p><p className="mt-1 text-[11px] text-blue-400">{metrics.activeProjects} {t('intermediaries.show.activeProjects').toLowerCase()}</p></div>
                            </div>
                            <div className="mt-4"><p className="mb-2 text-[11px] font-medium text-[var(--text-muted)]">{t('intermediaries.monthlyClients')}</p><MiniLineChart data={monthlyClients} height={180} /></div>
                        </div>
                        <div className="space-y-4">
                            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
                                <h2 className="text-sm font-semibold text-[var(--foreground)]">{t('intermediaries.show.contactDetails')}</h2>
                                <div className="mt-3 space-y-2.5 text-xs"><p className="flex items-center gap-2 text-[var(--foreground)]"><Phone size={13} className="text-[var(--text-muted)]" />{intermediary.phone || '-'}</p><p className="flex items-center gap-2 text-[var(--foreground)]"><Mail size={13} className="text-[var(--text-muted)]" />{intermediary.email || '-'}</p></div>
                            </div>
                            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
                                <h2 className="text-sm font-semibold text-[var(--foreground)]">{t('intermediaries.show.notes')}</h2>
                                <p className="mt-3 whitespace-pre-wrap text-xs leading-5 text-[var(--text-muted)]">{intermediary.notes || t('intermediaries.show.noNotes')}</p>
                            </div>
                            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
                                <h2 className="text-sm font-semibold text-[var(--foreground)]">{t('intermediaries.show.latestClients')}</h2>
                                <div className="mt-2 space-y-1">
                                    {clients.slice(0, 5).map((client) => <AppButton key={client.id} variant="quiet" size="sm" onPress={() => router.visit(`/clients/${client.id}`)} className="h-auto w-full justify-start px-2 py-2 text-left"><span className={cn('flex size-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold', avatarColor(client.id))}>{client.fullName.charAt(0)}</span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-medium text-[var(--foreground)]">{client.fullName}</span><span className="block text-[10px] text-[var(--text-muted)]">{client.clientNumber}</span></span></AppButton>)}
                                    {clients.length === 0 ? <p className="py-3 text-xs text-[var(--text-muted)]">{t('intermediaries.noClients')}</p> : null}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null}

                {activeTab === 'clients' ? (
                    <div>
                        <p className="mb-3 text-xs text-[var(--text-muted)]">{t('intermediaries.show.clientsDescription')}</p>
                        <AppWorkspaceTable
                            ariaLabel={t('intermediaries.clients')}
                            columns={clientColumns}
                            columnOrderStorageKey="archilbo.intermediaries.show.clients.columns.v1"
                            columnOrderHint={t('intermediaries.table.reorderHint')}
                            data={pageClients}
                            rowKey={(client) => client.id}
                            minTableWidthClassName="min-w-[840px]"
                            onRowPress={(client) => router.visit(`/clients/${client.id}`)}
                            emptyContent={<AppEmptyState title={t('intermediaries.noClients')} description={t('intermediaries.show.noClientData')} />}
                            toolbar={<div className="flex flex-wrap items-center gap-2 px-3 py-2"><div className="relative min-w-[200px] flex-1"><Search size={12} className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" /><Input value={clientQuery} onChange={(event) => { setClientQuery(event.target.value); setClientPage(0); }} placeholder={t('intermediaries.show.searchClients')} className="h-7 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] pl-7 pr-7 text-[11px] text-[var(--text)] outline-none" />{clientQuery ? <AppButton isIconOnly compact variant="quiet" size="sm" aria-label={t('intermediaries.resetFilters')} onPress={() => { setClientQuery(''); setClientPage(0); }} className="absolute right-0 top-1/2 -translate-y-1/2"><X size={11} /></AppButton> : null}</div><div className="flex flex-wrap items-center gap-1">{clientStatuses.map((status) => <AppButton key={status} compact size="sm" variant={clientStatus === status ? 'accent' : 'quiet'} onPress={() => { setClientStatus(status); setClientPage(0); }}>{status === 'all' ? t('intermediaries.show.allStatuses') : statusLabel(status)}</AppButton>)}</div></div>}
                            renderMobileRow={(client) => <div className="flex items-start gap-2 p-3"><span className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg text-[12px] font-bold', avatarColor(client.id))}>{client.fullName.charAt(0)}</span><AppButton variant="quiet" size="sm" onPress={() => router.visit(`/clients/${client.id}`)} className="h-auto min-w-0 flex-1 justify-start p-0 text-left"><span className="min-w-0 flex-1"><span className="flex items-center gap-2"><span className="truncate text-[13px] font-semibold text-[var(--foreground)]">{client.fullName}</span><StatusPill label={statusLabel(client.status)} color={statusColor(client.status)} size="sm" /></span><span className="mt-0.5 block text-[11px] text-[var(--text-muted)]">{client.cin || client.clientNumber} · {client.projectsCount} {t('intermediaries.projects').toLowerCase()}</span></span></AppButton></div>}
                            footer={<PaginationFooter page={resolvedClientPage} pageCount={clientPageCount} onPrevious={() => setClientPage(Math.max(0, resolvedClientPage - 1))} onNext={() => setClientPage(Math.min(clientPageCount - 1, resolvedClientPage + 1))} resultLabel={t('intermediaries.show.resultCount', { count: filteredClients.length })} pageLabel={t('intermediaries.show.pageStatus', { current: resolvedClientPage + 1, total: clientPageCount })} previousLabel={t('intermediaries.pagination.previous')} nextLabel={t('intermediaries.pagination.next')} />}
                        />
                    </div>
                ) : null}

                {activeTab === 'projects' ? (
                    <div>
                        <p className="mb-3 text-xs text-[var(--text-muted)]">{t('intermediaries.show.projectsDescription')}</p>
                        <AppWorkspaceTable
                            ariaLabel={t('intermediaries.projects')}
                            columns={projectColumns}
                            columnOrderStorageKey="archilbo.intermediaries.show.projects.columns.v1"
                            columnOrderHint={t('intermediaries.table.reorderHint')}
                            data={pageProjects}
                            rowKey={(project) => project.id}
                            minTableWidthClassName="min-w-[760px]"
                            onRowPress={(project) => router.visit(`/dossiers/${project.id}`)}
                            emptyContent={<AppEmptyState title={t('intermediaries.noProjects')} description={t('intermediaries.show.noProjectData')} />}
                            toolbar={<div className="flex flex-wrap items-center gap-2 px-3 py-2"><div className="relative min-w-[200px] flex-1"><Search size={12} className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" /><Input value={projectQuery} onChange={(event) => { setProjectQuery(event.target.value); setProjectPage(0); }} placeholder={t('intermediaries.show.searchProjects')} className="h-7 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] pl-7 pr-7 text-[11px] text-[var(--text)] outline-none" />{projectQuery ? <AppButton isIconOnly compact variant="quiet" size="sm" aria-label={t('intermediaries.resetFilters')} onPress={() => { setProjectQuery(''); setProjectPage(0); }} className="absolute right-0 top-1/2 -translate-y-1/2"><X size={11} /></AppButton> : null}</div><div className="flex flex-wrap items-center gap-1">{projectStatuses.map((status) => <AppButton key={status} compact size="sm" variant={projectStatus === status ? 'accent' : 'quiet'} onPress={() => { setProjectStatus(status); setProjectPage(0); }}>{status === 'all' ? t('intermediaries.show.allStatuses') : statusLabel(status)}</AppButton>)}</div></div>}
                            renderMobileRow={(project) => <div className="flex items-start gap-2 p-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400"><FolderKanban size={15} /></span><AppButton variant="quiet" size="sm" onPress={() => router.visit(`/dossiers/${project.id}`)} className="h-auto min-w-0 flex-1 justify-start p-0 text-left"><span className="min-w-0 flex-1"><span className="flex items-center gap-2"><span className="truncate text-[13px] font-semibold text-[var(--foreground)]">{project.projectObject || project.dossierNumber}</span><StatusPill label={statusLabel(project.status)} color={statusColor(project.status)} size="sm" /></span><span className="mt-0.5 block text-[11px] text-[var(--text-muted)]">{project.clientName || '-'} · {project.commune || '-'}</span></span></AppButton></div>}
                            footer={<PaginationFooter page={resolvedProjectPage} pageCount={projectPageCount} onPrevious={() => setProjectPage(Math.max(0, resolvedProjectPage - 1))} onNext={() => setProjectPage(Math.min(projectPageCount - 1, resolvedProjectPage + 1))} resultLabel={t('intermediaries.show.resultCount', { count: filteredProjects.length })} pageLabel={t('intermediaries.show.pageStatus', { current: resolvedProjectPage + 1, total: projectPageCount })} previousLabel={t('intermediaries.pagination.previous')} nextLabel={t('intermediaries.pagination.next')} />}
                        />
                    </div>
                ) : null}

                {activeTab === 'analytics' ? (
                    <div>
                        <p className="mb-3 text-xs text-[var(--text-muted)]">{t('intermediaries.show.analyticsDescription')}</p>
                        <div className="grid gap-4 lg:grid-cols-2">
                            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm"><div className="mb-2 flex items-center justify-between"><h2 className="text-sm font-semibold text-[var(--foreground)]">{t('intermediaries.monthlyClients')}</h2><span className="text-lg font-bold text-[var(--accent)]">{metrics.totalClients}</span></div><MiniLineChart data={monthlyClients} height={220} /></div>
                            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm"><div className="mb-2 flex items-center justify-between"><h2 className="text-sm font-semibold text-[var(--foreground)]">{t('intermediaries.monthlyProjects')}</h2><span className="text-lg font-bold text-blue-400">{metrics.totalProjects}</span></div><MiniLineChart data={monthlyProjects} color="#60a5fa" height={220} /></div>
                            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm"><h2 className="mb-3 text-sm font-semibold text-[var(--foreground)]">{t('intermediaries.clientDistribution')}</h2><div className="flex flex-wrap items-center gap-6"><DonutChart data={clientStatusBreakdown} colorMap={{ active: '#34d399', inactive: '#fbbf24', archived: '#a78bfa' }} size={130} /><div className="space-y-2">{clientStatusBreakdown.map((item) => <div key={item.status} className="flex items-center gap-2 text-xs"><span className={cn('size-2.5 rounded-full', item.status === 'active' ? 'bg-emerald-400' : item.status === 'inactive' ? 'bg-amber-400' : 'bg-violet-400')} /><span className="text-[var(--text-muted)]">{statusLabel(item.status)}</span><span className="font-semibold text-[var(--foreground)]">{item.count}</span></div>)}</div></div></div>
                            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm"><h2 className="mb-3 text-sm font-semibold text-[var(--foreground)]">{t('intermediaries.projectDistribution')}</h2>{projectStatusBreakdown.length > 0 ? <div className="flex flex-wrap items-center gap-6"><DonutChart data={projectStatusBreakdown} colorMap={{ active: '#34d399', opened: '#60a5fa', closed: '#94a3b8', archived: '#a78bfa', blocked: '#f87171', new: '#38bdf8' }} size={130} /><div className="space-y-2">{projectStatusBreakdown.map((item) => <div key={item.status} className="flex items-center gap-2 text-xs"><CircleDot size={10} className="text-[var(--accent)]" /><span className="text-[var(--text-muted)]">{statusLabel(item.status)}</span><span className="font-semibold text-[var(--foreground)]">{item.count}</span></div>)}</div></div> : <AppEmptyState title={t('intermediaries.show.noAnalyticsData')} />}</div>
                        </div>
                    </div>
                ) : null}

                {activeTab === 'activity' ? (
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
                        <div className="border-b border-[var(--border)] px-4 py-3"><h2 className="text-sm font-semibold text-[var(--foreground)]">{t('intermediaries.activity')}</h2><p className="mt-0.5 text-[11px] text-[var(--text-muted)]">{t('intermediaries.show.activityDescription')}</p></div>
                        {pageActivity.length > 0 ? <div className="divide-y divide-[var(--border)]">{pageActivity.map((item: IntermediaryActivityItem) => <button key={item.id} type="button" disabled={!item.href} onClick={() => item.href && router.visit(item.href)} className={cn('flex w-full items-start gap-3 px-4 py-3 text-left', item.href ? 'transition hover:bg-[var(--surface-2)]' : 'cursor-default')}><span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]/10 text-[var(--accent)]">{activityIcon(item.type)}</span><span className="min-w-0 flex-1"><span className="block text-xs font-semibold text-[var(--foreground)]">{t(`intermediaries.show.activityTypes.${item.type}`)}</span><span className="mt-0.5 block truncate text-[11px] text-[var(--text-muted)]">{item.subjectName}{item.subjectCode ? ` · ${item.subjectCode}` : ''}</span></span><span className="shrink-0 text-[10px] text-[var(--text-muted)]">{item.occurredAtHuman}</span></button>)}</div> : <div className="p-6"><AppEmptyState title={t('intermediaries.noActivity')} description={t('intermediaries.noActivityDesc')} /></div>}
                        <div className="border-t border-[var(--border)]"><PaginationFooter page={resolvedActivityPage} pageCount={activityPageCount} onPrevious={() => setActivityPage(Math.max(0, resolvedActivityPage - 1))} onNext={() => setActivityPage(Math.min(activityPageCount - 1, resolvedActivityPage + 1))} resultLabel={t('intermediaries.show.resultCount', { count: activity.length })} pageLabel={t('intermediaries.show.pageStatus', { current: resolvedActivityPage + 1, total: activityPageCount })} previousLabel={t('intermediaries.pagination.previous')} nextLabel={t('intermediaries.pagination.next')} /></div>
                    </div>
                ) : null}

                <IntermediaryDrawer isOpen={drawerOpen} mode="edit" intermediary={selectedIntermediary} onOpenChange={setDrawerOpen} onSubmit={handleSubmit} errors={formErrors} />

                <AppModal isOpen={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }} title={t('intermediaries.deleteIntermediary')} size="sm">
                    <p className="mb-5 text-sm text-[var(--text-muted)]">{t('intermediaries.deleteConfirm')} <strong>{deleteTarget?.name}</strong>? {t('intermediaries.deleteWarning')}</p>
                    {deleteTarget && deleteTarget.clientsCount > 0 ? <div className="mb-4 rounded-lg border border-[var(--danger)]/30 bg-[var(--danger)]/5 px-3 py-2 text-[12px] text-[var(--danger)]">{t('intermediaries.deleteHasClients', { count: deleteTarget.clientsCount })}</div> : null}
                    <div className="flex justify-end gap-2"><AppButton variant="bordered" onPress={() => setDeleteTarget(null)}>{t('intermediaries.cancel')}</AppButton><AppButton color="danger" variant="solid" onPress={confirmDelete}>{t('intermediaries.delete')}</AppButton></div>
                </AppModal>
            </AppShell>
        </>
    );
}
