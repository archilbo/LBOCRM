import { Head, router } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRight,
    Bell,
    CalendarDays,
    CheckCircle2,
    ChevronRight,
    Clock3,
    Command,
    FileCheck2,
    FolderKanban,
    ListChecks,
    MessageSquare,
    Plus,
    ReceiptText,
    Search,
    ShieldCheck,
    SlidersHorizontal,
    UploadCloud,
    UserRound,
    WalletCards,
} from 'lucide-react';
import type { ComponentType } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import type { DashboardCommandCenter, DashboardIconKey, DashboardTone } from '@/features/dashboard/types';

type PageProps = {
    commandCenter: DashboardCommandCenter;
};

const iconMap: Record<DashboardIconKey, ComponentType<{ size?: number; className?: string }>> = {
    projects: FolderKanban,
    documents: FileCheck2,
    authorizations: ShieldCheck,
    invoices: ReceiptText,
    payments: WalletCards,
    tasks: ListChecks,
    chat: MessageSquare,
    upload: UploadCloud,
    clients: UserRound,
    clock: Clock3,
    check: CheckCircle2,
};

const toneClasses: Record<DashboardTone, { soft: string; text: string; dot: string; pill: string }> = {
    gold: {
        soft: 'bg-[color-mix(in_srgb,var(--crm-gold)_14%,transparent)]',
        text: 'text-[var(--crm-gold)]',
        dot: 'bg-[var(--crm-gold)]',
        pill: 'crm-status-warning',
    },
    green: {
        soft: 'bg-[var(--crm-success-soft)]',
        text: 'text-[var(--crm-success)]',
        dot: 'bg-[var(--crm-success)]',
        pill: 'crm-status-success',
    },
    red: {
        soft: 'bg-[var(--crm-danger-soft)]',
        text: 'text-[var(--crm-danger)]',
        dot: 'bg-[var(--crm-danger)]',
        pill: 'crm-status-danger',
    },
    blue: {
        soft: 'bg-[var(--crm-info-soft)]',
        text: 'text-[var(--crm-info)]',
        dot: 'bg-[var(--crm-info)]',
        pill: 'crm-status-info',
    },
    violet: {
        soft: 'bg-[var(--crm-violet-soft)]',
        text: 'text-[var(--crm-violet)]',
        dot: 'bg-[var(--crm-violet)]',
        pill: 'crm-status-info',
    },
    neutral: {
        soft: 'bg-[var(--crm-surface-2)]',
        text: 'text-[var(--crm-text-muted)]',
        dot: 'bg-[var(--crm-text-soft)]',
        pill: 'crm-status-info',
    },
};

function goTo(href: string) {
    router.visit(href);
}

function IconTile({ icon, tone }: { icon: DashboardIconKey; tone: DashboardTone }) {
    const Icon = iconMap[icon] ?? FolderKanban;

    return (
        <span className={`flex size-10 shrink-0 items-center justify-center rounded-[var(--crm-radius-md)] ${toneClasses[tone].soft} ${toneClasses[tone].text}`}>
            <Icon size={18} />
        </span>
    );
}

export default function Dashboard({ commandCenter }: PageProps) {
    const { hero, kpis, quickLinks, nextActions, recentProjects, financeAlerts, systemHealth, activityFeed, blockedDossiers, workflowDistribution, urgentTaskList, recentMessageList } = commandCenter;

    return (
        <>
            <Head title="Dashboard" />

            <AppShell
                eyebrowKey="dashboard.eyebrow"
                titleKey="dashboard.title"
                subtitleKey="dashboard.subtitle"
                action={
                    <div className="flex flex-wrap items-center gap-2">
                        <button type="button" className="crm-action-button" onClick={() => goTo('/finance/documents?tab=monthly')}>
                            <CalendarDays size={15} />
                            Monthly
                                               </button>
                        <button type="button" className="crm-action-button-primary crm-action-button" onClick={() => goTo('/dossiers')}>
                            <Plus size={15} />
                            New project
                        </button>
                    </div>
                }
            >
                <section className="space-y-[var(--crm-page-gap)]">
                    <div className="crm-panel p-4">
                        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                            <div className="min-w-0">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                    <div>
                                        <p className="crm-eyebrow">{hero.eyebrow}</p>
                                        <h1 className="crm-page-title mt-2">{hero.title}</h1>
                                        <p className="mt-2 max-w-2xl text-sm text-[var(--crm-text-muted)]">{hero.subtitle}</p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                        <button type="button" className="crm-action-button" onClick={() => goTo('/documents')}>
                                            <Bell size={15} />
                                            Urgent
                                        </button>
                                        <button type="button" className="crm-action-button" onClick={() => goTo('/dossiers')}>
                                            <SlidersHorizontal size={15} />
                                            Filters
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-5 crm-kpi-grid">
                                    {kpis.map((kpi) => (
                                        <button
                                            key={kpi.key}
                                            type="button"
                                            onClick={() => goTo(kpi.href)}
                                            className="crm-kpi-card text-left transition hover:border-[var(--crm-border-strong)] hover:bg-[var(--crm-surface-2)]"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <IconTile icon={kpi.icon} tone={kpi.tone} />
                                                <ArrowRight size={14} className="text-[var(--crm-text-soft)]" />
                                            </div>
                                            <p className="crm-kpi-label mt-3">{kpi.label}</p>
                                            <p className={`crm-kpi-value ${toneClasses[kpi.tone].text}`}>{kpi.value}</p>
                                            <p className="mt-2 truncate text-xs text-[var(--crm-text-soft)]">{kpi.helper}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <aside className="crm-panel-flat p-4">
                                <div className="mb-4 flex items-center justify-between gap-3">
                                    <div>
                                        <h2 className="text-sm font-semibold">Quick launch</h2>
                                        <p className="mt-1 text-xs text-[var(--crm-text-muted)]">Fast access to daily work.</p>
                                    </div>
                                    <Command size={16} className="text-[var(--crm-gold)]" />
                                </div>

                                <div className="grid gap-2">
                                    {quickLinks.map((link) => (
                                        <button
                                            key={link.label}
                                            type="button"
                                            onClick={() => goTo(link.href)}
                                            className="flex items-center justify-between gap-3 rounded-[var(--crm-radius-md)] border border-[var(--crm-border)] bg-[var(--crm-surface)] px-3 py-3 text-left transition hover:bg-[var(--crm-surface-2)]"
                                        >
                                            <span className="flex min-w-0 items-center gap-3">
                                                <IconTile icon={link.icon} tone="gold" />
                                                <span className="truncate text-sm font-semibold">{link.label}</span>
                                            </span>
                                            <ChevronRight size={15} className="shrink-0 text-[var(--crm-text-soft)]" />
                                        </button>
                                    ))}
                                </div>
                            </aside>
                        </div>
                    </div>

                    <div className="grid gap-[var(--crm-page-gap)] xl:grid-cols-[minmax(0,1fr)_360px]">
                        <main className="min-w-0 space-y-[var(--crm-page-gap)]">
                            <section className="grid gap-[var(--crm-page-gap)] lg:grid-cols-[360px_minmax(0,1fr)]">
                                <div className="crm-panel-flat overflow-hidden">
                                    <div className="flex items-center justify-between gap-3 border-b border-[var(--crm-border)] px-5 py-4">
                                        <div>
                                            <h2 className="text-sm font-semibold">Next actions</h2>
                                            <p className="text-xs text-[var(--crm-text-muted)]">Priority workflow queue.</p>
                                        </div>
                                        <button type="button" className="crm-action-button" onClick={() => goTo('/dossiers')}>View all</button>
                                    </div>

                                    <div className="divide-y divide-[var(--crm-border)]">
                                        {nextActions.map((action) => (
                                            <button
                                                key={action.id}
                                                type="button"
                                                onClick={() => goTo(action.href)}
                                                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-[var(--crm-surface-2)]"
                                            >
                                                <span className="flex min-w-0 items-center gap-3">
                                                    <IconTile icon={action.icon} tone={action.tone} />
                                                    <span className="min-w-0">
                                                        <span className="block truncate text-sm font-semibold">{action.title}</span>
                                                        <span className="block truncate text-xs text-[var(--crm-text-muted)]">{action.subtitle}</span>
                                                    </span>
                                                </span>
                                                <span className={`crm-status-pill ${toneClasses[action.tone].pill}`}>{action.due}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="crm-table-wrap">
                                    <div className="flex items-center justify-between gap-3 border-b border-[var(--crm-border)] px-5 py-4">
                                        <div>
                                            <h2 className="text-sm font-semibold">Recent projects</h2>
                                            <p className="text-xs text-[var(--crm-text-muted)]">Latest active dossiers and workflow status.</p>
                                        </div>
                                        <div className="hidden items-center gap-2 md:flex">
                                            <div className="crm-command-input flex w-64 items-center gap-2 px-3">
                                                <Search size={14} className="text-[var(--crm-text-soft)]" />
                                                <span className="text-xs text-[var(--crm-text-muted)]">Search projects...</span>
                                            </div>
                                            <button type="button" className="crm-action-button" onClick={() => goTo('/dossiers')}>Open</button>
                                        </div>
                                    </div>

                                    <div className="overflow-x-auto crm-scroll-thin">
                                        <table className="crm-table">
                                            <thead>
                                                <tr>
                                                    <th>Project</th>
                                                    <th>Client</th>
                                                    <th>Location</th>
                                                    <th>Step</th>
                                                    <th>Missing</th>
                                                    <th>Remaining</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {recentProjects.map((project) => (
                                                    <tr key={project.id}>
                                                        <td>
                                                            <button type="button" onClick={() => goTo(project.href)} className="text-left">
                                                                <span className="block font-semibold text-[var(--crm-text)]">{project.project}</span>
                                                                <span className="block text-xs text-[var(--crm-text-soft)]">{project.dossierNumber}</span>
                                                            </button>
                                                        </td>
                                                        <td>{project.client}</td>
                                                        <td>{project.location}</td>
                                                        <td><span className="crm-status-pill crm-status-warning">{project.step}</span></td>
                                                        <td>
                                                            <span className={project.missingDocs > 0 ? 'font-semibold text-[var(--crm-danger)]' : 'font-semibold text-[var(--crm-success)]'}>
                                                                {project.missingDocs}
                                                            </span>
                                                        </td>
                                                        <td>{project.remaining}</td>
                                                        <td>
                                                            <button type="button" className="crm-action-button" onClick={() => goTo(project.href)}>Open</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </section>

                            <section className="grid gap-[var(--crm-page-gap)] lg:grid-cols-3">
                                <div className="crm-panel-flat overflow-hidden">
                                    <div className="flex items-center justify-between gap-3 border-b border-[var(--crm-border)] px-5 py-4">
                                        <h2 className="text-sm font-semibold">Finance alerts</h2>
                                        <button type="button" className="text-xs font-semibold text-[var(--crm-gold)]" onClick={() => goTo('/finance/documents')}>Go to finance</button>
                                    </div>

                                    <div className="divide-y divide-[var(--crm-border)]">
                                        {financeAlerts.map((alert) => (
                                            <button
                                                key={alert.id}
                                                type="button"
                                                onClick={() => goTo(alert.href)}
                                                className="grid w-full grid-cols-[1fr_auto] gap-3 px-4 py-3 text-left transition hover:bg-[var(--crm-surface-2)]"
                                            >
                                                <span className="min-w-0">
                                                    <span className="flex items-center gap-2 text-sm font-semibold">
                                                        <span className={`size-2 rounded-full ${toneClasses[alert.tone].dot}`} />
                                                        {alert.title}
                                                    </span>
                                                    <span className="mt-1 block text-xs text-[var(--crm-text-muted)]">{alert.subtitle}</span>
                                                </span>
                                                <span className={`text-sm font-semibold ${toneClasses[alert.tone].text}`}>{alert.amount}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="crm-panel-flat overflow-hidden">
                                    <div className="flex items-center justify-between gap-3 border-b border-[var(--crm-border)] px-5 py-4">
                                        <h2 className="text-sm font-semibold">Workflow distribution</h2>
                                    </div>

                                    <div className="p-4">
                                        {workflowDistribution.length > 0 ? (
                                            <div className="grid gap-3">
                                                {workflowDistribution.map((step) => {
                                                    const maxCount = Math.max(...workflowDistribution.map((s) => s.count), 1);
                                                    const pct = Math.round((step.count / maxCount) * 100);

                                                    return (
                                                        <div key={step.key}>
                                                            <div className="mb-1 flex items-center justify-between text-xs">
                                                                <span className="font-semibold text-[var(--crm-text)]">{step.label}</span>
                                                                <span className="text-[var(--crm-muted)]">{step.count}</span>
                                                            </div>
                                                            <div className="h-2 overflow-hidden rounded-full bg-black/20">
                                                                <div
                                                                    className="h-full rounded-full bg-[var(--crm-accent)]"
                                                                    style={{ width: `${pct}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-[var(--crm-text-muted)]">No active projects.</p>
                                        )}
                                    </div>
                                </div>

                                {blockedDossiers.length > 0 ? (
                                    <div className="crm-panel-flat overflow-hidden">
                                        <div className="flex items-center justify-between gap-3 border-b border-[var(--crm-border)] px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <AlertTriangle size={14} className="text-red-400" />
                                                <h2 className="text-sm font-semibold">Blocked dossiers</h2>
                                            </div>
                                            <button type="button" className="text-xs font-semibold text-[var(--crm-gold)]" onClick={() => goTo('/dossiers')}>View all</button>
                                        </div>

                                        <div className="divide-y divide-[var(--crm-border)]">
                                            {blockedDossiers.map((dossier) => (
                                                <button
                                                    key={dossier.id}
                                                    type="button"
                                                    onClick={() => goTo(dossier.href)}
                                                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-[var(--crm-surface-2)]"
                                                >
                                                    <span className="min-w-0">
                                                        <span className="block truncate text-sm font-semibold">{dossier.project}</span>
                                                        <span className="block truncate text-xs text-[var(--crm-text-muted)]">{dossier.client}</span>
                                                        <span className="mt-1 block text-[11px] text-[var(--crm-gold)]">{dossier.step}</span>
                                                    </span>
                                                    <span className="shrink-0 rounded-full bg-red-500/10 px-2 py-1 text-[11px] font-bold text-red-300">
                                                        {dossier.daysStuck}d
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="crm-panel-flat p-4">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 size={14} className="text-emerald-400" />
                                                <h2 className="text-sm font-semibold">Blocked dossiers</h2>
                                            </div>
                                        </div>
                                        <p className="mt-2 text-xs text-[var(--crm-text-muted)]">No dossiers stuck for more than 7 days.</p>
                                    </div>
                                )}

                                <div className="crm-panel-flat overflow-hidden">
                                    <div className="flex items-center justify-between gap-3 border-b border-[var(--crm-border)] px-5 py-4">
                                        <h2 className="text-sm font-semibold">System health</h2>
                                    </div>

                                    <div className="grid gap-2 p-4 sm:grid-cols-2">
                                        {systemHealth.map((item) => (
                                            <div key={item.label} className="flex items-center gap-3 rounded-[var(--crm-radius-md)] border border-[var(--crm-border)] bg-[var(--crm-surface)] p-3">
                                                <IconTile icon={item.icon} tone={item.tone} />
                                                <div className="min-w-0">
                                                    <p className="truncate text-xs text-[var(--crm-text-muted)]">{item.label}</p>
                                                    <p className="truncate text-sm font-semibold">{item.value}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        </main>

                        <aside className="crm-right-panel min-w-0 space-y-[var(--crm-page-gap)]">
                            <div className="crm-panel-flat overflow-hidden">
<div className="flex items-center justify-between gap-3 border-b border-[var(--crm-border)] px-5 py-4">
                                        <h2 className="text-sm font-semibold">Activity feed</h2>
                                    <button type="button" className="text-xs font-semibold text-[var(--crm-gold)]">View all</button>
                                </div>

                                <div className="relative space-y-1 p-4">
                                    <div className="absolute bottom-4 left-[31px] top-4 w-px bg-[var(--crm-border)]" />

                                    {activityFeed.map((activity) => (
                                        <div key={activity.id} className="relative flex gap-3 rounded-[var(--crm-radius-md)] p-2 transition hover:bg-[var(--crm-surface-2)]">
                                            <span className={`relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full ${toneClasses[activity.tone].soft} ${toneClasses[activity.tone].text}`}>
                                                {(() => {
                                                    const Icon = iconMap[activity.icon] ?? FolderKanban;
                                                    return <Icon size={15} />;
                                                })()}
                                            </span>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold">{activity.title}</p>
                                                <p className="mt-1 text-xs leading-5 text-[var(--crm-text-muted)]">{activity.description}</p>
                                                <p className="mt-1 text-[11px] text-[var(--crm-text-soft)]">{activity.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="crm-panel-flat overflow-hidden">
                                <div className="flex items-center justify-between gap-3 border-b border-[var(--crm-border)] px-5 py-4">
                                    <h2 className="text-sm font-semibold">Urgent tasks</h2>
                                    <button type="button" className="text-xs font-semibold text-[var(--crm-gold)]" onClick={() => goTo('/tasks')}>View all</button>
                                </div>

                                {urgentTaskList.length > 0 ? (
                                    <div className="divide-y divide-[var(--crm-border)]">
                                        {urgentTaskList.map((t) => (
                                            <button key={t.id} type="button" onClick={() => goTo(`/tasks?task=${t.id}`)}
                                                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-[var(--crm-surface-2)]">
                                                <span className="min-w-0 flex-1">
                                                    <span className="flex items-center gap-2">
                                                        {t.isOverdue ? <span className="size-1.5 shrink-0 rounded-full bg-red-400" /> : null}
                                                        <span className="truncate text-sm font-semibold">{t.title}</span>
                                                    </span>
                                                    <span className="block truncate text-xs text-[var(--crm-text-muted)]">{t.taskNumber}</span>
                                                </span>
                                                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${t.priority === 'urgent' ? 'bg-red-500/10 text-red-300' : 'bg-yellow-500/10 text-yellow-300'}`}>
                                                    {t.isOverdue ? 'Overdue' : 'Urgent'}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-4">
                                        <p className="text-xs text-[var(--crm-text-muted)]">No urgent tasks assigned to you.</p>
                                    </div>
                                )}
                            </div>

                            <div className="crm-panel-flat overflow-hidden">
                                <div className="flex items-center justify-between gap-3 border-b border-[var(--crm-border)] px-5 py-4">
                                    <h2 className="text-sm font-semibold">Recent messages</h2>
                                    <button type="button" className="text-xs font-semibold text-[var(--crm-gold)]" onClick={() => goTo('/inbox')}>Open inbox</button>
                                </div>

                                {recentMessageList.length > 0 ? (
                                    <div className="divide-y divide-[var(--crm-border)]">
                                        {recentMessageList.map((m) => (
                                            <button key={m.id} type="button" onClick={() => goTo(`/inbox?conversation=${m.conversationId}`)}
                                                className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-[var(--crm-surface-2)]">
                                                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--crm-gold)] text-[10px] font-bold text-black">
                                                    {m.sender.charAt(0).toUpperCase()}
                                                </span>
                                                <span className="min-w-0 flex-1">
                                                    <span className="flex items-center gap-2">
                                                        <span className="truncate text-sm font-semibold">{m.sender}</span>
                                                        {m.unread ? <span className="size-1.5 shrink-0 rounded-full bg-[var(--crm-gold)]" /> : null}
                                                    </span>
                                                    <span className="block truncate text-xs text-[var(--crm-text-muted)]">{m.body}</span>
                                                    <span className="mt-0.5 block text-[11px] text-[var(--crm-text-soft)]">{m.createdAt}</span>
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-4">
                                        <p className="text-xs text-[var(--crm-text-muted)]">No recent messages.</p>
                                    </div>
                                )}
                            </div>
                        </aside>
                    </div>
                </section>
            </AppShell>
        </>
    );
}