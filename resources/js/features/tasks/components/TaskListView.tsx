import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';

import { useState } from 'react';
import { Card, Chip, Dropdown } from '@heroui/react';
import { cn } from '@/lib/cn';
import { AvatarPill } from '@/components/ui/AvatarPill';
import { AppButton } from '@/components/ui/AppButton';
import { useTranslation } from '@/lib/i18n';
import type { TaskRow, TaskStatus } from '@/features/tasks/types';
import { COLUMNS, PRIORITY_COLORS, STATUS_COLORS, STATUS_DOT_COLORS } from '@/features/tasks/types';

type Props = {
    columns: Record<string, TaskRow[]>;
    onTaskClick: (task: TaskRow) => void;
    onStatusChange: (task: TaskRow, status: string) => void;
};

export function TaskListView({ columns, onTaskClick, onStatusChange }: Props) {
    const { t } = useTranslation();
    const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

    const toggle = (status: string) => {
        setCollapsed((prev) => {
            const next = new Set(prev);
            if (next.has(status)) next.delete(status); else next.add(status);
            return next;
        });
    };

    return (
        <div className="space-y-3">
            {COLUMNS.map((status) => {
                const tasks = columns[status] || [];
                const isCollapsed = collapsed.has(status);
                return (
                    <Card key={status} className="gap-0 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
                        <AppButton variant="ghost" onPress={() => toggle(status)} className="flex h-auto min-h-0 w-full items-center gap-2 justify-start rounded-none px-4 py-3 text-left hover:bg-[var(--surface-2)]">
                            {isCollapsed ? <IconChevronRight size={14} className="text-[var(--text-muted)]" /> : <IconChevronDown size={14} className="text-[var(--text-muted)]" />}
                            <span className={`size-2 rounded-full ${STATUS_DOT_COLORS[status]}`} />
                            <span className="text-sm font-semibold text-[var(--text)]">{t(`tasks.statuses.${status}`)}</span>
                            <Chip size="sm" className="h-5 min-w-[20px] rounded-md bg-[var(--surface-3)] px-1.5 text-[9px] font-bold text-[var(--text-muted)]">{tasks.length}</Chip>
                        </AppButton>
                        {!isCollapsed ? (
                            tasks.length === 0 ? (
                                <div className="px-4 py-3 text-xs text-[var(--text-muted)]">{t('tasks.empty.list')}</div>
                            ) : (
                                <div className="divide-y divide-[var(--border)] border-t border-[var(--border)]">
                                    {tasks.map((task) => (
                                        <div key={task.id} className="flex items-center gap-3 px-4 py-2.5 transition hover:bg-[var(--surface-2)]">
                                            <AppButton variant="ghost" onPress={() => onTaskClick(task)} className="flex h-auto min-h-0 flex-1 items-center gap-3 justify-start rounded-lg p-0 text-left">
                                                <span className={`size-2 shrink-0 rounded-full ${STATUS_DOT_COLORS[task.status]}`} />
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-semibold text-[var(--text)]">{task.title}</p>
                                                    <p className="truncate text-[9px] text-[var(--text-muted)]">{task.taskNumber}{task.dossier?.object ? ` \u00B7 ${task.dossier.object}` : ''}</p>
                                                </div>
                                            </AppButton>
                                            <div className="flex shrink-0 items-center gap-3">
                                                {Array.isArray(task.assignees) && task.assignees.length > 0 ? (
                                                    <div className="flex -space-x-1">
                                                        {task.assignees.slice(0, 2).map((a) => (
                                                            <AvatarPill key={a.id} name={a.name} size="sm" className="size-6 min-w-6 border-2 border-[var(--surface)] text-[8px]" />
                                                        ))}
                                                    </div>
                                                ) : null}
                                                <Chip size="sm" className={cn('h-5 rounded-full border px-2 text-[9px] font-semibold', PRIORITY_COLORS[task.priority])}>{t(`tasks.priorities.${task.priority}`)}</Chip>
                                                <Chip size="sm" className={cn('h-5 rounded-full border px-2 text-[9px] font-semibold', STATUS_COLORS[task.status])}>{t(`tasks.statuses.${task.status}`)}</Chip>
                                                {task.dueDate ? <span className="whitespace-nowrap text-[9px] text-[var(--text-muted)]">{task.dueDate}</span> : null}
                                                <QuickStatus task={task} onStatusChange={onStatusChange} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        ) : null}
                    </Card>
                );
            })}
        </div>
    );
}

function QuickStatus({ task, onStatusChange }: { task: TaskRow; onStatusChange: (task: TaskRow, status: string) => void }) {
    const { t } = useTranslation();
    return (
        <div onClick={(e) => e.stopPropagation()}>
            <Dropdown>
                <Dropdown.Trigger className="inline-flex h-7 items-center gap-1 rounded-lg border border-[var(--border)] px-2 text-[9px] font-semibold text-[var(--text-muted)] transition hover:border-[var(--accent)] hover:text-[var(--text)]">
                    <IconChevronDown size={11} /> {t('tasks.actions.move')}
                </Dropdown.Trigger>
                <Dropdown.Popover placement="bottom end" className="min-w-40 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-xl">
                    <Dropdown.Menu
                        aria-label={t('tasks.actions.moveTask')}
                        onAction={(key) => onStatusChange(task, String(key))}
                    >
                        {COLUMNS.filter((s) => s !== task.status).map((status) => (
                            <Dropdown.Item
                                key={status}
                                id={status}
                                textValue={t(`tasks.statuses.${status as TaskStatus}`)}
                                className="rounded-lg px-2 py-1.5 text-[11px] font-medium text-[var(--text)] outline-none transition data-[hovered]:bg-[var(--surface-2)]"
                            >
                                <span className="flex items-center gap-2">
                                    <span className={`size-2 rounded-full ${STATUS_DOT_COLORS[status]}`} />
                                    {t(`tasks.statuses.${status as TaskStatus}`)}
                                </span>
                            </Dropdown.Item>
                        ))}
                    </Dropdown.Menu>
                </Dropdown.Popover>
            </Dropdown>
        </div>
    );
}
