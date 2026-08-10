import { Plus } from 'lucide-react';
import { Button } from '@heroui/react';

import { useTranslation } from '@/lib/i18n';

type Props = {
    canAdd: boolean;
    onAddTask?: () => void;
};

export function TaskBoardEmptyState({ canAdd, onAddTask }: Props) {
    const { t } = useTranslation();

    return (
        <div className="flex min-h-[96px] w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface)]/40 px-3 py-4 text-center">
            <span className="text-[9px] font-medium text-[var(--text-muted)]">{t('tasks.board.noTasks')}</span>
            {canAdd && onAddTask ? (
                <Button
                    variant="ghost"
                    size="sm"
                    onPress={onAddTask}
                    className="h-5 min-h-5 gap-1 px-2 text-[8px] font-semibold text-[var(--text-muted)] transition hover:text-[var(--accent)]"
                >
                    <Plus size={10} /> {t('tasks.board.addTask')}
                </Button>
            ) : null}
        </div>
    );
}
