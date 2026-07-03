import { Button, type ButtonProps } from 'react-aria-components';
import { cn } from '@/lib/cn';

type AppButtonProps = ButtonProps & {
    variant?: 'default' | 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md';
};

export function AppButton({
    className,
    variant = 'default',
    size = 'md',
    ...props
}: AppButtonProps) {
    return (
        <Button
            {...props}
            className={cn(
                'react-aria-Button',
                size === 'sm' && 'h-8 px-3 text-xs',
                variant === 'primary' &&
                    'border-transparent bg-[var(--accent)] text-[var(--accent-foreground)] data-[hovered]:bg-[var(--accent-hover)] data-[pressed]:bg-[var(--accent-pressed)]',
                variant === 'secondary' &&
                    'border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] data-[hovered]:bg-[var(--surface-2)]',
                variant === 'danger' &&
                    'border-transparent bg-[var(--danger)] text-white data-[hovered]:bg-[var(--danger-hover)]',
                variant === 'ghost' &&
                    'border-transparent bg-transparent data-[hovered]:bg-[var(--surface-2)]',
                className,
            )}
        />
    );
}
