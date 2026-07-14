import { Head, router } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, Calendar, TrendingUp, TriangleAlert } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';

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
    return (
        <>
            <Head title="Archive Reports" />
            <AppShell>
                <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                    <div className="flex items-center gap-3">
                        <button type="button" onClick={() => router.visit('/archives')}
                            className="flex size-8 items-center justify-center rounded-lg border border-white/10 text-white/40 hover:text-white/80 hover:bg-white/5">
                            <ArrowLeft size={14} />
                        </button>
                        <h1 className="text-2xl font-semibold text-white">Reports</h1>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-4">
                            <div className="flex items-center gap-2">
                                <AlertCircle size={16} className="text-red-400" />
                                <span className="text-sm font-medium text-white">Overdue</span>
                            </div>
                            <p className="mt-1 text-2xl font-semibold text-white">{kpis.totalOverdue}</p>
                            <p className="text-xs text-white/50">Avg {kpis.avgOverdueDays} days overdue</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                            <div className="flex items-center gap-2">
                                <Calendar size={16} className="text-amber-400" />
                                <span className="text-sm font-medium text-white">Monthly</span>
                            </div>
                            <p className="mt-1 text-2xl font-semibold text-white">{monthly.reduce((s, r) => s + r.total, 0)}</p>
                            <p className="text-xs text-white/50">Archives in last 12 months</p>
                        </div>
                        <div className="rounded-xl border border-orange-400/20 bg-orange-400/5 p-4">
                            <div className="flex items-center gap-2">
                                <TriangleAlert size={16} className="text-orange-400" />
                                <span className="text-sm font-medium text-white">Lost</span>
                            </div>
                            <p className="mt-1 text-2xl font-semibold text-white">{kpis.totalLost}</p>
                            <p className="text-xs text-white/50">Missing archives</p>
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        <section className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                            <h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-white">
                                <TrendingUp size={14} className="text-amber-400" /> Monthly creation
                            </h2>
                            <div className="space-y-2">
                                {monthly.map((row) => {
                                    const max = Math.max(...monthly.map((r) => r.total), 1);
                                    const pct = (row.total / max) * 100;
                                    return (
                                        <div key={row.period} className="flex items-center gap-3">
                                            <span className="w-16 text-xs text-white/50 font-mono">{row.period}</span>
                                            <div className="flex-1 h-5 rounded bg-white/5 overflow-hidden">
                                                <div className="h-full rounded bg-amber-500/60 transition-all" style={{ width: `${pct}%` }} />
                                            </div>
                                            <span className="w-8 text-right text-xs text-white/60">{row.total}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        <section className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                            <h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-white">
                                <AlertCircle size={14} className="text-red-400" /> Overdue archives
                            </h2>
                            {overdue.length > 0 ? (
                                <div className="space-y-2 max-h-80 overflow-y-auto">
                                    {overdue.map((row) => (
                                        <div key={row.id}
                                            onClick={() => router.visit(`/archives/${row.id}`)}
                                            className="flex items-center justify-between rounded-lg px-3 py-2 text-xs cursor-pointer transition hover:bg-white/5">
                                            <div className="min-w-0">
                                                <p className="font-mono text-white/80">{row.archiveNumber}</p>
                                                <p className="text-white/40 truncate">{row.projectObject}</p>
                                            </div>
                                            <div className="text-right shrink-0 ml-2">
                                                <p className="text-red-400 font-medium">{row.overdueDays}d overdue</p>
                                                <p className="text-white/40">due {row.dueAt}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-white/40">No overdue archives.</p>
                            )}
                        </section>
                    </div>

                    <section className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                        <h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-white">
                            <TriangleAlert size={14} className="text-orange-400" /> Lost register
                        </h2>
                        {lost.length > 0 ? (
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/5">
                                        {['ARC', 'Project', 'Lost reason', 'Date'].map((label) => (
                                            <th key={label} className="h-8 px-3 text-left text-[11px] uppercase tracking-wide text-white/50 font-semibold">{label}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {lost.map((row) => (
                                        <tr key={row.id}
                                            onClick={() => router.visit(`/archives/${row.id}`)}
                                            className="border-b border-white/5 transition last:border-0 hover:bg-white/[0.02] cursor-pointer">
                                            <td className="px-3 py-2 font-mono text-xs text-white/80">{row.archiveNumber}</td>
                                            <td className="px-3 py-2 text-xs text-white/60">{row.projectObject}</td>
                                            <td className="px-3 py-2 text-xs text-white/50">{row.lostReason || '-'}</td>
                                            <td className="px-3 py-2 text-xs text-white/50">{row.lostAt || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-sm text-white/40">No lost archives.</p>
                        )}
                    </section>
                </div>
            </AppShell>
        </>
    );
}
