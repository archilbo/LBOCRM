import { IconCalendarMonth } from '@tabler/icons-react';

import { AppCard } from '@/components/ui/AppCard';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppStatusBadge } from '@/components/ui/AppStatusBadge';
import { useTranslation } from '@/lib/i18n';

type PlanningTaskRow = {
    id: number; title: string; type: string; dossierNumber: string;
    projectObject: string; client: string; cin: string; assignee: string;
    priority: string; status: string; startsAt: string; dueDate: string;
    dayKey: string; progress: number; updatedAt: string; nextAction: string;
};

type PlanningBoardProps = {
    tasks: PlanningTaskRow[];
    onSelectTask: (task: PlanningTaskRow) => void;
};

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

export function PlanningBoard({ tasks, onSelectTask }: PlanningBoardProps) {
    const { t } = useTranslation();

    return (
        <AppCard className="min-w-0 p-4">
            <div className="mb-4 flex items-start gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)]">
                    <IconCalendarMonth size={17} />
                </div>
                <div className="min-w-0">
                    <h2 className="text-sm font-semibold">{t('planningWorkspace.board.title')}</h2>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                        {t('planningWorkspace.board.description')}
                    </p>
                </div>
            </div>

            <div className="app-scrollbar min-w-0 overflow-x-auto pb-1">
                <div className="grid min-w-[980px] grid-cols-7 gap-3">
                    {days.map((day) => {
                        const dayTasks = tasks.filter((task) => task.dayKey === day);

                        return (
                            <div
                                key={day}
                                className="min-h-32 rounded-2xl border bg-[var(--surface-2)] p-3"
                            >
                                <div className="mb-3 flex items-center justify-between gap-2">
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                                        {t(`planningWorkspace.board.${day}`)}
                                    </p>
                                    <AppBadge tone="neutral">{dayTasks.length}</AppBadge>
                                </div>

                                <div className="space-y-2">
                                    {dayTasks.map((task) => (
                                        <button
                                            key={task.id}
                                            type="button"
                                            title={task.title}
                                            onClick={() => onSelectTask(task)}
                                            className="w-full rounded-xl border bg-[var(--surface)] p-2.5 text-left transition hover:border-[var(--accent)] hover:bg-[color-mix(in_srgb,var(--accent)_6%,var(--surface))]"
                                        >
                                            <p className="truncate text-xs font-semibold">
                                                {task.title}
                                            </p>
                                            <p className="mt-1 truncate text-[10px] text-[var(--text-muted)]">
                                                {task.dossierNumber}
                                            </p>
                                            <div className="mt-2">
                                                <AppStatusBadge
                                                    label={t(`planningWorkspace.status.${task.status}`)}
                                                    tone={
                                                        task.status === 'completed'
                                                            ? 'green'
                                                            : task.status === 'overdue' || task.status === 'blocked'
                                                              ? 'red'
                                                              : task.status === 'active'
                                                                ? 'blue'
                                                                : 'amber'
                                                    }
                                                    icon={
                                                        task.status === 'completed'
                                                            ? 'check'
                                                            : task.status === 'blocked' || task.status === 'overdue'
                                                              ? 'warning'
                                                              : 'clock'
                                                    }
                                                />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </AppCard>
    );
}
