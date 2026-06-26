import { ReactNode } from 'react';
import { Button } from 'react-aria-components';
import { cn } from '@/lib/cn';
import { AppTooltip } from '@/components/ui/AppTooltip';

type AppTableActionTone = 'view' | 'edit' | 'documents' | 'create' | 'archive' | 'delete';

type AppTableActionButtonProps = {
    label: string;
    tone: AppTableActionTone;
    children: ReactNode;
    onPress: () => void;
    isDisabled?: boolean;
};

const toneClasses: Record<AppTableActionTone, string> = {
    view: 'border-blue-200 bg-blue-50 text-blue-700 data-[hovered]:bg-blue-100 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300 dark:data-[hovered]:bg-blue-500/20',
    edit: 'border-amber-200 bg-amber-50 text-amber-700 data-[hovered]:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300 dark:data-[hovered]:bg-amber-500/20',
    documents: 'border-violet-200 bg-violet-50 text-violet-700 data-[hovered]:bg-violet-100 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300 dark:data-[hovered]:bg-violet-500/20',
    create: 'border-green-200 bg-green-50 text-green-700 data-[hovered]:bg-green-100 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300 dark:data-[hovered]:bg-green-500/20',
    archive: 'border-slate-200 bg-slate-50 text-slate-700 data-[hovered]:bg-slate-100 dark:border-slate-500/30 dark:bg-slate-500/10 dark:text-slate-300 dark:data-[hovered]:bg-slate-500/20',
    delete: 'border-red-200 bg-red-50 text-red-700 data-[hovered]:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300 dark:data-[hovered]:bg-red-500/20',
};

export function AppTableActionButton({
    label,
    tone,
    children,
    onPress,
    isDisabled,
}: AppTableActionButtonProps) {
    return (
        <AppTooltip label={label}>
            <Button
                aria-label={label}
                isDisabled={isDisabled}
                onPress={onPress}
                className={cn(
                    'inline-flex size-8 shrink-0 items-center justify-center rounded-lg border outline-none transition',
                    'data-[focus-visible]:ring-2 data-[focus-visible]:ring-[var(--focus-ring)] data-[focus-visible]:ring-offset-2 data-[focus-visible]:ring-offset-[var(--surface)]',
                    'data-[pressed]:scale-95 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
                    toneClasses[tone],
                )}
            >
                {children}
            </Button>
        </AppTooltip>
    );
}
