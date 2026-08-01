import { CheckCircle2, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';
import { AppButton } from '@/components/ui/AppButton';
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

type PlanningFocusPanelProps = {
    task: PlanningTaskRow | null;
};

function ProgressBar({ value }: { value: number }) {
    return (
        <div className="flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--surface-2)]">
                <div
                    className="h-full rounded-full bg-[var(--accent)]"
                    style={{ width: `${value}%` }}
                />
            </div>
            <span className="w-9 text-right text-[10px] font-medium text-[var(--text-muted)]">
                {value}%
            </span>
        </div>
    );
}

function DetailItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border bg-[var(--surface-2)] p-3">
            <p className="text-[10px] font-medium text-[var(--text-muted)]">{label}</p>
            <p className="mt-1 truncate text-sm font-semibold">{value}</p>
        </div>
    );
}

export function PlanningFocusPanel({ task }: PlanningFocusPanelProps) {
    const { t } = useTranslation();

    return (
        <AppCard className="min-w-0 p-4">
            <div className="mb-4">
                <h2 className="text-sm font-semibold">{t('planningWorkspace.focus.title')}</h2>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                    {t('planningWorkspace.focus.description')}
                </p>
            </div>

            {task ? (
                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)]">
                            <ClipboardList size={18} />
                        </div>
                        <div className="min-w-0">
                            <p className="line-clamp-2 text-sm font-semibold">{task.title}</p>
                            <p className="mt-1 text-xs text-[var(--text-muted)]">{task.dossierNumber}</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
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
                                    : task.status === 'overdue' || task.status === 'blocked'
                                      ? 'warning'
                                      : 'clock'
                            }
                        />
                        <AppBadge
                            tone={
                                task.priority === 'urgent'
                                    ? 'red'
                                    : task.priority === 'high'
                                      ? 'amber'
                                      : task.priority === 'normal'
                                        ? 'blue'
                                        : 'neutral'
                            }
                        >
                            {t(`planningWorkspace.priority.${task.priority}`)}
                        </AppBadge>
                        <AppBadge tone="violet">{t(`planningWorkspace.type.${task.type}`)}</AppBadge>
                    </div>

                    <ProgressBar value={task.progress} />

                    <div className="grid gap-2">
                        <DetailItem label={t('planningWorkspace.focus.project')} value={task.projectObject} />
                        <DetailItem label={t('planningWorkspace.focus.client')} value={task.client} />
                        <DetailItem label={t('planningWorkspace.focus.assignee')} value={task.assignee} />
                        <DetailItem label={t('planningWorkspace.focus.dueDate')} value={task.dueDate} />
                    </div>

                    <div className="rounded-2xl border bg-[color-mix(in_srgb,var(--accent)_8%,var(--surface))] p-4">
                        <p className="text-xs font-medium text-[var(--accent)]">
                            {t('planningWorkspace.focus.nextAction')}
                        </p>
                        <p className="mt-1 text-sm text-[var(--text-muted)]">
                            {task.nextAction}
                        </p>
                    </div>

                    <div className="grid gap-2">
                        <AppButton
                            variant="primary"
                            onPress={() => toast.success(t('planningWorkspace.toast.done'))}
                        >
                            <CheckCircle2 size={16} />
                            {t('planningWorkspace.markDone')}
                        </AppButton>
                        <AppButton
                            variant="secondary"
                            onPress={() => toast.error(t('planningWorkspace.toast.block'))}
                        >
                            {t('planningWorkspace.blockTask')}
                        </AppButton>
                    </div>
                </div>
            ) : (
                <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed bg-[var(--surface-2)]">
                    <div className="px-6 text-center">
                        <ClipboardList className="mx-auto text-[var(--text-muted)]" size={34} />
                        <p className="mt-3 text-sm font-semibold">{t('planningWorkspace.focus.noTask')}</p>
                        <p className="mt-1 max-w-sm text-sm text-[var(--text-muted)]">
                            {t('planningWorkspace.focus.selectTask')}
                        </p>
                    </div>
                </div>
            )}
        </AppCard>
    );
}
