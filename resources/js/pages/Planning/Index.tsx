import { Head, router, usePage } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    AlertTriangle,
    CalendarCheck,
    CheckCircle2,
    Download,
    Eye,
    Pencil,
    Plus,
    Square,
    UserRound,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppDataTable } from '@/components/ui/AppDataTable';
import { AppStatusBadge } from '@/components/ui/AppStatusBadge';
import { AppTableActionButton } from '@/components/ui/AppTableActionButton';
import { AppTableActions } from '@/components/ui/AppTableActions';
import { PlanningBoard } from '@/features/planning/components/PlanningBoard';
import { PlanningFocusPanel } from '@/features/planning/components/PlanningFocusPanel';
import { PlanningTimeline } from '@/features/planning/components/PlanningTimeline';
import { useTranslation } from '@/lib/i18n';

type PlanningStatus = 'pending' | 'active' | 'completed' | 'blocked' | 'overdue';
type PlanningPriority = 'low' | 'normal' | 'high' | 'urgent';

type PlanningTaskRow = {
    id: number;
    title: string;
    type: string;
    dossierNumber: string;
    projectObject: string;
    client: string;
    cin: string;
    assignee: string;
    priority: PlanningPriority;
    status: PlanningStatus;
    startsAt: string;
    dueDate: string;
    dayKey: string;
    progress: number;
    updatedAt: string;
    nextAction: string;
};

type PageProps = {
    tasks: PlanningTaskRow[];
    metrics: { total: number; active: number; overdue: number; completed: number };
};

const statusTone: Record<PlanningStatus, 'neutral' | 'blue' | 'green' | 'amber' | 'red' | 'violet'> = {
    pending: 'amber',
    active: 'blue',
    completed: 'green',
    blocked: 'red',
    overdue: 'red',
};

const priorityTone: Record<PlanningPriority, 'neutral' | 'blue' | 'green' | 'amber' | 'red' | 'violet'> = {
    low: 'neutral',
    normal: 'blue',
    high: 'amber',
    urgent: 'red',
};

function ProgressCell({ value }: { value: number }) {
    return (
        <div className="flex min-w-24 items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--surface-2)]">
                <div
                    className="h-full rounded-full bg-[var(--accent)]"
                    style={{ width: `${value}%` }}
                />
            </div>
            <span className="w-8 text-right text-[11px] text-[var(--text-muted)]">
                {value}%
            </span>
        </div>
    );
}

export default function PlanningIndex() {
    const { t } = useTranslation();
    const page = usePage<PageProps>();
    const { tasks, metrics } = page.props;
    const [selectedTask, setSelectedTask] = useState<PlanningTaskRow | null>(tasks[0] || null);

    const columns = useMemo<ColumnDef<PlanningTaskRow, unknown>[]>(
        () => [
            {
                accessorKey: 'title',
                header: t('planningWorkspace.table.task'),
                cell: ({ row }) => (
                    <div className="app-table-primary-cell">
                        <div className="flex items-center gap-2">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent)]">
                                <CalendarCheck size={15} />
                            </div>

                            <div className="min-w-0">
                                <p className="max-w-[250px] truncate text-sm font-semibold">
                                    {row.original.title}
                                </p>
                                <p className="text-xs text-[var(--text-muted)]">
                                    {t(`planningWorkspace.type.${row.original.type}`)}
                                </p>
                            </div>
                        </div>
                    </div>
                ),
            },
            {
                accessorKey: 'projectObject',
                header: t('planningWorkspace.table.project'),
                cell: ({ row }) => (
                    <div>
                        <p className="max-w-[210px] truncate text-sm font-medium">
                            {row.original.projectObject}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                            {row.original.dossierNumber} - {row.original.client}
                        </p>
                    </div>
                ),
            },
            {
                accessorKey: 'assignee',
                header: t('planningWorkspace.table.assignee'),
                cell: ({ row }) => (
                    <AppBadge tone="violet">
                        <UserRound size={10} />
                        {row.original.assignee}
                    </AppBadge>
                ),
            },
            {
                accessorKey: 'priority',
                header: t('planningWorkspace.table.priority'),
                cell: ({ row }) => (
                    <AppBadge tone={priorityTone[row.original.priority]}>
                        {t(`planningWorkspace.priority.${row.original.priority}`)}
                    </AppBadge>
                ),
            },
            {
                accessorKey: 'status',
                header: t('planningWorkspace.table.status'),
                cell: ({ row }) => (
                    <AppStatusBadge
                        label={t(`planningWorkspace.status.${row.original.status}`)}
                        tone={statusTone[row.original.status]}
                        icon={
                            row.original.status === 'completed'
                                ? 'check'
                                : row.original.status === 'overdue' || row.original.status === 'blocked'
                                  ? 'warning'
                                  : 'clock'
                        }
                    />
                ),
            },
            {
                accessorKey: 'dueDate',
                header: t('planningWorkspace.table.dueDate'),
                cell: ({ row }) => (
                    <div>
                        <p className="text-sm font-medium">{row.original.dueDate}</p>
                        <ProgressCell value={row.original.progress} />
                    </div>
                ),
            },
            {
                id: 'actions',
                header: t('planningWorkspace.table.actions'),
                cell: ({ row }) => (
                    <AppTableActions>
                        <AppTableActionButton
                            label={t('actions.view')}
                            tone="view"
                            onPress={() => setSelectedTask(row.original)}
                        >
                            <Eye size={15} />
                        </AppTableActionButton>

                        <AppTableActionButton
                            label={t('actions.edit')}
                            tone="edit"
                            onPress={() => toast.info(t('planningWorkspace.toast.edit'))}
                        >
                            <Pencil size={15} />
                        </AppTableActionButton>

                        <AppTableActionButton
                            label={t('planningWorkspace.markDone')}
                            tone="create"
                            onPress={() => toast.success(t('planningWorkspace.toast.done'))}
                        >
                            <CheckCircle2 size={15} />
                        </AppTableActionButton>

                        <AppTableActionButton
                            label={t('planningWorkspace.blockTask')}
                            tone="delete"
                            onPress={() => toast.error(t('planningWorkspace.toast.block'))}
                        >
                            <Square size={15} />
                        </AppTableActionButton>
                    </AppTableActions>
                ),
            },
        ],
        [t],
    );

    const metricCards = [
        {
            label: t('planningWorkspace.metrics.total'),
            value: metrics.total,
            icon: CalendarCheck,
        },
        {
            label: t('planningWorkspace.metrics.active'),
            value: metrics.active,
            icon: Eye,
        },
        {
            label: t('planningWorkspace.metrics.overdue'),
            value: metrics.overdue,
            icon: AlertTriangle,
        },
        {
            label: t('planningWorkspace.metrics.completed'),
            value: metrics.completed,
            icon: CheckCircle2,
        },
    ];

    return (
        <>
            <Head title={t('planningWorkspace.title')} />

            <AppShell
                eyebrowKey="planningWorkspace.eyebrow"
                titleKey="planningWorkspace.title"
                subtitleKey="planningWorkspace.subtitle"
                action={
                    <div className="flex items-center gap-2">
                        <AppButton
                            variant="secondary"
                            onPress={() => toast.info(t('planningWorkspace.toast.export'))}
                        >
                            <Download size={16} />
                            {t('planningWorkspace.exportList')}
                        </AppButton>

                        <AppButton
                            variant="primary"
                            onPress={() => toast.success(t('planningWorkspace.toast.newTask'))}
                        >
                            <Plus size={16} />
                            {t('planningWorkspace.newTask')}
                        </AppButton>
                    </div>
                }
            >
                <section className="grid min-w-0 gap-5 md:grid-cols-2 xl:grid-cols-4">
                    {metricCards.map((metric) => {
                        const Icon = metric.icon;

                        return (
                            <AppCard key={metric.label} className="p-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-[var(--text-muted)]">
                                        {metric.label}
                                    </p>

                                    <div className="flex size-9 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)]">
                                        <Icon size={17} />
                                    </div>
                                </div>

                                <p className="mt-3 text-2xl font-semibold">{metric.value}</p>
                            </AppCard>
                        );
                    })}
                </section>

                <PlanningBoard tasks={tasks} onSelectTask={setSelectedTask} />

                <section className="grid min-w-0 gap-5 2xl:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="min-w-0 space-y-5">
                        <AppDataTable
                            data={tasks}
                            columns={columns}
                            searchPlaceholder={t('planningWorkspace.searchPlaceholder')}
                            emptyTitle={t('planningWorkspace.emptyTitle')}
                            emptyDescription={t('planningWorkspace.emptyDescription')}
                            pageSize={6}
                        />

                        <PlanningTimeline />
                    </div>

                    <aside className="min-w-0 space-y-5 2xl:sticky 2xl:top-24 2xl:self-start">
                        <PlanningFocusPanel task={selectedTask} />

                        <AppCard className="min-w-0 p-4">
                            <div className="mb-4">
                                <h2 className="text-sm font-semibold">{t('planningWorkspace.cards.todayTitle')}</h2>
                                <p className="mt-1 text-sm text-[var(--text-muted)]">
                                    {t('planningWorkspace.cards.todayDescription')}
                                </p>
                            </div>

                            <div className="grid gap-2">
                                <AppButton
                                    variant="primary"
                                    onPress={() => toast.success(t('planningWorkspace.toast.done'))}
                                >
                                    <CheckCircle2 size={16} />
                                    {t('planningWorkspace.markDone')}
                                </AppButton>

                                <AppButton
                                    variant="secondary"
                                    onPress={() => selectedTask ? router.visit(`/dossiers/${selectedTask.id}`) : null}
                                >
                                    <CalendarCheck size={16} />
                                    {t('actions.view')}
                                </AppButton>
                            </div>
                        </AppCard>
                    </aside>
                </section>
            </AppShell>
        </>
    );
}
