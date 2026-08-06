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
        <div className="flex min-h-[120px] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)]/40 px-4 py-6 text-center">
            <span className="text-[10px] font-medium text-[var(--text-muted)]">{t('tasks.board.noTasks')}</span>
            {canAdd && onAddTask ? (
                <Button
                    variant="ghost"
                    size="sm"
                    onPress={onAddTask}
                    className="h-6 min-h-6 gap-1 px-2 text-[9px] font-semibold text-[var(--text-muted)] transition hover:text-[var(--accent)]"
                >
                    <Plus size={10} /> {t('tasks.board.addTask')}
                </Button>
            ) : null}
        </div>
    );
}
