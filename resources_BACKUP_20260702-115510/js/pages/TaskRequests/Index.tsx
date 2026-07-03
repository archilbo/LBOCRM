import { Head, router } from '@inertiajs/react';
import { CheckCircle2, FilePlus2, ListFilter, Plus, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { TaskRequestCreateDrawer, type TaskRequestOptions } from '@/features/tasks/components/TaskRequestCreateDrawer';

type TaskRequestRow = {
    id: number;
    requestNumber: string;
    requestType: string;
    title: string;
    description: string | null;
    status: string;
    convertedTaskId: number | null;
    client: { id: number; name: string } | null;
    dossier: { id: number; number: string; object: string } | null;
    updatedAt: string;
};

type PageProps = {
    taskRequests: TaskRequestRow[];
    requestTypes: string[];
    requestStatuses: string[];
    requestTypeLabels: Record<string, string>;
    requestStatusLabels: Record<string, string>;
    taskRequestOptions: TaskRequestOptions;
};

const STATUS_COLORS: Record<string, string> = {
    submitted: 'border-blue-400/20 bg-blue-400/10 text-blue-300',
    accepted: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
    rejected: 'border-red-400/20 bg-red-400/10 text-red-300',
    converted: 'border-amber-400/20 bg-amber-400/10 text-amber-300',
};

function postAction(url: string, success: string, data: Record<string, string> = {}) {
    router.post(url, data, {
        preserveScroll: true,
        onSuccess: () => toast.success(success),
        onError: () => toast.error('Action failed.'),
    });
}

export default function TaskRequestsIndex({ taskRequests, requestTypes, requestStatuses, requestTypeLabels, requestStatusLabels, taskRequestOptions }: PageProps) {
    const [activeStatus, setActiveStatus] = useState('all');
    const [createOpen, setCreateOpen] = useState(false);
    const filteredRequests = useMemo(() => {
        return activeStatus === 'all' ? taskRequests : taskRequests.filter((item) => item.status === activeStatus);
    }, [activeStatus, taskRequests]);

    const counts = useMemo(() => {
        return taskRequests.reduce<Record<string, number>>((carry, item) => {
            carry[item.status] = (carry[item.status] ?? 0) + 1;
            return carry;
        }, {});
    }, [taskRequests]);

    const reject = (item: TaskRequestRow) => {
        const reason = window.prompt('Reason for rejection');
        if (reason === null) return;

        postAction(`/task-requests/${item.id}/reject`, 'Request rejected.', { reason });
    };

    return (
        <>
            <Head title="Task requests" />
            <AppShell eyebrowKey="nav.tasks" titleKey="nav.tasks" subtitleKey="Operations intake requests">
                <div className="crm-page">
                    <section className="crm-panel overflow-hidden">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--crm-border)] p-4">
                            <div>
                                <p className="crm-eyebrow">Operations intake</p>
                                <h1 className="mt-1 text-xl font-black text-[var(--crm-text)]">Task requests</h1>
                                <p className="mt-1 text-xs text-[var(--crm-muted)]">Review office requests and convert accepted work into real tasks.</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button type="button" className="crm-action-button" onClick={() => router.visit('/tasks')}>
                                    Open tasks
                                </button>
                                <button type="button" className="crm-action-button border-[var(--crm-gold)] bg-[var(--crm-gold)] text-black hover:bg-[var(--crm-gold)]" onClick={() => setCreateOpen(true)}>
                                    <Plus size={14} />
                                    New request
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 border-b border-[var(--crm-border)] p-3">
                            <span className="mr-1 inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.14em] text-[var(--crm-muted)]">
                                <ListFilter size={13} /> Status
                            </span>
                            {['all', ...requestStatuses].map((status) => (
                                <button key={status} type="button" onClick={() => setActiveStatus(status)}
                                    className={`rounded-full border px-3 py-1.5 text-xs font-black transition ${
                                        activeStatus === status
                                            ? 'border-[var(--crm-gold)] bg-[var(--crm-gold)] text-black'
                                            : 'border-[var(--crm-border)] bg-[var(--crm-surface)] text-[var(--crm-text-muted)] hover:border-[var(--crm-gold)] hover:text-[var(--crm-gold)]'
                                    }`}>
                                    {status === 'all' ? 'All' : requestStatusLabels[status] ?? status}
                                    <span className="ml-1 opacity-70">{status === 'all' ? taskRequests.length : counts[status] ?? 0}</span>
                                </button>
                            ))}
                        </div>

                        <div className="grid gap-2 p-4">
                            {filteredRequests.map((item) => {
                                const isClosed = item.status === 'rejected' || item.status === 'converted';
                                const statusClass = STATUS_COLORS[item.status] ?? 'border-zinc-400/20 bg-zinc-400/10 text-zinc-300';

                                return (
                                <div key={item.id} className="grid gap-3 rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] p-3 lg:grid-cols-[1fr_auto] lg:items-center">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="truncate text-sm font-black">{item.title}</p>
                                            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black uppercase ${statusClass}`}>
                                                {requestStatusLabels[item.status] ?? item.status}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-xs text-[var(--crm-muted)]">
                                            {item.requestNumber} / {requestTypeLabels[item.requestType] ?? item.requestType} / Updated {item.updatedAt}
                                        </p>
                                        {item.client || item.dossier ? (
                                            <p className="mt-1 text-xs text-[var(--crm-text-muted)]">
                                                {[item.client?.name, item.dossier?.number].filter(Boolean).join(' / ')}
                                            </p>
                                        ) : null}
                                        {item.description ? <p className="mt-2 line-clamp-2 text-xs text-[var(--crm-text-muted)]">{item.description}</p> : null}
                                    </div>
                                    <div className="flex flex-wrap gap-2 lg:justify-end">
                                        {item.convertedTaskId ? (
                                            <button type="button" className="crm-action-button" onClick={() => router.visit('/tasks')}>
                                                Open tasks
                                            </button>
                                        ) : null}
                                        <button type="button" disabled={isClosed || item.status === 'accepted'} className="crm-action-button disabled:cursor-not-allowed disabled:opacity-45"
                                            onClick={() => postAction(`/task-requests/${item.id}/accept`, 'Request accepted.')}>
                                            <CheckCircle2 size={14} />
                                            Accept
                                        </button>
                                        <button type="button" disabled={isClosed} className="crm-action-button disabled:cursor-not-allowed disabled:opacity-45"
                                            onClick={() => postAction(`/task-requests/${item.id}/convert`, 'Request converted to task.')}>
                                            <FilePlus2 size={14} />
                                            Convert
                                        </button>
                                        <button type="button" disabled={isClosed} className="crm-action-button border-red-400/20 bg-red-400/10 text-red-300 disabled:cursor-not-allowed disabled:opacity-45"
                                            onClick={() => reject(item)}>
                                            <XCircle size={14} />
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            )})}
                            {filteredRequests.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-[var(--crm-border)] p-8 text-center text-sm text-[var(--crm-muted)]">
                                    No task requests in this status.
                                </div>
                            ) : null}
                        </div>
                    </section>

                    <TaskRequestCreateDrawer
                        isOpen={createOpen}
                        requestTypes={requestTypes}
                        requestTypeLabels={requestTypeLabels}
                        options={taskRequestOptions}
                        onOpenChange={setCreateOpen}
                    />
                </div>
            </AppShell>
        </>
    );
}
