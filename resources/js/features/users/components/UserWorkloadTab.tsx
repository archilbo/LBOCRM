import { useMemo, useState } from 'react';
import { AlertTriangle, ChevronLeft, ChevronRight, CircleAlert, Gauge, ListTodo, Search, ShieldAlert, TimerOff, UsersRound } from 'lucide-react';
import { Chip, Input } from '@heroui/react';
import { AppButton } from '@/components/ui/AppButton';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { AppKpiCard } from '@/components/ui/AppKpiCard';
import { AppWorkspaceTable, type AppWorkspaceTableColumn } from '@/components/ui/AppWorkspaceTable';

export type UserWorkloadRow = {
    userId: number;
    name: string;
    email: string;
    openTasks: number;
    urgentTasks: number;
    blockedTasks: number;
    overdueTasks: number;
};

function workloadState(row: UserWorkloadRow) {
    const alerts = row.urgentTasks + row.blockedTasks + row.overdueTasks;

    if (alerts >= 3) return { label: 'À traiter', color: 'danger' as const };
    if (alerts > 0) return { label: 'À surveiller', color: 'warning' as const };

    return { label: 'Stable', color: 'success' as const };
}

export function UserWorkloadTab({ workload }: { workload: UserWorkloadRow[] }) {
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const filteredWorkload = useMemo(() => {
        const term = query.trim().toLocaleLowerCase('fr-FR');

        return workload.filter((row) => !term || [row.name, row.email].some((value) => value.toLocaleLowerCase('fr-FR').includes(term)));
    }, [query, workload]);
    const totals = useMemo(() => workload.reduce((summary, row) => ({
        open: summary.open + row.openTasks,
        urgent: summary.urgent + row.urgentTasks,
        blocked: summary.blocked + row.blockedTasks,
        overdue: summary.overdue + row.overdueTasks,
    }), { open: 0, urgent: 0, blocked: 0, overdue: 0 }), [workload]);
    const pageSize = 10;
    const totalPages = Math.max(1, Math.ceil(filteredWorkload.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const pagedWorkload = filteredWorkload.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    const columns = useMemo<AppWorkspaceTableColumn<UserWorkloadRow>[]>(() => [
        {
            id: 'collaborator',
            label: 'Collaborateur',
            icon: <UsersRound size={13} />,
            render: (row) => <div className="min-w-44"><p className="text-[12px] font-semibold text-[var(--text)]">{row.name}</p><p className="text-[10px] text-[var(--text-muted)]">{row.email}</p></div>,
        },
        { id: 'open', label: 'Tâches ouvertes', icon: <ListTodo size={13} />, render: (row) => <span className="text-[12px] font-semibold tabular-nums text-[var(--text)]">{row.openTasks}</span> },
        { id: 'urgent', label: 'Urgentes', icon: <AlertTriangle size={13} />, render: (row) => <span className="text-[12px] font-semibold tabular-nums text-[var(--crm-danger)]">{row.urgentTasks}</span> },
        { id: 'blocked', label: 'Bloquées', icon: <CircleAlert size={13} />, render: (row) => <span className="text-[12px] font-semibold tabular-nums text-[var(--crm-gold)]">{row.blockedTasks}</span> },
        { id: 'overdue', label: 'En retard', icon: <TimerOff size={13} />, render: (row) => <span className="text-[12px] font-semibold tabular-nums text-[var(--crm-violet)]">{row.overdueTasks}</span> },
        { id: 'state', label: 'État', icon: <ShieldAlert size={13} />, render: (row) => { const state = workloadState(row); return <Chip size="sm" variant="soft" color={state.color}>{state.label}</Chip>; } },
    ], []);

    return (
        <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <AppKpiCard label="Charge ouverte" value={totals.open} detail={`${workload.length} collaborateur${workload.length > 1 ? 's' : ''}`} icon={<Gauge size={15} className="text-[var(--crm-info)]" />} valueClassName="text-[var(--crm-info)]" accentColor="var(--crm-info)" />
                <AppKpiCard label="Urgentes" value={totals.urgent} detail="Priorité immédiate" icon={<AlertTriangle size={15} className="text-[var(--crm-danger)]" />} valueClassName="text-[var(--crm-danger)]" accentColor="var(--crm-danger)" />
                <AppKpiCard label="Bloquées" value={totals.blocked} detail="Décision ou dépendance" icon={<CircleAlert size={15} className="text-[var(--crm-gold)]" />} valueClassName="text-[var(--crm-gold)]" accentColor="var(--crm-gold)" />
                <AppKpiCard label="En retard" value={totals.overdue} detail="Échéance dépassée" icon={<UsersRound size={15} className="text-[var(--crm-violet)]" />} valueClassName="text-[var(--crm-violet)]" accentColor="var(--crm-violet)" />
            </div>

            <AppWorkspaceTable
                ariaLabel="Charge de travail par collaborateur"
                columns={columns}
                data={pagedWorkload}
                rowKey={(row) => row.userId}
                minTableWidthClassName="min-w-[680px]"
                columnOrderStorageKey="archilbo.users.workload.table.columns.v1"
                columnOrderHint="Glissez pour réorganiser la colonne"
                emptyContent={<AppEmptyState title="Aucune charge à afficher" description="Aucun collaborateur ne correspond à la recherche." />}
                toolbar={<div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                    <div>
                        <h2 className="text-sm font-semibold text-[var(--text)]">Charge par collaborateur</h2>
                        <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">Les alertes mettent en avant la charge nécessitant un suivi.</p>
                    </div>
                    <Input
                        aria-label="Rechercher un collaborateur"
                        placeholder="Rechercher un collaborateur"
                        value={query}
                        onChange={(event) => { setQuery(event.target.value); setPage(1); }}
                        startContent={<Search size={13} className="text-[var(--accent)]" />}
                        classNames={{ base: 'w-full sm:w-64', input: 'text-[11px]', inputWrapper: 'h-8 min-h-8 rounded-full border border-[var(--border)] bg-[var(--surface-2)]/60 px-2.5 shadow-none' }}
                    />
                </div>}
                footer={
                    <div className="flex items-center justify-between px-3 py-2">
                        <span className="text-[9px] text-[var(--text-muted)]">
                            {filteredWorkload.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredWorkload.length)} sur {filteredWorkload.length}
                        </span>
                        <div className="flex items-center gap-1.5">
                            <AppButton isIconOnly compact size="sm" variant="quiet" tooltip="Page précédente" aria-label="Page précédente" isDisabled={currentPage <= 1} onPress={() => setPage(Math.max(1, currentPage - 1))}>
                                <ChevronLeft size={14} />
                            </AppButton>
                            <span className="min-w-10 text-center text-[9px] font-semibold tabular-nums text-[var(--text-muted)]">{currentPage} / {totalPages}</span>
                            <AppButton isIconOnly compact size="sm" variant="quiet" tooltip="Page suivante" aria-label="Page suivante" isDisabled={currentPage >= totalPages || filteredWorkload.length === 0} onPress={() => setPage(Math.min(totalPages, currentPage + 1))}>
                                <ChevronRight size={14} />
                            </AppButton>
                        </div>
                    </div>
                }
            />
        </div>
    );
}
