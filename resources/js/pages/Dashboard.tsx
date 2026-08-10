import { Head, router } from '@inertiajs/react';
import { Card, Chip, Tooltip } from '@heroui/react';
import { IconAlertTriangle, IconArrowRight, IconCircleCheck, IconChevronRight, IconClockHour3, IconFileCheck, IconFolder, IconListCheck, IconMessage2, IconReceipt2, IconCloudUpload, IconUserCircle, IconWallet } from '@tabler/icons-react';

import { useState, type ComponentType, type ReactNode } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { AppButton } from '@/components/ui/AppButton';
import { AppKpiCard } from '@/components/ui/AppKpiCard';
import { DashboardAttentionPanel } from '@/features/dashboard/components/DashboardAttentionPanel';
import { DashboardClientActionDrawer } from '@/features/dashboard/components/DashboardClientActionDrawer';
import { DashboardFinanceTrend } from '@/features/dashboard/components/DashboardFinanceTrend';
import { DashboardWorkflowDonut } from '@/features/dashboard/components/DashboardWorkflowDonut';
import type { DashboardCommandCenter, DashboardIconKey, DashboardTone } from '@/features/dashboard/types';
import { formatCompactMoney } from '@/lib/currency';
import { useTranslation } from '@/lib/i18n';

type PageProps = { commandCenter: DashboardCommandCenter };
type ChipColor = 'default' | 'accent' | 'success' | 'warning' | 'danger';

const iconMap: Record<DashboardIconKey, ComponentType<{ size?: number; className?: string }>> = {
    projects: IconFolder,
    documents: IconFileCheck,
    invoices: IconReceipt2,
    payments: IconWallet,
    tasks: IconListCheck,
    chat: IconMessage2,
    upload: IconCloudUpload,
    clients: IconUserCircle,
    clock: IconClockHour3,
    check: IconCircleCheck,
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
    const Icon = iconMap[icon] ?? IconFolder;

    return <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${tones[tone].icon} ${className}`}><Icon size={size} /></span>;
}

function PanelTitle({ title, detail, action, icon }: { title: string; detail?: string; action?: ReactNode; icon?: ReactNode }) {
    return (
        <div className="flex min-w-0 items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3.5">
            <div className="flex min-w-0 items-center gap-2.5">
                {icon ? <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-2)] text-[var(--accent)]">{icon}</span> : null}
                <div className="min-w-0">
                    <h2 className="text-sm font-semibold text-[var(--foreground)]">{title}</h2>
                    {detail ? <p className="mt-0.5 truncate text-[10px] text-[var(--text-muted)]">{detail}</p> : null}
                </div>
            </div>
            {action}
        </div>
    );
}

export default function Dashboard({ commandCenter }: PageProps) {
    const {
        kpis,
        quickLinks,
        nextActions,
        recentProjects,
        financeAlerts,
        activityFeed,
        blockedDossiers,
        financeTrend,
        workflowDistribution,
        urgentTaskList,
        recentMessageList,
        attentionItems,
    } = commandCenter;
    const primaryKpis = kpis.filter((kpi) => ['activeProjects', 'missingDocuments', 'unpaidInvoices', 'todayPayments', 'blockedDossiers', 'myTasks'].includes(kpi.key));
    const signalKpis = kpis.filter((kpi) => ['pendingReviewTasks', 'unreadMessages'].includes(kpi.key));
    const focusAction = nextActions[0];
    const queuedActions = nextActions.length > 1 ? nextActions.slice(1, 5) : nextActions.slice(0, 4);
    const [clientDrawerOpen, setClientDrawerOpen] = useState(false);
    const { t } = useTranslation();

    function openQuickAction(key: string, href: string) {
        if (key === 'newClient') {
            setClientDrawerOpen(true);
            return;
        }

        navigate(href);
    }

    return (
        <>
            <Head title={t('dashboard.hero.title')} />

            <AppShell>
                <section className="space-y-3">
                    <header className="flex flex-col gap-3 px-1 py-1 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] text-[var(--accent)]"><IconFolder size={18} /></span>
                            <div className="min-w-0">
                                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">{t('dashboard.hero.eyebrow')}</p>
                                <div className="flex min-w-0 items-center gap-3">
                                    <h1 className="truncate text-lg font-bold text-[var(--foreground)]">{t('dashboard.hero.title')}</h1>
                                    <span className="hidden h-4 w-px bg-[var(--border)] md:block" />
                                    <p className="hidden truncate text-xs text-[var(--text-muted)] md:block">{t('dashboard.hero.subtitle')}</p>
                                </div>
                            </div>
                        </div>
                    </header>

                    {focusAction ? (
                        <Card className="gap-0 overflow-hidden border border-[color-mix(in_srgb,var(--accent)_34%,var(--border))] bg-[color-mix(in_srgb,var(--accent)_6%,var(--surface))] shadow-sm">
                            <Card.Content className="grid min-w-0 gap-0 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)]">
                                <AppButton variant="ghost" className="h-auto min-h-24 justify-start rounded-none px-4 py-3 text-left hover:bg-[color-mix(in_srgb,var(--accent)_8%,var(--surface))]" onPress={() => navigate(focusAction.href)}>
                                    <span className="flex min-w-0 items-center gap-3">
                                        <DashboardIcon icon={focusAction.icon} tone={focusAction.tone} className="size-10" size={19} />
                                        <span className="min-w-0 flex-1">
                                            <span className="flex items-center gap-2"><span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">{t('dashboard.sections.focus')}</span><Chip size="sm" variant="soft" color={tones[focusAction.tone].chip}>{t(`dashboard.nextActions.due.${focusAction.dueKey}`)}</Chip></span>
                                            <span className="mt-1 block truncate text-base font-semibold text-[var(--foreground)]">{t(`dashboard.nextActions.${focusAction.kind}.title`)}</span>
                                            <span className="mt-0.5 block truncate text-xs text-[var(--text-muted)]">{focusAction.context ?? t(`dashboard.nextActions.${focusAction.kind}.detail`)}</span>
                                        </span>
                                        <IconArrowRight size={17} className="shrink-0 text-[var(--accent)]" />
                                    </span>
                                </AppButton>

                                <div className="flex min-w-0 flex-col border-t border-[color-mix(in_srgb,var(--accent)_22%,var(--border))] lg:border-l lg:border-t-0">
                                    <div className="grid flex-1 grid-cols-2 divide-x divide-[var(--border)]">
                                        {signalKpis.map((kpi) => (
                                            <AppButton key={kpi.key} variant="ghost" className="h-auto min-w-0 justify-center rounded-none px-2 py-2 text-center hover:bg-[var(--surface-2)]" onPress={() => navigate(kpi.href)}>
                                                <span className="min-w-0"><span className={`block text-base font-semibold ${tones[kpi.tone].text}`}>{kpi.value}</span><span className="mt-0.5 block truncate text-[9px] font-medium text-[var(--text-muted)]">{t(`dashboard.kpis.${kpi.key}`)}</span></span>
                                            </AppButton>
                                        ))}
                                    </div>
                                    {quickLinks.length > 0 ? (
                                        <div className="flex items-center justify-between border-t border-[var(--border)] px-2 py-1.5">
                                            <span className="px-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">{t('dashboard.sections.quickActions')}</span>
                                            <div className="flex items-center gap-1">
                                                {quickLinks.map((link) => {
                                                    const Icon = iconMap[link.icon] ?? IconFolder;

                                                    return (
                                                        <Tooltip key={link.key} delay={450}>
                                                            <Tooltip.Trigger><AppButton isIconOnly size="sm" compact variant="quiet" onPress={() => openQuickAction(link.key, link.href)} aria-label={t(`dashboard.quickActions.${link.key}`)}><Icon size={14} /></AppButton></Tooltip.Trigger>
                                                            <Tooltip.Content className="border border-[var(--border)] bg-[var(--surface)] text-[var(--text)]">{t(`dashboard.quickActions.${link.key}`)}</Tooltip.Content>
                                                        </Tooltip>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            </Card.Content>
                        </Card>
                    ) : null}

                    <DashboardAttentionPanel items={attentionItems} onOpen={navigate} />

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
                        {primaryKpis.map((kpi) => {
                            const Icon = iconMap[kpi.icon] ?? IconFolder;
                            const helperValues = kpi.helperValues ? { ...kpi.helperValues, ...(kpi.helperValues.amount !== undefined ? { amount: formatCompactMoney(kpi.helperValues.amount) } : {}) } : undefined;

                            return <AppKpiCard key={kpi.key} label={t(`dashboard.kpis.${kpi.key}`)} value={typeof kpi.value === 'number' ? formatCompactMoney(kpi.value) : kpi.value} detail={t(`dashboard.kpiHelpers.${kpi.helperKey}`, helperValues)} icon={<Icon size={14} className={tones[kpi.tone].text} />} valueClassName={tones[kpi.tone].text} onPress={() => navigate(kpi.href)} />;
                        })}
                    </div>

                    <div className="grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1.65fr)_minmax(340px,0.85fr)] xl:grid-cols-[minmax(0,1.8fr)_minmax(380px,0.9fr)]">
                        <Card className="gap-0 overflow-hidden border border-[var(--border)] bg-[var(--surface)] shadow-sm">
                            <PanelTitle icon={<IconReceipt2 size={15} />} title={t('dashboard.sections.financeTrend')} detail={t('dashboard.sections.financeTrendDetail')} action={<AppButton size="sm" compact variant="quiet" onPress={() => navigate('/finance/documents?tab=monthly')}>{t('dashboard.actions.monthly')}</AppButton>} />
                            <Card.Content className="p-0">
                                <DashboardFinanceTrend points={financeTrend} />
                            </Card.Content>
                        </Card>

                        <Card className="gap-0 overflow-hidden border border-[var(--border)] bg-[var(--surface)] shadow-sm">
                            <PanelTitle icon={<IconFolder size={15} />} title={t('dashboard.sections.workflow')} detail={t('dashboard.sections.workflowDetail')} action={<IconFolder size={15} className="text-[var(--accent)]" />} />
                            <Card.Content className="p-0">
                                <DashboardWorkflowDonut steps={workflowDistribution} />
                            </Card.Content>
                        </Card>
                    </div>

                    <div className="grid min-w-0 items-stretch gap-3 lg:grid-cols-[minmax(0,1.65fr)_minmax(360px,0.85fr)] xl:grid-cols-[minmax(0,1.8fr)_minmax(380px,0.9fr)]">
                        <Card className="gap-0 overflow-hidden border border-[var(--border)] bg-[var(--surface)] shadow-sm xl:order-1">
                            <div className="flex min-w-0 items-center justify-between gap-3 px-2 py-2">
                                <div className="flex min-w-0 items-center gap-2.5">
                                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-2)] text-[var(--accent)]"><IconFolder size={15} /></span>
                                    <div className="min-w-0">
                                        <h2 className="text-sm font-semibold text-[var(--foreground)]">{t('dashboard.sections.projects')}</h2>
                                        <p className="mt-0.5 truncate text-[10px] text-[var(--text-muted)]">{t('dashboard.sections.projectsDetail')}</p>
                                    </div>
                                </div>
                                <AppButton size="sm" compact variant="quiet" onPress={() => navigate('/dossiers')}>{t('dashboard.actions.viewAll')}</AppButton>
                            </div>
                            <Card.Content className="px-2 py-0">
                                {recentProjects.length > 0 ? recentProjects.slice(0, 5).map((project) => (
                                    <AppButton
                                        key={project.id}
                                        variant="ghost"
                                        className="h-auto w-full justify-start py-2 text-left hover:bg-[var(--surface-3)] bg-[var(--surface-2)] rounded-[10px]"
                                        onPress={() => navigate(project.href)}
                                    >
                                        <span className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto] items-center gap-2"><span className="min-w-0"><span className="truncate text-xs font-semibold text-[var(--foreground)]">{project.project}</span><span className="mt-0.5 block truncate text-[9px] text-[var(--text-muted)]">{project.dossierNumber} / {project.client}</span></span><span className="flex shrink-0 items-center gap-2"><Chip size="sm" variant="soft" color={project.missingDocs > 0 ? 'warning' : 'success'}>{project.missingDocs} {t('dashboard.states.documents')}</Chip><IconChevronRight size={14} className="text-[var(--text-muted)]" /></span></span>
                                    </AppButton>
                                )) : <div className="px-4 py-9 text-center text-sm text-[var(--text-muted)]">{t('dashboard.states.noRecentProject')}</div>}
                            </Card.Content>
                        </Card>

                        <div className="grid h-full grid-rows-2 gap-3 xl:order-2">
                            <Card className="gap-0 self-start overflow-hidden border border-[var(--border)] bg-[var(--surface)] shadow-sm">
                                <div className="flex min-w-0 items-center justify-between gap-3 px-2 py-2">
                                    <div className="flex min-w-0 items-center gap-2.5">
                                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-2)] text-[var(--accent)]"><IconListCheck size={15} /></span>
                                        <div className="min-w-0">
                                            <h2 className="text-sm font-semibold text-[var(--foreground)]">{t('dashboard.sections.actionQueue')}</h2>
                                            <p className="mt-0.5 truncate text-[10px] text-[var(--text-muted)]">{t('dashboard.sections.actionQueueDetail')}</p>
                                        </div>
                                    </div>
                                    <IconListCheck size={15} className="text-[var(--accent)]" />
                                </div>
                                <Card.Content className="px-2 py-0">
                                    {queuedActions.map((action) => (
                                        <AppButton
                                            key={action.id}
                                            variant="ghost"
                                            className="h-auto w-full justify-start items-center py-2 text-left hover:bg-[var(--surface-3)] bg-[var(--surface-2)] rounded-[10px] min-w-0"
                                            onPress={() => navigate(action.href)}
                                        >
                                            <span className="flex min-w-0 flex-1 items-center gap-2.5"><DashboardIcon icon={action.icon} tone={action.tone} /><span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-[var(--foreground)]">{t(`dashboard.nextActions.${action.kind}.title`)}</span><span className="mt-0.5 block truncate text-[9px] text-[var(--text-muted)]">{action.context ?? t(`dashboard.nextActions.${action.kind}.detail`)}</span></span><Chip size="sm" variant="soft" color={tones[action.tone].chip}>{t(`dashboard.nextActions.due.${action.dueKey}`)}</Chip></span>
                                        </AppButton>
                                    ))}
                                </Card.Content>
                            </Card>

                            <Card className="gap-0 self-start overflow-hidden border border-[var(--border)] bg-[var(--surface)] shadow-sm">
                                <div className="flex min-w-0 items-center justify-between gap-3 px-2 py-2">
                                    <div className="flex min-w-0 items-center gap-2.5">
                                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-2)] text-[var(--accent)]">{blockedDossiers.length > 0 || urgentTaskList.length > 0 ? <IconAlertTriangle size={15} className="text-[var(--danger)]" /> : <IconCircleCheck size={15} className="text-[var(--success)]" />}</span>
                                        <div className="min-w-0">
                                            <h2 className="text-sm font-semibold text-[var(--foreground)]">{t('dashboard.sections.vigilance')}</h2>
                                            <p className="mt-0.5 truncate text-[10px] text-[var(--text-muted)]">{t('dashboard.sections.vigilanceDetail')}</p>
                                        </div>
                                    </div>
                                    {blockedDossiers.length > 0 || urgentTaskList.length > 0 ? <IconAlertTriangle size={15} className="text-[var(--danger)]" /> : <IconCircleCheck size={15} className="text-[var(--success)]" />}
                                </div>
                                <Card.Content className="px-2 py-0">
                                    {blockedDossiers.slice(0, 2).map((dossier) => (
                                        <AppButton
                                            key={dossier.id}
                                            variant="ghost"
                                            className="h-auto w-full justify-start items-center py-2 text-left hover:bg-[var(--surface-3)] bg-[var(--surface-2)] rounded-[10px] min-w-0"
                                            onPress={() => navigate(dossier.href)}
                                        >
                                            <span className="flex min-w-0 flex-1 items-center justify-between gap-2"><span className="min-w-0"><span className="block truncate text-xs font-semibold text-[var(--foreground)]">{dossier.project}</span><span className="block truncate text-[9px] text-[var(--text-muted)]">{dossier.client}</span></span><Chip size="sm" variant="soft" color="danger">{dossier.daysStuck} {t('dashboard.states.days')}</Chip></span>
                                        </AppButton>
                                    ))}
                                    {urgentTaskList.slice(0, 2).map((task) => (
                                        <AppButton
                                            key={task.id}
                                            variant="ghost"
                                            className="h-auto w-full justify-start items-center py-2 text-left hover:bg-[var(--surface-3)] bg-[var(--surface-2)] rounded-[10px] min-w-0"
                                            onPress={() => navigate(`/tasks?task=${task.id}`)}
                                        >
                                            <span className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto] gap-2"><span className="min-w-0"><span className="block truncate text-xs font-semibold text-[var(--foreground)]">{task.title}</span><span className="block truncate text-[9px] text-[var(--text-muted)]">{task.taskNumber}</span></span><Chip size="sm" variant="soft" color={task.isOverdue ? 'danger' : 'warning'}>{task.isOverdue ? t('dashboard.states.overdue') : t('dashboard.states.urgent')}</Chip></span>
                                        </AppButton>
                                    ))}
                                    {blockedDossiers.length === 0 && urgentTaskList.length === 0 ? <div className="flex items-center gap-2 px-3 py-7 text-sm text-[var(--text-muted)]"><IconCircleCheck size={17} className="text-[var(--success)]" /> {t('dashboard.states.allStable')}</div> : null}
                                </Card.Content>
                            </Card>
                        </div>
                    </div>

                    <Card className="gap-0 overflow-hidden border border-[var(--border)] bg-[var(--surface)] shadow-sm">
                        <Card.Content className="grid min-w-0 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
                            <section className="min-w-0">
                                <div className="flex min-w-0 items-center justify-between gap-3 px-2 py-2">
                                    <div className="flex min-w-0 items-center gap-2.5">
                                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-2)] text-[var(--accent)]"><IconReceipt2 size={15} /></span>
                                        <div className="min-w-0">
                                            <h2 className="text-sm font-semibold text-[var(--foreground)]">{t('dashboard.sections.finance')}</h2>
                                            <p className="mt-0.5 truncate text-[10px] text-[var(--text-muted)]">{t('dashboard.sections.financeDetail')}</p>
                                        </div>
                                    </div>
                                    <IconReceipt2 size={15} className="text-[var(--accent)]" />
                                </div>
                                <div className="flex flex-col gap-2 px-2 py-0">
                                    {financeAlerts.map((alert) => (
                                        <AppButton
                                            key={alert.id}
                                            variant="ghost"
                                            className="h-auto w-full justify-start items-center py-2 text-left hover:bg-[var(--surface-3)] bg-[var(--surface-2)] rounded-[10px] min-w-0"
                                            onPress={() => navigate(alert.href)}
                                        >
                                            <span className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto] gap-2"><span className="min-w-0"><span className="flex items-center gap-2 text-xs font-semibold text-[var(--foreground)]"><span className={`size-1.5 shrink-0 rounded-full ${tones[alert.tone].dot}`} /><span className="truncate">{t(`dashboard.alerts.${alert.id}.title`)}</span></span><span className="mt-0.5 block truncate text-[9px] text-[var(--text-muted)]">{t(`dashboard.alerts.${alert.id}.detail`, alert.count === undefined ? undefined : { count: alert.count })}</span></span><span className={`self-center text-xs font-semibold ${tones[alert.tone].text}`}>{formatCompactMoney(alert.amount)}</span></span>
                                        </AppButton>
                                    ))}
                                </div>
                            </section>

                            <section className="min-w-0">
                                <div className="flex min-w-0 items-center justify-between gap-3 px-2 py-2">
                                    <div className="flex min-w-0 items-center gap-2.5">
                                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-2)] text-[var(--accent)]"><IconMessage2 size={15} /></span>
                                        <div className="min-w-0">
                                            <h2 className="text-sm font-semibold text-[var(--foreground)]">{t('dashboard.sections.updates')}</h2>
                                            <p className="mt-0.5 truncate text-[10px] text-[var(--text-muted)]">{t('dashboard.sections.updatesDetail')}</p>
                                        </div>
                                    </div>
                                    <AppButton size="sm" compact variant="quiet" onPress={() => navigate('/inbox')}>{t('dashboard.actions.inbox')}</AppButton>
                                </div>
                                <div className="flex flex-col gap-2 px-2 py-0">
                                    {recentMessageList.slice(0, 2).map((message) => (
                                        <AppButton
                                            key={message.id}
                                            variant="ghost"
                                            className="h-auto w-full justify-start items-center py-2 text-left hover:bg-[var(--surface-3)] bg-[var(--surface-2)] rounded-[10px] min-w-0"
                                            onPress={() => navigate(`/inbox?conversation=${message.conversationId}`)}
                                        >
                                            <span className="flex min-w-0 flex-1 items-start gap-2.5"><span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[9px] font-bold text-black">{message.sender.charAt(0).toUpperCase()}</span><span className="min-w-0 flex-1"><span className="flex items-center gap-2"><span className="truncate text-xs font-semibold text-[var(--foreground)]">{message.sender}</span>{message.unread ? <span className="size-1.5 shrink-0 rounded-full bg-[var(--accent)]" /> : null}</span><span className="mt-0.5 block truncate text-[9px] text-[var(--text-muted)]">{message.body}</span></span></span>
                                        </AppButton>
                                    ))}
                                    {activityFeed.slice(0, 2).map((activity) => <div key={activity.id} className="flex min-w-0 gap-2.5 px-2 py-2"><DashboardIcon icon={activity.icon} tone={activity.tone} /><div className="min-w-0"><p className="truncate text-xs font-medium text-[var(--foreground)]">{t(`dashboard.activity.${activity.kind}`)}</p><p className="mt-0.5 truncate text-[9px] text-[var(--text-muted)]">{activity.description}</p></div></div>)}
                                    {recentMessageList.length === 0 && activityFeed.length === 0 ? <div className="px-2 py-7 text-center text-sm text-[var(--text-muted)]">{t('dashboard.states.noRecentUpdates')}</div> : null}
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
