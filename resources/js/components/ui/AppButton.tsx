import { Button as HeroButton, type ButtonProps as HeroButtonProps } from '@heroui/react';
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
    | 'danger-soft';

type AppButtonProps = Omit<HeroButtonProps, 'variant'> & {
    variant?: AppButtonVariant;
    color?: 'default' | 'primary' | 'danger' | 'success' | 'warning';
    size?: 'sm' | 'md' | 'lg';
};

type HeroButtonVariant = NonNullable<HeroButtonProps['variant']>;

function resolveVariant(variant: AppButtonVariant, color: AppButtonProps['color']): HeroButtonVariant {
    if (color === 'danger') return variant === 'flat' || variant === 'light' ? 'danger-soft' : 'danger';
    if (variant === 'bordered') return 'outline';
    if (variant === 'light') return 'ghost';
    if (variant === 'flat') return 'secondary';
    if (variant === 'solid' || variant === 'shadow') return color === 'primary' || color === 'warning' ? 'primary' : 'secondary';
    return variant;
}

export function AppButton({
    className,
    variant = 'solid',
    color = 'default',
    size = 'md',
    ...props
}: AppButtonProps) {
    return (
        <HeroButton
            {...props}
            variant={resolveVariant(variant, color)}
            size={size}
            className={cn(
                color === 'success' && 'bg-[var(--success)] text-black hover:opacity-90',
                className,
            )}
        />
    );
}
