import { Head, router } from '@inertiajs/react';
import { Card, Chip, ProgressBar, Tooltip } from '@heroui/react';
import {
    AlertTriangle,
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    ChevronRight,
    Clock3,
    FileCheck2,
    FolderKanban,
    ListChecks,
    MessageSquare,
    Plus,
    ReceiptText,
    RefreshCw,
    ShieldCheck,
    UploadCloud,
    UserRound,
    WalletCards,
} from 'lucide-react';
import { useState, type ComponentType, type ReactNode } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { AppButton } from '@/components/ui/AppButton';
import { AppKpiCard } from '@/components/ui/AppKpiCard';
import { DashboardClientActionDrawer } from '@/features/dashboard/components/DashboardClientActionDrawer';
import type { DashboardCommandCenter, DashboardIconKey, DashboardTone } from '@/features/dashboard/types';

type PageProps = { commandCenter: DashboardCommandCenter };
type ChipColor = 'default' | 'accent' | 'success' | 'warning' | 'danger';

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

const tones: Record<DashboardTone, { icon: string; text: string; dot: string; chip: ChipColor }> = {
    gold: { icon: 'bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] text-[var(--accent)]', text: 'text-[var(--accent)]', dot: 'bg-[var(--accent)]', chip: 'warning' },
    green: { icon: 'bg-[color-mix(in_srgb,var(--success)_15%,transparent)] text-[var(--success)]', text: 'text-[var(--success)]', dot: 'bg-[var(--success)]', chip: 'success' },
    red: { icon: 'bg-[color-mix(in_srgb,var(--danger)_15%,transparent)] text-[var(--danger)]', text: 'text-[var(--danger)]', dot: 'bg-[var(--danger)]', chip: 'danger' },
    blue: { icon: 'bg-[color-mix(in_srgb,var(--info)_15%,transparent)] text-[var(--info)]', text: 'text-[var(--info)]', dot: 'bg-[var(--info)]', chip: 'accent' },
    violet: { icon: 'bg-[color-mix(in_srgb,var(--secondary)_15%,transparent)] text-[var(--secondary)]', text: 'text-[var(--secondary)]', dot: 'bg-[var(--secondary)]', chip: 'accent' },
    neutral: { icon: 'bg-[var(--surface-2)] text-[var(--text-muted)]', text: 'text-[var(--text-muted)]', dot: 'bg-[var(--text-muted)]', chip: 'default' },
};

function navigate(href: string) {
    router.visit(href);
}

function DashboardIcon({ icon, tone, size = 16, className = '' }: { icon: DashboardIconKey; tone: DashboardTone; size?: number; className?: string }) {
    const Icon = iconMap[icon] ?? FolderKanban;

    return <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${tones[tone].icon} ${className}`}><Icon size={size} /></span>;
}

function PanelTitle({ title, detail, action }: { title: string; detail?: string; action?: ReactNode }) {
    return (
        <div className="flex min-w-0 items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
            <div className="min-w-0">
                <h2 className="text-sm font-semibold text-[var(--foreground)]">{title}</h2>
                {detail ? <p className="mt-0.5 truncate text-[11px] text-[var(--text-muted)]">{detail}</p> : null}
            </div>
            {action}
        </div>
    );
}

export default function Dashboard({ commandCenter }: PageProps) {
    const {
        hero,
        kpis,
        quickLinks,
        nextActions,
        recentProjects,
        financeAlerts,
        activityFeed,
        blockedDossiers,
        workflowDistribution,
        urgentTaskList,
        recentMessageList,
    } = commandCenter;
    const primaryKpis = kpis.filter((kpi) => ['activeProjects', 'missingDocuments', 'pendingAuthorizations', 'unpaidInvoices', 'todayPayments'].includes(kpi.key));
    const signalKpis = kpis.filter((kpi) => ['blockedDossiers', 'myTasks', 'pendingReviewTasks', 'unreadMessages'].includes(kpi.key));
    const focusAction = nextActions[0];
    const queuedActions = nextActions.length > 1 ? nextActions.slice(1, 5) : nextActions.slice(0, 4);
    const maxWorkflowCount = Math.max(...workflowDistribution.map((step) => step.count), 1);
    const [clientDrawerOpen, setClientDrawerOpen] = useState(false);

    function openQuickAction(label: string, href: string) {
        if (label === 'New client') {
            setClientDrawerOpen(true);
            return;
        }

        navigate(href);
    }

    return (
        <>
            <Head title="Dashboard" />

            <AppShell>
                <section className="space-y-3">
                    <header className="flex flex-col gap-3 px-1 py-1 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] text-[var(--accent)]"><FolderKanban size={18} /></span>
                            <div className="min-w-0">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">{hero.eyebrow}</p>
                                <div className="flex min-w-0 items-center gap-3">
                                    <h1 className="truncate text-lg font-bold text-[var(--foreground)]">{hero.title}</h1>
                                    <span className="hidden h-4 w-px bg-[var(--border)] md:block" />
                                    <p className="hidden truncate text-xs text-[var(--text-muted)] md:block">{hero.subtitle}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <AppButton size="sm" variant="ghost" className="h-8 border border-[var(--border)] bg-[var(--surface)] px-2.5" onPress={() => router.reload({ only: ['commandCenter'] })}><RefreshCw size={14} /> Actualiser</AppButton>
                            <AppButton size="sm" variant="ghost" className="h-8 border border-[var(--border)] bg-[var(--surface)] px-2.5" onPress={() => navigate('/finance/documents?tab=monthly')}><CalendarDays size={14} /> Mensuel</AppButton>
                            <AppButton size="sm" variant="ghost" className="h-8 bg-[var(--accent)] px-2.5 text-black hover:bg-[var(--accent-hover)]" onPress={() => navigate('/dossiers?command=create')}><Plus size={14} /> Projet</AppButton>
                        </div>
                    </header>

                    <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-5">
                        {primaryKpis.map((kpi) => {
                            const Icon = iconMap[kpi.icon] ?? FolderKanban;

                            return <AppKpiCard key={kpi.key} label={kpi.label} value={kpi.value} detail={kpi.helper} icon={<Icon size={14} className={tones[kpi.tone].text} />} valueClassName={tones[kpi.tone].text} onPress={() => navigate(kpi.href)} className="min-h-24" />;
                        })}
                    </div>

                    {focusAction ? (
                        <Card className="gap-0 overflow-hidden border border-[color-mix(in_srgb,var(--accent)_34%,var(--border))] bg-[color-mix(in_srgb,var(--accent)_6%,var(--surface))] shadow-sm">
                            <Card.Content className="grid min-w-0 gap-0 lg:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.9fr)]">
                                <AppButton variant="ghost" className="h-auto min-h-24 justify-start rounded-none px-4 py-3 text-left hover:bg-[color-mix(in_srgb,var(--accent)_8%,var(--surface))]" onPress={() => navigate(focusAction.href)}>
                                    <span className="flex min-w-0 items-center gap-3">
                                        <DashboardIcon icon={focusAction.icon} tone={focusAction.tone} className="size-10" size={19} />
                                        <span className="min-w-0 flex-1">
                                            <span className="flex items-center gap-2"><span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Focus maintenant</span><Chip size="sm" variant="soft" color={tones[focusAction.tone].chip}>{focusAction.due}</Chip></span>
                                            <span className="mt-1 block truncate text-base font-semibold text-[var(--foreground)]">{focusAction.title}</span>
                                            <span className="mt-0.5 block truncate text-xs text-[var(--text-muted)]">{focusAction.subtitle}</span>
                                        </span>
                                        <ArrowRight size={17} className="shrink-0 text-[var(--accent)]" />
                                    </span>
                                </AppButton>

                                <div className="flex min-w-0 flex-col border-t border-[color-mix(in_srgb,var(--accent)_22%,var(--border))] lg:border-l lg:border-t-0">
                                    <div className="grid flex-1 grid-cols-4 divide-x divide-[var(--border)]">
                                        {signalKpis.map((kpi) => (
                                            <AppButton key={kpi.key} variant="ghost" className="h-auto min-w-0 justify-center rounded-none px-2 py-2 text-center hover:bg-[var(--surface-2)]" onPress={() => navigate(kpi.href)}>
                                                <span className="min-w-0"><span className={`block text-base font-semibold ${tones[kpi.tone].text}`}>{kpi.value}</span><span className="mt-0.5 block truncate text-[9px] font-medium text-[var(--text-muted)]">{kpi.label}</span></span>
                                            </AppButton>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between border-t border-[var(--border)] px-2 py-1.5">
                                        <span className="px-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">Acces rapide</span>
                                        <div className="flex items-center gap-1">
                                            {quickLinks.map((link) => {
                                                const Icon = iconMap[link.icon] ?? FolderKanban;

                                                return (
                                                    <Tooltip key={link.label} delay={450}>
                                                        <Tooltip.Trigger><AppButton isIconOnly size="sm" variant="ghost" className="size-7 text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--accent)]" onPress={() => openQuickAction(link.label, link.href)} aria-label={link.label}><Icon size={14} /></AppButton></Tooltip.Trigger>
                                                        <Tooltip.Content className="border border-[var(--border)] bg-[var(--surface)] text-[var(--text)]">{link.label}</Tooltip.Content>
                                                    </Tooltip>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </Card.Content>
                        </Card>
                    ) : null}

                    <div className="grid min-w-0 gap-3 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.25fr)_300px]">
                        <Card className="gap-0 self-start overflow-hidden border border-[var(--border)] bg-[var(--surface)] shadow-sm">
                            <PanelTitle title="File d action" detail="Apres le focus actuel" action={<ListChecks size={15} className="text-[var(--accent)]" />} />
                            <Card.Content className="divide-y divide-[var(--border)] p-0">
                                {queuedActions.map((action) => (
                                    <AppButton key={action.id} variant="ghost" className="h-auto w-full justify-start rounded-none px-3 py-3 text-left hover:bg-[var(--surface-2)]" onPress={() => navigate(action.href)}>
                                        <span className="flex min-w-0 flex-1 items-center gap-2.5"><DashboardIcon icon={action.icon} tone={action.tone} /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-[var(--foreground)]">{action.title}</span><span className="mt-0.5 block truncate text-[11px] text-[var(--text-muted)]">{action.subtitle}</span></span><Chip size="sm" variant="soft" color={tones[action.tone].chip}>{action.due}</Chip></span>
                                    </AppButton>
                                ))}
                            </Card.Content>
                        </Card>

                        <Card className="gap-0 self-start overflow-hidden border border-[var(--border)] bg-[var(--surface)] shadow-sm">
                            <PanelTitle title="Pulse projets" detail="Dossiers recemment mis a jour" action={<AppButton size="sm" variant="ghost" className="h-7 px-2 text-xs text-[var(--accent)]" onPress={() => navigate('/dossiers')}>Tout voir</AppButton>} />
                            <Card.Content className="divide-y divide-[var(--border)] p-0">
                                {recentProjects.length > 0 ? recentProjects.slice(0, 5).map((project) => (
                                    <AppButton key={project.id} variant="ghost" className="h-auto w-full justify-start rounded-none px-3 py-3 text-left hover:bg-[var(--surface-2)]" onPress={() => navigate(project.href)}>
                                        <span className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto] items-center gap-3"><span className="min-w-0"><span className="block truncate text-sm font-semibold text-[var(--foreground)]">{project.project}</span><span className="mt-0.5 block truncate text-[11px] text-[var(--text-muted)]">{project.dossierNumber} / {project.client}</span><span className="mt-0.5 block truncate text-[11px] text-[var(--text-muted)]">{project.location}</span></span><span className="flex shrink-0 items-center gap-2"><Chip size="sm" variant="soft" color={project.missingDocs > 0 ? 'warning' : 'success'}>{project.missingDocs} docs</Chip><ChevronRight size={15} className="text-[var(--text-muted)]" /></span></span>
                                    </AppButton>
                                )) : <div className="px-4 py-9 text-center text-sm text-[var(--text-muted)]">Aucun projet recent.</div>}
                            </Card.Content>
                        </Card>

                        <Card className="gap-0 self-start overflow-hidden border border-[var(--border)] bg-[var(--surface)] shadow-sm">
                            <PanelTitle title="Vigilance" detail="Risques a traiter" action={blockedDossiers.length > 0 || urgentTaskList.length > 0 ? <AlertTriangle size={15} className="text-[var(--danger)]" /> : <CheckCircle2 size={15} className="text-[var(--success)]" />} />
                            <Card.Content className="divide-y divide-[var(--border)] p-0">
                                {blockedDossiers.slice(0, 2).map((dossier) => (
                                    <AppButton key={dossier.id} variant="ghost" className="h-auto w-full justify-start rounded-none px-3 py-3 text-left hover:bg-[var(--surface-2)]" onPress={() => navigate(dossier.href)}><span className="flex min-w-0 flex-1 items-center justify-between gap-2"><span className="min-w-0"><span className="block truncate text-sm font-semibold text-[var(--foreground)]">{dossier.project}</span><span className="block truncate text-[11px] text-[var(--text-muted)]">{dossier.client}</span></span><Chip size="sm" variant="soft" color="danger">{dossier.daysStuck} j</Chip></span></AppButton>
                                ))}
                                {urgentTaskList.slice(0, 2).map((task) => (
                                    <AppButton key={task.id} variant="ghost" className="h-auto w-full justify-start rounded-none px-3 py-3 text-left hover:bg-[var(--surface-2)]" onPress={() => navigate(`/tasks?task=${task.id}`)}><span className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto] gap-2"><span className="min-w-0"><span className="block truncate text-sm font-semibold text-[var(--foreground)]">{task.title}</span><span className="block truncate text-[11px] text-[var(--text-muted)]">{task.taskNumber}</span></span><Chip size="sm" variant="soft" color={task.isOverdue ? 'danger' : 'warning'}>{task.isOverdue ? 'Retard' : 'Urgent'}</Chip></span></AppButton>
                                ))}
                                {blockedDossiers.length === 0 && urgentTaskList.length === 0 ? <div className="flex items-center gap-2 px-3 py-7 text-sm text-[var(--text-muted)]"><CheckCircle2 size={17} className="text-[var(--success)]" /> Tout est stable.</div> : null}
                            </Card.Content>
                        </Card>
                    </div>

                    <Card className="gap-0 overflow-hidden border border-[var(--border)] bg-[var(--surface)] shadow-sm">
                        <Card.Content className="grid min-w-0 divide-y divide-[var(--border)] lg:grid-cols-3 lg:divide-x lg:divide-y-0">
                            <section className="min-w-0">
                                <PanelTitle title="Finance" detail="Encaissements et relances" action={<ReceiptText size={15} className="text-[var(--accent)]" />} />
                                <div className="divide-y divide-[var(--border)]">
                                    {financeAlerts.map((alert) => (
                                        <AppButton key={alert.id} variant="ghost" className="h-auto w-full justify-start rounded-none px-4 py-2.5 text-left hover:bg-[var(--surface-2)]" onPress={() => navigate(alert.href)}><span className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto] gap-2"><span className="min-w-0"><span className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]"><span className={`size-1.5 shrink-0 rounded-full ${tones[alert.tone].dot}`} /><span className="truncate">{alert.title}</span></span><span className="mt-0.5 block truncate text-[11px] text-[var(--text-muted)]">{alert.subtitle}</span></span><span className={`self-center text-sm font-semibold ${tones[alert.tone].text}`}>{alert.amount}</span></span></AppButton>
                                    ))}
                                </div>
                            </section>

                            <section className="min-w-0">
                                <PanelTitle title="Avancement" detail="Repartition des dossiers actifs" />
                                <div className="space-y-2.5 px-4 py-3">
                                    {workflowDistribution.filter((step) => step.count > 0).length > 0 ? workflowDistribution.filter((step) => step.count > 0).map((step) => {
                                        const value = Math.round((step.count / maxWorkflowCount) * 100);

                                        return <div key={step.key}><div className="mb-1 flex items-center justify-between gap-3 text-[11px]"><span className="truncate font-medium text-[var(--foreground)]">{step.label}</span><span className="shrink-0 text-[var(--text-muted)]">{step.count}</span></div><ProgressBar value={value} aria-label={step.label} className="w-full"><ProgressBar.Track className="h-1.5 rounded-full bg-[var(--surface-2)]"><ProgressBar.Fill className="rounded-full bg-[var(--accent)]" /></ProgressBar.Track></ProgressBar></div>;
                                    }) : <p className="py-4 text-center text-sm text-[var(--text-muted)]">Aucun dossier actif.</p>}
                                </div>
                            </section>

                            <section className="min-w-0">
                                <PanelTitle title="Mises a jour" detail="Messages et activite" action={<AppButton size="sm" variant="ghost" className="h-7 px-2 text-xs text-[var(--accent)]" onPress={() => navigate('/inbox')}>Inbox</AppButton>} />
                                <div className="divide-y divide-[var(--border)]">
                                    {recentMessageList.slice(0, 2).map((message) => (
                                        <AppButton key={message.id} variant="ghost" className="h-auto w-full justify-start rounded-none px-4 py-2.5 text-left hover:bg-[var(--surface-2)]" onPress={() => navigate(`/inbox?conversation=${message.conversationId}`)}><span className="flex min-w-0 flex-1 items-start gap-2.5"><span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[9px] font-bold text-black">{message.sender.charAt(0).toUpperCase()}</span><span className="min-w-0 flex-1"><span className="flex items-center gap-2"><span className="truncate text-sm font-semibold text-[var(--foreground)]">{message.sender}</span>{message.unread ? <span className="size-1.5 shrink-0 rounded-full bg-[var(--accent)]" /> : null}</span><span className="mt-0.5 block truncate text-[11px] text-[var(--text-muted)]">{message.body}</span></span></span></AppButton>
                                    ))}
                                    {activityFeed.slice(0, 2).map((activity) => <div key={activity.id} className="flex min-w-0 gap-2.5 px-4 py-2.5"><DashboardIcon icon={activity.icon} tone={activity.tone} /><div className="min-w-0"><p className="truncate text-sm font-medium text-[var(--foreground)]">{activity.title}</p><p className="mt-0.5 truncate text-[11px] text-[var(--text-muted)]">{activity.description}</p></div></div>)}
                                    {recentMessageList.length === 0 && activityFeed.length === 0 ? <div className="px-4 py-7 text-center text-sm text-[var(--text-muted)]">Aucune mise a jour recente.</div> : null}
                                </div>
                            </section>
                        </Card.Content>
                    </Card>
                </section>
                <DashboardClientActionDrawer isOpen={clientDrawerOpen} onOpenChange={setClientDrawerOpen} />
            </AppShell>
        </>
    );
}
