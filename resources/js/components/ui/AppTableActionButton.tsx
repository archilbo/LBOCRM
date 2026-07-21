import { ReactNode } from 'react';
import { Button } from 'react-aria-components';
import { cn } from '@/lib/cn';
import { Tooltip } from '@heroui/react';

type AppTableActionTone = 'view' | 'edit' | 'documents' | 'create' | 'archive' | 'delete';

type AppTableActionButtonProps = {
    label: string;
    tone: AppTableActionTone;
    children: ReactNode;
    onPress: () => void;
    isDisabled?: boolean;
};

const toneClasses: Record<AppTableActionTone, string> = {
    view: 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] data-[hovered]:border-[color-mix(in_srgb,var(--accent)_45%,var(--border))] data-[hovered]:bg-[var(--surface-2)] data-[hovered]:text-[var(--accent)]',
    edit: 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] data-[hovered]:border-[color-mix(in_srgb,var(--accent)_45%,var(--border))] data-[hovered]:bg-[var(--surface-2)] data-[hovered]:text-[var(--text)]',
    documents: 'border-[color-mix(in_srgb,var(--accent)_25%,var(--border))] bg-[color-mix(in_srgb,var(--accent)_8%,var(--surface))] text-[var(--accent)] data-[hovered]:bg-[color-mix(in_srgb,var(--accent)_16%,var(--surface))]',
    create: 'border-[color-mix(in_srgb,var(--success)_28%,var(--border))] bg-[color-mix(in_srgb,var(--success)_8%,var(--surface))] text-[var(--success)] data-[hovered]:bg-[color-mix(in_srgb,var(--success)_15%,var(--surface))]',
    archive: 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] data-[hovered]:bg-[var(--surface-2)] data-[hovered]:text-[var(--text)]',
    delete: 'border-[color-mix(in_srgb,var(--danger)_25%,var(--border))] bg-[color-mix(in_srgb,var(--danger)_7%,var(--surface))] text-[var(--danger)] data-[hovered]:bg-[color-mix(in_srgb,var(--danger)_14%,var(--surface))]',
};

export function AppTableActionButton({
    label,
    tone,
    children,
    onPress,
    isDisabled,
}: AppTableActionButtonProps) {
    return (
        <Tooltip delay={500}>
            <Button
                aria-label={label}
                isDisabled={isDisabled}
                onPress={onPress}
                className={cn(
                    'inline-flex size-7 shrink-0 items-center justify-center rounded-md border outline-none transition',
                    'data-[focus-visible]:ring-2 data-[focus-visible]:ring-[var(--focus-ring)] data-[focus-visible]:ring-offset-2 data-[focus-visible]:ring-offset-[var(--surface)]',
                    'data-[pressed]:scale-95 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
                    toneClasses[tone],
                )}
            >
                {children}
            </Button>
            <Tooltip.Content className="bg-[var(--surface)] text-[var(--text)] border border-[var(--border)]">{label}</Tooltip.Content>
        </Tooltip>
    );
}
