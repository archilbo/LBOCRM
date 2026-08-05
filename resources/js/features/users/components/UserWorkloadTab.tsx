import { useMemo, useState } from 'react';
import { IconAlertTriangle, IconAlertCircle, IconGauge, IconListCheck, IconShieldExclamation, IconClockOff, IconUsersGroup } from '@tabler/icons-react';

import { Chip } from '@heroui/react';
import { ColumnDef } from '@tanstack/react-table';
import { AppKpiCard } from '@/components/ui/AppKpiCard';
import { AppDataTable } from '@/components/ui/AppDataTable';

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
    const filteredWorkload = useMemo(() => workload, [workload]);
    const totals = useMemo(() => workload.reduce((summary, row) => ({
        open: summary.open + row.openTasks,
        urgent: summary.urgent + row.urgentTasks,
        blocked: summary.blocked + row.blockedTasks,
        overdue: summary.overdue + row.overdueTasks,
    }), { open: 0, urgent: 0, blocked: 0, overdue: 0 }), [workload]);
    const columns: ColumnDef<UserWorkloadRow>[] = [
        {
            id: 'collaborator',
            header: 'Collaborateur',
            cell: (info) => <div className="min-w-44"><p className="text-[12px] font-semibold text-[var(--text)]">{info.row.original.name}</p><p className="text-[10px] text-[var(--text-muted)]">{info.row.original.email}</p></div>,
        },
        { id: 'open', header: 'Tâches ouvertes', cell: (info) => <span className="text-[12px] font-semibold tabular-nums text-[var(--text)]">{info.row.original.openTasks}</span> },
        { id: 'urgent', header: 'Urgentes', cell: (info) => <span className="text-[12px] font-semibold tabular-nums text-[var(--crm-danger)]">{info.row.original.urgentTasks}</span> },
        { id: 'blocked', header: 'Bloquées', cell: (info) => <span className="text-[12px] font-semibold tabular-nums text-[var(--crm-gold)]">{info.row.original.blockedTasks}</span> },
        { id: 'overdue', header: 'En retard', cell: (info) => <span className="text-[12px] font-semibold tabular-nums text-[var(--crm-violet)]">{info.row.original.overdueTasks}</span> },
        { id: 'state', header: 'État', cell: (info) => { const state = workloadState(info.row.original); return <Chip size="sm" variant="soft" color={state.color}>{state.label}</Chip>; } },
    ];

    return (
        <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <AppKpiCard label="Charge ouverte" value={totals.open} detail={`${workload.length} collaborateur${workload.length > 1 ? 's' : ''}`} icon={<IconGauge size={15} className="text-[var(--crm-info)]" />} valueClassName="text-[var(--crm-info)]" accentColor="var(--crm-info)" />
                <AppKpiCard label="Urgentes" value={totals.urgent} detail="Priorité immédiate" icon={<IconAlertTriangle size={15} className="text-[var(--crm-danger)]" />} valueClassName="text-[var(--crm-danger)]" accentColor="var(--crm-danger)" />
                <AppKpiCard label="Bloquées" value={totals.blocked} detail="Décision ou dépendance" icon={<IconAlertCircle size={15} className="text-[var(--crm-gold)]" />} valueClassName="text-[var(--crm-gold)]" accentColor="var(--crm-gold)" />
                <AppKpiCard label="En retard" value={totals.overdue} detail="Échéance dépassée" icon={<IconUsersGroup size={15} className="text-[var(--crm-violet)]" />} valueClassName="text-[var(--crm-violet)]" accentColor="var(--crm-violet)" />
            </div>

            <AppDataTable
                data={filteredWorkload}
                columns={columns}
                searchPlaceholder="Rechercher un collaborateur"
                emptyTitle="Aucune charge à afficher"
                emptyDescription="Aucun collaborateur ne correspond à la recherche."
                pageSize={10}
                compact
            />
        </div>
    );
}
