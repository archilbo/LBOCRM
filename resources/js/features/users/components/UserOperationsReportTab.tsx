import { useMemo } from 'react';
import { IconAlertTriangle, IconCircleCheck, IconClockHour3, IconListCheck, IconRefresh, IconClockOff, IconUserMinus } from '@tabler/icons-react';

import { Chip } from '@heroui/react';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { AppKpiCard } from '@/components/ui/AppKpiCard';

export type OperationsReport = {
    totalTasks: number;
    openTasks: number;
    completedTasks: number;
    blockedTasks: number;
    overdueTasks: number;
    dueThisWeek: number;
    unassignedTasks: number;
    byModule: Record<string, number>;
    byPriority: Record<string, number>;
};

const MODULE_LABELS: Record<string, string> = { documents: 'Documents', client_follow_up: 'Suivi client', contract: 'Contrats', authorization: 'Autorisations', finance: 'Finance', archive: 'Archives', general_admin: 'Général' };
const PRIORITY_LABELS: Record<string, string> = { urgent: 'Urgente', high: 'Haute', medium: 'Moyenne', low: 'Basse' };

function DistributionList({ title, subtitle, data, labels }: { title: string; subtitle: string; data: Record<string, number>; labels: Record<string, string> }) {
    const rows = useMemo(() => Object.entries(data).sort(([, left], [, right]) => right - left), [data]);
    const maximum = Math.max(...rows.map(([, value]) => value), 1);

    return (
        <AppCard className="p-0">
            <div className="border-b border-[var(--border)] px-4 py-3"><h2 className="text-sm font-semibold text-[var(--text)]">{title}</h2><p className="mt-0.5 text-[11px] text-[var(--text-muted)]">{subtitle}</p></div>
            {rows.length === 0 ? <div className="p-4"><AppEmptyState title="Aucune donnée" description="Les tâches apparaîtront ici dès leur création." /></div> : <div className="divide-y divide-[var(--border)]/65">
                {rows.map(([key, value]) => (
                    <div key={key} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
                        <div className="min-w-0"><div className="mb-2 flex items-center justify-between gap-3"><span className="truncate text-[12px] font-medium text-[var(--text)]">{labels[key] ?? key}</span><span className="text-[11px] font-semibold tabular-nums text-[var(--text-muted)]">{value}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-2)]"><div className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-300" style={{ width: `${Math.round((value / maximum) * 100)}%` }} /></div></div>
                        <Chip size="sm" variant="soft">{Math.round((value / maximum) * 100)}%</Chip>
                    </div>
                ))}
            </div>}
        </AppCard>
    );
}

export function UserOperationsReportTab({ report, reportedAt, onRefresh }: { report: OperationsReport; reportedAt: string; onRefresh: () => void }) {
    const completionRate = report.totalTasks === 0 ? 0 : Math.round((report.completedTasks / report.totalTasks) * 100);

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-[11px] text-[var(--text-muted)]">Données consolidées au {new Intl.DateTimeFormat('fr-MA', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(reportedAt))}.</p><AppButton variant="quiet" compact onPress={onRefresh}><IconRefresh size={13} />Actualiser</AppButton></div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                <AppKpiCard label="Total" value={report.totalTasks} detail="Tâches créées" icon={<IconListCheck size={15} className="text-[var(--crm-info)]" />} valueClassName="text-[var(--crm-info)]" accentColor="var(--crm-info)" />
                <AppKpiCard label="Ouvertes" value={report.openTasks} detail={`${report.dueThisWeek} cette semaine`} icon={<IconClockHour3 size={15} className="text-[var(--crm-gold)]" />} valueClassName="text-[var(--crm-gold)]" accentColor="var(--crm-gold)" />
                <AppKpiCard label="Terminées" value={report.completedTasks} detail={`${completionRate}% réalisées`} icon={<IconCircleCheck size={15} className="text-[var(--crm-success)]" />} valueClassName="text-[var(--crm-success)]" accentColor="var(--crm-success)" />
                <AppKpiCard label="Bloquées" value={report.blockedTasks} detail={`${report.unassignedTasks} sans responsable`} icon={<IconAlertTriangle size={15} className="text-[var(--crm-danger)]" />} valueClassName="text-[var(--crm-danger)]" accentColor="var(--crm-danger)" />
                <AppKpiCard label="En retard" value={report.overdueTasks} detail="À replanifier" icon={<IconClockOff size={15} className="text-[var(--crm-violet)]" />} valueClassName="text-[var(--crm-violet)]" accentColor="var(--crm-violet)" />
            </div>
            <div className="grid gap-4 xl:grid-cols-2"><DistributionList title="Répartition par module" subtitle="Où se concentre le travail opérationnel." data={report.byModule} labels={MODULE_LABELS} /><DistributionList title="Répartition par priorité" subtitle="Niveau d’urgence des actions enregistrées." data={report.byPriority} labels={PRIORITY_LABELS} /></div>
            <AppCard className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm font-semibold text-[var(--text)]">Avancement global</p><p className="mt-0.5 text-[11px] text-[var(--text-muted)]">{report.completedTasks} tâche(s) terminée(s) sur {report.totalTasks}.</p></div><div className="flex min-w-52 flex-1 items-center gap-3 sm:max-w-md"><div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--surface-2)]"><div className="h-full rounded-full bg-[var(--crm-success)] transition-[width] duration-300" style={{ width: `${completionRate}%` }} /></div><Chip size="sm" variant="soft" color="success">{completionRate}%</Chip></div>{report.unassignedTasks > 0 ? <Chip size="sm" variant="soft" color="warning" startContent={<IconUserMinus size={12} />}>{report.unassignedTasks} sans responsable</Chip> : null}</AppCard>
        </div>
    );
}
