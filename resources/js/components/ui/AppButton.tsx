import { Button as HeroButton, type ButtonProps as HeroButtonProps } from '@heroui/react';
import { cn } from '@/lib/cn';

type AppButtonProps = HeroButtonProps & {
    variant?: 'solid' | 'bordered' | 'light' | 'flat' | 'ghost' | 'shadow';
    color?: 'default' | 'primary' | 'danger' | 'success' | 'warning';
    size?: 'sm' | 'md' | 'lg';
};

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
            variant={variant}
            color={color === 'primary' ? 'warning' : color}
            size={size}
            className={cn(className)}
        />
    );
}
