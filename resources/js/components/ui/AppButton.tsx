import { Button as HeroButton, Tooltip, type ButtonProps as HeroButtonProps } from '@heroui/react';
import { cn } from '@/lib/cn';

type AppButtonVariant =
    | 'solid'
    | 'bordered'
    | 'light'
    | 'flat'
    | 'shadow'
    | 'primary'
    | 'secondary'
    | 'tertiary'
    | 'outline'
    | 'ghost'
    | 'danger'
    | 'danger-soft'
    | 'toolbar'
    | 'accent'
    | 'quiet';

type AppButtonProps = Omit<HeroButtonProps, 'variant'> & {
    variant?: AppButtonVariant;
    color?: 'default' | 'primary' | 'danger' | 'success' | 'warning';
    size?: 'sm' | 'md' | 'lg';
    compact?: boolean;
    tooltip?: string;
};

type HeroButtonVariant = NonNullable<HeroButtonProps['variant']>;

function resolveVariant(variant: AppButtonVariant, color: AppButtonProps['color']): HeroButtonVariant {
    if (color === 'danger') return variant === 'flat' || variant === 'light' ? 'danger-soft' : 'danger';
    if (variant === 'bordered') return 'outline';
    if (variant === 'light') return 'ghost';
    if (variant === 'flat') return 'secondary';
    if (variant === 'toolbar') return 'outline';
    if (variant === 'accent') return 'primary';
    if (variant === 'quiet') return 'ghost';
    if (variant === 'solid' || variant === 'shadow') return color === 'primary' || color === 'warning' ? 'primary' : 'secondary';
    return variant;
}

export function AppButton({
    className,
    variant = 'solid',
    color = 'default',
    size = 'md',
    compact = false,
    tooltip,
    ...props
}: AppButtonProps) {
    const button = (
        <HeroButton
            {...props}
            variant={resolveVariant(variant, color)}
            size={size}
            className={cn(
                compact && 'h-8 min-h-8 gap-1.5 rounded-lg px-2.5 text-xs font-semibold',
                compact && props.isIconOnly && 'size-8 min-w-8 p-0',
                variant === 'toolbar' && 'border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] shadow-none hover:border-[color-mix(in_srgb,var(--accent)_42%,var(--border))] hover:bg-[var(--surface-2)]',
                variant === 'accent' && 'bg-[var(--accent)] text-black shadow-none hover:bg-[var(--accent-hover)]',
                variant === 'quiet' && 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]',
                color === 'success' && 'bg-[var(--success)] text-black hover:opacity-90',
                className,
            )}
        />
    );

    if (!tooltip) {
        return button;
    }

    return (
        <Tooltip delay={450}>
            <Tooltip.Trigger>{button}</Tooltip.Trigger>
            <Tooltip.Content className="border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] shadow-xl">
                {tooltip}
            </Tooltip.Content>
        </Tooltip>
    );
}
