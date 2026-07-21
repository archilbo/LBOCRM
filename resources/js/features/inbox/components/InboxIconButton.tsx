import { Button, Tooltip, type ButtonProps } from '@heroui/react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Props = Omit<ButtonProps, 'children' | 'aria-label'> & {
    label: string;
    children: ReactNode;
    tone?: 'default' | 'accent' | 'danger';
};

export function InboxIconButton({ label, children, tone = 'default', className, ...props }: Props) {
    return (
        <Tooltip delay={450}>
            <Button
                {...props}
                isIconOnly
                aria-label={label}
                variant="ghost"
                className={cn(
                    'size-8 min-w-8 rounded-lg text-[var(--text-muted)] data-[hovered]:bg-[var(--surface-2)] data-[pressed]:scale-95',
                    tone === 'accent' && 'data-[hovered]:text-[var(--accent)]',
                    tone === 'danger' && 'data-[hovered]:bg-red-400/10 data-[hovered]:text-red-400',
                    className,
                )}
            >
                {children}
            </Button>
            <Tooltip.Content className="border border-[var(--border)] bg-[var(--surface)] text-[var(--text)]">{label}</Tooltip.Content>
        </Tooltip>
    );
}
