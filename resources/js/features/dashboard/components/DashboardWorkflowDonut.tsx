import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { IconFolder } from '@tabler/icons-react';

import type { DashboardWorkflowStepCount } from '@/features/dashboard/types';
import { useTranslation } from '@/lib/i18n';

type Props = {
    steps: DashboardWorkflowStepCount[];
};

const COLORS = ['#fcb12d', '#38bdf8', '#a78bfa', '#34d399', '#fb7185', '#f59e0b'];

export function DashboardWorkflowDonut({ steps }: Props) {
    const { t } = useTranslation();
    const activeSteps = steps.filter((step) => step.count > 0);
    const total = activeSteps.reduce((sum, step) => sum + step.count, 0);

    if (total === 0) {
        return (
            <div className="flex min-h-52 flex-col items-center justify-center px-4 text-center">
                <span className="flex size-10 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent)]"><IconFolder size={18} /></span>
                <p className="mt-3 text-sm font-semibold text-[var(--foreground)]">{t('dashboard.chart.noActiveProjects')}</p>
                <p className="mt-1 max-w-xs text-xs leading-5 text-[var(--text-muted)]">{t('dashboard.chart.noActiveProjectsDetail')}</p>
            </div>
        );
    }

    return (
        <div className="grid min-h-52 grid-cols-[132px_minmax(0,1fr)] items-center gap-3 px-4 pb-4 pt-3">
            <div className="relative size-[132px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Tooltip
                            contentStyle={{ borderColor: 'var(--border)', background: 'var(--surface)', borderRadius: 12, fontSize: 12 }}
                            formatter={(value: number) => [t('dashboard.chart.dossierCount', { count: value }), '']}
                        />
                        <Pie data={activeSteps} dataKey="count" nameKey="label" innerRadius={43} outerRadius={61} paddingAngle={3} stroke="none">
                            {activeSteps.map((step, index) => <Cell key={step.key} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">{total}</span>
                    <span className="text-[9px] font-medium uppercase tracking-[0.12em] text-[var(--text-muted)]">{t('dashboard.chart.active')}</span>
                </div>
            </div>
            <div className="min-w-0 space-y-2">
                {activeSteps.slice(0, 4).map((step, index) => (
                    <div key={step.key} className="flex items-center justify-between gap-2 text-xs">
                        <span className="flex min-w-0 items-center gap-2 text-[var(--text-muted)]"><span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} /><span className="truncate">{step.label}</span></span>
                        <span className="shrink-0 font-semibold tabular-nums text-[var(--foreground)]">{step.count}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
