import { Head } from '@inertiajs/react';
import { AppShell } from '@/components/layout/AppShell';

type ReportPayload = {
    totalTasks: number;
    openTasks: number;
    completedTasks: number;
    blockedTasks: number;
    overdueTasks: number;
    byModule: Record<string, number>;
    byPriority: Record<string, number>;
};

function Stat({ label, value }: { label: string; value: number }) {
    return (
        <div className="crm-kpi-card">
            <p className="crm-kpi-label">{label}</p>
            <p className="crm-kpi-value">{value}</p>
        </div>
    );
}

export default function OperationsReports({ report }: { report: ReportPayload }) {
    return (
        <>
            <Head title="Operations reports" />
            <AppShell eyebrowKey="nav.tasks" titleKey="nav.tasks" subtitleKey="Operations reports">
                <div className="crm-page">
                    <section className="crm-kpi-grid">
                        <Stat label="Total tasks" value={report.totalTasks} />
                        <Stat label="Open tasks" value={report.openTasks} />
                        <Stat label="Completed" value={report.completedTasks} />
                        <Stat label="Blocked" value={report.blockedTasks} />
                        <Stat label="Overdue" value={report.overdueTasks} />
                    </section>
                    <section className="grid gap-4 lg:grid-cols-2">
                        <div className="crm-panel p-4">
                            <h2 className="text-sm font-black">By module</h2>
                            <pre className="mt-3 overflow-auto rounded-xl bg-black/20 p-3 text-xs text-[var(--crm-muted)]">{JSON.stringify(report.byModule, null, 2)}</pre>
                        </div>
                        <div className="crm-panel p-4">
                            <h2 className="text-sm font-black">By priority</h2>
                            <pre className="mt-3 overflow-auto rounded-xl bg-black/20 p-3 text-xs text-[var(--crm-muted)]">{JSON.stringify(report.byPriority, null, 2)}</pre>
                        </div>
                    </section>
                </div>
            </AppShell>
        </>
    );
}
