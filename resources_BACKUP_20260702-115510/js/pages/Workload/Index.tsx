import { Head } from '@inertiajs/react';
import { AppShell } from '@/components/layout/AppShell';

type WorkloadRow = {
    userId: number;
    name: string;
    email: string;
    openTasks: number;
    urgentTasks: number;
    blockedTasks: number;
    overdueTasks: number;
};

export default function WorkloadIndex({ workload }: { workload: WorkloadRow[] }) {
    return (
        <>
            <Head title="Workload" />
            <AppShell eyebrowKey="nav.tasks" titleKey="nav.tasks" subtitleKey="Team workload summary">
                <div className="crm-page">
                    <section className="crm-panel overflow-hidden">
                        <div className="border-b border-[var(--crm-border)] p-4">
                            <p className="crm-eyebrow">Operations</p>
                            <h1 className="mt-1 text-xl font-black text-[var(--crm-text)]">Workload</h1>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="crm-table">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Open</th>
                                        <th>Urgent</th>
                                        <th>Blocked</th>
                                        <th>Overdue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {workload.map((row) => (
                                        <tr key={row.userId}>
                                            <td>
                                                <div className="font-bold">{row.name}</div>
                                                <div className="text-xs text-[var(--crm-muted)]">{row.email}</div>
                                            </td>
                                            <td>{row.openTasks}</td>
                                            <td>{row.urgentTasks}</td>
                                            <td>{row.blockedTasks}</td>
                                            <td>{row.overdueTasks}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </AppShell>
        </>
    );
}
