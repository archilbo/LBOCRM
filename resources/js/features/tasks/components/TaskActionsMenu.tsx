import { ExternalLink, MoreHorizontal } from 'lucide-react';
import { Dropdown } from '@heroui/react';

import { cn } from '@/lib/cn';
import { useTranslation } from '@/lib/i18n';
import { COLUMNS, STATUS_DOT_COLORS } from '@/features/tasks/types';
import type { TaskRow } from '@/features/tasks/types';

type Props = {
    task: TaskRow;
    onOpen: () => void;
    onStatusChange?: (task: TaskRow, status: string) => void;
};

const itemClass = 'rounded-lg px-2 py-1.5 text-[11px] font-medium text-[var(--text)] outline-none transition data-[hovered]:bg-[var(--surface-2)]';

export function TaskActionsMenu({ task, onOpen, onStatusChange }: Props) {
    const { t } = useTranslation();

    const handleAction = (key: string | number) => {
        if (key === 'open') {
            onOpen();
            return;
        }

        if (typeof key === 'string' && key.startsWith('move:') && onStatusChange) {
            onStatusChange(task, key.slice(5));
        }
    };

    return (
        <Dropdown>
            <Dropdown.Trigger
                aria-label={t('tasks.actions.moreActions')}
                className="flex size-6 shrink-0 items-center justify-center rounded-md text-[var(--text-muted)] transition hover:bg-[var(--surface-3)] hover:text-[var(--foreground)]"
            >
                <MoreHorizontal size={14} />
            </Dropdown.Trigger>
            <Dropdown.Popover placement="bottom end" className="min-w-44 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-xl">
                <Dropdown.Menu aria-label={t('tasks.actions.taskActions')} onAction={handleAction}>
                    <Dropdown.Item id="open" textValue={t('tasks.actions.open')} className={itemClass}>
                        <span className="flex items-center gap-2">
                            <ExternalLink size={12} className="shrink-0 text-[var(--text-muted)]" />
                            {t('tasks.actions.open')}
                        </span>
                    </Dropdown.Item>
                    {onStatusChange ? (
                        <Dropdown.Section title={t('tasks.actions.moveTo')} className="border-t border-[var(--border)] pt-1">
                            {COLUMNS.filter((status) => status !== task.status).map((status) => (
                                <Dropdown.Item key={status} id={`move:${status}`} textValue={t(`tasks.statuses.${status}`)} className={itemClass}>
                                    <span className="flex items-center gap-2">
                                        <span className={cn('size-2 shrink-0 rounded-full', STATUS_DOT_COLORS[status])} />
                                        {t(`tasks.statuses.${status}`)}
                                    </span>
                                </Dropdown.Item>
                            ))}
                        </Dropdown.Section>
                    ) : null}
                </Dropdown.Menu>
            </Dropdown.Popover>
        </Dropdown>
    );
}
