import { Chip } from '@heroui/react';
import { cn } from '@/lib/cn';

type StatusPillProps = {
    label: string;
    color?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
    variant?: 'flat' | 'solid' | 'bordered' | 'light';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
};

export function StatusPill({ label, color = 'default', variant = 'flat', size = 'sm', className }: StatusPillProps) {
    return (
        <Chip
            variant={variant}
            color={color}
            size={size}
            className={cn('font-medium', className)}
        >
            {label}
        </Chip>
    );
}
