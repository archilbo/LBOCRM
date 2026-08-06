import { Head, router } from '@inertiajs/react';
import { IconAlertCircle, IconArrowLeft, IconCalendar, IconTrendingUp, IconAlertTriangle } from '@tabler/icons-react';

import { AppShell } from '@/components/layout/AppShell';
import { AppKpiCard } from '@/components/ui/AppKpiCard';
import { useTranslation } from '@/lib/i18n';

type OverdueRow = {
    id: number;
    archiveNumber: string;
    dossierNumber: string;
    projectObject: string;
    clientName: string;
    requestedBy: string | null;
    dueAt: string | null;
    overdueDays: number;
};

type MonthlyRow = {
    period: string;
    total: number;
};

type LostRow = {
    id: number;
    archiveNumber: string;
    dossierNumber: string;
    projectObject: string;
    lostReason: string | null;
    lostAt: string | null;
};

type PageProps = {
    overdue: OverdueRow[];
    monthly: MonthlyRow[];
    lost: LostRow[];
    kpis: { totalOverdue: number; totalLost: number; avgOverdueDays: number };
};

export default function ArchivesReports({ overdue, monthly, lost, kpis }: PageProps) {
    const { t } = useTranslation();
    return (
        <>
            <Head title={t('reports.title')} />
            <AppShell>
                <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                    <div className="flex items-center gap-3">
                        <button type="button" onClick={() => router.visit('/archives')}
                            className="flex size-8 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-subtle)] hover:text-[var(--foreground)]/80 hover:bg-[var(--surface-2)]">
                            <IconArrowLeft size={14} />
                        </button>
                        <h1 className="text-2xl font-semibold text-[var(--foreground)]">{t('reports.title')}</h1>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <AppKpiCard label={t('reports.overdue')} value={kpis.totalOverdue} detail={`${t('reports.avgDays')} ${kpis.avgOverdueDays} ${t('reports.daysOverdue')}`} icon={<IconAlertCircle size={16} className="text-[var(--danger)]" />} valueClassName="text-[var(--danger)]" />
                        <AppKpiCard label={t('reports.monthly')} value={monthly.reduce((sum, row) => sum + row.total, 0)} detail={t('reports.archivesLast12Months')} icon={<IconCalendar size={16} className="text-[var(--accent)]" />} />
                        <AppKpiCard label={t('reports.lost')} value={kpis.totalLost} detail={t('reports.missingArchives')} icon={<IconAlertTriangle size={16} className="text-[var(--warning)]" />} valueClassName="text-[var(--warning)]" />
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                            <h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
                                <IconTrendingUp size={14} className="text-[var(--accent)]" /> {t('reports.monthlyCreation')}
                            </h2>
                            <div className="space-y-2">
                                {monthly.map((row) => {
                                    const max = Math.max(...monthly.map((r) => r.total), 1);
                                    const pct = (row.total / max) * 100;
                                    return (
                                        <div key={row.period} className="flex items-center gap-3">
                                            <span className="w-16 text-xs text-[var(--text-muted)]">{row.period}</span>
                                            <div className="flex-1 h-5 rounded bg-[var(--surface-2)] overflow-hidden">
                                                <div className="h-full rounded bg-[var(--accent)]/60 transition-all" style={{ width: `${pct}%` }} />
                                            </div>
                                            <span className="w-8 text-right text-xs text-[var(--text-muted)]">{row.total}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                            <h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
                                <IconAlertCircle size={14} className="text-[var(--danger)]" /> {t('reports.overdueArchives')}
                            </h2>
                            {overdue.length > 0 ? (
                                <div className="space-y-2 max-h-80 overflow-y-auto">
                                    {overdue.map((row) => (
                                        <div key={row.id}
                                            onClick={() => router.visit(`/archives/${row.id}`)}
                                            className="flex items-center justify-between rounded-lg px-3 py-2 text-xs cursor-pointer transition hover:bg-[var(--surface-2)]">
                                            <div className="min-w-0">
                                                <p className="text-[var(--foreground)]/80">{row.archiveNumber}</p>
                                                <p className="text-[var(--text-subtle)] truncate">{row.projectObject}</p>
                                            </div>
                                            <div className="text-right shrink-0 ml-2">
                                                <p className="text-[var(--danger)] font-medium">{row.overdueDays}d {t('reports.overdue')}</p>
                                                <p className="text-[var(--text-subtle)]">{t('reports.due')} {row.dueAt}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-[var(--text-subtle)]">{t('reports.noOverdueArchives')}</p>
                            )}
                        </section>
                    </div>

                    <section className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                        <h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
                            <IconAlertTriangle size={14} className="text-[var(--warning)]" /> {t('reports.lostRegister')}
                        </h2>
                        {lost.length > 0 ? (
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-[var(--border)]">
                                        {[t('reports.arc'), t('reports.project'), t('reports.lostReason'), t('reports.date')].map((label) => (
                                            <th key={label} className="h-8 px-3 text-left text-[10px] capitalize tracking-wide text-[var(--text-muted)] font-semibold">{label}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {lost.map((row) => (
                                        <tr key={row.id}
                                            onClick={() => router.visit(`/archives/${row.id}`)}
                                            className="border-b border-[var(--border)] transition last:border-0 hover:bg-[var(--surface-2)]/50 cursor-pointer">
                                            <td className="px-3 py-2 text-xs text-[var(--foreground)]/80">{row.archiveNumber}</td>
                                            <td className="px-3 py-2 text-xs text-[var(--text-muted)]">{row.projectObject}</td>
                                            <td className="px-3 py-2 text-xs text-[var(--text-muted)]">{row.lostReason || '-'}</td>
                                            <td className="px-3 py-2 text-xs text-[var(--text-muted)]">{row.lostAt || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-sm text-[var(--text-subtle)]">{t('reports.noLostArchives')}</p>
                        )}
                    </section>
                </div>
            </AppShell>
        </>
    );
}
